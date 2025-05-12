function initCarousels() {
  document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel');
    const prev  = container.querySelector('.prev');
    const next  = container.querySelector('.next');
    const cards = Array.from(track.querySelectorAll('.card'));

    // disable mouse-wheel scrolling over the carousel
    track.addEventListener('wheel', e => e.preventDefault(), { passive: false });

    // center a chosen card
    function centerCard(card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    // compute the offset for a given card
    function computeOffset(card) {
      const t = track.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const trackCenter = t.left + t.width / 2;
      const cardCenter  = c.left + c.width / 2;
      return cardCenter - trackCenter;
    }

    // click on a card to scroll and select
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const trackRect = track.getBoundingClientRect();
        const cardRect  = card.getBoundingClientRect();
    
        // calculate how far to scroll so that cards center = tracks center
        const trackCenter = trackRect.left + trackRect.width  / 2;
        const cardCenter  = cardRect.left  + cardRect.width  / 2;
        const offset      = cardCenter - trackCenter;
    
        // perform the smooth scroll
        track.scrollBy({ left: offset, behavior: 'smooth' });
      });
    });



    // arrow navigation with wrap-around
    prev.addEventListener('click', () => {
      const selected = track.querySelector('.card.selected');
      if (selected === cards[0]) {
        centerCard(cards[cards.length - 1]);
      } else {
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      }
    });
    next.addEventListener('click', () => {
      const selected = track.querySelector('.card.selected');
      if (selected === cards[cards.length - 1]) {
        centerCard(cards[0]);
      } else {
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
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

      cards.forEach(c => c.classList.toggle('selected', c === best));
    }

    track.addEventListener('scroll', updateSelected);
    window.addEventListener('resize', updateSelected);
    updateSelected();
  
    /*
    // disable arrows at the ends
    function updateArrows() {
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
  
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
    */
  
    // TODO: drag to scroll? 
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

document.addEventListener('DOMContentLoaded', () => {
  updateCardWidths();
  initCarousels();
  window.addEventListener('resize', () => {
    updateCardWidths();
    initCarousels();
  });
});