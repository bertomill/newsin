import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Get the generative model
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

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