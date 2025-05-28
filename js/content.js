import { getData, updateUserText } from './utils.js';

async function loadContent(title) {
    const { items } = await getData();

    if (title === '') { // for now!
        console.warn("No Title Provided?");
        title = "The King in Yellow";
    }

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

    // ─── 1) USER NOTES ──────────────────────────────
    // assumes <section class="user-notes"><p>…</p></section>
    const notesEl = document.getElementById('user-notes-textarea');
    notesEl.value = item.userText || '';
    notesEl.addEventListener('blur', () => {
        updateUserText(title, notesEl.value);
    });

    // ─── 2) SUMMARY PANEL ───────────────────────────
    // update heading with source
    const summaryHeader = document.querySelector('.summary h3');
    summaryHeader.textContent = `Summary (${item.summary.source})`;

    // first <p> → summary text
    const [summaryTextEl, summaryPlatformEl] =
        document.querySelectorAll('.summary p');
    summaryTextEl.textContent = item.summary.text;

    // second <p> → platform rating + count
    summaryPlatformEl.innerHTML =
        `<strong>Platform Rating:</strong> ${item.summary.platformRating} ` +
        `(${item.summary.ratingN})`;

    // ─── 3) Q&A PANEL ───────────────────────────────
    // assumes .q-and-a .question contains a <strong> and a <p>
    const qaSection = document.querySelector('.q-and-a');
    qaSection.innerHTML = '<h3>Q&amp;A</h3>';  // reset

    item.questions.forEach(({ question, answer }) => {
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `
        <strong>${question}</strong>
        <p>${answer}</p>
    `;
    qaSection.appendChild(div);
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    // pull the ?title= ...
    const params = new URLSearchParams(window.location.search);
    const rawTitle = params.get('title') || '';
    // decode it
    const title = decodeURIComponent(rawTitle);

    loadContent(title);
});