'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // State to track the current user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);

  // Check authentication status when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('AppLayout: User authenticated:', currentUser);
        console.log('AppLayout: User displayName:', currentUser.displayName);
        console.log('AppLayout: User email:', currentUser.email);
        setUser(currentUser);
      } else {
        console.log('AppLayout: No user authenticated, redirecting to login');
        router.push('/login');
      }
      setLoading(false);
    });

    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [auth, router]);

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar user={user} onSignOut={handleSignOut} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto md:ml-0">
        {children}
      </div>
    </div>
  );
} 