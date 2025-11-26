// Simplified Voice Assistant using Web Speech API
interface VoiceAssistantConfig {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onListening?: (isListening: boolean) => void;
}

export class VoiceAssistant {
  private recognition: any = null;
  private config: VoiceAssistantConfig;
  private isListening = false;
  private shouldBeListening = false;

  constructor(config: VoiceAssistantConfig) {
    this.config = config;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.config.onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-IN'; // English (India) - supports both English and Marathi
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
      this.config.onListening?.(true);
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        this.config.onTranscript?.(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // User didn't speak, this is not critical
        return;
      }
      
      this.config.onError?.(`Speech recognition error: ${event.error}`);
      this.isListening = false;
      this.config.onListening?.(false);
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;
      
      // Auto-restart if we should still be listening
      if (this.shouldBeListening) {
        console.log('Auto-restarting voice recognition...');
        setTimeout(() => {
          if (this.shouldBeListening) {
            try {
              this.recognition.start();
            } catch (error) {
              console.log('Error restarting recognition:', error);
            }
          }
        }, 100);
      } else {
        this.config.onListening?.(false);
      }
    };
  }

  startListening() {
    if (!this.recognition) {
      this.config.onError?.('Speech recognition not initialized');
      return;
    }

    this.shouldBeListening = true;
    try {
      this.recognition.start();
    } catch (error) {
      // If already started, ignore
      console.log('Recognition already started or error:', error);
    }
  }

  stopListening() {
    this.shouldBeListening = false;
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  getIsListening() {
    return this.isListening;
  }
}

// Text-to-Speech utility
export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoice();
  }

  private loadVoice() {
    const voices = this.synth.getVoices();
    // Try to find an Indian English voice
    this.voice = voices.find(voice => 
      voice.lang === 'en-IN' || voice.lang.startsWith('en')
    ) || voices[0];

    // If voices not loaded yet, wait for them
    if (voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        const newVoices = this.synth.getVoices();
        this.voice = newVoices.find(voice => 
          voice.lang === 'en-IN' || voice.lang.startsWith('en')
        ) || newVoices[0];
      };
    }
  }

  speak(text: string) {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}
