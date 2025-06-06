import { logIn, checkedLoggedIn } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // If we already have a login in local storage, skip the login screen
  if (checkedLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  setupLogIn();
});

// This finds all image paths in the given directory
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

    const bookCovers = await listCovers("/media/books/");
    const movieCovers = await listCovers("/media/movies/");

    const allCovers = [...bookCovers, ...movieCovers];

    const isSmall = window.matchMedia('(max-width: 600px)').matches; // check if hitting mobile breakpoint
    const numToShow = isSmall ? 30 : 70; 70;  // how many floating covers - less if mobile width

    for (let i = 0; i < numToShow; i++) {
        const img = document.createElement('img');
        // pick a random cover
        const src = allCovers[Math.floor(Math.random() * allCovers.length)];
        img.src = src;

        // random initial position
        img.style.left = `${Math.random() * 100}%`;
        img.style.top  = `${Math.random() * 120}%`;

        // random size variation
        const scale = 0.9 + Math.random() * 0.6;
        img.style.width = `${120 * scale}px`;

        // depth via opacity & blur:
        const opacity = 0.3 + Math.random() * 0.2;
        const blur    = Math.random() * 1;  // up to 2px
        img.style.opacity = opacity;
        img.style.filter  = `blur(${blur}px)`;

        const direction = Math.random() < 0.5 ? 'floatUp' : 'floatDown'; // 50-50 chance of going up or down
        img.style.animationName = direction; // referencing the custom animations defined in css

        // random animation duration & delay
        const dur = 20 + Math.random() * 30;   // 20s–50s duration
        img.style.animationDuration = `${dur}s`;
        img.style.animationDelay = `-${Math.random() * dur}s`;

        bg.appendChild(img);
    }

  // LOGIN FORM
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    
    form.addEventListener('submit', e => {
        e.preventDefault();

        // clear previous state
        errorMsg.textContent = '';
        errorMsg.classList.remove('show');
        userInput .classList.remove('invalid');
        passInput .classList.remove('invalid');

        const username = userInput.value.trim();
        const password = passInput.value;

        // validate username
        if (!username) {
            errorMsg.textContent = 'Username cannot be empty.';
            errorMsg.classList.add('show');
            userInput.classList.add('invalid');
            userInput.focus();
            return;
        }
        
        // validate password
        if (!password) {
            errorMsg.textContent = 'Please enter your password.';
            errorMsg.classList.add('show');
            passInput.classList.add('invalid');
            passInput.focus();
            return;
        }

        // success!
        logIn(username);
        window.location.href = 'index.html';
    });
}