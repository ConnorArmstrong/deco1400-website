function initCarousels() {
  document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel');
    const prev  = container.querySelector('.prev');
    const next  = container.querySelector('.next');
    const cards = Array.from(track.querySelectorAll('.card'));
  
    // how much to scroll on each click 
    function scrollAmount() {
      const style = getComputedStyle(track);
      const cardW = parseFloat(style.getPropertyValue('--card-width'));
      const gap   = parseFloat(style.getPropertyValue('gap'));
      return cardW + gap;
    }
  
    prev.addEventListener('click', () =>
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' })
    );
    next.addEventListener('click', () =>
      track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' })
    );

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
  
    // disable arrows at the ends
    function updateArrows() {
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
  
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  
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