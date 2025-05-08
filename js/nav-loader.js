//document.addEventListenter("DOMContentLoaded", () => {
const placeholder = document.getElementById('nav-placeholder');
fetch('./components/navbar.html')
  .then(res => {
    if (!res.ok) throw new Error(res.status);
    return res.text();
  })
  .then(html => {
    placeholder.innerHTML = html;
    placeholder.style.opacity = '1'; // WIP: Currently to stop the Navbar snapping as it loads in
  })
  .catch(err => console.error('Nav load failed:', err));
//});