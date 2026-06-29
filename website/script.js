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
  const expandContainer = document.getElementById("glyph-expand-container");
  const expandBtn = document.getElementById("glyph-expand-btn");

  let currentCategory = "all";
  let isExpanded = false;
  const LIMIT = 72; // Initial number of glyphs to show

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
        if (expandContainer) expandContainer.style.display = "none";
        return;
      }

      // Determine items to display based on expand status
      const showButton = filtered.length > LIMIT;
      const itemsToRender = (isExpanded || !showButton) ? filtered : filtered.slice(0, LIMIT);

      glyphGrid.innerHTML = itemsToRender
        .map(
          (item) => `
                <div class="glyph-card" data-unicode="${item.unicode}">
                    <div class="glyph-char">${escapeHtml(item.char)}</div>
                    <div class="glyph-unicode">${item.unicode}</div>
                </div>
            `,
        )
        .join("");

      // Update button visibility and text
      if (expandContainer && expandBtn) {
        if (showButton) {
          expandContainer.style.display = "flex";
          expandBtn.textContent = isExpanded ? "Show Less" : "Show More";
        } else {
          expandContainer.style.display = "none";
        }
      }
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

    // Handle expand/collapse button click
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        isExpanded = !isExpanded;
        renderGlyphs();
        if (!isExpanded) {
          const glyphsSection = document.getElementById("glyphs-section");
          if (glyphsSection) {
            glyphsSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    }

    // Load grid initially
    renderGlyphs();
  }
  // Theme Toggle Functionality
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
  hljs.addPlugin(new CopyButtonPlugin());
  hljs.highlightAll();
});
