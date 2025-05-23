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

    // Buttons
    const closeBtn = modal.querySelector('.modal-close');
    const resetBtn = modal.querySelector('#resetBtn');
    const applyBtn = modal.querySelector('#applyBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const openers = document.querySelectorAll('[data-modal-open]');

    // Cover Image
    let coverInput = modal.querySelector('#coverInput');
    let uploadArea = modal.querySelector('.upload-area');
    const emptyUploadHTML = uploadArea.innerHTML;

    // Form, Errors and Validation
    const form = modal.querySelector('#modal-form');
    const formError = modal.querySelector('#formError');
    const titleInput = modal.querySelector('#titleInput');
    const mediaType = modal.querySelector('#mediaType');
    const autoFillBtn = modal.querySelector('#autoFillBtn');

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

    cancelBtn.addEventListener('click', () => {
        form.reset(); // clear the input
        close(); // close the form
    });

    // applyBtn.addEventListener('click', close); // TODO: For now

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            close();
        }
    });


    function handleCoverChange() {
        const file = coverInput.files[0];
        if (!file) return;

        // mark as containing image
        uploadArea.classList.add('has-image');

        // create an img preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src); // free memory

        // clear out the icon/text and insert the preview
        uploadArea.innerHTML = '';
        uploadArea.appendChild(img);
    }

    function linkCoverUpload() {
        uploadArea.addEventListener('click', () => coverInput.click());
        coverInput.addEventListener('change', handleCoverChange);
    }
    linkCoverUpload();


    // cover image handling/validation
    uploadArea.addEventListener('click', () => coverInput.click());


    function updateAutoFill() {
        autoFillBtn.disabled = !(
            titleInput.value.trim() && 
            mediaType.value
        );
    }

    titleInput.addEventListener('input', updateAutoFill);
    mediaType.addEventListener('change', updateAutoFill);
    updateAutoFill();

    function showFieldError(el, msg) {
        const err = el.parentNode.querySelector('.error');
        err.textContent = msg;
        el.classList.toggle('invalid', !!msg);
    }

      // validate a single field
    function validateField(el) {
        if (!el.checkValidity()) {
            if (el.validity.valueMissing) {
                showFieldError(el, `${el.previousElementSibling.textContent.replace('*','')} is required`);
            } else {
                showFieldError(el, el.validationMessage);
            }
            return false;
        } else {
            showFieldError(el, '');
            return true;
        }
    }

    titleInput.addEventListener('blur', () => validateField(titleInput));
    mediaType.addEventListener('blur', () => validateField(mediaType));

    // on submit, prevent if invalid & show summary
    form.addEventListener('submit', e => {
        e.preventDefault();
        formError.textContent = '';

        const validTitle = validateField(titleInput);
        const validType  = validateField(mediaType);

        if (!validTitle || !validType) {
        const missing = [];
        if (!validType)  missing.push('Type');
        if (!validTitle) missing.push('Title');
        formError.textContent = `Please fill in: ${missing.join(' and ')}`;
        return;
        }

        // all good → proceed!
        formError.textContent = '';
        console.log("Pretend Something is Happening for now :)")
    });

    form.addEventListener('reset', () => {
        // clear banner
        formError.textContent = '';

        // 2) clear inline errors + invalid classes
        [ titleInput, mediaType ].forEach(el => {
            //showFieldError(el, '');
            el.classList.remove('invalid');
            const err = el.parentNode.querySelector('.error');
            if (err) err.textContent = '';
        });

        // clear upload area
        coverInput.value = '';
        uploadArea.innerHTML = emptyUploadHTML;
        uploadArea.classList.remove('has-image');

        uploadArea = modal.querySelector('.upload-area');
        coverInput = modal.querySelector('#coverInput');

        linkCoverUpload();

        // re-disable Auto-Fill
        updateAutoFill();
    });

    console.log("Modal Initialised!");
}

window.addEventListener('DOMContentLoaded', loadPopupModal)