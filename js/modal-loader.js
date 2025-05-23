function applyModalStyling() {
    if (document.getElementById('modal-styles')) return;
    const link = document.createElement('link');

    link.id = 'modal-styles';
    link.rel = 'stylesheet';
    link.href = './css/modalpopup.css'

    document.head.appendChild(link);
}

async function loadPopupModal() {
    try {
        applyModalStyling();

        const resp = await fetch('./components/modal.html');

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        document.body.insertAdjacentHTML('beforeend', html);

        initModal();
    }

    catch(err) {
        console.error(err);
    }
}

function initModal() {
    const modal = document.getElementById('globalModal');
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const resetBtn = modal.querySelector('#resetBtn');
    const applyBtn = modal.querySelector('#applyBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const openers = document.querySelectorAll('[data-modal-open]');

    const coverInput = modal.querySelector('#coverInput');
    const uploadArea = modal.querySelector('.upload-area');

    // open the modal functionality
    openers.forEach(btn => {
        btn.addEventListener('click', e=> {
            e.preventDefault();
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    applyBtn.addEventListener('click', close); // TODO: For now

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            close();
        }
    });

    resetBtn.addEventListener('click', () => {
        const form = modal.querySelector('form');
        if (form) form.reset();
    });

    // form handling/validation
    uploadArea.addEventListener('click', () => coverInput.click());

    // when a file is chosen, show a preview
    coverInput.addEventListener('change', () => {
        const file = coverInput.files[0];
        if (!file) return;

        // create an img preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src); // free memory

        // clear out the icon/text and insert the preview
        uploadArea.innerHTML = '';
        uploadArea.appendChild(img);
    });




    console.log("Modal Initialised!");
}

window.addEventListener('DOMContentLoaded', loadPopupModal)