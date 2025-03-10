'use client';

// Import necessary dependencies
import { useState } from 'react'; // For managing component state
import Link from 'next/link'; // For client-side navigation
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Firebase auth methods
import { app } from '@/lib/firebase'; // Firebase app instance
import { FirebaseError } from 'firebase/app';

// Login page component
export default function Login() {
  // State management using hooks
  const [email, setEmail] = useState(''); // Email input state
  const [password, setPassword] = useState(''); // Password input state
  const [error, setError] = useState(''); // Error message state
  const [loading, setLoading] = useState(false); // Loading state for UI feedback
  const router = useRouter(); // Router instance for navigation
  const auth = getAuth(app); // Get Firebase auth instance

  // Handle email/password login submission
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any existing errors
    setLoading(true); // Set loading state

    try {
      // Attempt to sign in with email/password
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home'); // Redirect to home page on success
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof FirebaseError) {
        setError(error.message || 'Failed to login. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    setError(''); // Clear any existing errors
    setLoading(true); // Set loading state

    try {
      // Create Google auth provider and attempt sign in
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/home'); // Redirect to home page on success
    } catch (error: unknown) {
      console.error('Google login error:', error);
      if (error instanceof FirebaseError) {
        setError(error.message || 'Failed to login with Google. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo/brand */}
      <header className="py-6 px-8 border-b">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Newsin</Link>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Welcome message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Error message display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password input field */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social login options */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {/* Google icon */}
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z"
                  fill="#4285F4"
                />
              </svg>
              Google
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 