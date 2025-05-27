function applyLibraryStyling() {
  if (document.getElementById('library-styles')) return;
  const link = document.createElement('link');
  link.id = 'library-styles';
  link.rel = 'stylesheet';
  link.href = './css/library.css';
  document.head.appendChild(link);
}


// this had to get abstracted out of the init library function for clarity
function createFilterPanel(searchBar, filterBtn, onApply) {
  console.log("Creating Filter Panel");
  // build the panel
  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  
  // hide by default
  panel.style.display = 'none';

  // messy but it works. maybe.
  panel.innerHTML = `
    <div class="filter-content">
      <!-- Tags (you can swap this out for your tag-picker component) -->
      <div class="filter-section">
        <label>Tags:</label>
        <div class="tag-input">
          <!-- example static tags; you’ll want to render your own -->
          <span class="tag">tag_1 ×</span>
          <span class="tag">tag_2 ×</span>
          <button class="add-tag-btn">Add Tag +</button>
        </div>
      </div>

      <!-- Series -->
      <div class="filter-section">
        <label for="series-input">Series:</label>
        <div class="series-wrapper">
          <input
            type="text"
            id="series-input"
            class="series-input"
            placeholder="e.g. Harry Potter"
            list="series-list"
          />
          <datalist id="series-list"></datalist>
          <button type="button" class="clear-series-btn" title="Clear">×</button>
        </div>
      </div>

      <!-- Type dropdown -->
      <div class="filter-section">
        <label>Type:</label>
        <select class="type-select">
          <option value="">Any</option>
          <option value="Book">Book</option>
          <option value="Movie">Movie</option>
        </select>
      </div>

      <!-- Status dropdown -->
      <div class="filter-section">
        <label>Status:</label>
        <select class="status-select">
          <option value="">Any</option>
          <option value="planned">Planned</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <!-- Rating threshold -->
      <div class="filter-section">
        <label>Rating Threshold:</label>
        <div class="rating-threshold">
          ☆☆☆☆☆
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <button class="reset-btn">Reset ⟳</button>
      <button class="clear-btn">Clear ×</button>
      <button class="apply-btn">Apply →</button>
    </div>`
    
  searchBar.appendChild(panel);

  const backdrop = document.createElement('div');
  backdrop.className = 'filter-backdrop';
  backdrop.style.display = 'none';
  document.body.appendChild(backdrop);

  // prevent clicks inside the search-bar (input, sort, panel…) from closing
  searchBar.addEventListener('click', e => e.stopPropagation());

  filterBtn.addEventListener('click', e => {
    e.stopPropagation();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    backdrop.style.display = backdrop.style.display === 'none' ? 'block' : 'none';
    console.log(`${panel.style.display}`);
  });
  panel.addEventListener('click', e => e.stopPropagation()); // so clicking the panel doesnt close it 
  
  document.addEventListener('click', () => { // clicking outside closes
    panel.style.display = 'none';
    backdrop.style.display = 'none';
  });

   panel.querySelector('.apply-btn').addEventListener('click', () => {
    panel.style.display    = 'none';
    backdrop.style.display = 'none';
    onApply();
  });



  return panel;
}

