function initCarousels() {
  document.querySelectorAll('.carousel-container').forEach(container => {
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
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
      const real_idx = realCards.indexOf(selected);

      if (real_idx === 0) {
        centerCard(realCards.length[-1]);
      } else {
        track.scrollBy({left: -scrollAmount(), behavior: 'smooth'});
      }
    });
    next.addEventListener('click', () => {
      const selected = track.querySelector('.card.selected');
      const real_idx = realCards.indexOf(selected);

      if (real_idx === 0) {
        centerCard(realCards.length[-1]);
      } else {
        track.scrollBy({left: scrollAmount(), behavior: 'smooth'});
      }
    });
  
    // how much to scroll on each arrow click 
    function scrollAmount() {
      const style = getComputedStyle(track);
      const cardW = parseFloat(style.getPropertyValue('--card-width'));
      const gap   = parseFloat(style.getPropertyValue('gap'));
      return cardW + gap;
    }

    function updateSelected() {
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

      cards.forEach(c => {
        const isSelected = c === best;
        c.classList.toggle('selected', isSelected);

        if (isSelected) {
          const title = c.dataset.title;
          getContentData(title).then(item => renderDisplay(item, container));
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
    const gap = parseFloat(getComputedStyle(track).getPropertyValue('gap'));
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

// Load the entire JSON File
async function getJSON() { 
  const response = await fetch("./media/data.json");
  return response.json();
}

// Get all fields for a given title
async function getContentData(contentTitle) { 
  const data = await getJSON();

  const item = data.items.find(item => item.title === contentTitle);

  return item;
}

// Directly render the data for a given item and container
function renderDisplay(item, container) {

  const section = container.closest('.content-section'); // specified container

  const titleHeading = section.querySelector('.display-title'); // title
  const metaData = section.querySelector('.display-meta'); // metadata
  const autoSummary = section.querySelector('.display-summary'); // autosummary section
  const coverImage = section.querySelector('.display-thumb');  // cover image/thumbnail

  if (!item) {
    // reset fields
    titleHeading.textContent = "";
    metaData.textContent = "";
    autoSummary.textContent = "";
    autoSummary.innerHTML = "";
    coverImage.src = "";
    coverImage.alt = "";

    return;
  }

  // 1) Title
  titleHeading.textContent = item.title;

  // 2) Meta: rating - date – status – times
  const metaText = makeMetaString(item.rating, item.date, item.status, item.amount);
  metaData.textContent = metaText;

  // 3) Summary box
  const sum = item.summary || {};
  const src = sum.source || "Unknown";
  const txt = sum.text   || "No summary available.";
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

  // The final string depends on status - No rating or Amount if planned, No amount if in progress
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


document.addEventListener('DOMContentLoaded', () => {
  updateCardWidths();
  initCarousels();
  window.addEventListener('resize', () => {
    updateCardWidths();
    initCarousels();
  });
});