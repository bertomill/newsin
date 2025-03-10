import { NextRequest } from 'next/server';
import { AssistantApiRequest } from '../../types';
import { streamPerplexityCompletion, Message } from '@/lib/perplexity';

// Define environment variables for API keys
// In production, these should be set in your environment
const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';

/**
 * Streaming API route handler for the assistant
 * This handles streaming communication with the Perplexity API
 * 
 * @param request - The incoming request with user messages
 * @returns Streaming response with the AI assistant's reply
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json() as AssistantApiRequest;
    const { messages, userContext } = body;
    
    console.log('Streaming Assistant API received request:', JSON.stringify({ 
      messageCount: messages?.length,
      hasUserContext: !!userContext
    }));
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if we have an API key
    if (!PERPLEXITY_API_KEY) {
      console.error('Missing Perplexity API key - please set NEXT_PUBLIC_PERPLEXITY_API_KEY in your .env.local file');
      return new Response(
        JSON.stringify({ 
          error: 'Missing API key',
          content: "I'm sorry, but I can't process your request right now due to a configuration issue. Please make sure the Perplexity API key is set in the environment variables."
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract user business context to enhance the system prompt
    let enhancedSystemPrompt = '';
    
    if (userContext) {
      const { business, role, themes } = userContext;
      
      // Build context from business information
      if (business?.sector) {
        const sector = business.sector === 'other' && business.otherSector 
          ? business.otherSector 
          : business.sector;
        
        enhancedSystemPrompt += `The user works in the ${sector} sector. `;
      }
      
      if (business?.description) {
        enhancedSystemPrompt += `Their business: ${business.description}. `;
      }
      
      // Add role information
      if (role?.type) {
        const roleType = role.type === 'other' && role.otherType 
          ? role.otherType 
          : role.type;
        
        enhancedSystemPrompt += `Their role is ${roleType}. `;
      }
      
      // Add themes they're interested in
      if (themes?.selected && themes.selected.length > 0) {
        enhancedSystemPrompt += `They're tracking these key themes: ${themes.selected.join(', ')}. `;
      }
      
      if (themes?.custom) {
        enhancedSystemPrompt += `Additional themes of interest: ${themes.custom}. `;
      }
    }
    
    // Format messages for the Perplexity API
    const formattedMessages: Message[] = [];
    
    // 1. Add system message with enhanced context
    const systemMessage = messages.find(msg => msg.role === 'system');
    formattedMessages.push({
      role: 'system',
      content: systemMessage 
        ? `${systemMessage.content} ${enhancedSystemPrompt}. Provide comprehensive, well-researched responses with relevant details and insights. Include citations where appropriate.`
        : `You are a helpful AI assistant for a news application. ${enhancedSystemPrompt} Provide comprehensive, well-researched responses with relevant details and insights. Include citations where appropriate.`
    });
    
    // 2. Add conversation history (the validation will happen in the utility function)
    const conversationHistory = messages.filter(msg => msg.role !== 'system');
    formattedMessages.push(...conversationHistory);
    
    console.log('Streaming from Perplexity API with conversation history');
    
    try {
      // Get the streaming response from Perplexity
      const rawStream = await streamPerplexityCompletion(
        formattedMessages,
        PERPLEXITY_API_KEY
      );
      
      // Create a TransformStream to process the raw stream
      const { readable, writable } = new TransformStream();
      
      // Process the stream in the background
      const processStream = async () => {
        const reader = rawStream.getReader();
        const writer = writable.getWriter();
        const textDecoder = new TextDecoder();
        const textEncoder = new TextEncoder();
        
        let citations: string[] = [];
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the chunk
            const chunk = textDecoder.decode(value, { stream: true });
            
            // Process the chunk - extract only the content from the JSON
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonData = JSON.parse(line.substring(6));
                  
                  // Extract content delta if available
                  if (jsonData.choices && 
                      jsonData.choices[0] && 
                      jsonData.choices[0].delta && 
                      jsonData.choices[0].delta.content) {
                    
                    const contentDelta = jsonData.choices[0].delta.content;
                    
                    // Send only the content delta to the client
                    await writer.write(textEncoder.encode(contentDelta));
                  }
                  
                  // Store citations if available
                  if (jsonData.citations && jsonData.citations.length > 0) {
                    citations = jsonData.citations;
                  }
                } catch (e) {
                  console.error('Error parsing JSON from stream:', e);
                }
              }
            }
          }
          
          // If we have citations, send them at the end
          if (citations.length > 0) {
            const citationsText = '\n\nSources:\n' + citations.map((url, i) => `[${i+1}] ${url}`).join('\n');
            await writer.write(textEncoder.encode(citationsText));
          }
          
        } catch (error) {
          console.error('Error processing stream:', error);
          await writer.write(textEncoder.encode(`\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`));
        } finally {
          await writer.close();
        }
      };
      
      // Start processing the stream
      processStream().catch(error => {
        console.error('Unhandled error in stream processing:', error);
      });
      
      // Return the readable part of the transform stream
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
      
    } catch (error) {
      console.error('Error streaming from Perplexity API:', error);
      
      // Provide a more specific error message for timeouts
      const errorMessage = error instanceof Error && 
        (error.message.includes('timed out') || error.name === 'AbortError')
        ? "I'm sorry, but the streaming request timed out. The Perplexity API is taking too long to respond. Please try a simpler query or try again later."
        : "I'm sorry, but I couldn't stream the information you requested. There was an error communicating with the Perplexity API. Please check the console logs for more details.";
      
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          content: errorMessage
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in streaming assistant API route:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        content: "I'm sorry, but an error occurred while processing your streaming request. Please check the console logs for more details."
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 