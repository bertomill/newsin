'use client';

import { useState } from 'react';
import { generateContent, generateContentStream, createChatSession } from '@/lib/gemini-firebase';

/**
 * GeminiDemo component
 * 
 * This component demonstrates different ways to use the Gemini API via Firebase Vertex AI:
 * 1. Basic text generation
 * 2. Streaming text generation
 * 3. Chat functionality
 */
export default function GeminiDemo() {
  // State for basic text generation
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for streaming text generation
  const [streamPrompt, setStreamPrompt] = useState('');
  const [streamResult, setStreamResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // State for chat functionality
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Create a chat session
  const [chatSession] = useState(() => createChatSession());
  
  // Handle basic text generation
  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const content = await generateContent(prompt);
      setResult(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setResult('An error occurred while generating content.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle streaming text generation
  const handleStreamContent = async () => {
    if (!streamPrompt.trim()) return;
    
    setIsStreaming(true);
    setStreamResult('');
    
    try {
      await generateContentStream(streamPrompt, (chunk) => {
        setStreamResult(prev => prev + chunk);
      });
    } catch (error) {
      console.error('Error streaming content:', error);
      setStreamResult('An error occurred while streaming content.');
    } finally {
      setIsStreaming(false);
    }
  };
  
  // Handle chat message submission
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setIsChatLoading(true);
    
    // Add user message to UI
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    
    try {
      // Send message to chat session
      const response = await chatSession.sendMessage(chatMessage);
      
      // Add model response to UI
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: 'An error occurred in the chat session.' 
      }]);
    } finally {
      setIsChatLoading(false);
      setChatMessage('');
    }
  };
  
  // Clear chat history
  const handleClearChat = () => {
    chatSession.clearHistory();
    setChatHistory([]);
  };
  
  return (
    <div className="space-y-12 p-6">
      {/* Basic Text Generation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Basic Text Generation</h2>
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            onClick={handleGenerateContent}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
        {result && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Result:</h3>
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </section>
      
      {/* Streaming Text Generation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Streaming Text Generation</h2>
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter your prompt for streaming..."
            value={streamPrompt}
            onChange={(e) => setStreamPrompt(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            onClick={handleStreamContent}
            disabled={isStreaming || !streamPrompt.trim()}
          >
            {isStreaming ? 'Streaming...' : 'Stream Content'}
          </button>
        </div>
        {streamResult && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Streaming Result:</h3>
            <div className="whitespace-pre-wrap">{streamResult}</div>
          </div>
        )}
      </section>
      
      {/* Chat Functionality */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Chat with Gemini</h2>
        <div className="border rounded-md overflow-hidden">
          {/* Chat History */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500">
                Start a conversation with Gemini
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-auto' 
                      : 'bg-white border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ))
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
            />
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
              onClick={handleSendChatMessage}
              disabled={isChatLoading || !chatMessage.trim()}
            >
              {isChatLoading ? 'Sending...' : 'Send'}
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
              onClick={handleClearChat}
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 