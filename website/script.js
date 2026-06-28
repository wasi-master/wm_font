document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-btn");
  const editableText = document.querySelector(".editable-text");
  const defaultText = "Edit this text to see the font in action!";

  const playBtn = document.getElementById("play-btn");
  const playgroundCard = document.getElementById("playground-card");

  if (resetBtn && editableText) {
    resetBtn.addEventListener("click", () => {
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
    playBtn.addEventListener("click", () => {
      playgroundCard.scrollIntoView({ behavior: "smooth", block: "center" });
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
  const glyphGrid = document.getElementById("glyph-grid");
  const searchInput = document.getElementById("glyph-search");
  const pillsContainer = document.getElementById("category-pills");

  let currentCategory = "all";

  if (
    glyphGrid &&
    searchInput &&
    pillsContainer &&
    typeof GLYPHS_DATA !== "undefined"
  ) {
    // Render glyph grid based on active category & search keyword
    const renderGlyphs = () => {
      const query = searchInput.value.toLowerCase().trim();

      const filtered = GLYPHS_DATA.filter((item) => {
        const matchesCategory =
          currentCategory === "all" || item.category === currentCategory;
        const matchesSearch =
          item.char.toLowerCase().includes(query) ||
          item.unicode.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        glyphGrid.innerHTML = `<div class="no-results">No glyphs found matching your search.</div>`;
        return;
      }

      glyphGrid.innerHTML = filtered
        .map(
          (item) => `
                <div class="glyph-card" data-unicode="${item.unicode}">
                    <div class="glyph-char">${escapeHtml(item.char)}</div>
                    <div class="glyph-unicode">${item.unicode}</div>
                </div>
            `,
        )
        .join("");
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
    searchInput.addEventListener("input", renderGlyphs);

    // Listen for category pills selections
    pillsContainer.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest(".pill");
      if (!clickedBtn) return;

      pillsContainer
        .querySelectorAll(".pill")
        .forEach((btn) => btn.classList.remove("active"));
      clickedBtn.classList.add("active");

      currentCategory = clickedBtn.dataset.category;
      renderGlyphs();
    });

    // Load grid initially
    renderGlyphs();
  }
});
