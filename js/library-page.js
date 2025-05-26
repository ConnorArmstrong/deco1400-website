// library-page.js

/**
 * Applies the library-specific stylesheet (if not already applied).
 */
function applyLibraryStyling() {
  if (document.getElementById('library-styles')) return;
  const link = document.createElement('link');
  link.id = 'library-styles';
  link.rel = 'stylesheet';
  link.href = './css/library.css';
  document.head.appendChild(link);
}

/**
 * Initializes the library: fetches data, sets up UI, and renders cards with combined search & sort.
 */
async function initLibrary() {
  try {
    const resp = await fetch('./media/data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const { items } = await resp.json();

    // Cache DOM elements
    const searchInput = document.querySelector('.search-input');
    const filterBtn = document.querySelector('.filter-btn');
    const sortBtn = document.querySelector('.sort-btn')
    const cardGrid = document.querySelector('.card-grid');
    const itemCountArea = document.querySelector('.item-count');
    const actionsWrap = document.querySelector('.search-actions');

    // State: search term, filter toggle, sort method
    const state = {
      searchTerm: '',
      showOnlyBooks: false,
      sortMethod: 'az', // default
      sortDesc: false // false = ascending, true = descending
    };

    // Create sort menu (always visible)
    const sortMenu = document.createElement('ul');
    sortMenu.className = 'sort-menu';
    sortMenu.style.display = 'none'; // Sort Menu Hidden by Default

    const options = [
      { value: 'az',     label: 'A-Z' },
      { value: 'recent', label: 'Most Recent' },
      { value: 'rating', label: 'Rating' }
    ];
    options.forEach(opt => {
      const li = document.createElement('li');
      li.textContent = opt.label;
      li.dataset.value = opt.value;
      sortMenu.appendChild(li);
    });
    actionsWrap.insertBefore(sortMenu, filterBtn);

    // Toggle menu visibility on sort button click
    sortBtn.addEventListener('click', e => {
      e.stopPropagation();
      sortMenu.style.display = sortMenu.style.display === 'none' ? 'block' : 'none';
    });
    // Prevent clicking inside menu from closing it
    sortMenu.addEventListener('click', e => e.stopPropagation());
    // Optionally close menu when clicking outside



    // Core update: filter, sort, render, update UI
    function updateView() {
      let list = items.slice();
      // apply search filter
      if (state.searchTerm) {
        const term = state.searchTerm;
        list = list.filter(item =>
          item.title.toLowerCase().includes(term) ||
          item.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
      // apply book-only filter
      if (state.showOnlyBooks) {
        list = list.filter(item => item.contentType === 'Book');
      }
      // apply sort
      if (state.sortMethod === 'az') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else if (state.sortMethod === 'recent') {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (state.sortMethod === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // render
      renderCards(list, cardGrid, itemCountArea);
      // highlight active sort
      sortMenu.querySelectorAll('li').forEach(li => {
        li.classList.toggle('active', li.dataset.value === state.sortMethod);
      });
    }

    // Event: search input
    searchInput.addEventListener('input', e => {
      state.searchTerm = e.target.value.trim().toLowerCase();
      updateView();
    });

    // Event: filter button toggles book-only
    filterBtn.addEventListener('click', () => {
      state.showOnlyBooks = !state.showOnlyBooks;
      updateView();
    });

    // Event: sort menu clicks
    sortMenu.addEventListener('click', e => {
      if (e.target.tagName !== 'LI') return;
      state.sortMethod = e.target.dataset.value;
      updateView();
    });

    // Initial render
    updateView();

  } catch (err) {
    console.error('Failed to load library data:', err);
    document.querySelector('.card-grid').innerHTML =
      `<p class="error">Could not load your library.</p>`;
  }
}


function renderCards(list, grid, area) {
  grid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title} cover" />
      <div class="card-info">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-meta">
          ${item.contentType === 'Book' ? '📚' : '🎬'}
          <span class="date">${item.date}</span>
          <span class="status ${item.status.toLowerCase()}">${item.status}</span>
        </p>


        <p class="card-tags">
          Tags: ${item.tags.map(t => `[${t}]`).join(' ')}
        </p>
      </div>
    `;
    grid.appendChild(card);
  });
  updateItemCount(list, area);
}

function updateItemCount(list, area) {
  const books  = list.filter(i => i.contentType === 'Book').length;
  const movies = list.filter(i => i.contentType === 'Movie').length;
  area.textContent =
    `Currently showing ${list.length} Items from ${books} Books and ${movies} Movies`;
}

// Start up
document.addEventListener('DOMContentLoaded', () => {
  applyLibraryStyling();
  initLibrary();
});
