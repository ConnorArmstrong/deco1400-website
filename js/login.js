document.addEventListener('DOMContentLoaded', () => {
  setupLogIn();
});

async function listCovers(dirUrl) {
    const res = await fetch(dirUrl);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    return Array.from(doc.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      // ignore parent-dir links
      .filter(name => !name.startsWith('../'))
      // only keep images
      .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
      // build full path
      .map(name => dirUrl + name);
}

async function setupLogIn() {
  const bg = document.querySelector('.bg');

  const bookCovers = await listCovers("/media/books/covers/");
  const movieCovers = await listCovers("/media/movies/covers/");

  const allCovers = [...bookCovers, ...movieCovers];

  const numToShow = 35;  // how many floating covers
  for (let i = 0; i < numToShow; i++) {
    const img = document.createElement('img');
    // pick a random cover
    const src = allCovers[Math.floor(Math.random() * allCovers.length)];
    img.src = src;

    // random initial position
    img.style.left = `${Math.random() * 100}%`;
    img.style.top  = `${Math.random() * 120}%`;

    // random size variation
    const scale = 1 + Math.random() * 0.6;
    img.style.width = `${120 * scale}px`;

    const direction = Math.random() < 0.5 ? 'floatUp' : 'floatDown';
    img.style.animationName = direction;

    // random animation duration & delay
    const dur = 20 + Math.random() * 30;   // 20s–50s
    img.style.animationDuration = `${dur}s`;
    img.style.animationDelay = `-${Math.random() * dur}s`;

    bg.appendChild(img);
  }
}