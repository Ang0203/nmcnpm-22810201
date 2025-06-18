import { showError } from "./utils.js";

let RESOURCES = {}; // Stores language resources
let LANG = ""; // Stores the current language

/**
 * Get a localized string from the language resources.
 * 
 * @async
 * @param {string} key - The key of the string in the language resources.
 * @returns {string} The localized string or null if not found.
 */
export async function getResourceString(key) {
    if (!Object.keys(RESOURCES).length) {
        await loadLanguage();
    }
    return RESOURCES[LANG] && RESOURCES[LANG][key] 
        ? RESOURCES[LANG][key]
        : key;
}

/**
 * Initializes the language settings and sets up a dropdown for language selection.
 * 
 * Loads the language resource file and applies the selected language.
 * 
 * @async
 */
export async function setupLanguage() {
    const languageDropdown = document.getElementById("languageDropdown");

    await loadLanguage();
    console.log("[language]: Loaded language!")

    populateLanguageDropdown(languageDropdown);
    console.log("[language]: Populated language!")
}

/**
 * Loads the language resources from the resources.json file and applies the selected language.
 * 
 * @async
 * @param {string} lang - The language code to be loaded (e.g., "en" or "vi").
 */
async function loadLanguage() {
    try {
        const lastFetched = Number(localStorage.getItem("resources_timestamp"));
        const cachedResources = localStorage.getItem("resources");
        const cachedLang = localStorage.getItem("lang");
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // If cache is available and not expired => Use cache
        if (cachedResources && lastFetched && (now - lastFetched < oneDay)) {
            RESOURCES = JSON.parse(cachedResources);
            LANG = getValidLang(cachedLang);
            applyLanguage();
            return;
        }

        // Fetch if cache is expired
        const response = await fetch("/resources.json");
        const resources = await response.json();
        console.log("[language]: Fetched resources!");
        console.log(lastFetched);
        console.log(cachedResources);
        console.log(cachedLang);

        // Save new values
        LANG = getValidLang(cachedLang);;
        RESOURCES = resources;
        
        // Set new caches
        localStorage.setItem("resources_timestamp", now.toString());
        localStorage.setItem("resources", JSON.stringify(resources));
        localStorage.setItem("lang", LANG);

        applyLanguage();
    } catch (error) {
        showError(`Error loading resources.json: ${error.message}`);
    }
}

/**
 * Updates the UI elements to reflect the selected language.
 */
function applyLanguage() {
    if (!RESOURCES[LANG]) return;
    
    document.title = RESOURCES[LANG]["chatTitle"] || "22810201";
    document.getElementById("clearChatBtn").setAttribute("title", RESOURCES[LANG]["clearChat"]);
    document.getElementById("recordBtn").setAttribute("title", RESOURCES[LANG]["transcript"]);
    document.getElementById("chatTitle").innerText = RESOURCES[LANG]["chatTitle"];
    document.getElementById("userInput").placeholder = RESOURCES[LANG]["inputPlaceholder"];
    document.getElementById("languageText").innerText = RESOURCES[LANG]["language"];
}

/**
 * Populates the language dropdown menu with available language options.
 * 
 * @param {HTMLElement} dropdown - The dropdown element where language options will be added.
 */
function populateLanguageDropdown(dropdown) {
    dropdown.innerHTML = "";

    // Iterate through available languages in RESOURCES
    Object.keys(RESOURCES).forEach(langCode => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        
        // Use the language name from resources, fallback to langCode if not available
        a.innerText = RESOURCES[langCode]["language"] || langCode;
        
        // Highlight the currently selected language
        if (langCode === LANG) {
            a.classList.add("active");
        }

        // Handle language selection click event
        a.addEventListener("click", async (event) => { 
            event.preventDefault();

            // Set new lang cache
            localStorage.setItem("lang", langCode);
            
            // Reload language sources and UI
            await loadLanguage();

            // Update active selection in the dropdown
            Array.from(dropdown.getElementsByTagName("a"))
                .forEach(item => item.classList.remove("active"));
            a.classList.add("active");
        });

        // Append a to list item and to dropdown
        li.appendChild(a);
        dropdown.appendChild(li);
    });
}

/**
 * Retrieves a valid language code from localStorage or defaults to "vi".
 * 
 * @param {string} cachedLang - The language code from localStorage.
 * @returns {string} A valid language code.
 */
function getValidLang(cachedLang) {
    return Object.hasOwnProperty.call(RESOURCES, cachedLang) ? cachedLang : "vi";
}