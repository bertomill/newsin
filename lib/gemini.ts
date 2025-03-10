import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Get the generative model
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 1000,
  }
});

// System instruction for post-processing
const SYSTEM_INSTRUCTION = `You are a professional financial news editor specializing in AI and technology trends.
Your task is to enhance raw AI-generated content while maintaining accuracy and improving readability.
Be extremely concise and focused.

Key requirements:
1. Keep responses under 1000 tokens
2. Preserve source citations in "(read more: [X])" format
3. Use bullet points for key information
4. Focus on 3-5 most important points
5. Keep technical concepts accessible

Focus on high-impact information while maintaining accuracy.`;

/**
 * Post-process content using Gemini to improve readability and structure
 * @param content - Raw content from Perplexity API
 * @returns Processed content with improved structure and readability
 */
export async function postProcessContent(content: string): Promise<string> {
  try {
    const prompt = `${SYSTEM_INSTRUCTION}\n\nHere is the raw content to improve:\n\n${content}`;
    
    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent output
        maxOutputTokens: 4000
      }
    });

    return result.response.text();
  } catch (error) {
    console.error('Error in Gemini post-processing:', error);
    // Return original content if processing fails
    return content;
  }
}

/**
 * Stream process content using Gemini
 * @param content - Raw content chunk from Perplexity API
 * @returns Processed content stream
 */
export async function streamProcessContent(content: string) {
  try {
    const prompt = `${SYSTEM_INSTRUCTION}\n\nHere is the raw content to improve:\n\n${content}`;
    
    const result = await geminiModel.generateContentStream({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000
      }
    });

    return result.stream;
  } catch (error) {
    console.error('Error in Gemini stream processing:', error);
    // Return null if processing fails
    return null;
  }
}

// Helper function to generate content
export async function generateContent(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    return 'An error occurred while generating content.';
  }
}

// Helper function to summarize text
export async function summarizeText(text: string): Promise<string> {
  return generateContent(`Summarize the following text in a concise manner: ${text}`);
}

// Helper function for personalized recommendations
export async function getRecommendations(userInterests: string[], recentArticles: string[]): Promise<string> {
  const prompt = `
    Based on the user's interests: ${userInterests.join(', ')}
    And their recently read articles: ${recentArticles.join(', ')}
    Provide 3-5 personalized news recommendations.
  `;
  return generateContent(prompt);
} 