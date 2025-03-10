/**
 * Perplexity API Integration
 * 
 * This file contains utility functions for interacting with the Perplexity API.
 * It provides a clean interface for making API calls and handling responses.
 */

// Define the message type for chat completions
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define the API response type
interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

/**
 * Validates that messages follow the Perplexity API requirements:
 * - First message(s) must be system messages (optional)
 * - After system messages, user and assistant messages must alternate
 * - The last message must be from the user
 * 
 * @param messages - Array of messages to validate
 * @returns Validated and potentially fixed messages array
 */
function validateMessages(messages: Message[]): Message[] {
  if (messages.length === 0) {
    return [];
  }
  
  const result: Message[] = [];
  let systemMessagesDone = false;
  let lastRole: 'user' | 'assistant' | null = null;
  
  // Process each message
  for (const msg of messages) {
    // Handle system messages (must come first)
    if (msg.role === 'system') {
      if (systemMessagesDone) {
        console.warn('System message found after non-system messages - skipping');
        continue;
      }
      result.push(msg);
      continue;
    }
    
    // Once we see a non-system message, mark system messages as done
    systemMessagesDone = true;
    
    // First non-system message must be from user
    if (lastRole === null && msg.role !== 'user') {
      console.warn('First non-system message must be from user - skipping assistant message');
      continue;
    }
    
    // Ensure alternating pattern
    if (lastRole === msg.role) {
      console.warn(`Skipping consecutive ${msg.role} message to maintain alternating pattern`);
      continue;
    }
    
    result.push(msg);
    lastRole = msg.role as 'user' | 'assistant';
  }
  
  // Ensure the last message is from the user
  if (result.length > 1 && result[result.length - 1].role !== 'user') {
    console.warn('Removing last assistant message to ensure the conversation ends with a user message');
    result.pop();
  }
  
  return result;
}

/**
 * Sends a request to the Perplexity API for chat completions
 * 
 * @param messages - Array of messages in the conversation
 * @param apiKey - Perplexity API key
 * @returns The API response with content and citations
 */
export async function getPerplexityCompletion(
  messages: Message[],
  apiKey: string
): Promise<{ content: string; citations: string[] }> {
  try {
    // Log original messages for debugging
    console.log('Original messages before validation:', JSON.stringify(messages.map(m => ({ role: m.role, contentLength: m.content.length }))));
    
    // Validate and fix messages to ensure they meet Perplexity API requirements
    const validatedMessages = validateMessages(messages);
    
    if (validatedMessages.length === 0) {
      throw new Error('No valid messages to send to Perplexity API');
    }
    
    console.log('Calling Perplexity API with validated messages:', JSON.stringify(validatedMessages));
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout
    
    try {
      // Make the API request with timeout
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "sonar-pro", // Using sonar-pro for larger context window (200k) and enhanced capabilities
          messages: validatedMessages,
          temperature: 0.4, // Slightly reduced for more precise financial analysis
          max_tokens: 2500, // Increased for more comprehensive financial analysis
          search_recency_filter: "day", // Keep recent news focus
          stream: true // For streaming route
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error status:', response.status);
        console.error('Perplexity API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      // Parse the response
      const data: PerplexityResponse = await response.json();
      console.log('Perplexity API response received');

      // Extract the content and citations
      const content = data.choices[0]?.message?.content || 
        "I'm sorry, but I couldn't generate a response. Please try again.";
      
      const citations = data.citations || [];

      return { content, citations };
    } catch (error) {
      clearTimeout(timeoutId); // Ensure timeout is cleared if there's an error
      throw error;
    }
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request to Perplexity API timed out after 55 seconds');
    }
    throw error;
  }
}

/**
 * Streams a response from the Perplexity API for chat completions
 * 
 * @param messages - Array of messages in the conversation
 * @param apiKey - Perplexity API key
 * @returns A ReadableStream of the API response
 */
