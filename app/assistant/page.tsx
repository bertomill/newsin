'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import AppLayout from '@/components/AppLayout';
import { Message, UserBusinessContext } from './types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Suggested topics for the user to ask about
const SUGGESTED_TOPICS = [
  "What are the latest trends in my industry?",
  "Summarize recent news about my business sector",
  "What should I know about my key themes today?",
  "How is AI transforming my industry?",
  "What are my competitors doing?"
];

export default function Assistant() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userBusinessInfo, setUserBusinessInfo] = useState<UserBusinessContext | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat with personalized welcome message
  const initializeChat = useCallback(
    (
      businessDescription = '',
      role = '',
      themes: string[] = []
    ) => {
      // Create system message with user context
      const systemMessage: Message = {
        id: generateId(),
        role: 'system',
        content: `You are an AI assistant for a news application. The user is ${userName || 'a professional'} who works in ${businessDescription || 'their industry'}${role ? ` as a ${role}` : ''}. They are interested in ${themes.length > 0 ? themes.join(', ') : 'various business topics'}. Provide helpful, concise information about news and trends relevant to their interests.`,
        timestamp: new Date()
      };
      
      // Create welcome message
      const welcomeMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Hello${userName ? `, ${userName}` : ''}! I'm your AI news assistant. I can help you stay updated on the latest news and trends${businessDescription ? ` relevant to ${businessDescription}` : ' in your industry'}. What would you like to know about today?`,
        timestamp: new Date()
      };
      
      setMessages([systemMessage, welcomeMessage]);
    },
    [userName]
  );
  
  // Initialize with system message and welcome message
  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Assistant page - User authenticated:', user.uid);
        
        // Get user's name for greeting
        if (user.displayName) {
          setUserName(user.displayName.split(' ')[0]);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }
        
        // Load user's business information
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserBusinessInfo({
              business: userData.business || {},
              role: userData.role || {},
              themes: userData.themes || {}
            });
            
            // Initialize chat with welcome message
            initializeChat(
              userData.business?.description || '',
              userData.role?.type || '',
              userData.themes?.selected || []
            );
          } else {
            // Initialize with generic welcome if no user data
            initializeChat();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          initializeChat();
        }
        
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router, initializeChat]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    
    // Create a temporary message ID for the streaming response
    const tempAssistantId = generateId();
    
    // Add a placeholder assistant message that will be updated as we receive chunks
    const assistantMessage: Message = {
      id: tempAssistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      citations: []
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Create a timeout for the API call
    const apiTimeout = setTimeout(() => {
      // If this timeout fires, the API call is taking too long
      if (isProcessing) {
        // Update the placeholder message with a timeout notice
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempAssistantId 
              ? {
                  ...msg, 
                  content: msg.content + "\n\nI'm still processing your request. The Perplexity API might be experiencing high load or your query might be complex. Please wait while I continue working on a complete response."
                }
              : msg
          )
        );
      }
    }, 15000); // Show a partial response after 15 seconds
    
    try {
      // Get system message for context
      const systemMessage = messages.find(msg => msg.role === 'system');
      
      // Get the conversation history, ensuring alternating user/assistant messages
      // First, filter out system messages
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      
      // Create an array to hold properly alternating messages
      const alternatingMessages = [];
      let lastRole = null;
      
      // Always start with a user message after system message
      // If the first non-system message is from assistant, skip it
      let startIdx = nonSystemMessages.length - 1;
      if (nonSystemMessages.length > 0 && nonSystemMessages[0].role === 'assistant') {
        startIdx = nonSystemMessages.length - 2;
      }
      
      // Process messages to ensure alternation, but preserve more context
      // Include up to 8 messages for more context (increased from 4)
      for (let i = startIdx; i >= 0; i--) {
        const msg = nonSystemMessages[i];
        
        // Skip if same role as previous message (avoid consecutive same roles)
        if (msg.role === lastRole) {
          continue;
        }
        
        // Add message to our alternating list
        alternatingMessages.unshift({
          role: msg.role,
          content: msg.content
        });
        
        lastRole = msg.role;
        
        // Limit to last 8 messages for context (plus the new user message we'll add)
        if (alternatingMessages.length >= 8) {
          break;
        }
      }
      
      // Ensure the sequence starts with a user message
      if (alternatingMessages.length > 0 && alternatingMessages[0].role !== 'user') {
        // Remove the first message if it's not from a user
        alternatingMessages.shift();
      }
      
      // Add the current user message if not already present
      // If the last message in our alternating list is already a user message,
      // replace it with the current one to maintain alternation
      if (alternatingMessages.length > 0 && 
          alternatingMessages[alternatingMessages.length - 1].role === 'user') {
        alternatingMessages[alternatingMessages.length - 1] = {
          role: 'user',
          content: inputMessage
        };
      } else {
        // Otherwise just add the new user message
        alternatingMessages.push({
          role: 'user',
          content: inputMessage
        });
      }
      
      // Prepare API request payload with conversation history
      const payload = {
        messages: [
          {
            role: 'system',
            content: systemMessage?.content || 'You are a helpful AI assistant for a news application.'
          },
          ...alternatingMessages
        ],
        userContext: userBusinessInfo
      };
      
      console.log('Sending request to streaming assistant API');
      
      // Use the streaming API endpoint
      const response = await fetch('/assistant/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Clear the timeout since we got a response
      clearTimeout(apiTimeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming Assistant API error status:', response.status);
        console.error('Streaming Assistant API error response:', errorText);
        throw new Error(`Failed to get streaming response: ${response.status} ${errorText}`);
      }
      
      // Check if we have a readable stream
      if (!response.body) {
        throw new Error('No response body received from streaming API');
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode the chunk and add it to our accumulated content
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          
          // Update the message with the accumulated content so far
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempAssistantId 
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
          
          // Scroll to the bottom as new content arrives
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        
        console.log('Streaming completed');
        
        // Final update with any remaining content
        const finalChunk = decoder.decode();
        if (finalChunk) {
          accumulatedContent += finalChunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempAssistantId 
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }
        
      } catch (streamError) {
        console.error('Error processing stream:', streamError);
        throw streamError;
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      // Clear the timeout in case of error
      clearTimeout(apiTimeout);
      
      console.error('Error getting streaming assistant response:', error);
      
      // Update the placeholder message with the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAssistantId 
            ? {
                ...msg, 
                content: `Sorry, I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again.'}`
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle clicking a suggested topic
  const handleSuggestedTopic = (topic: string) => {
    setInputMessage(topic);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Chat header */}
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">News Assistant</h1>
          <p className="text-gray-600">Ask me anything about news and trends relevant to your business</p>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.filter(msg => msg.role !== 'system').map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-gray-800' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Sources:</p>
                    <ul className="text-xs text-blue-600">
                      {message.citations.map((citation, index) => (
                        <li key={index}>
                          <a 
                            href={citation} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {new URL(citation).hostname}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
          
          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Suggested topics */}
        {messages.length <= 2 && (
          <div className="px-4 py-3 border-t">
            <p className="text-sm text-gray-500 mb-2">Suggested topics:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedTopic(topic)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="w-full p-3 focus:outline-none resize-none"
                rows={1}
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className={`p-3 rounded-lg ${
                !inputMessage.trim() || isProcessing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 