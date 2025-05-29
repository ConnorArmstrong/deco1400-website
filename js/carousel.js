import { getUser, checkedLoggedIn, getData, getItem } from './utils.js';

// this is by far my messiest JS File
// Apologies
// I have learnt: I am never using carousels again

function initCarousels() {
  document.querySelectorAll('.carousel-container').forEach(container => {
    const username = getUser();
    const welcomeElement = document.getElementById('usernameDisplay');
    welcomeElement.textContent = username;


    const track = container.querySelector('.carousel');
    const prev  = container.querySelector('.prev');
    const next  = container.querySelector('.next');
    
    const realCards = Array.from(track.querySelectorAll('.card')); // the original set
    const buffer = 3; // The amount of clones on either end for smooth looping traversal

    track.querySelectorAll('.card.clone').forEach(c => c.remove()); // clear previous

    // add the first 3:
    realCards.slice(-buffer).reverse().forEach(c => {
      const clone = c.cloneNode(true);
      clone.classList.add('clone');
      track.insertBefore(clone, track.firstChild);
    });

    // add the last 3:
    realCards.slice(0, buffer).forEach(c => {
      const clone = c.cloneNode(true);
      clone.classList.add('clone');
      track.appendChild(clone);
    });

    const cards = Array.from(track.querySelectorAll('.card'));

    // set the scroll position so the first REAL card is centered:
    (() => {
      const style = getComputedStyle(track);
      const cardW = parseFloat(style.getPropertyValue('--card-width'));
      const gap = parseFloat(style.getPropertyValue("gap"));
      // scroll by (buffer * (cardW + gap)) to ensure the real card is selected
      track.scrollLeft = buffer * (cardW + gap)
    })

    // disable mouse-wheel scrolling over the carousel
    track.addEventListener('wheel', e => e.preventDefault(), { passive: false });

    // center a chosen card
    function centerCard(card) {
      console.log(`Centering card: ${card}`)
      // Find the scrolling elements
      const container = card.closest('.carousel-container');
      
      if (!container) {
        console.error("No container found (?)");
        return
      }

      const track = container.querySelector('.carousel');
      const currentScroll = track.scrollLeft;

      const cardRect = card.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const cardCenterX = cardRect.left + cardRect.width / 2;
      const containerCenterX = containerRect.left + containerRect.width/2;

      const deltaX = cardCenterX - containerCenterX;
      const targetScroll = Math.round(currentScroll + deltaX);

      track.scrollTo({
        left: Math.round(targetScroll),
        behavior: 'smooth'
      });
    }

    // click on a card to scroll and select
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        const real = card.classList.contains('clone') ? // Messy but finds the correct index of the real card
          realCards[
            idx < buffer
              ? realCards.length - buffer + idx
              : idx >= buffer + realCards.length
                ? idx - (buffer + realCards.length)
                : idx - buffer
          ]
        : card;
        centerCard(real);
      });
    });

    // arrow navigation TODO: Not working with wrap around
    prev.addEventListener('click', () => {
      const selected = track.querySelector('.card.selected');
      const idx = realCards.indexOf(selected);
      if (idx === -1) {
        console.warn("Trying to navigate to non-existant card");
        return;
      }

      // if at 0 wrap to last else idx - 1
      const targetCard = idx === 0 ? realCards[realCards.length - 1] : realCards[idx - 1];

      centerCard(targetCard);
    });
    next.addEventListener('click', () => {
      const selected = track.querySelector('.card.selected');
      const idx = realCards.indexOf(selected);
      if (idx === -1) {
        console.warn("Trying to navigate to non-existant card");
        return;
      }

      // if at finalcard wrap to start else idx + 1
      const targetCard = idx === realCards.length - 1 
        ? realCards[0] 
        : realCards[idx + 1];

      centerCard(targetCard);
    });
    
    // Find the Centred Card and mark it as selected 
    function updateSelected() {
      const section = container.closest('.content-section');
      section.querySelectorAll('.add-review-overlay').forEach(el => el.remove());
      const {left, width} = track.getBoundingClientRect();
      const centreX = left + width/2;

      let best = null, bestDiff = Infinity;
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const cardCentre = r.left + r.width/2;
        const diff = Math.abs(cardCentre - centreX);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = card;
        }
      })

      //cards.forEach(c => c.classList.toggle('selected', c === best));

      // toggle selected and unselected cards
      cards.forEach(c => {
        const isSelected = c === best;
        c.classList.toggle('selected', isSelected);

        // Set the content section to show information regarding the selected item
        if (isSelected) {
          const sectionContainer = c.closest('.carousel-container');
          if (c.classList.contains('add-card')) {
            showAddReviewPrompt(sectionContainer);
          } else {
          const title = c.dataset.title;
          getItem(title).then(item => renderDisplay(item, container));
          }
        }
      });
    }

    track.addEventListener('scroll', updateSelected);
    window.addEventListener('resize', updateSelected);
    updateSelected();

    // TODO: drag to scroll? 
    // need to incorporate scrolling changes and smoother transitions
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add('dragging');
    });
    ['mouseup','mouseleave'].forEach(evt =>
      track.addEventListener(evt, () => {
        isDown = false;
        track.classList.remove('dragging');
      })
    );
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const scroll_speed = 1.2;
      const walk = (x - startX) * scroll_speed;
      track.scrollLeft = scrollLeft - walk;
    });
  });
}

