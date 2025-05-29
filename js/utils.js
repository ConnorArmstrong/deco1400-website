// This is a shared utils file that handles all functions dealing with local storage
// this was necessary when checking if data was loaded/needed to be read from file
// export in the function declaration means it is public - either used by another file or was used at some point

// Constant Keys for all types of LocalStorage Use:
const STORAGE_KEY = "media-data"; // key for media data
const LOGIN_KEY = "login" // key for login session
const THEME_KEY = "theme"; // key for dark mode/light mode


// ------------------- STORAGE/DATA HANDLING -----------------------

// load data.json and return it
export async function loadJSONData() {
    const resp = await fetch('media/data.json', {cache: 'no-store'}); // no-store to fix caching issues
    // I cannot stress how long it took me to find out thats why things werent working
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const items = await resp.json();
    return items;
}

// either use the saved local storage data, or load the data.json and save it to local storage
export async function getData(useStorage = true) {
  if (useStorage) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      //console.log(`stored: ${stored}`);
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Corrupted localStorage data – refetching', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  // no valid cache, so fetch and cache it
  const data = await loadJSONData();
  console.log('read:', JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function clearJSONCache() { // less important now but very useful for debugging
  localStorage.removeItem(STORAGE_KEY);
}

// Set local storage to the data.json file
export async function refreshData() {
    const data = await loadJSONData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Refreshed Local Storage to data.json state");
    return true;
}

// for testing data caching :(
export async function resetData() {
  const data = await loadJSONData();
  console.log(data);
  localStorage.setItem("testing", JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// The following are for updating specific parts of an items json:
// All public mutating functions should print to console

// internal helper: pull the raw object
function _loadRaw() {
  const str = localStorage.getItem(STORAGE_KEY);
  return str ? JSON.parse(str) : { items: [] };
}

// internal helper: overwrite saved data
function _saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// internal helper: save after mutating one item
function _updateItem(title, mutator) {
  const data = _loadRaw();
  const item = data.items.find(i => i.title === title);
  if (!item) {
    throw new Error(`No item found with title "${title}"`);
  }
  mutator(item);
  _saveData(data);
}


// update user text for title with given text
export function updateUserText(title, newText) {
  console.log(`Updating ${title} User Text to "${newText}"`);
  _updateItem(title, item => {
    item.userText = newText;
  });
}

// add question for a given title - specified a default answer but it could also be a template response for a given question maybe?
export function addQuestion(title, question, answer = '') {
  _updateItem(title, item => {
    // ensure there's an array to push into
    if (!Array.isArray(item.questions)) {
      item.questions = [];
    }
    item.questions.push({ question, answer });
  });
  console.log(`Adding Question "${question}" with Answer "${answer}" for ${title}`);
}

// return the item for a given title
export async function getItem(title) {
    const { items } = await getData();

    const item = items.find(i => i.title === title);
    if (!item) {
        console.error('Cannot Find Content');
        return;
    }

    return item;
}

// for a given title and question index, update hte answer
export function updateQuestionAnswer(title, qIndex, newAnswer) {
  _updateItem(title, item => {
    if (!Array.isArray(item.questions) || qIndex < 0 || qIndex >= item.questions.length) { //  this has been flagged once
      throw new Error(`Invalid question index ${qIndex} for "${title}"`); // so I'm scared of removing it and not knowing why something breaks
    }
    item.questions[qIndex].answer = newAnswer;
  });
  console.log(`Updated ${title} Question ${qIndex} Answer to: "${newAnswer}"`);
}


// ------------------- LOGIN HANDLING -----------------------

// internal helper - login just saves username
function setSessionStatus(username) {
    localStorage.setItem(LOGIN_KEY, username);
}

// note no password
export function logIn(username) {
    setSessionStatus(username);
}

// once it was "" as the default logout but this was error prone
export function logOut() {
    localStorage.removeItem(LOGIN_KEY)
}

// return if the user is logged in
export function checkedLoggedIn() {
    return !(localStorage.getItem(LOGIN_KEY) === null);
}

// return the username
export function getUser() {
    return localStorage.getItem(LOGIN_KEY);
}

// ------------------- DARK MODE / LIGHT MODE -----------------------

/* 
If a poor soul reads this I apologise for how this section seems completely
different from above, but realise that this is necessary to keep modal.js clean. 

But really... modal.js has no right to be handling other global events.
My bad.
*/

// internal helper: sets the theme and toggles the nav icon
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.querySelector('#theme-toggle');

    if (toggle) {
       toggle.textContent = theme === 'dark' ? '☀️' : '🌙'; // switch icons 
    }
}

// internal helper: return the theme saved in local storage
function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
}

// internal helper: save the them in local storage - internal so it always is a correct value
function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

// internal helper: swap between themes - note this assumes two themes always (which is the case)
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme' || 'dark');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
}

// The only public theme function - applies saved or default theme then adds the toggle event listener
export function initThemeToggle() {
    // apply stored or default theme
    const saved = getSavedTheme() || 'dark';
    applyTheme(saved);

    // find the toggle
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return console.warn("Could not find toggle");

    // on click flip theme:
    toggle.addEventListener('click', e => {
        e.preventDefault();
        toggleTheme();
    })
}