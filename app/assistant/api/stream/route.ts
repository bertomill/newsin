import { NextRequest } from 'next/server';
import { AssistantApiRequest } from '../../types';
import { streamPerplexityCompletion, Message } from '@/lib/perplexity';
import { streamProcessContent } from '@/lib/gemini';

// Define environment variables for API keys
// In production, these should be set in your environment
const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';

// Minimum content length before processing with Gemini
const MIN_CONTENT_LENGTH = 50;

// Maximum buffer size before forcing processing
const MAX_BUFFER_SIZE = 200;

// Maximum time to wait for a complete sentence (in milliseconds)
const MAX_WAIT_TIME = 5000;

// Sentence ending patterns
const SENTENCE_ENDINGS = /[.!?]\s*$/;

// Content completion markers
const COMPLETION_MARKERS = ['In conclusion', 'To summarize', '## Summary'];

/**
 * Check if content appears to be a complete thought
 * @param content - The content to check
 * @returns boolean indicating if content is complete
 */
function isCompleteThought(content: string): boolean {
  return SENTENCE_ENDINGS.test(content) || 
         COMPLETION_MARKERS.some(marker => content.includes(marker));
}

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
    
    // Format messages for the Perplexity API
    const formattedMessages: Message[] = [];
    
    // Build a more focused personalization context
    let personalizedContext = '';
    if (userContext) {
      const { business, role, themes } = userContext;
      
      // Create focused business context
      if (business?.sector || business?.description) {
        personalizedContext += '## Business Context\n';
        if (business.sector) {
          const sector = business.sector === 'other' ? business.otherSector : business.sector;
          personalizedContext += `Industry: ${sector}\n`;
        }
        if (business.description) {
          personalizedContext += `Focus: ${business.description}\n`;
        }
      }
      
      // Add role context
      if (role?.type) {
        personalizedContext += '## User Role\n';
        const roleType = role.type === 'other' ? role.otherType : role.type;
        personalizedContext += `Position: ${roleType}\n`;
      }
      
      // Add theme preferences
      if (themes) {
        const hasSelectedThemes = themes.selected && themes.selected.length > 0;
        const hasCustomThemes = themes.custom && themes.custom.trim() !== '';
        
        if (hasSelectedThemes || hasCustomThemes) {
          personalizedContext += '## Key Interests\n';
          if (hasSelectedThemes && themes.selected) {
            personalizedContext += `Primary themes: ${themes.selected.join(', ')}\n`;
          }
          if (hasCustomThemes) {
            personalizedContext += `Custom interests: ${themes.custom}\n`;
          }
        }
      }
    }

    formattedMessages.push({
      role: 'system',
      content: `You are an experienced news reporter for a leading business publication.
${personalizedContext}

CRITICAL INSTRUCTIONS:
1. Present information in clear, concise bullet points
2. Each major statement must end with "(read more: [X])" citation
3. Focus on facts relevant to the user's industry and role
4. Organize content by themes matching user interests
5. Keep responses focused and avoid repetition
6. Limit to 3-5 key points total
7. End response once key points are covered`
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
        
        let fullContent = '';
        let contentBuffer = '';
        let lastProcessTime = Date.now();
        let processedLength = 0;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining content in the buffer
              if (contentBuffer.length > 0) {
                const geminiStream = await streamProcessContent(contentBuffer);
                if (geminiStream) {
                  for await (const chunk of geminiStream) {
                    await writer.write(textEncoder.encode(chunk.text()));
                  }
                } else {
                  await writer.write(textEncoder.encode(contentBuffer));
                }
              }
              break;
            }
            
            // Decode the chunk
            const chunk = textDecoder.decode(value, { stream: true });
            
            // Process each line
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const content = line.substring(6);
                  
                  if (content === '[DONE]') continue;
                  
                  // Add to buffer
                  contentBuffer += content;
                  fullContent += content;
                  
                  // Check if we should process the buffer
                  const timeWaiting = Date.now() - lastProcessTime;
                  const hasMinLength = contentBuffer.length >= MIN_CONTENT_LENGTH;
                  const isComplete = isCompleteThought(contentBuffer);
                  const isOversize = contentBuffer.length >= MAX_BUFFER_SIZE;
                  const waitedTooLong = timeWaiting >= MAX_WAIT_TIME;
                  
                  // Only process if we have enough content and either:
                  // 1. We have a complete thought, or
                  // 2. Buffer is too large, or
                  // 3. We've waited too long
                  if (hasMinLength && (isComplete || isOversize || waitedTooLong)) {
                    // Avoid processing duplicate content
                    const newContent = contentBuffer.substring(processedLength);
                    if (newContent.length > 0) {
                      const geminiStream = await streamProcessContent(newContent);
                      if (geminiStream) {
                        for await (const chunk of geminiStream) {
                          await writer.write(textEncoder.encode(chunk.text()));
                        }
                      } else {
                        await writer.write(textEncoder.encode(newContent));
                      }
                      processedLength = contentBuffer.length;
                    }
                    
                    // Reset buffer and timer
                    contentBuffer = '';
                    lastProcessTime = Date.now();
                  }
                } catch (e) {
                  console.error('Error processing stream line:', e);
                  if (contentBuffer.length > 0) {
                    await writer.write(textEncoder.encode(contentBuffer));
                    contentBuffer = '';
                    lastProcessTime = Date.now();
                  }
                  continue;
                }
              }
            }
          }
          
          console.log('Full content length:', fullContent.length);
          
        } catch (error) {
          console.error('Error processing stream:', error);
          if (contentBuffer.length > 0) {
            await writer.write(textEncoder.encode(contentBuffer));
          }
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