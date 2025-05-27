async function loadContent() {
    const resp = await fetch('/media/data.json');
    const {items} = await resp.json();

    // Find a given piece of content

    const item = items.find(i => i.title === 'The King in Yellow');
    if (!item) {
        console.warn('Cannot Find Content');
        return;
    }

    document.getElementById('thumb').src = item.thumbnail.replace(/\\/g, '/');

    document.getElementById('item-title').textContent = item.title;

    // stars ★☆☆ = rating
    document.getElementById('item-stars').textContent = 
        '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);

    document.getElementById('item-status').textContent = item.status;
    document.getElementById('item-date').textContent = item.date;
    document.getElementById('item-amount').textContent = item.amount;

    document.getElementById('item-series').textContent = item.series || '—';
    
    const tagsEl = document.getElementById('item-tags');
    tagsEl.innerHTML = '';  // clear “Loading…”
    item.tags.forEach(t => {
        const pill = document.createElement('span');
        pill.classList.add('tag');
        pill.textContent = t;
        tagsEl.appendChild(pill);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    loadContent();
});