async function initLibrary() {
  try {
    const resp = await fetch('./media/data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const { items } = await resp.json();

    // Cache DOM elements
    const searchInput = document.querySelector('.search-input');
    const searchBar  = document.querySelector('.search-bar');
    const filterBtn = document.querySelector('.filter-btn');
    const sortBtn = document.querySelector('.sort-btn')
    const cardGrid = document.querySelector('.card-grid');
    const itemCountArea = document.querySelector('.item-count');
    const actionsWrap = document.querySelector('.search-actions');

    // State: search term, filter toggle, sort method
    const state = {
      searchTerm: '', // Whats in the Search Bar
      sortMethod: 'az', // default
      sortDesc: false, // false = ascending, true = descending
      filterType: '', // ''/'book'/'movie'
      filterStatus: '', // ''/'planned'/'completed'/'in progress'
      filterThreshold: 0, // minimum rating to be shown (inclusive);
      filterSeries: '', // what series a content belongs to ('' -> no series)
    };




    // Create the sort menu
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
      if (opt.value === state.sortMethod) {
        li.classList.add('active', state.sortDesc ? 'desc' : 'asc');
      }
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

    // Handle selecting or toggling a sort option
    sortMenu.addEventListener('click', e => {
      if (e.target.tagName !== 'LI') return;
      const val = e.target.dataset.value;
      if (state.sortMethod === val) {
        state.sortDesc = !state.sortDesc;
      } else {
        state.sortMethod = val;
        state.sortDesc = false;
      }
      sortBtn.classList.toggle('asc', !state.sortDesc);
      sortBtn.classList.toggle('desc', state.sortDesc);
      updateView();
      // update classes on menu items
      sortMenu.querySelectorAll('li').forEach(li => {
        li.classList.remove('active', 'asc', 'desc');
        if (li.dataset.value === state.sortMethod) {
          li.classList.add('active', state.sortDesc ? 'desc' : 'asc');
        }
      });
    });

    // create filter panel
    const filterPanel = createFilterPanel(searchBar, filterBtn, updateView);

    // create a list of all series and tags
    const allSeries = Array.from(new Set(
      items.map(item => item.series || '').filter(s => s.trim().length > 0)
    ));

    const seriesDatalist = filterPanel.querySelector('#series-list');

    // add each series as an <option>
    allSeries.forEach(seriesName => {
      const opt = document.createElement('option');
      opt.value = seriesName;
      seriesDatalist.appendChild(opt);
    });

    const seriesInput = filterPanel.querySelector('.series-input');
    const clearSeriesBtn = filterPanel.querySelector('.clear-series-btn');

    seriesInput.addEventListener('input', e => {
      state.filterSeries = e.target.value.trim().toLowerCase();
      updateView();
    });

    clearSeriesBtn.addEventListener('click', () => {
      seriesInput.value = '';
      state.filterSeries = '';
      updateView();
    });

    const typeSelect = filterPanel.querySelector('.type-select');
      typeSelect.addEventListener('change', e => {
      state.filterType = e.target.value;
      updateView();                       
    });

    const statusSelect = filterPanel.querySelector('.status-select');
      statusSelect.addEventListener('change', e => {
      state.filterStatus = e.target.value;
      updateView();                       
    });

    const ratingContainer = filterPanel.querySelector('.rating-threshold');

    ratingContainer.innerHTML = '';

    function renderThresholdStars() {
      ratingContainer.querySelectorAll('span').forEach(star => {
        const v = Number(star.dataset.value);
        star.textContent = v <= state.filterThreshold ? '★' : '☆';
      })
    }

    // show the rating threshold
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.dataset.value = i;
      star.style.cursor = 'pointer';
      star.style.fontSize = '2em';
      star.textContent = '☆';

      // on hover light up the relevant stars
      star.addEventListener('mouseover', () => {
        ratingContainer.querySelectorAll('span').forEach(s => {
          const v = Number(s.dataset.value);
          s.textContent = v <= i ? '★' : '☆';
        });
      });

      // undo when mouse leaves
      star.addEventListener('mouseout', renderThresholdStars);

      star.addEventListener('click', () => {
        if (state.filterThreshold === i) {
          state.filterThreshold = 0; // unselect if selected
        } else {
          state.filterThreshold = i; // select if not selected
        }
        renderThresholdStars();
        updateView();
      });

      ratingContainer.appendChild(star);
    }

    renderThresholdStars();

    // Core update: filter, sort, render, update
    function updateView() {
      let list = items.slice(); // copy the list
      // apply search filter
      if (state.searchTerm) {
        const term = state.searchTerm;
        list = list.filter(item =>
          item.title.toLowerCase().includes(term) ||
          item.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // filter based on selected state
      if (state.filterType) {
        list = list.filter(item =>
          item.contentType === state.filterType
        );
      }

      // filter based on the selected status
      if (state.filterStatus) {
        list = list.filter(item => 
          item.status.toLowerCase() === state.filterStatus
        );
      }
      
      // filter based on specified threshold
      if (state.filterThreshold) {
        list = list.filter(item =>
          (item.rating || 0) >= state.filterThreshold
        );
      }

      // Filter based on Series
      if (state.filterSeries) {
        list = list.filter(item =>
          item.series && item.series.toLowerCase().includes(state.filterSeries)
        );
      }

      // apply sort
      if (state.sortMethod === 'az') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else if (state.sortMethod === 'recent') {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (state.sortMethod === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // reverse if descending order
      if (state.sortDesc) list.reverse();

      // render the remaining cards in order
      renderCards(list, cardGrid, itemCountArea);

      // highlight active sort
      sortMenu.querySelectorAll('li').forEach(li => {
        li.classList.toggle('active', li.dataset.value === state.sortMethod);
      });
    }

    // search input
    searchInput.addEventListener('input', e => {
      state.searchTerm = e.target.value.trim().toLowerCase();
      updateView();
    });


    function resetFilters() {
      // Series
      seriesInput.value = '';
      state.filterSeries = '';

      // Type
      typeSelect.value = '';
      state.filterType = '';

      // Status
      statusSelect.value = '';
      state.filterStatus = '';

      // Rating threshold
      state.filterThreshold = 0;
      renderThresholdStars();

      // re‐run the filter
      updateView();
    }

    const resetBtn = filterPanel.querySelector('.reset-btn');
    const clearBtn = filterPanel.querySelector('.clear-btn');

    resetBtn.addEventListener('click', () => {
      resetFilters();
    });

    clearBtn.addEventListener('click', () => {
      resetFilters();
      panel.style.display    = 'none';
      backdrop.style.display = 'none';
    });

    // Initial state
    updateView();

  } catch (err) {
    console.error('Failed to load library data:', err);
    document.querySelector('.card-grid').innerHTML =
      `<p class="error">Could not load your library.</p>`;
  }
}

function formatDate(dateString) {
  const opts = { day: 'numeric', month: 'numeric', year: '2-digit' };
  return new Date(dateString)
    .toLocaleDateString('en-AU', opts);  // eg "15/5/25"
}


function renderCards(list, grid, area) {
  grid.innerHTML = '';
  
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    let ratingHTML = '';
    if (typeof item.rating === 'number') {
      const rounded = Math.round(item.rating);
      const fullStars = '⭐'.repeat(rounded);
      const emptyStars = '✰'.repeat(5 - rounded);
      ratingHTML = `${fullStars}${emptyStars} (${item.rating}/5)`;
    }

    const niceDate = formatDate(item.date);

    card.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title} cover" />
      <div class="card-info">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-meta">
          <span class="type">${item.contentType === 'Book' ? '📚' : '🎬'}</span>
          <span class="date">${niceDate}</span>
          <span class="status ${item.status.toLowerCase()}">${item.status}</span>
          
        </p>
        ${ ratingHTML ? `<p class="card-rating">${ratingHTML}</p>` : '' }
        
        ${item.series
          ? `<p class="card-series">Series: [${item.series}]</p>`
          : ''
        }

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
