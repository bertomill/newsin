'use client'; // Mark as client component since we use browser APIs and state

// Import necessary hooks from React and the Wave animation component
import { useEffect, useState } from 'react';
import Wave from 'react-wavify';

/**
 * Props interface for the WaveAnimation component
 * @property {string} className - Optional CSS classes to apply to the container
 */
interface WaveAnimationProps {
  className?: string;
}

/**
 * WaveAnimation Component
 * Creates a layered wave animation effect using multiple wave instances with different properties
 * The waves are stacked on top of each other with varying opacity, speed and size to create depth
 * 
 * @param {WaveAnimationProps} props - Component props
 * @returns {JSX.Element | null} The wave animation or null if not mounted
 */
export default function WaveAnimation({ className = '' }: WaveAnimationProps) {
  // Track if component has mounted on client-side
  const [mounted, setMounted] = useState(false);
  
  // Effect to set mounted state once component mounts on client
  // This prevents hydration errors since the wave animation uses browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side mounted
  if (!mounted) {
    return null;
  }

  return (
    // Container div with absolute positioning and overflow control
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {/* First wave layer - Darkest blue with largest amplitude
          This creates the main wave effect in the background */}
      <div className="absolute inset-x-0 bottom-0 h-full">
        <Wave 
          fill='rgba(59, 130, 246, 0.2)' // Blue with 20% opacity
          paused={false} // Animation constantly running
          options={{
            height: 40, // Tallest wave height
            amplitude: 40, // Largest wave amplitude
            speed: 0.15, // Slowest movement speed
            points: 3 // Fewest points for smoother, longer waves
          }}
          className="h-full"
        />
      </div>
      
      {/* Second wave layer - Medium blue with medium amplitude
          Creates a middle layer effect for depth */}
      <div className="absolute inset-x-0 bottom-0 h-full">
        <Wave 
          fill='rgba(96, 165, 250, 0.15)' // Lighter blue with 15% opacity
          paused={false}
          options={{
            height: 30, // Medium wave height
            amplitude: 30, // Medium amplitude
            speed: 0.2, // Medium speed
            points: 4 // More points for slightly more detailed waves
          }}
          className="h-full"
        />
      </div>
      
      {/* Third wave layer - Lightest blue with smallest amplitude
          Creates foreground effect with fastest movement */}
      <div className="absolute inset-x-0 bottom-0 h-full">
        <Wave 
          fill='rgba(191, 219, 254, 0.1)' // Very light blue with 10% opacity
          paused={false}
          options={{
            height: 20, // Shortest wave height
            amplitude: 20, // Smallest amplitude
            speed: 0.25, // Fastest speed
            points: 5 // Most points for detailed, shorter waves
          }}
          className="h-full"
        />
      </div>
    </div>
  );
} 