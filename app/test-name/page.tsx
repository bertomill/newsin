'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';

export default function TestName() {
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('TestName page - User authenticated:', user);
        console.log('TestName page - User displayName:', user.displayName);
        console.log('TestName page - User email:', user.email);
        
        // Try to get first name from displayName
        if (user.displayName) {
          const firstNameFromDisplay = user.displayName.split(' ')[0];
          console.log('TestName page - Using first name from displayName:', firstNameFromDisplay);
          setFirstName(firstNameFromDisplay);
        } 
        // Fallback to email if no displayName
        else if (user.email) {
          const firstNameFromEmail = user.email.split('@')[0];
          console.log('TestName page - Using first name from email:', firstNameFromEmail);
          setFirstName(firstNameFromEmail);
        }
        // Final fallback
        else {
          console.log('TestName page - No displayName or email, using default');
          setFirstName('User');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Test Name Page</h1>
          <Link href="/home" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-6">Hello, {firstName}!</h2>
          <p className="text-gray-600 text-center mb-8">
            This is a test page to demonstrate displaying the user&apos;s first name.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
            <p className="text-sm text-blue-700">First Name: {firstName}</p>
          </div>
          <div className="text-center">
            <Link 
              href="/home" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 