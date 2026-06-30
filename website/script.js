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
      
      // If playground background is set to default, update it to match theme change
      if (typeof currentBg !== "undefined" && currentBg === "default") {
        updatePlaygroundBg("default");
      }
    });
  }
  // Image Viewer Modal Functionality
  const imageModal = document.getElementById("image-modal");
  const modalPicture = document.getElementById("modal-picture");
  const modalPictureAvif = document.getElementById("modal-picture-avif");
  const modalPictureWebp = document.getElementById("modal-picture-webp");
  const modalImg = document.getElementById("modal-img");
  const modalClose = imageModal ? imageModal.querySelector(".modal-close") : null;

  if (imageModal && modalImg) {
    const setModalImageFromPicture = (picture) => {
      const sourceAvif = picture.querySelector('source[type="image/avif"]');
      const sourceWebp = picture.querySelector('source[type="image/webp"]');
      const image = picture.querySelector("img");

      if (modalPictureAvif) {
        modalPictureAvif.srcset = sourceAvif ? sourceAvif.srcset : "";
      }
      if (modalPictureWebp) {
        modalPictureWebp.srcset = sourceWebp ? sourceWebp.srcset : "";
      }
      modalImg.src = image ? (image.currentSrc || image.src) : "";
      modalImg.alt = image ? image.alt : "";
    };

    // Open modal on image click
    document.querySelectorAll(".use-case-image, .drawing-sheet-image").forEach((picture) => {
      picture.style.cursor = "pointer";
      picture.addEventListener("click", () => {
        setModalImageFromPicture(picture);
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
      if (modalPictureAvif) modalPictureAvif.srcset = "";
      if (modalPictureWebp) modalPictureWebp.srcset = "";
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

  let currentBg = "default";
  let activeTextColorIndex = 0;

  const colorPalettes = {
    light: [
      { name: "Charcoal", hex: "#1e293b" },
      { name: "Rust", hex: "#c2410c" },
      { name: "Ocean", hex: "#1d4ed8" },
      { name: "Forest", hex: "#15803d" },
      { name: "Purple", hex: "#6d28d9" },
      { name: "Crimson", hex: "#be123c" }
    ],
    dark: [
      { name: "Cream", hex: "#f8fafc" },
      { name: "Peach", hex: "#fdba74" },
      { name: "Sky", hex: "#93c5fd" },
      { name: "Mint", hex: "#86efac" },
      { name: "Lavender", hex: "#c084fc" },
      { name: "Rose", hex: "#fda4af" }
    ]
  };

  const isDarkBg = (bg) => {
    if (bg === "default") {
      return document.documentElement.classList.contains("dark");
    }
    return bg === "dark" || bg === "blueprint";
  };

  const refreshColorSelector = () => {
    const isDark = isDarkBg(currentBg);
    const activePalette = isDark ? colorPalettes.dark : colorPalettes.light;
    const colorPickerContainer = document.getElementById("pg-color-picker");

    if (colorPickerContainer) {
      colorPickerContainer.innerHTML = activePalette.map((color, index) => {
        const isActive = index === activeTextColorIndex;
        return `
          <button 
            class="color-swatch ${isActive ? 'active' : ''}" 
            style="background-color: ${color.hex};" 
            data-index="${index}" 
            title="${color.name}"
            aria-label="Set text color to ${color.name}">
          </button>
        `;
      }).join("");
    }

    if (pgEditable) {
      pgEditable.style.color = activePalette[activeTextColorIndex].hex;
    }
  };

  const updatePlaygroundBg = (bg) => {
    currentBg = bg;
    const editorCard = document.querySelector(".playground-editor-card");
    if (editorCard) {
      editorCard.classList.remove("pg-bg-white", "pg-bg-notebook", "pg-bg-kraft", "pg-bg-blueprint", "pg-bg-dark");
      if (bg !== "default") {
        editorCard.classList.add(`pg-bg-${bg}`);
      }
    }
    refreshColorSelector();
  };

  if (pgEditable) {
    updatePlaygroundBg("default");

    const bgPickerContainer = document.getElementById("pg-bg-picker");
    if (bgPickerContainer) {
      bgPickerContainer.addEventListener("click", (e) => {
        const swatch = e.target.closest(".bg-swatch");
        if (!swatch) return;

        bgPickerContainer.querySelectorAll(".bg-swatch").forEach(btn => btn.classList.remove("active"));
        swatch.classList.add("active");

        updatePlaygroundBg(swatch.dataset.bg);
      });
    }

    const colorPickerContainer = document.getElementById("pg-color-picker");
    if (colorPickerContainer) {
      colorPickerContainer.addEventListener("click", (e) => {
        const swatch = e.target.closest(".color-swatch");
        if (!swatch) return;

        const index = parseInt(swatch.dataset.index, 10);
        activeTextColorIndex = index;

        colorPickerContainer.querySelectorAll(".color-swatch").forEach(btn => btn.classList.remove("active"));
        swatch.classList.add("active");

        const isDark = isDarkBg(currentBg);
        const activePalette = isDark ? colorPalettes.dark : colorPalettes.light;
        pgEditable.style.color = activePalette[index].hex;
      });
    }

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

        // Reset bg & color state
        activeTextColorIndex = 0;
        const bgPickerContainer = document.getElementById("pg-bg-picker");
        if (bgPickerContainer) {
          bgPickerContainer.querySelectorAll(".bg-swatch").forEach(btn => {
            if (btn.dataset.bg === "default") btn.classList.add("active");
            else btn.classList.remove("active");
          });
        }
        updatePlaygroundBg("default");
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

  // ==========================================================================
  // Make a Comic Section
  // ==========================================================================
  const comicSelector   = document.getElementById('comic-selector');
  const comicFrame      = document.getElementById('comic-editor-frame');
  const comicImageAvif  = document.getElementById('comic-image-avif');
  const comicImageWebp  = document.getElementById('comic-image-webp');
  const comicImage      = document.getElementById('comic-image');
  const comicResetBtn   = document.getElementById('comic-reset-btn');
  const comicDownloadBtn = document.getElementById('comic-download-btn');

  if (!comicSelector || !comicFrame || !comicImage) return;

  // ------------------------------------------------------------------
  // Comic data: each comic has an image path, natural dimensions, and
  // an array of bubble descriptors.
  //
  // Bubble fields:
  //   id       - unique DOM id
  //   text     - pre-filled default text (from OCR of the original)
  //   left/top/width/height - percentage of the rendered image size
  //   caption  - if true, adds .caption class (italic, slightly smaller)
  // ------------------------------------------------------------------
 const COMICS = {
  1: {
    src: './assets/comic_strip_1.png',
    avif: './assets/comic_strip_1.avif',
    webp: './assets/comic_strip_1.webp',
    alt: 'Comic Strip 1: Planning the Camping Trip',
    naturalW: 2000, naturalH: 1600,
    fontScale: 0.011,
    bubbles: [
      {
        id: 'c1-b1',
        text: '"Hey, is all your camping gear ready?',
        left: 15.7, top: 24.1, width: 9.3, height: 7.5
      },
      {
        id: 'c1-b3',
        text: "'Almost. I just bought a tent, but I don't have a portable stove yet",
        left: 34.8, top: 22, width: 9.1, height: 8.1
      },
      {
        id: 'c1-b4',
        text: "'That's great. Oh yeah, did you bring a sleeping bag?'",
        left: 57.4, top: 22.5, width: 9.4, height: 7.8
      },
      {
        id: 'c1-b5',
        text: "Just wow! If we don't have one, we can just cook over a campfire'",
        left: 71.2, top: 22, width: 9.5, height: 7.8
      },
      {
        id: 'c1-b7',
        text: "'Yeah, two in fact. One for you, so you don't get cold.'",
        left: 16.5, top: 58, width: 9.2, height: 7.6
      },
      {
        id: 'c1-b8',
        text: "Wow, thanks. So, shall we leave tomorrow morning at 6?'",
        left: 28.8, top: 58, width: 9.3, height: 7.8
      },
      {
        id: 'c1-b9',
        text: "'Ready! Don't forget to bring coffee, it'll make the trip even better.",
        left: 66.6, top: 57.5, width: 8.7, height: 8.2
      },
      {
        id: 'c1-b10',
        text: "'Deal, this camping trip is going to be fun!'",
        left: 79.2, top: 61.4, width: 8.8, height: 7.6
      }
    ]
  },
  2: {
    src: './assets/comic_strip_2.png',
    avif: './assets/comic_strip_2.avif',
    webp: './assets/comic_strip_2.webp',
    alt: 'Comic Strip 2: Adventurous Elephant',
    naturalW: 2000, naturalH: 1600,
    fontScale: 0.013,
    bubbles: [
      {
        id: 'c2-b1',
        text: "'The world is so big. I want to explore more than just this forest!'",
        left: 18.5, top: 21.1, width: 11.2, height: 10.2
      },
      {
        id: 'c2-b2',
        text: "'Who knows, I might find that chocolate river they say is so sweet!'",
        left: 68.5, top: 22.1, width: 11.7, height: 9.5
      },
      {
        id: 'c2-b3',
        text: "(The elephant is walking in the meadow, encountering a small, confused-looking bird)",
        left: 4.8, top:59, width: 40.5, height: 7.8,
        caption: true
      },
      {
        id: 'c2-b4',
        text: "I'm lost. I don't know how to get home.",
        left: 61.8, top: 69.2, width: 9, height: 8
      },
      {
        id: 'c2-b5',
        text: "Don't worry, I'll help you get home! The adventure just got even better!",
        left: 75, top: 61, width: 11.5, height: 8.9
      }
    ]
  },
  3: {
    src: './assets/comic_strip_3.png',
    avif: './assets/comic_strip_3.avif',
    webp: './assets/comic_strip_3.webp',
    alt: 'Comic Strip 3: Morning Rush',
    naturalW: 1200, naturalH: 927,
    fontScale: 0.02,
    bubbles: [
      {
        id: 'c3-b1',
        text: 'Oh, score! Would you look at that? A perfectly good, delicious-looking bone just sitting right out here in the open, waiting for me!',
        left: 11.9, top: 7.1, width: 36.3, height: 17.6
      },
      // {
      //   id: 'c3-b2',
      //   text: '',
      //   left: 75.1, top: 7.7, width: 15, height: 10
      // },
      {
        id: 'c3-b3',
        text: 'I think I\'ll just carry it across this river to the other side, where it\'s nice, safe, and quiet...',
        left: 3.6, top: 64.5, width: 22.2, height: 16.6
      },
      {
        id: 'c3-b4',
        text: 'Excuse me, are you going to throw that or just stand there?',
        left: 72.2, top: 61.8, width: 22.7, height: 11.5
      }
    ]
  }
};

  let activeComicKey = 2;

  function setComicImage(comic) {
    if (!comic) return;
    if (comicImageAvif) comicImageAvif.srcset = comic.avif || "";
    if (comicImageWebp) comicImageWebp.srcset = comic.webp || "";
    comicImage.src = comic.src;
    comicImage.alt = comic.alt;
  }

  // ------------------------------------------------------------------
  // Render: inject bubble divs for the given comic key
  // ------------------------------------------------------------------
  function renderBubbles(key) {
    // Remove all existing bubbles
    comicFrame.querySelectorAll('.comic-bubble').forEach(el => el.remove());

    const comic = COMICS[key];
    if (!comic) return;

    comic.bubbles.forEach(b => {
      const div = document.createElement('div');
      div.className = 'comic-bubble' + (b.caption ? ' caption' : '');
      div.id = b.id;
      div.contentEditable = 'true';
      div.setAttribute('aria-label', 'Speech bubble text – editable');
      div.setAttribute('spellcheck', 'false');
      div.textContent = b.text;

      // Percentage-based positioning
      div.style.left   = b.left   + '%';
      div.style.top    = b.top    + '%';
      div.style.width  = b.width  + '%';
      div.style.height = b.height + '%';

      comicFrame.appendChild(div);
    });

    updateBubbleFontSize();
  }

  // ------------------------------------------------------------------
  // Dynamically scale font size so text fills each bubble proportionally
  // as the image scales with the container width.
  // Base reference: the natural image width is treated as 100%.
  // At natural width, font size = 1.55% of the natural width.
  // ------------------------------------------------------------------
  function getBubbleFontSettings() {
    const width = window.innerWidth;

    // Keep the comic text readable on smaller screens without overpowering
    // the speech bubbles. The floor is lower on mobile so the editor can
    // shrink enough to fit.
    if (width <= 480) {
      return { multiplier: 0.72, minPx: 5 };
    }

    if (width <= 768) {
      return { multiplier: 0.85, minPx: 6 };
    }

    return { multiplier: 1, minPx: 8 };
  }

  function updateBubbleFontSize() {
    const key = activeComicKey;
    const comic = COMICS[key];
    if (!comic) return;

    const renderedW = comicImage.offsetWidth;
    if (!renderedW) return;

    // Scale factor relative to natural width
    const scale = renderedW / comic.naturalW;
    const { multiplier, minPx } = getBubbleFontSettings();
    // Base font at natural size: driven by each comic's fontScale property
    const basePx = comic.naturalW * (comic.fontScale ?? 0.009);
    const scaledPx = Math.max(minPx, Math.round(basePx * scale * multiplier));

    comicFrame.style.setProperty('--bubble-font-size', scaledPx + 'px');
  }

  // Use ResizeObserver to keep font size in sync as the container resizes
  const resizeObserver = new ResizeObserver(() => updateBubbleFontSize());
  resizeObserver.observe(comicFrame);
  window.addEventListener('resize', updateBubbleFontSize);

  // ------------------------------------------------------------------
  // Switch comic on pill click
  // ------------------------------------------------------------------
  comicSelector.addEventListener('click', e => {
    const pill = e.target.closest('.pill[data-comic]');
    if (!pill) return;

    const key = parseInt(pill.dataset.comic, 10);
    if (key === activeComicKey) return;

    // Update active pill
    comicSelector.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    // Clear stale bubbles immediately so old text never lingers
    comicFrame.querySelectorAll('.comic-bubble').forEach(el => el.remove());

    // Update state and image
    activeComicKey = key;
    const comic = COMICS[key];

    setComicImage(comic);

    // Cancel any pending onload from a previous switch
    comicImage.onload = null;

    // Guard: only render if this key is still the active one when the image loads
    const capturedKey = key;
    const doRender = () => {
      if (activeComicKey === capturedKey) renderBubbles(capturedKey);
    };

    // Use requestAnimationFrame to let the browser update .complete after src change
    requestAnimationFrame(() => {
      if (comicImage.complete && comicImage.naturalWidth > 0) {
        doRender();
      } else {
        comicImage.onload = doRender;
      }
    });
  });

  // ------------------------------------------------------------------
  // Reset: restore all bubbles to their default text
  // ------------------------------------------------------------------
  comicResetBtn.addEventListener('click', () => {
    const comic = COMICS[activeComicKey];
    if (!comic) return;
    comic.bubbles.forEach(b => {
      const el = document.getElementById(b.id);
      if (el) el.textContent = b.text;
    });
  });

  // ------------------------------------------------------------------
  // Download: draw the comic onto a canvas at full natural resolution
  // and trigger a PNG download.
  // ------------------------------------------------------------------
  comicDownloadBtn.addEventListener('click', () => {
    const comic = COMICS[activeComicKey];
    if (!comic) return;

    const canvas = document.createElement('canvas');
    canvas.width  = comic.naturalW;
    canvas.height = comic.naturalH;
    const ctx = canvas.getContext('2d');

    // 1. Draw the base comic image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = comic.src;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, comic.naturalW, comic.naturalH);

      // 2. Draw each bubble's text onto the canvas at full resolution
      const { multiplier, minPx } = getBubbleFontSettings();
      const baseFontPx = comic.naturalW * (comic.fontScale ?? 0.009); // matches CSS logic
      ctx.fillStyle = '#111111';
      ctx.textBaseline = 'top';

      comic.bubbles.forEach(b => {
        const el = document.getElementById(b.id);
        if (!el) return;

        const text  = el.textContent.trim();
        const x     = (b.left   / 100) * comic.naturalW + 6;
        const y     = (b.top    / 100) * comic.naturalH + 6;
        const maxW  = (b.width  / 100) * comic.naturalW - 12;
        const maxH  = (b.height / 100) * comic.naturalH - 12;

        const fontSize = Math.max(
          minPx,
          Math.round((b.caption ? baseFontPx * 0.9 : baseFontPx) * multiplier),
        );
        ctx.font = `${fontSize}px WmFont, sans-serif`;

        // Word-wrap helper
        function wrapText(ctx, text, maxWidth) {
          const words  = text.split(' ');
          const lines  = [];
          let   line   = '';
          for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
              lines.push(line);
              line = word;
            } else {
              line = test;
            }
          }
          if (line) lines.push(line);
          return lines;
        }

        const lineH = fontSize * 1.35;
        const rawLines = text.split('\n');
        const allLines = rawLines.flatMap(l => wrapText(ctx, l, maxW));

        allLines.forEach((line, i) => {
          const lineY = y + i * lineH;
          if (lineY + lineH > y + maxH) return; // clip to bubble height
          ctx.fillText(line, x, lineY, maxW);
        });
      });

      // 3. Trigger download
      const link = document.createElement('a');
      link.download = `wm-comic-${activeComicKey}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.onerror = () => {
      alert('Could not load the comic image for download. Make sure the page is served from a local server.');
    };
  });

  // Initial render
  renderBubbles(activeComicKey);
});
