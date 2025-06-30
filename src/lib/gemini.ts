const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. AI responses will be limited.');
    }
    this.apiKey = GEMINI_API_KEY;
  }

  async generateResponse(messages: any[], context?: any): Promise<string> {
    if (!this.apiKey) {
      return "I apologize, but the AI service is not properly configured. Please check the API key configuration and try again.";
    }

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
        
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.error && parsedError.error.message) {
            errorMessage = parsedError.error.message;
          }
        } catch {
          // If we can't parse the error, use the status text
        }

        if (response.status === 429) {
          return "I apologize, but I've reached my daily request limit. This is due to API quota restrictions. Please try again tomorrow, or consider upgrading your API plan for higher limits. In the meantime, you can still browse opportunities manually using the search and filter features.";
        } else if (response.status === 401) {
          return "I apologize, but there's an authentication issue with the AI service. Please check the API key configuration.";
        } else if (response.status === 400) {
          return "I apologize, but there was an issue with your request. Please try rephrasing your question.";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini API response structure:', data);
        return "I apologize, but I received an unexpected response. Please try again.";
      }

      return data.candidates[0].content.parts[0].text || 'I apologize, but I encountered an error. Please try again.';
    } catch (error) {
      console.error('Gemini API error:', error);
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('429') || error.message.includes('quota')) {
          return "I apologize, but I've reached my daily request limit. This is due to API quota restrictions. Please try again tomorrow, or consider upgrading your API plan for higher limits. In the meantime, you can still browse opportunities manually using the search and filter features.";
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          return "I apologize, but there's an authentication issue with the AI service. Please check the API key configuration.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          return "I apologize, but I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
        }
        
        return `I apologize, but I encountered an error: ${error.message}. Please try again or use the manual search features.`;
      }
      
      return 'I apologize, but I encountered an error processing your request. Please try again or use the manual search and filter features to find opportunities.';
    }
  }
}