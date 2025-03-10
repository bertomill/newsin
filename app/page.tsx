// Import necessary dependencies
import Link from 'next/link'; // Next.js Link component for client-side navigation
import { ArrowRight } from 'lucide-react'; // Icon component from lucide-react library
import WaveAnimation from '@/components/WaveAnimation';

// Main Home page component
export default function Home() {
  return (
    // Main container with full height and column layout
    <main className="flex min-h-screen flex-col">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center py-6 px-8 md:px-12 relative z-10">
        {/* Logo/Brand Section */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Newsin</h1>
        </div>
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {/* Standard navigation links with hover effects */}
          <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/features" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          {/* Login button with distinct styling */}
          <Link 
            href="/login" 
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section - Main landing area */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Wave animation */}
        <WaveAnimation />
        
        {/* Main headline - responsive text sizing */}
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold max-w-4xl mb-6">
            Stay informed with AI-powered news insights
          </h1>
          {/* Subheadline with gray text */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-10">
            Personalized news, summaries, and insights powered by cutting-edge AI technology
          </p>
          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary CTA button with arrow icon */}
            <Link 
              href="/signup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {/* Secondary CTA button */}
            <Link 
              href="/demo" 
              className="border border-gray-300 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 md:px-12 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          {/* Features grid - responsive layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 - AI Insights */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Get intelligent summaries and analysis of news articles using cutting-edge AI technology.</p>
            </div>
            {/* Feature Card 2 - Personalized Feed */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Feed</h3>
              <p className="text-gray-600">News tailored to your interests and reading habits, continuously improving over time.</p>
            </div>
            {/* Feature Card 3 - Interactive Chat */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Chat</h3>
              <p className="text-gray-600">Ask questions about news topics and get intelligent, informative responses in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 px-8 md:px-12 border-t relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          {/* Copyright notice */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© 2024 Newsin. All rights reserved.</p>
          </div>
          {/* Footer links */}
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
