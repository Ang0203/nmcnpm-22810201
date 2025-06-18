import { createSpeechRecognitionSession } from "./stt.js";
import { updateOverlayIcon, showError } from "./utils.js";

const SILENCE_TIMEOUT = 3000;

let recognition = null;
let silenceTimer = null;
let isVoiceActive = false;
let fullTranscript = "";
let lastInterim = "";

export async function startContinuousRecognition(onFinalTranscript) {
  stopContinuousRecognition();

  fullTranscript = "";
  lastInterim = "";
  isVoiceActive = true;
  updateOverlayIcon("user");

  recognition = await createSpeechRecognitionSession({
    onResult: (event) => {
      if (!isVoiceActive) return;

      // Build interim transcript
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      interim = interim.trim();

      // Final of interim
      const isFinal = event.results[event.results.length - 1].isFinal;
      if (isFinal && interim) {
        fullTranscript += interim + " ";
        lastInterim = "";
      } else if (interim && interim !== lastInterim) {
        lastInterim = interim;
      }

      // Reset silence timer if anything was said
      if (interim) {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          stopContinuousRecognition();
          onFinalTranscript((fullTranscript + lastInterim).trim());
        }, SILENCE_TIMEOUT);
      }
    },

    onError: async (event) => {
      if (!isVoiceActive) return;

      if (event.error !== "no-speech") {
        await showError("errorVoiceRecording");
        stopContinuousRecognition();
      }
    },
    
    onEnd: () => {
      if (!isVoiceActive) return;

      clearTimeout(silenceTimer);
      startContinuousRecognition(onFinalTranscript);
    }
  });

  if (!recognition) return;
  
  recognition.start();
}

export function stopContinuousRecognition() {
  clearTimeout(silenceTimer);
  isVoiceActive = false;

  if (!recognition) return;

  recognition.abort(); recognition = null;
}