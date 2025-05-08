const placeholder = document.getElementById('nav-placeholder');
fetch('./components/navbar.html')
  .then(res => {
    if (!res.ok) throw new Error(res.status);
    return res.text();
  })
  .then(html => {
    placeholder.innerHTML = html;
    // trigger the fade-in
    placeholder.style.opacity = '1';
  })
  .catch(err => console.error('Nav load failed:', err));