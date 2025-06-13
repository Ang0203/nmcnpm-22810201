import { showError } from "./utils.js";
import { speakText } from "./tts.js";

let currentAudioBtn = null;

/**
 * Create button for Text to Speech (TTS) using Web Speech API.
 * 
 * When pressed, switch between "play" and "stop".
 * 
 * @param {string} text - Text to convert.
 * @returns {HTMLButtonElement} TTS button created.
 */
export function createAudioButton(text) {
  const audioBtn = document.createElement("button");
  audioBtn.classList.add("btn", "btn-sm", "ms-2", "btn-light", "border-dark");
  audioBtn.isSpeaking = false;

  setButtonIcon(audioBtn, "play");

  audioBtn.onclick = async () => {
    try {
      // If already speaking -> stop
      if (audioBtn.isSpeaking) return stopSpeaking(audioBtn);

      // Stop other speech if already playing
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (currentAudioBtn && currentAudioBtn !== audioBtn) {
          stopSpeaking(currentAudioBtn);
        }
      }

      // Start speaking
      audioBtn.isSpeaking = true;
      currentAudioBtn = audioBtn;
      setButtonIcon(audioBtn, "stop");

      speakText(text, () => stopSpeaking(audioBtn));
    } catch (err) {
      await showError("errorPlayAudio", err.message);
      stopSpeaking(audioBtn);
    }
  };

  return audioBtn;
}

/**
 * Update the icon for the button.
 * 
 * @param {HTMLButtonElement} button
 * @param {"play" | "stop"} type
 */
function setButtonIcon(button, type) {
  const icon = type === "play" ? "bi-play-fill" : "bi-stop-fill";
  button.innerHTML = `<i class="bi ${icon}"></i>`;
}

/**
 * Stop speaking and reset button state.
 * 
 * @param {HTMLButtonElement} button
 */
function stopSpeaking(button) {
  window.speechSynthesis.cancel();
  button.isSpeaking = false;
  setButtonIcon(button, "play");
}