'use client';

import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function Home() {
  // State to store the time-based greeting
  const [greeting, setGreeting] = useState('Good morning');
  // State to store the user's first name
  const [firstName, setFirstName] = useState('');
  // State to track loading state
  const [loading, setLoading] = useState(true);
  
  // Get user data directly from Firebase Auth
  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Home page - User authenticated:', user);
        console.log('Home page - User displayName:', user.displayName);
        console.log('Home page - User email:', user.email);
        
        // Try to get first name from displayName
        if (user.displayName) {
          const firstNameFromDisplay = user.displayName.split(' ')[0];
          console.log('Home page - Using first name from displayName:', firstNameFromDisplay);
          setFirstName(firstNameFromDisplay);
        } 
        // Fallback to email if no displayName
        else if (user.email) {
          const firstNameFromEmail = user.email.split('@')[0];
          console.log('Home page - Using first name from email:', firstNameFromEmail);
          setFirstName(firstNameFromEmail);
        }
        // Final fallback
        else {
          console.log('Home page - No displayName or email, using default');
          setFirstName('User');
        }
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Update greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Good morning');
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };
    
    // Set initial greeting
    updateGreeting();
    
    // Update greeting every minute
    const intervalId = setInterval(updateGreeting, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-6 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold pl-12 md:pl-0">
            {loading ? (
              <span className="inline-block w-40 h-8 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              `${greeting}, ${firstName}!`
            )}
          </h1>
          <Link 
            href="/personalization" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Personalize Your News
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <main className="p-6 md:p-6 pl-12 md:pl-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* News Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-medium">Latest News</h2>
            </div>
            <p className="text-gray-600">Stay updated with the latest news and trends in your industry.</p>
            <Link href="/news" className="mt-4 inline-block text-blue-600 hover:underline">
              View all news
            </Link>
          </div>
          
          {/* Topics Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-medium">Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Technology</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Science</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Business</span>
            </div>
            <Link href="/topics" className="text-blue-600 hover:underline">
              Manage topics
            </Link>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-medium">Your Profile</h2>
            </div>
            <p className="text-gray-600">Update your profile information and preferences.</p>
            <Link href="/profile" className="mt-4 inline-block text-blue-600 hover:underline">
              Edit profile
            </Link>
          </div>
          
          {/* Personalization Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-medium">Personalize Your News</h2>
            </div>
            <p className="text-gray-600">Tell us your interests so we can tailor your news experience.</p>
            <Link href="/personalization" className="mt-4 inline-block text-blue-600 hover:underline">
              Set Preferences
            </Link>
          </div>
          
          {/* Test User Name Link */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-medium">Test User Name</h2>
            </div>
            <p className="text-gray-600">Click below to test displaying your name on a separate page.</p>
            <Link href="/test-name" className="mt-4 inline-block text-blue-600 hover:underline">
              Test Name Display
            </Link>
          </div>
        </div>
      </main>
    </AppLayout>
  );
} 