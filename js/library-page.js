function applyLibraryStyling() {
    if (document.getElementById('library-styles')) return;
    const link = document.createElement('link');

    link.id = 'library-styles';
    link.rel = 'stylesheet';
    link.href = './css/library.css'

    document.head.appendChild(link);
}


async function initLibrary() {
    try {
        // fetch json data

        const resp = await fetch("./media/data.json");

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const {items} = await resp.json();

        // Find DOM Elements:

        const searchInput = document.querySelector('.search-input');
        const sortBtn = document.querySelector('.sort-btn');
        const filterBtn = document.querySelector('.filter-btn');
        const cardGrid = document.querySelector('.card-grid');
        const itemCountArea = document.querySelector('.item-count')

        searchInput.addEventListener('input', e => {
            const term = e.target.value.trim().toLowerCase();
            const filtered = items.filter(item => 
                item.title.toLowerCase().includes(term) ||
                item.tags.some(tag => tag.toLowerCase().includes(term))
            );
            renderCards(filtered, cardGrid, itemCountArea);
        });


        renderCards(items, cardGrid, itemCountArea);


    } catch (err) {
        console.error('Failed to load library data:', err);
        cardGrid.innerHTML = `<p class="error">Could not load your library.</p>`;
    }
}

function renderCards(list, grid, countArea) {
    grid.innerHTML = '';

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        // For now - will make it like the carousel
        card.innerHTML = `
          <img src="${item.thumbnail}" alt="${item.title} cover" />
          <div class="card-info">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-meta">
              ${item.contentType === 'Book' ? '📚' : '🎬'} ${item.contentType}
              <span class="date">${item.date}</span>
              <span class="status ${item.status}">
                ${item.status}
              </span>
            </p>
            <p class="card-tags">
              Tags: ${item.tags.map(t => `[${t}]`).join(' ')}
            </p>
          </div>
        `;
        grid.appendChild(card);
    });
    updateItemCount(list, countArea);
}

function updateItemCount(list, area) {
    const books = list.filter(i => i.contentType === 'Book').length;
    const movies = list.filter(i => i.contentType === 'Movie').length;
    area.textContent = `Currently showing ${list.length} Items from ${books} Books and ${movies} Movies`;
}



document.addEventListener('DOMContentLoaded', () => {
  applyLibraryStyling();
  initLibrary();
});