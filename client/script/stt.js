import { showError } from "./utils.js";

/**
 * Initializes and configures a new SpeechRecognition session.
 *
 * @async
 * @param {Object} config - Configuration object for the speech recognition session.
 * @param {string} config.lang - Language code for recognition (default is "en").
 * @param {boolean} config.continuous - If true, recognition continues even after pauses (default is true).
 * @param {boolean} config.interimResults - If true, partial (interim) results are returned (default is true).
 * @param {function} config.onResult - Callback for when results are available.
 * @param {function} config.onEnd - Callback for when recognition ends.
 * @param {function} config.onError - Callback for handling errors.
 *
 * @returns {SpeechRecognition|null} A configured SpeechRecognition instance, or null if not supported.
 */
export async function createSpeechRecognitionSession({
    lang = "en", continuous = true, interimResults = true,
    onResult, onEnd, onError
}) {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
        await showError("errorWebSpeech");
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onresult = onResult || (() => {});
    recognition.onerror = onError || (() => {});
    recognition.onend = onEnd || (() => {});

    return recognition;
}
