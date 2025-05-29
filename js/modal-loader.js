import { refreshData, initThemeToggle } from './utils.js'; // for storage actions

// simple albeit redundant way to separate modal css
function applyModalStyling() {
    if (document.getElementById('modal-styles')) return;
    const link = document.createElement('link');

    link.id = 'modal-styles';
    link.rel = 'stylesheet';
    link.href = './css/modalpopup.css'

    document.head.appendChild(link);
}

// fetch the modal.html component and load it - this is done for all major pages
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

// note that in this submission the modal doesn't actually create any data or add anything to data.json/local storage
// however implementing this could be quite simple
function initModal() {
    const modal = document.getElementById('globalModal');
    const backdrop = modal.querySelector('.modal-backdrop');

    // Buttons
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#cancelBtn');

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
    // this was changed from iterating through all buttons with data-modal-open label which I thought was cooler
    // but didnt work when adding buttons AFTER the modal was loaded
    document.addEventListener('click', e => {
        const opener = e.target.closest('[data-modal-open]');
        if (!opener) return;
        e.preventDefault();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
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

    // check to see if there is a type and title
    // theoretically autofill basically meant you input the bare minimum data to find the book/movie
    // and the autofill button fills the rest based on API calls but that is out of scope/not implemented
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

    // on submit prevent if invalid and show summary
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

        // success
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


window.addEventListener('DOMContentLoaded', loadPopupModal); // runs the functions above, note that it is hidden by default



// THE FOLLOWING ARE SOME GLOBAL FUNCTIONS THAT HAVE BEEN PUT HERE BECAUSE THE MODAL IS ON EVERY MAJOR PAGE
// this is almost certainly bad practice. apologies.

// initialise the toggle dark/light theme button in the navbar
document.addEventListener('nav-loaded', initThemeToggle); // need the nav loaded FULLY to find the toggle button


// This makes Ctrl + Alt + R "refresh" the local storage. IE. this resets the local storage to the saved data.json file
// this is important for debugging
window.addEventListener('keydown', async e => { // Alt + Shift + R refreshes localstorage saved media data to the data.json
  if (e.altKey && e.shiftKey && e.code === 'KeyR') {
    e.preventDefault();    // stop any default action just in case
    refreshData().then(async () => { // reset the locaal storage
        /* Keeping for now - refresh data never played nice on the content page
        const url = new URL(window.location.href);
        // this will either add “_” or overwrite it if it was there
        url.searchParams.set('_', Date.now());
        window.location.href = url.toString(); // force a cache override 
        */
        await new Promise(res => setTimeout(res, 1000));
        window.location.href = 'login.html';
    });
  }
});

// In the future I will also make it so that I can manually download a backup so i can update the data.json file manually
// maybe like Ctrl + Alt + B or something

/*
Other global commands could be:
    - page navigation
    - delete specific things (ie pieces of content)
    - in theory a console would be cool for a page like this but very out of scope
*/