// Determine the correct width for the cards in the carousel
function updateCardWidths() {
  document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel');
    const gap = parseFloat(getComputedStyle(track).getPropertyValue('gap')) || 0;
    const W = track.clientWidth;

    const MIN_CARD_WIDTH = 110; // Minimum width of a card
    const MAX_VISIBLE = 7; // Maximum amount of cards shown on the carousel at once

    let maxN = Math.floor((W + gap) / (MIN_CARD_WIDTH + gap));
    if (maxN < 1) maxN = 1;

    // make odd
    const oddN = (maxN % 2 === 0) ? maxN - 1 : maxN;
    
    const visible = Math.min(oddN, MAX_VISIBLE)

    // compute exact width so visible cards + gaps fill 100%
    const cardW = (W - gap * (visible - 1))/ visible;

    track.style.setProperty('--card-width', `${cardW}px`);

    console.log("Computed cardW:", cardW);
  });
}


/// TODO: Implement Maybe?
function equaliseContentSections() {
  const sections = document.querySelectorAll('.content-section.books, content-section.movies');

  // reset heights to find the natural height of each
  sections.forEach(s => { 
    s.style.height = '';
    s.style.overflow = '';
  });

  const heights = Array.from(sections).map( s => s.getBoundingClientRect().height);

  const maxH = Math.max(...heights);
  

  // apply to both the taller height
  sections.forEach(s => {
     s.style.height = maxH + 'px';
     s.style.overflow = 'hidden';
  });
}


// Directly render the data for a given item and container
function renderDisplay(item, container) {
  const section = container.closest('.content-section'); // specified container

  const titleHeading = section.querySelector('.display-title'); // title
  const metaData = section.querySelector('.display-meta'); // metadata
  const autoSummary = section.querySelector('.display-summary'); // autosummary section
  const coverImage = section.querySelector('.display-thumb');  // cover image/thumbnail
  const tags = section.querySelector('.display-tags'); // list of tags
  const series = section.querySelector('.display-series'); // Series

  if (!item) { // reset fields if the item is empty
    titleHeading.textContent = "";
    metaData.textContent = "";
    autoSummary.textContent = "";
    autoSummary.innerHTML = "";
    coverImage.src = "";
    coverImage.alt = "";
    tags.textContent = "";
    series.textContent = "";

    return;
  }

  // for redirects to content for the specific title
  const qs = encodeURIComponent(item.title);
  const url = `/content.html?title=${qs}`;

  // For now we assume that if the item has a title, the rest of the form is correct

  // 1) Title
  titleHeading.textContent = item.title;
  titleHeading.style.cursor = 'pointer';
  titleHeading.onclick = () => {
    window.location.href = url;
  };


  // 2) Meta: rating - date – status – times
  const metaText = makeMetaString(item.rating, item.date, item.status, item.amount);
  metaData.textContent = metaText;

  // 3) Summary box
  const sum = item.summary || {};
  const src = sum.source || "Unknown";
  const txt = makeSummaryString(sum.text);
  const autoCount = sum.ratingN != null ? sum.ratingN : 0;

  const autoStars = typeof sum.platformRating === 'number'
    ? makeRatingString(sum.platformRating, autoCount)
    : '';

  // directly write in autosummary
  autoSummary.innerHTML = `
      <p><strong>Summary retrieved from</strong> <a href=#>${src}</a>:</p>
      <p>${txt}</p>
      <p><strong>Platform Rating:</strong> ${autoStars}</p>
    `;

  // 4) Cover image
  coverImage.src = item.thumbnail || "";
  coverImage.alt = item.title;
  coverImage.style.cursor = 'pointer';
  coverImage.onclick = () => {
    window.location.href = url;
  };

  // 5) Tags

  const tagText = makeTagString(item.tags);
  tags.style.whiteSpace = "pre"; // allow \n for div
  tags.textContent = tagText; 

  // 6) Series

  const seriesText = makeSeriesString(item.series);
  series.style.whiteSpace = "pre"; // allow \n for div
  series.textContent = seriesText;
}

