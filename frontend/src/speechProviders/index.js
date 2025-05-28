// ====================================================================
// Select ASR/TTS service providers
// ====================================================================
import { AzureASR,  AzureTTS  } from './AzureServices';
import { GeminiASR, GeminiTTS } from './GeminiServices';
import { TestASR,   TestTTS   } from './TestServices';

export const Providers = {
  azure : { ASR: AzureASR,  TTS: AzureTTS  },
  gemini: { ASR: GeminiASR, TTS: GeminiTTS },
  test  : { ASR: TestASR,   TTS: TestTTS   },
};