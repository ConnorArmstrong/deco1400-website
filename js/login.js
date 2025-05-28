import { logIn, checkedLoggedIn } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // If we already have a session, skip the login screen
  if (checkedLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

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

    const numToShow = 70;  // how many floating covers
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

        const direction = Math.random() < 0.5 ? 'floatUp' : 'floatDown';
        img.style.animationName = direction;

        // random animation duration & delay
        const dur = 20 + Math.random() * 30;   // 20s–50s
        img.style.animationDuration = `${dur}s`;
        img.style.animationDelay = `-${Math.random() * dur}s`;

        bg.appendChild(img);
    }

  // LOGIN FORM
    const form      = document.getElementById('loginForm');
    const errorMsg  = document.getElementById('errorMsg');
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