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
});
