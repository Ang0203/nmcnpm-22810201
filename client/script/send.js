import { showError, updateSendButton, appendMessage } from "./utils";
import { getResourceString } from "./language";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const hiddenUserInput = document.getElementById("hiddenUserInput");
const sendBtn = document.getElementById("sendBtn");

/**
 * Handles the full message processing flow for both manual and conversation (voice) input modes.
 *
 * - In both modes:
 *    • Reads input from #userInput or #hiddenUserInput depending on isConversation
 *    • Validates the message length (only in normal input mode)
 *    • Extracts recent chat history for context
 *    • Appends the user's message and a temporary bot placeholder to the chat box
 *    • Sends the message to the backend and displays the response
 *
 * - Only in normal mode (`isConversation = false`):
 *    • Sets the UI to "sending" state (disables send button, clears input, updates placeholder)
 *    • Restores UI state after processing
 *
 * @async
 * @param {boolean} [isConversation=false] - Whether this is conversation mode using hidden input.
 * @returns {Promise<string|undefined>} The bot's reply if successful; otherwise undefined.
 */
export async function processMessage(isConversation = false) {
    const text = isConversation
        ? hiddenUserInput.value.trim()
        : userInput.value.trim();

    if (!text) return;
    if (!isConversation && text.length > 1000) return await showError("errorMessageLength");

    // Get history and strings
    const history = getChatHistory();
    const [processingMessage, inputPlaceholder] = await Promise.all([
        getResourceString("processingMessage"),
        getResourceString("inputPlaceholder"),
    ]);
    
    // Update UI and append messages
    if (!isConversation) setSendingState(true, processingMessage);
    appendMessage(text, "user");
    appendMessage(processingMessage, "bot", true);

    // Call API and send the message to the server
    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, history })
        });

        const { reply, error, message } = await res.json();
        chatBox.lastChild?.remove();
        if (res.ok) {
            appendMessage(reply, "bot");
            return reply;
        } else {
            return await showError(error, message);
        };
    } catch (err) {
        chatBox.lastChild?.remove();
        await showError("errorSendingMessage", err.message);
    } finally {
        if (!isConversation) {
            setSendingState(false, inputPlaceholder);
            hiddenUserInput.value = "";
        }
    }
}

/**
 * Extracts the last 10 messages from the chat box to construct a message history.
 * This history is used for context when sending a new message to the backend.
 *
 * @returns {string} A JSON string of message history with role and content.
 */
function getChatHistory() {
    const children = Array.from(chatBox.children);
    const lastMessages = children.slice(-10);
    
    return JSON.stringify(lastMessages.map(wrapper => {
        const messageDiv = wrapper.querySelector("div");
        if (!messageDiv) return { role: "unknown", content: "" };

        const role = messageDiv.classList.contains("bg-custom-gray")
            ? "user"
            : messageDiv.classList.contains("bg-white")
                ? "bot"
                : "unknown";

        return { role, content: messageDiv.innerText.trim() };
    }));
}

/**
 * Set the UI state for when sending or restoring message input.
 *
 * @param {boolean} isSending - Indicates whether a message is currently being sent (true) or not (false).
 * @param {string} placeholder - The placeholder text to display in the input field.
 */
function setSendingState(isSending, placeholder) {
    sendBtn.disabled = isSending;
    userInput.placeholder = placeholder;
    if (isSending) userInput.value = "";
    updateSendButton();
}