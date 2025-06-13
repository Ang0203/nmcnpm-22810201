/**
 * Initializes dictionary lookup feature.
 * 
 * When user double-clicks a word in the chat box, it opens its Cambridge Dictionary page.
 */
export function setupDictionary() {
    const chatBox = document.getElementById("chatBox");
    
    chatBox.addEventListener("dblclick", () => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(selectedText)}`, "_blank");
      }
    });
}