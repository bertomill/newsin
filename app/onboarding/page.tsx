'use client';

// Import React hooks for managing state and side effects:
// - useState: Allows components to manage local state data
// - useEffect: Handles side effects like data fetching and subscriptions
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

// Define the steps in the onboarding process
// Each step represents a different screen in the onboarding flow
const ONBOARDING_STEPS = {
  NAME: 0,           // Step to collect user's name
  ROLE: 1,           // Step to collect user's professional role
  COMPLETE: 2,       // Final confirmation step
};

export default function Onboarding() {
  // Initialize Next.js router for navigation between pages
  const router = useRouter();
  
  // State variables to track user progress and input
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.NAME);
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  
  // UI state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  // Check if user is authenticated and has completed onboarding
  const checkOnboardingStatus = useCallback(async () => {
    try {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is signed in
          try {
            // Check if user has already completed onboarding
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists() && userDoc.data().onboardingCompleted) {
              // User has already completed onboarding, redirect to home
              router.push('/home');
              return;
            }
            
            // User needs to complete onboarding
            setLoading(false);
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            if (!navigator.onLine) {
              setIsOffline(true);
            }
            setError('Error loading your profile. Please try again.');
            setLoading(false);
          }
        } else {
          // No user is signed in, redirect to login
          router.push('/login');
        }
      });
      
      // Clean up subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication error. Please try again.');
      setLoading(false);
    }
  }, [router]);

  // Check network status
  useEffect(() => {
    // Set up network status listeners
    const handleOnline = () => {
      console.log('App is online');
      setIsOffline(false);
      // Retry loading if we were previously offline
      checkOnboardingStatus();
    };

    const handleOffline = () => {
      console.log('App is offline');
      setIsOffline(true);
    };

    // Add event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial network status
    setIsOffline(!navigator.onLine);

    // Check if user is already authenticated and has completed onboarding
    checkOnboardingStatus();

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkOnboardingStatus]);

  // Handle form submission for each step
  const handleNext = async () => {
    // Check if offline before proceeding
    if (isOffline) {
      setError('You are currently offline. Please check your internet connection to continue.');
      return;
    }

    // Clear any previous errors
    setError('');

    // Validate current step before proceeding
    if (currentStep === ONBOARDING_STEPS.NAME && !firstName.trim()) {
      setError('Please enter your name to continue.');
      return;
    }

    // If we're on the final step before completion, save all data
    if (currentStep === ONBOARDING_STEPS.ROLE) {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to complete onboarding.');
          return;
        }

        // Save all collected information to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          role,
          onboardingCompleted: true,
          createdAt: new Date(),
        }, { merge: true });

        // Move to completion step
        setCurrentStep(ONBOARDING_STEPS.COMPLETE);
        
        // Redirect to home page after a short delay
        setTimeout(() => router.push('/home'), 2000);
      } catch (error: unknown) {
        console.error('Error saving onboarding data:', error);
        // Check if it's a network error
        if (error instanceof FirebaseError && error.message.includes('offline')) {
          setIsOffline(true);
          setError('You appear to be offline. Please check your internet connection and try again.');
        } else {
          setError('Error saving your information. Please try again.');
        }
      }
      return;
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  // Handle retry when offline
  const handleRetry = () => {
    setLoading(true);
    setError('');
    checkOnboardingStatus();
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-center">Loading your profile...</p>
      </div>
    );
  }

  // Error state UI with retry button
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Issue</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex space-x-4">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/home')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main onboarding UI
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Network status indicator - shows a warning banner when offline */}
      {isOffline && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center">
          You are currently offline. Some features may be limited.
        </div>
      )}
      
      {/* Progress bar - visually shows how far along the user is in the onboarding process */}
      <div className="w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-black transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / Object.keys(ONBOARDING_STEPS).length) * 100}%` }}
        />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold mb-12">Welcome to Newsin</h1>

        {/* Step 1: Name */}
        {currentStep === ONBOARDING_STEPS.NAME && (
          <div className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-lg font-medium mb-2">
                What&apos;s your first name?
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your first name"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                We&apos;ll use this to personalize your experience.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Role */}
        {currentStep === ONBOARDING_STEPS.ROLE && (
          <div className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-lg font-medium mb-2">
                What&apos;s your role?
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. CEO, Marketing Manager, Founder"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                This helps us understand how we can best serve you.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {currentStep === ONBOARDING_STEPS.COMPLETE && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">All set!</h2>
            <p className="text-gray-600">Thanks for sharing your information. We&apos;re redirecting you to your home page...</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep < ONBOARDING_STEPS.COMPLETE && (
            <>
              <button
                onClick={() => router.push('/home')}
                className="text-gray-600 hover:text-gray-900"
              >
                Skip for now
              </button>
              <button
                onClick={handleNext}
                disabled={(currentStep === ONBOARDING_STEPS.NAME && !firstName.trim()) || isOffline}
                className={`px-6 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors
                  ${((currentStep === ONBOARDING_STEPS.NAME && !firstName.trim()) || isOffline) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {currentStep === ONBOARDING_STEPS.ROLE ? 'Complete' : 'Next'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 