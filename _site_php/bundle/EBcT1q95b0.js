const importAlpine = import("https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.js/+esm");
document.addEventListener("alpine:init", () => {
  Alpine.data("currentScoreDot", () => ({
    init() {
      this.$watch("$store.game.currentScore", (currentScore) => {
        const geniusScoreThreshold = this.$store.game.geniusScoreThreshold;
        this.$el.style.left = `${100 * Math.min(1, currentScore / geniusScoreThreshold)}%`;
        const width = `${currentScore.toString().length + 1.2}ch`;
        this.$el.style.width = width;
        this.$el.style.height = width;
      });
    }
  }));
  Alpine.data("prevGuessModal", () => ({
    maxPageSize: 20,
    guessedWordPages: [],
    init() {
      this.$watch("$store.game.guessedWords", (guessedWords) => {
        const alphabetizedWordList = guessedWords.slice().sort();
        const wordCount = alphabetizedWordList.length;
        const pageCount = Math.ceil(wordCount / this.maxPageSize);
        const guessedWordPages = new Array(pageCount);
        for (let i = 0; i < pageCount; ++i) {
          guessedWordPages[i] = {
            id: Math.random().toString(36),
            words: alphabetizedWordList.slice(
              i * this.maxPageSize,
              (i + 1) * this.maxPageSize
            )
          };
        }
        this.guessedWordPages = guessedWordPages;
      });
      const wordPageWrapper = document.getElementById("word-page-wrapper");
      const wordPageIntersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const pageIndex = entry.target.getAttribute("data-idx");
            const pageButton = document.querySelector(
              `.page-btn[data-idx="${pageIndex}"]`
            );
            if (pageButton) {
              pageButton.style.setProperty(
                "--page-scroll-pct",
                `${entry.intersectionRatio * 100}%`
              );
            }
          });
        },
        {
          root: wordPageWrapper,
          // The observer will fire every time an element's visibility changes by >=10% to allow us
          // to have a slightly more fine-grained/smooth animation of the page buttons
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        }
      );
      const wordPageMutationObserver = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          for (const addedNode of mutation.addedNodes) {
            wordPageIntersectionObserver.observe(addedNode);
          }
          for (const removedNode of mutation.removedNodes) {
            wordPageIntersectionObserver.unobserve(removedNode);
          }
        }
      });
      wordPageMutationObserver.observe(wordPageWrapper, {
        childList: true
      });
      for (const wordPageElement of wordPageWrapper.getElementsByClassName(
        "word-page"
      )) {
        wordPageIntersectionObserver.observe(wordPageElement);
      }
    }
  }));
  Alpine.bind("PageScrollButton", () => ({
    type: "button",
    class: "page-btn",
    "@click"() {
      const wordPageWrapper = document.getElementById("word-page-wrapper");
      wordPageWrapper.scrollTo({
        top: 0,
        left: wordPageWrapper.querySelector(
          `.word-page[data-idx='${this.$data.index}']`
        ).offsetLeft,
        behavior: "smooth"
      });
    },
    ":data-idx": "index",
    ":aria-label": "`Go to page ${index + 1}`"
  }));
  Alpine.data("prevGuessModalBtn", () => ({
    isInitialRender: true,
    mostRecentGuesses: [],
    init() {
      this.$nextTick(() => {
        this.isInitialRender = false;
      });
      this.$watch("$store.game.guessedWords", (guessedWords) => {
        this.mostRecentGuesses = guessedWords.slice().reverse();
      });
    },
    tmpl: {
      "@click"() {
        if (this.$store.game.guessedWords.length) {
          document.querySelector('[x-data="prevGuessModal"]').showModal();
        }
      },
      ":aria-label"() {
        return this.$store.game.guessedWords.length > 0 ? "Show previous guesses" : null;
      },
      ":aria-disabled"() {
        return this.$store.game.guessedWords.length === 0;
      },
      type: "button",
      class: "prev-guess-modal-btn"
    }
  }));
  Alpine.data("letterButton", (letter) => ({
    letter,
    tmpl: {
      "x-text": "letter",
      type: "button",
      "@click": "guess += letter",
      // Hiding these buttons from screen readers because they will just be noisy and hard to navigate;
      // if using the keyboard, the user will be expected to type their guess into the text input
      // instead of clicking these buttons.
      tabindex: "-1",
      "aria-hidden": "true"
    }
  }));
  Alpine.data("winModal", () => ({
    showModal() {
      this.$el.showModal();
      window.fireConfetti("win-confetti");
    },
    init() {
      this.$watch("$store.game.isGenius", (isGenius) => {
        if (isGenius) {
          this.showModal();
        }
      });
    }
  }));
});
const a = (await importAlpine).default;
window.Alpine = a;
a.start();
