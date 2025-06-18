import { updateSendButton } from "./utils.js";
import { getResourceString } from "./language.js";
import { processMessage } from "./send.js";
import { startRecording } from "./recording.js";
import { toggleConversation } from "./conversation.js";

/**
 * Initializes DOMs for the chat window.
 */
export function setupChat() {
  const userInput = document.getElementById("userInput");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const recordBtn = document.getElementById("recordBtn");
  const sendBtn = document.getElementById("sendBtn");

  clearChatBtn.disabled = false;
  recordBtn.disabled = false;
  sendBtn.disabled = false;

  userInput.addEventListener("input", () => updateSendButton());
  userInput.addEventListener("keydown", handleEnterKey);
  clearChatBtn.addEventListener("click", handleClearChat);
  recordBtn.addEventListener("click", () => startRecording());
  sendBtn.addEventListener("click", handleUserAction);

  // Clears the chat box after confirmation.
  async function handleClearChat() {
    const confirmClear = await getResourceString("confirmClearChat");
    if (confirm(confirmClear)) document.getElementById("chatBox").innerHTML = "";
  }

  // Handles Enter key to trigger user action.
  function handleEnterKey(event) {
    if (event.key === "Enter" && !sendBtn.disabled) handleUserAction();
  }

  // Handles sending message or start conversation based on input content.
  function handleUserAction() {
    if (userInput.value.trim()) {
        processMessage();
    } else {
        toggleConversation();
    }
  }
}