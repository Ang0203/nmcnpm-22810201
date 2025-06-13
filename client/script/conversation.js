import { updateOverlayIcon } from "./utils.js";
import { startContinuousRecognition, stopContinuousRecognition } from "./voice.js";
import { processMessage } from "./send.js";
import { speakText } from "./tts.js";

const recordingOverlay = document.getElementById("recordingOverlay");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");

let conversationMode = false;
let isSending = false;

/**
 * Toggles the voice conversation mode.
 * 
 * Starts or stops the recording overlay and recording process.
 */
export function toggleConversation() {
    if (conversationMode) {
        recordingOverlay.classList.add("d-none");
        stopRecordingBtn.removeEventListener("click", handleStopClick);
        conversationMode = false;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        stopContinuousRecognition();
    } else {
        recordingOverlay.classList.remove("d-none");
        stopRecordingBtn.addEventListener("click", handleStopClick);
        conversationMode = true;
        nextTurn();
    }
}

/**
 * Toggles the voice conversation mode.
 * 
 * Starts or stops the recording overlay and recording process.
 * @async
 */
async function nextTurn() {
    if (!conversationMode) return;

    startContinuousRecognition(async (transcript) => {
        if (!conversationMode) return; // User may turn off while waiting

        // Empty transcript
        const trimmed = transcript.trim();
        if (window.speechSynthesis.speaking || isSending || !trimmed) {
            if (!trimmed && conversationMode && !isSending) nextTurn();
            return;
        }

        // Send a valid transcript
        isSending = true;
        updateOverlayIcon("loading");
        document.getElementById("hiddenUserInput").value = trimmed;
        let reply = await processMessage(true);
        isSending = false;

        if (!conversationMode) return; // User may turn off while waiting

        // Repeat the listening if no reply
        if (!reply) {
            updateOverlayIcon("user");
            nextTurn();
            return;
        }

        // Read TTS and start next turn
        updateOverlayIcon("bot");
        await speakText(reply, () => {
            if (conversationMode) nextTurn();
        });
    });
}

/**
 * Handler for stop conversation button.
 */
function handleStopClick() {
    toggleConversation();
}