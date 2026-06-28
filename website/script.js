document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('reset-btn');
    const editableText = document.querySelector('.editable-text');
    const defaultText = "Edit this text to see the font in action!";

    if (resetBtn && editableText) {
        resetBtn.addEventListener('click', () => {
            editableText.textContent = defaultText;
            // Place cursor at the end of the text
            editableText.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableText);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        });
    }
});
