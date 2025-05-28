const STORAGE_KEY = "media-data";

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
      console.log(`stored: ${stored}`);
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

export function clearJSONCache() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function refreshData() {
    const data = await loadJSONData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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



export function updateUserText(title, newText) {
    console.log(`Updating ${title} User Text...`)
  _updateItem(title, item => {
    item.userText = newText;
  });
}

