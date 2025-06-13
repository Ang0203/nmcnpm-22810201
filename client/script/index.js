import { setupLanguage } from "./language.js";
import { setupChat } from "./main.js";
import { setupDictionary } from "./dictionary.js";

/**
 * Initializes all client-side modules after the DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp().then(() => {
    console.log("[INFO] Client script loaded!");
  }).catch((error) => {
    console.error("[ERROR] Failed to initialize app:", error.message);
  });
});

/**
 * Runs all setup routines for the application.
 */
async function initializeApp() {
  await setupLanguage();
  setupChat();
  setupDictionary();
}