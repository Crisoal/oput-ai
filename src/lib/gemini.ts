const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }
    this.apiKey = GEMINI_API_KEY;
  }

  async generateResponse(messages: any[], context?: any): Promise<string> {
    try {
      const systemPrompt = `You are Oput, an intelligent AI assistant specialized in helping students discover personalized educational opportunities. 

Your role:
- Ask targeted questions to understand student needs
- Provide tailored recommendations for scholarships, grants, fellowships
- Assess eligibility in real-time
- Guide students through the application process

Current context: ${JSON.stringify(context || {})}

Guidelines:
- Be conversational and helpful
- Ask one question at a time
- Focus on eligibility criteria
- Provide specific, actionable advice
- Keep responses concise but informative`;

      // Format the conversation for Gemini
      const conversationText = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nPlease provide a helpful response as Oput:`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API response:', errorData);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      return data.candidates[0].content.parts[0].text || 'I apologize, but I encountered an error. Please try again.';
    } catch (error) {
      console.error('Gemini API error:', error);
      if (error instanceof Error) {
        return `I apologize, but I encountered an error: ${error.message}. Please check your API configuration and try again.`;
      }
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }
}