import { Message } from '../hooks/useChat';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const SYSTEM_MESSAGE = `You are a Bible-based AI assistant. Your responses must be:
1. Strictly grounded in the Holy Bible
2. Include relevant scripture references
3. Maintain a respectful and spiritual tone
4. Focus on biblical wisdom and guidance
5. Avoid speculation or personal opinions not supported by scripture`;

export const generateResponse = async (messages: Message[]): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_MESSAGE }],
          },
          ...messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}; 