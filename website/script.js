document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-btn");
  const editableText = document.querySelector(".editable-text");
  const defaultText = "Edit the text below to take a feel of WM Font.";

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

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      const pgSection = document.getElementById("playground");
      const pgEdit = document.getElementById("pg-editable");
      if (pgSection && pgEdit) {
        pgSection.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          pgEdit.focus();
          // Place cursor at the end of the text
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(pgEdit);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }, 500); // Wait for smooth scroll to finalize
      }
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
  const LIMIT = window.innerWidth <= 768 ? 16 : 72; // Initial number of glyphs to show

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

    glyphGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".glyph-card");
      if (!card) return;
      navigator.clipboard.writeText(card.querySelector(".glyph-char").textContent);
      card.classList.add("copied");
      setTimeout(() => card.classList.remove("copied"), 300);
    });

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
  // Image Viewer Modal Functionality
  const imageModal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalClose = imageModal ? imageModal.querySelector(".modal-close") : null;

  if (imageModal && modalImg) {
    // Open modal on image click
    document.querySelectorAll(".use-case-image, .drawing-sheet-image").forEach((img) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        imageModal.showModal();
        document.body.style.overflow = "hidden"; // Prevent background scroll
      });
    });

    const handleClose = () => {
      imageModal.close();
    };

    imageModal.addEventListener("close", () => {
      document.body.style.overflow = ""; // Restore background scroll
      modalImg.src = "";
      modalImg.alt = "";
    });

    if (modalClose) {
      modalClose.addEventListener("click", handleClose);
    }

    // Fallback light-dismiss for browsers without closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      imageModal.addEventListener("click", (event) => {
        if (event.target !== imageModal) return;
        const rect = imageModal.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          handleClose();
        }
      });
    }
  }

  // ==========================================================================
  // Custom Playground Section Functionality
  // ==========================================================================
  const pgEditable = document.getElementById("pg-editable");
  const pgResetBtn = document.getElementById("pg-reset-btn");
  const pgSize = document.getElementById("pg-size");
  const pgSizeVal = document.getElementById("pg-size-val");
  const pgHeight = document.getElementById("pg-height");
  const pgHeightVal = document.getElementById("pg-height-val");
  const pgSpacing = document.getElementById("pg-spacing");
  const pgSpacingVal = document.getElementById("pg-spacing-val");
  const pgSample = document.getElementById("pg-sample");
  const pgAlignBtns = document.querySelectorAll(".btn-align");

  const pgDefaults = {
    text: "The quick brown fox jumps over the lazy dog.",
    size: "36",
    height: "1.4",
    spacing: "0",
    align: "left"
  };

  const sampleTexts = {
    default: "The quick brown fox jumps over the lazy dog.",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789",
    math: "∫_a^b f(x) dx = F(b) - F(a)\nx₁,₂ = (-β ± Δ½) ÷ 2α\ny = ½x² ± ⅔x ÷ ⅕\nx³ ± y³ ≠ z³ for n ≥ 3\nℕ ≤ ℤ ≤ ℚ ≤ ℝ ≤ ℂ",
    chemistry: "2H₂ + O₂ → 2H₂O\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O\nE = ½μv²\nρ = m ÷ V\nΩ = R₁ + R₂ + R₃"
  };

  if (pgEditable) {
    // Font Size Slider
    if (pgSize && pgSizeVal) {
      pgSize.addEventListener("input", (e) => {
        const val = e.target.value;
        pgEditable.style.fontSize = `${val}px`;
        pgSizeVal.textContent = `${val}px`;
      });
    }

    // Line Height Slider
    if (pgHeight && pgHeightVal) {
      pgHeight.addEventListener("input", (e) => {
        const val = e.target.value;
        pgEditable.style.lineHeight = val;
        pgHeightVal.textContent = val;
      });
    }

    // Letter Spacing Slider
    if (pgSpacing && pgSpacingVal) {
      pgSpacing.addEventListener("input", (e) => {
        const val = e.target.value;
        pgEditable.style.letterSpacing = `${val}px`;
        pgSpacingVal.textContent = `${val}px`;
      });
    }

    // Sample Text Dropdown
    if (pgSample) {
      pgSample.addEventListener("change", (e) => {
        const key = e.target.value;
        pgEditable.innerText = sampleTexts[key] || pgDefaults.text;
      });
    }

    // Text Alignment Buttons
    pgAlignBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        pgAlignBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const align = btn.dataset.align;
        pgEditable.style.textAlign = align;
      });
    });

    // Reset Button
    if (pgResetBtn) {
      pgResetBtn.addEventListener("click", () => {
        pgEditable.innerText = pgDefaults.text;
        pgEditable.style.fontSize = `${pgDefaults.size}px`;
        pgEditable.style.lineHeight = pgDefaults.height;
        pgEditable.style.letterSpacing = `${pgDefaults.spacing}px`;
        pgEditable.style.textAlign = pgDefaults.align;

        if (pgSize) { pgSize.value = pgDefaults.size; pgSizeVal.textContent = `${pgDefaults.size}px`; }
        if (pgHeight) { pgHeight.value = pgDefaults.height; pgHeightVal.textContent = pgDefaults.height; }
        if (pgSpacing) { pgSpacing.value = pgDefaults.spacing; pgSpacingVal.textContent = `${pgDefaults.spacing}px`; }
        if (pgSample) { pgSample.value = "default"; }

        pgAlignBtns.forEach(b => {
          if (b.dataset.align === pgDefaults.align) b.classList.add("active");
          else b.classList.remove("active");
        });
      });
    }
  }

  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinksList = document.querySelectorAll(".nav-link");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close mobile menu and highlight active tab on click
    navLinksList.forEach(link => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navMenu.classList.remove("active");

        navLinksList.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  hljs.addPlugin(new CopyButtonPlugin());
  hljs.highlightAll();
});

