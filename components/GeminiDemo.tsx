// GeminiDemo.tsx - A component to demonstrate Gemini AI capabilities
'use client';

import { useState } from 'react';
import { generateContent } from '@/lib/gemini';

export default function GeminiDemo() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await generateContent(input);
      setResponse(result);
    } catch (error) {
      console.error('Error generating content:', error);
      setResponse('An error occurred while generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your prompt
          </label>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Type your prompt here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {response && (
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Response:</h2>
          <div className="p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 