function makeRatingString(rating, n) {
  // The String Consists of:
  // [Full Stars - Half Stars - Empty Stars] + [rating/n]
  const whole_stars_n = Math.round(rating);
  const full_stars = '⭐'.repeat(whole_stars_n);
  const empty_stars_n = 5 - whole_stars_n;
  const empty_stars = '✰'.repeat(empty_stars_n);

  const stars = full_stars + empty_stars;
  const rating_num = n !== 0 ? `(${n})` : "";

  const ratingn = ` (${rating}/5)` + rating_num

  return stars + ratingn;
}

function makeMetaString(rating, date, status, amount) {
  const stars = typeof rating === 'number' // if rating: stars else: ""
  ? makeRatingString(rating, 0) : '';

  // rating - date – Completed – times
  // rating - date – In Progress
  // Planned – date

  // The string depends on Status - No rating/Amount if planned, No amount if in progress
  if (status === "Completed") {
    return `${stars} – ${date} – ${status} – ${amount} Times`;
  } else if (status === "In Progress") {
    return `${stars} – ${date} – ${status}`;
  } else if (status === "Planned") {
    return `${status} – ${date}`;
  } else {
    console.warn("Error: No status for populated content element");
    return "";
  }
}

function makeSummaryString(summary_text) {
  if (!summary_text) {
    return "No Summary Available"
  }

  const text_length = summary_text.length;

  if (text_length > 300) {
    return summary_text.slice(0, 300) + "...";
  }

  return summary_text
}

function makeTagString(tags) {
  if (tags.length === 0) {
    return "";
  }
  
  let tag_string = "";
  tags.forEach(x => tag_string += `[${x}]  `);

  return "Tags:\n" + tag_string.trim();
}

function makeSeriesString(seriesTitle) {
  if (typeof seriesTitle !== "string" || seriesTitle === "") {
    return "";
  }

  let title = `[${seriesTitle}]\n\n`; // for now

  return "Series:\n" + title;
}

function showAddReviewPrompt(container) {
  const section = container.closest('.content-section');
  const displayContainer = section.querySelector('.display-container');

  // remove any existing overlay
  section.querySelectorAll('.add-review-overlay')
    .forEach(el => el.remove());

  // run your existing “clear but preserve” reset
  renderDisplay(null, container);

  // build the overlay
  const overlay = document.createElement('div');
  overlay.className = 'add-review-overlay';

  overlay.innerHTML = `
    <div class="card add-card" data-modal-open>
      <span>＋</span>
      <small>Add Review</small>
    </div>
  `;

  // append it over the display‐container
  displayContainer.appendChild(overlay);
}

async function populateCarousels() {
  const data = await getData();

  document.querySelectorAll('.content-section').forEach(section => {
    const isBookSection = section.classList.contains('books');
    const type = isBookSection ? 'Book' : 'Movie';

    const track = section.querySelector('.carousel');
    track.innerHTML = ''; // clear placeholders

    const items = data.items.filter(i => i.contentType === type).slice(0, 7);

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.title = item.title;

      const img = document.createElement('img');
      img.src = item.thumbnail;
      img.alt = item.title;

      card.appendChild(img);
      track.appendChild(card)
    });

    // re add the Add Review Card
    const addCard = document.createElement('div');
    addCard.className = 'card add-card';
    addCard.innerHTML = `<span>＋</span><small>Add Review</small>`;
    track.appendChild(addCard);
  });
}


// on index.html startup
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkedLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  await populateCarousels(); // load in the max amount of cards from data.js

  //applyHomeStyling();
  updateCardWidths();
  initCarousels();
  window.addEventListener('resize', () => { // mostly redundant now, css handles more than originally planned
    updateCardWidths();
    initCarousels();
  });
});

//window.addEventListener('load', equaliseContentSections); TODO: Will fix