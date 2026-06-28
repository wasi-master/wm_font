document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('reset-btn');
    const editableText = document.querySelector('.editable-text');
    const defaultText = "Edit this text to see the font in action!";

    const playBtn = document.getElementById('play-btn');
    const playgroundCard = document.getElementById('playground-card');

    if (resetBtn && editableText) {
        resetBtn.addEventListener('click', () => {
            editableText.textContent = defaultText;
            editableText.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableText);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        });
    }

    if (playBtn && editableText && playgroundCard) {
        playBtn.addEventListener('click', () => {
            playgroundCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                editableText.focus();
                // Place cursor at the end of the text
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(editableText);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }, 500); // Wait for smooth scroll to finalize
        });
    }
  // ==========================================================================
    // Glyph Set Section Functionality
    // ==========================================================================
    const glyphGrid = document.getElementById('glyph-grid');
    const searchInput = document.getElementById('glyph-search');
    const pillsContainer = document.getElementById('category-pills');

    // Dialog elements
    const glyphDialog = document.getElementById('glyph-dialog');
    const dialogCloseBtn = document.getElementById('dialog-close');
    const previewChar = document.getElementById('dialog-char-preview');
    const nameLabel = document.getElementById('dialog-char-name');
    const unicodeVal = document.getElementById('dialog-unicode-val');
    const htmlEntityVal = document.getElementById('dialog-html-entity');
    const categoryLabel = document.getElementById('dialog-char-category');
    const testInput = document.getElementById('dialog-test-input');
    const testRender = document.getElementById('dialog-test-render');
    const copyCharBtn = document.getElementById('btn-copy-char');
    const copyCodeBtn = document.getElementById('btn-copy-code');

    let currentCategory = 'all';
    let currentSelectedGlyph = null;

    if (glyphGrid && searchInput && pillsContainer && typeof GLYPHS_DATA !== 'undefined') {

        // Render glyph grid based on active category & search keyword
        const renderGlyphs = () => {
            const query = searchInput.value.toLowerCase().trim();

            const filtered = GLYPHS_DATA.filter(item => {
                const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
                const matchesSearch = item.char.toLowerCase().includes(query) ||
                                      item.unicode.toLowerCase().includes(query) ||
                                      item.name.toLowerCase().includes(query);
                return matchesCategory && matchesSearch;
            });

            if (filtered.length === 0) {
                glyphGrid.innerHTML = `<div class="no-results">No glyphs found matching your search.</div>`;
                return;
            }

            glyphGrid.innerHTML = filtered.map(item => `
                <div class="glyph-card" data-unicode="${item.unicode}">
                    <div class="glyph-char">${escapeHtml(item.char)}</div>
                    <div class="glyph-unicode">${item.unicode}</div>
                </div>
            `).join('');
        };

        // Utility to escape HTML tags
        const escapeHtml = (text) => {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        // Listen for typing in the search box
        searchInput.addEventListener('input', renderGlyphs);

        // Listen for category pills selections
        pillsContainer.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.pill');
            if (!clickedBtn) return;

            pillsContainer.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
            clickedBtn.classList.add('active');

            currentCategory = clickedBtn.dataset.category;
            renderGlyphs();
        });

        // Listen for clicks on the cards inside the grid to launch details dialog
        glyphGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.glyph-card');
            if (!card) return;

            const uCode = card.dataset.unicode;
            const glyphObj = GLYPHS_DATA.find(item => item.unicode === uCode);
            if (!glyphObj) return;

            openGlyphDialog(glyphObj);
        });

        // Populate dialog fields and open it
        const openGlyphDialog = (glyph) => {
            currentSelectedGlyph = glyph;
            previewChar.textContent = glyph.char;
            nameLabel.textContent = glyph.name;
            unicodeVal.textContent = glyph.unicode;
            htmlEntityVal.textContent = glyph.html;
            categoryLabel.textContent = capitalizeFirstLetter(glyph.category);

            // Set up context playground preview
            testInput.value = '';
            testRender.textContent = glyph.char;

            // Open modal natively
            glyphDialog.showModal();
        };

        // Live text entry sync in dialog
        testInput.addEventListener('input', () => {
            const txt = testInput.value;
            testRender.textContent = txt ? txt : currentSelectedGlyph.char;
        });

        // Close details dialog
        if (dialogCloseBtn) {
            dialogCloseBtn.addEventListener('click', () => {
                glyphDialog.close();
            });
        }

        // Close on clicking backdrop
        glyphDialog.addEventListener('click', (e) => {
            const rect = glyphDialog.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                glyphDialog.close();
            }
        });

        // Copy character logic
        if (copyCharBtn) {
            copyCharBtn.addEventListener('click', () => {
                if (!currentSelectedGlyph) return;
                navigator.clipboard.writeText(currentSelectedGlyph.char).then(() => {
                    const originalText = copyCharBtn.textContent;
                    copyCharBtn.textContent = 'Copied!';
                    copyCharBtn.classList.add('copied');
                    setTimeout(() => {
                        copyCharBtn.textContent = originalText;
                        copyCharBtn.classList.remove('copied');
                    }, 1500);
                });
            });
        }

        // Copy HTML entity code logic
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                if (!currentSelectedGlyph) return;
                navigator.clipboard.writeText(currentSelectedGlyph.html).then(() => {
                    const originalText = copyCodeBtn.textContent;
                    copyCodeBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyCodeBtn.textContent = originalText;
                    }, 1500);
                });
            });
        }

        // Helper string uppercase conversion
        const capitalizeFirstLetter = (str) => {
            return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        };

        // Load grid initially
        renderGlyphs();
    }
});