document.querySelectorAll('.carousel-container').forEach(container => {
    const track = container.querySelector('.carousel');
    const prev  = container.querySelector('.prev');
    const next  = container.querySelector('.next');
  
    // how much to scroll on each click 
    const scroll_percent = 0.8;
    const scrollAmount = () => track.clientWidth * scroll_percent;
  
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