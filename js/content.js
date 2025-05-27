async function loadContent() {
    const resp = await fetch('/media/data.json');
    const {items} = await resp.json();

    // Find a given piece of content

    const title = "Walden"; //TODO: For now

    const item = items.find(i => i.title === title);
    if (!item) {
        console.warn('Cannot Find Content');
        return;
    }

    document.getElementById('thumb').src = item.thumbnail.replace(/\\/g, '/');
    document.getElementById('item-title').textContent = item.title;

    const metaRoot = document.getElementById('item-meta');
    const [ratingEl, dateEl, statusEl, amountEl] = metaRoot.querySelectorAll('span');

      // reset text and classes
    ratingEl.textContent = '';
    dateEl.textContent   = '';
    statusEl.textContent = '';
    amountEl.textContent = '';
    statusEl.className   = 'status';

    if (item.status === 'Planned') {
        // --- PLANNED: only show status then date ---

        // hide rating & amount
        ratingEl.style.display = 'none';
        amountEl.style.display = 'none';

        // fill status + add a CSS hook
        statusEl.textContent = item.status;
        statusEl.classList.add('planned');

        // fill date
        dateEl.textContent = item.date;

        // reorder so statusEl comes before dateEl
        metaRoot.insertBefore(statusEl, dateEl);

    } else {
        // --- COMPLETED or IN PROGRESS ---

        // ensure spans are visible
        ratingEl.style.display = '';
        dateEl.style.display   = '';
        statusEl.style.display = '';
        amountEl.style.display = '';

        // date + status
        dateEl.textContent = item.date;
        statusEl.textContent = item.status;
        statusEl.classList.add(
        item.status.toLowerCase().replace(/\s+/g,'-')
        );

        // rating (both Completed & In Progress)
        if (typeof item.rating === 'number') {
        const rounded   = Math.round(item.rating);
        const fullStars = '⭐'.repeat(rounded);
        const emptyStars= '✰'.repeat(5 - rounded);
        ratingEl.textContent =
            `${fullStars}${emptyStars} (${item.rating}/5)`;
        }

        // amount only for Completed
        if (item.status === 'Completed') {
        amountEl.textContent =
            `${item.amount} ${item.amount===1 ? 'Time' : 'Times'}`;
        } else {
        amountEl.style.display = 'none';
        }
    }

    //document.getElementById('item-series').textContent = item.series || '+';
    const seriesEl = document.getElementById('item-series');
    seriesEl.innerHTML = '';
    const pill = document.createElement('span');
    pill.classList.add('tag');
    pill.textContent = item.series || '+';
    seriesEl.appendChild(pill);
    
    const tagsEl = document.getElementById('item-tags');
    tagsEl.innerHTML = '';
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