import { NextRequest, NextResponse } from 'next/server';
import { AssistantApiRequest, AssistantApiResponse } from '../types';
import { getPerplexityCompletion, Message } from '@/lib/perplexity';

// Define environment variables for API keys
// In production, these should be set in your environment
const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';

/**
 * API route handler for the assistant
 * This handles communication with the Perplexity API
 * 
 * @param request - The incoming request with user messages
 * @returns Response with the AI assistant's reply
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json() as AssistantApiRequest;
    const { messages, userContext } = body;
    
    console.log('Assistant API received request:', JSON.stringify({ 
      messageCount: messages?.length,
      hasUserContext: !!userContext
    }));
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' } as AssistantApiResponse,
        { status: 400 }
      );
    }
    
    // Check if we have an API key
    if (!PERPLEXITY_API_KEY) {
      console.error('Missing Perplexity API key - please set NEXT_PUBLIC_PERPLEXITY_API_KEY in your .env.local file');
      return NextResponse.json(
        { 
          content: "I'm sorry, but I can't process your request right now due to a configuration issue. Please make sure the Perplexity API key is set in the environment variables.",
          error: 'Missing API key'
        } as AssistantApiResponse,
        { status: 500 }
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
        ? `${systemMessage.content} ${enhancedSystemPrompt}. CRITICAL INSTRUCTION: You MUST start your response with a complete sentence that begins with a capital letter and ends with proper punctuation. NEVER start with a partial phrase or a continuation of a thought. Your first sentence must be self-contained and complete. IMPORTANT: You MUST provide complete, comprehensive responses that fully utilize all context provided by the user. Your response should be thorough and detailed. Do not truncate or abbreviate your responses. Ensure proper formatting with clear sections, headings, and bullet points where appropriate. Include relevant citations. If the user's query is about trends or industry information, provide a structured, well-organized response covering all relevant aspects.`
        : `You are a helpful AI assistant for a news application. ${enhancedSystemPrompt} CRITICAL INSTRUCTION: You MUST start your response with a complete sentence that begins with a capital letter and ends with proper punctuation. NEVER start with a partial phrase or a continuation of a thought. Your first sentence must be self-contained and complete. IMPORTANT: You MUST provide complete, comprehensive responses that fully utilize all context provided by the user. Your response should be thorough and detailed. Do not truncate or abbreviate your responses. Ensure proper formatting with clear sections, headings, and bullet points where appropriate. Include relevant citations. If the user's query is about trends or industry information, provide a structured, well-organized response covering all relevant aspects.`
    });
    
    // 2. Add conversation history (the validation will happen in the utility function)
    const conversationHistory = messages.filter(msg => msg.role !== 'system');
    formattedMessages.push(...conversationHistory);
    
    console.log('Calling Perplexity API with conversation history');
    
    // Set a timeout for the entire API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out after 55 seconds')), 55000);
    });
    
    // Call the Perplexity API using our utility function with a race against timeout
    try {
      const result = await Promise.race([
        getPerplexityCompletion(formattedMessages, PERPLEXITY_API_KEY),
        timeoutPromise
      ]);
      
      const { content, citations } = result as { content: string; citations: string[] };
      
      console.log('Received response from Perplexity API');
      
      // Return the response
      return NextResponse.json({
        content,
        citations
      } as AssistantApiResponse);
      
    } catch (error) {
      console.error('Error from Perplexity API:', error);
      
      // Provide a more specific error message for timeouts
      const errorMessage = error instanceof Error && 
        (error.message.includes('timed out') || error.name === 'AbortError')
        ? "I'm sorry, but the request timed out. The Perplexity API is taking too long to respond. Please try a simpler query or try again later."
        : "I'm sorry, but I couldn't retrieve the information you requested. There was an error communicating with the Perplexity API. Please check the console logs for more details.";
      
      return NextResponse.json(
        { 
          content: errorMessage,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as AssistantApiResponse,
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in assistant API route:', error);
    
    return NextResponse.json(
      { 
        content: "I'm sorry, but an error occurred while processing your request. Please check the console logs for more details.",
        error: error instanceof Error ? error.message : 'Internal server error'
      } as AssistantApiResponse,
      { status: 500 }
    );
  }
} 