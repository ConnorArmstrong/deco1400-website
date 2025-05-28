//document.addEventListenter("DOMContentLoaded", () => {
const placeholder = document.getElementById('nav-placeholder');
fetch('./components/navbar.html')
  .then(res => {
    applyNavStyling();
    if (!res.ok) throw new Error(res.status);
    return res.text();
  })
  .then(html => {
    placeholder.innerHTML = html;
    placeholder.style.opacity = '1'; // WIP: Currently to stop the Navbar snapping as it loads in
    document.dispatchEvent(new Event('nav-loaded')); // this is for the initThemeToggle
  })
  .catch(err => console.error('Nav load failed:', err));
//});


function applyNavStyling() { // apply nav styling BEFORE the navbar is loaded in
    if (document.getElementById('nav-styles')) return;
    const link = document.createElement('link');

    link.id = 'nav-styles';
    link.rel = 'stylesheet';
    link.href = './css/navbar.css'

    document.head.appendChild(link);
}

window.handleLogout = () => {
  localStorage.setItem("login", "");
}