'use client';

import { useState } from 'react';
import { getPerplexityCompletion, Message } from '@/lib/perplexity';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Test page for the Perplexity API
 * This page allows testing the API connection directly
 */
export default function TestPerplexityAPI() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  
  // Test the API connection
  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult('');
    setCitations([]);
    
    try {
      // Use the key from input or environment variable
      const key = apiKey || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';
      
      if (!key) {
        throw new Error('No API key provided. Please enter an API key or set NEXT_PUBLIC_PERPLEXITY_API_KEY in your .env.local file.');
      }
      
      // Simple test message with proper typing
      const messages: Message[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'What are the top business news headlines today?'
        }
      ];
      
      // Call the API
      const response = await getPerplexityCompletion(messages, key);
      
      // Display the result
      setResult(response.content);
      setCitations(response.citations);
    } catch (err) {
      console.error('Test API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Perplexity API Connection</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This page tests the connection to the Perplexity API. It will help diagnose any issues with your API key or configuration.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key (optional, will use environment variable if not provided)
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your Perplexity API key"
          />
        </div>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className={`px-4 py-2 rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <pre className="whitespace-pre-wrap text-red-600 text-sm">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Success</h2>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
          
          {citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <h3 className="text-sm font-semibold text-green-700 mb-2">Citations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {citations.map((citation, index) => (
                  <li key={index} className="text-xs">
                    <a 
                      href={citation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {new URL(citation).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Make sure you have a valid Perplexity API key.</li>
          <li>Check that your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file contains <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_PERPLEXITY_API_KEY=your_api_key</code>.</li>
          <li>Verify that your API key has sufficient credits and permissions.</li>
          <li>Check the browser console for detailed error messages.</li>
        </ul>
      </div>
    </div>
  );
} 