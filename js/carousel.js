document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel');
    const prev  = container.querySelector('.prev');
    const next  = container.querySelector('.next');
  
    // how much to scroll on each click (80% of visible width)
    const scrollAmount = () => track.clientWidth * 0.8;
  
    prev.addEventListener('click', () =>
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' })
    );
    next.addEventListener('click', () =>
      track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' })
    );
  
    // disable arrows at the ends
    function updateArrows() {
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
  
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  
    // optional: drag-to-scroll on desktop
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
      const walk = (x - startX) * 1.5; // tweak scroll speed
      track.scrollLeft = scrollLeft - walk;
    });
  });