export async function streamPerplexityCompletion(
  messages: Message[],
  apiKey: string
): Promise<ReadableStream> {
  try {
    // Log original messages for debugging
    console.log('Original messages before validation:', JSON.stringify(messages.map(m => ({ role: m.role, contentLength: m.content.length }))));
    
    // Validate and fix messages to ensure they meet Perplexity API requirements
    const validatedMessages = validateMessages(messages);
    
    if (validatedMessages.length === 0) {
      throw new Error('No valid messages to send to Perplexity API');
    }
    
    console.log('Streaming from Perplexity API with validated messages:', JSON.stringify(validatedMessages));
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout
    
    try {
      // Make the streaming API request
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "sonar-pro", // Using sonar-pro for larger context window (200k) and enhanced capabilities
          messages: validatedMessages,
          temperature: 0.4, // Slightly reduced for more precise financial analysis
          max_tokens: 2500, // Increased for more comprehensive financial analysis
          search_recency_filter: "day", // Keep recent news focus
          stream: true // For streaming route
        }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorText = await response.text();
        console.error('Perplexity API streaming error:', response.status);
        console.error('Perplexity API streaming error response:', errorText);
        throw new Error(`API streaming request failed with status ${response.status}: ${errorText}`);
      }
      
      // Check if we have a readable stream
      if (!response.body) {
        clearTimeout(timeoutId);
        throw new Error('No response body received from Perplexity API');
      }
      
      // Create a transformer to process the stream
      const transformStream = new TransformStream({
        start() {
          // Initialize any state here
        },
        transform(chunk, controller) {
          // Reset the timeout on each chunk
          clearTimeout(timeoutId);
          
          // Forward the chunk
          controller.enqueue(chunk);
          
          // Set a new timeout
          setTimeout(() => {
            try {
              if (controller) controller.error(new Error('Stream processing timed out'));
            } catch (e) {
              console.error('Error terminating stream:', e);
            }
          }, 55000);
        },
        flush() {
          // Clear the timeout when stream is done
          clearTimeout(timeoutId);
        }
      });
      
      // Pipe the response through our transformer
      return response.body.pipeThrough(transformStream);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Error streaming from Perplexity API:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Streaming request to Perplexity API timed out after 55 seconds');
    }
    throw error;
  }
}

/**
 * Perplexity API utility functions
 * 
 * This file contains helper functions for interacting with the Perplexity API
 * for internet search functionality in the Newsin application.
 */

// The base URL for the Perplexity API
const PERPLEXITY_API_URL = 'https://api.perplexity.ai';

/**
 * Interface for search options
 */
interface SearchOptions {
  query: string;
  max_results?: number;
  include_images?: boolean;
  include_links?: boolean;
}

/**
 * Interface for search result
 */
interface SearchResult {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  published_date?: string;
  image_url?: string;
}

/**
 * Interface for search response
 */
interface SearchResponse {
  query: string;
  results: SearchResult[];
  search_id: string;
}

/**
 * Search the internet using Perplexity API
 * 
 * @param options - Search options
 * @returns Promise with search results
 */
export async function searchInternet(options: SearchOptions): Promise<SearchResponse> {
  const { query, max_results = 5, include_images = true, include_links = true } = options;
  
  try {
    const response = await fetch(`${PERPLEXITY_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        max_results,
        include_images,
        include_links
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching with Perplexity:', error);
    throw error;
  }
}

/**
 * Get the latest news on a specific topic
 * 
 * @param topic - The news topic to search for
 * @param count - Number of results to return (default: 5)
 * @returns Promise with search results
 */
export async function getLatestNews(topic: string, count: number = 5): Promise<SearchResult[]> {
  try {
    const response = await searchInternet({
      query: `latest news about ${topic}`,
      max_results: count,
      include_images: true,
      include_links: true
    });
    
    return response.results;
  } catch (error) {
    console.error(`Error getting latest news about ${topic}:`, error);
    return [];
  }
} 