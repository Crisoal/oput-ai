const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pMsXgVXv3BLzUgSXRplE';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private static currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('Missing ElevenLabs API key');
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
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
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
        reject(new Error('Speech recognition not supported'));
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