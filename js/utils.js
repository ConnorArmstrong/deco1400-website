const STORAGE_KEY = "media-data"; // key for media data
const LOGIN_KEY = "login" // key for login session


// ------------------- STORAGE/DATA HANDLING -----------------------

export async function loadJSONData() {
    const resp = await fetch('./media/data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const items = await resp.json();
    return items;
}

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
  //console.log('read:', JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function clearJSONCache() {
  localStorage.removeItem(STORAGE_KEY);
}

// Set local storage to the data.json file
export async function refreshData() {
    const data = await loadJSONData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Refreshed Local Storage to data.json state");
    return true;
}

// internal helper: pull the raw object (no fetch)
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

// add question for 
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

export function updateQuestionAnswer(title, qIndex, newAnswer) {
  _updateItem(title, item => {
    if (!Array.isArray(item.questions) || qIndex < 0 || qIndex >= item.questions.length) {
      throw new Error(`Invalid question index ${qIndex} for "${title}"`);
    }
    item.questions[qIndex].answer = newAnswer;
  });
  console.log(`Updated ${title} Question ${qIndex} Answer to: "${newAnswer}"`);
}

// ------------------- LOGIN HANDLING -----------------------

// login just saves username
function setSessionStatus(username) {
    localStorage.setItem(LOGIN_KEY, username);
}

export function logIn(username) {
    setSessionStatus(username);
}

export function logOut() {
    setSessionStatus("");
}

export function checkedLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) !== "";
}