import { createSpeechRecognitionSession } from "./stt.js";
import { showError, updateSendButton, updateOverlayIcon } from "./utils.js";

const userInput = document.getElementById("userInput");
const sendIcon = document.getElementById("sendIcon");
const recordingOverlay = document.getElementById("recordingOverlay");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");

const SILENCE_TIMEOUT = 3000;

let recognition = null;
let silenceTimer = null;
let fullTranscript = "";
let lastInterim = "";
let originalInput = "";

/**
 * Starts the voice recording session using Web Speech API.
 * 
 * Also updates UI elements to indicate recording state.
 */
export async function startRecording() {
  stopRecording();
  
  fullTranscript = "";
  lastInterim = "";
  originalInput = userInput.value || "";
  updateOverlayIcon("user");

  recognition = await createSpeechRecognitionSession({
    onResult: (event) => {
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
      } else {
        lastInterim = interim;
      }

      // Update input and UI
      let newValue = originalInput;
      if (fullTranscript) {
        newValue += (newValue ? " " : "") + fullTranscript.trim();
      }
      if (lastInterim) {
        newValue += (newValue.endsWith(" ") || newValue === "" ? "" : " ") + lastInterim;
      }
      userInput.value = newValue;
      updateSendButton();

      // Put caret to last and scroll input
      const pos = userInput.value.length;
      userInput.setSelectionRange(pos, pos);
      userInput.scrollLeft = userInput.scrollWidth;
      userInput.focus();

      // Reset silence timer if anything was said
      if (interim) {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          stopRecording();
        }, SILENCE_TIMEOUT);
      }
    },

    onError: async (event) => {
      if (event.error !== "no-speech") await showError("errorVoiceRecording");
      stopRecording();
    },
    
    onEnd: stopRecording
  });

  if (!recognition) return;

  recognition.start();
  sendIcon.classList.replace("bi-mic", "bi-stop");
  recordingOverlay.classList.remove("d-none");
  stopRecordingBtn.addEventListener("click", handleStopClick);
}

/**
 * Stops the active voice recording session and resets UI to idle state.
 * 
 * Clears the reference to the recognition session.
 */
export function stopRecording() {
  clearTimeout(silenceTimer);

  if (!recognition) return;

  recognition.stop(); recognition = null;
  sendIcon.classList.replace("bi-stop", "bi-mic");
  recordingOverlay.classList.add("d-none");
  stopRecordingBtn.removeEventListener("click", handleStopClick);
}

/**
 * Handler for stop recording button.
 */
function handleStopClick() {
  stopRecording();
}