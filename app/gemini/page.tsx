// Import the GeminiDemo component from our components directory
import GeminiDemo from '@/components/GeminiDemo';

// Define page metadata for SEO and page information
export const metadata = {
  title: 'Gemini AI Demo | Newsin', // Page title that appears in browser tab
  description: 'Explore the capabilities of Gemini AI via Firebase Vertex AI integration', // Meta description for SEO
};

// Main page component for the Gemini AI demo
export default function GeminiPage() {
  return (
    // Container div with responsive padding and margin
    <div className="container mx-auto py-8">
      {/* Main heading for the page */}
      <h1 className="text-3xl font-bold mb-6">Gemini AI via Firebase Vertex AI</h1>
      
      {/* Descriptive paragraph explaining the demo's features */}
      <p className="text-gray-600 mb-8">
        This demo showcases the integration of Gemini AI through Firebase Vertex AI.
        Try out different features like text generation, streaming responses, and chat functionality.
      </p>
      
      {/* Render the GeminiDemo component that contains the actual demo functionality */}
      <GeminiDemo />
    </div>
  );
} 