function applyLibraryStyling() {
    if (document.getElementById('library-styles')) return;
    const link = document.createElement('link');

    link.id = 'library-styles';
    link.rel = 'stylesheet';
    link.href = './css/library.css'

    document.head.appendChild(link);
}




document.addEventListener('DOMContentLoaded', () => {
  applyLibraryStyling();
});