import { showError } from "./utils";

/**
 * Text to Speech using Web Speech API.
 *
 * @async
 * @param {string} text - Text to convert.
 * @param {function} onEnd - Callback after playing.
 */
export async function speakText(text, onEnd) {
    if (!("speechSynthesis" in window)) return await showError("errorWebSpeech");

    const voices = await loadVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.name.includes("Microsoft David")) || voices[0];

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        utterance.onend = onEnd;

        window.speechSynthesis.speak(utterance);
    } else return await showError("errorVoiceNotSupported");
}

/**
 * Loads available speech synthesis voices, waiting if necessary.
 *
 * @returns {Promise<SpeechSynthesisVoice[]>} A promise returning an array of voices.
 */
function loadVoices() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length !== 0) {
            resolve(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                resolve(voices);
            };
        }
    });
}