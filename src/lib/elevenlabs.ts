const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pMsXgVXv3BLzUgSXRplE';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private static currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found. Text-to-speech will be disabled.');
    }
    this.apiKey = ELEVENLABS_API_KEY;
    this.voiceId = ELEVENLABS_VOICE_ID;
  }

  static stopAllAudio() {
    if (ElevenLabsService.currentAudio) {
      ElevenLabsService.currentAudio.pause();
      ElevenLabsService.currentAudio.currentTime = 0;
      ElevenLabsService.currentAudio = null;
    }
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is not configured. Please check your environment variables.');
    }

    try {
      // Stop any currently playing ElevenLabs audio
      ElevenLabsService.stopAllAudio();

      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail && errorData.detail.message) {
            errorMessage = errorData.detail.message;
          }
        } catch {
          // If we can't parse the error, use the status text
        }

        if (response.status === 401) {
          errorMessage = 'Invalid ElevenLabs API key. Please check your credentials.';
        } else if (response.status === 429) {
          errorMessage = 'ElevenLabs API rate limit exceeded. Please try again later.';
        } else if (response.status === 422) {
          errorMessage = 'Invalid voice ID or request parameters for ElevenLabs API.';
        }

        throw new Error(errorMessage);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  async speechToText(audioBlob: Blob): Promise<string> {
    // Note: ElevenLabs doesn't provide STT, so we'll use Web Speech API
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  }

  static setCurrentAudio(audio: HTMLAudioElement) {
    ElevenLabsService.currentAudio = audio;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}