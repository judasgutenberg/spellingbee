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
  const seededRandom = (seed) => () => {
    var t = seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  function shuffleArray(array) {
    const arrayCopy = array.slice();
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
  }
 
  const uniqueCharSet = /* @__PURE__ */ new Set();
  function getIsWordPanagram(word) {
    const wordLength = word.length;
    for (let i = 0; i < wordLength; ++i) {
      uniqueCharSet.add(word[i]);
    }
    const uniqueCharCount = uniqueCharSet.size;
    uniqueCharSet.clear();
    return uniqueCharCount === 7;
  }
  function getWordScore(word) {
    const wordLength = word.length;
    const wordLengthScore = wordLength > 4 ? wordLength : 1;
    if (word.length < 7) {
      return wordLengthScore;
    }
    return wordLengthScore + getIsWordPanagram(word) * 7;
  }
  const importIdb = import("https://cdn.jsdelivr.net/npm/idb@7/+esm");
  async function openGameDB() {
    const { openDB } = await importIdb;
    return openDB("SpellingBee", 1, {
      upgrade(db) {
        db.createObjectStore("dailyGames", {
          keyPath: "timestamp"
        });
      }
    });
  }
  let wordData;
  async function loadWordData() {
    if (!wordData) {
      const importBrotli = import("https://cdn.jsdelivr.net/npm/brotli-compress@1.3.3/js.mjs");
      wordData = await fetch("/spellingbee/words/en.json").then((res) => res.arrayBuffer()).then(async (data) => {
        var text = new TextDecoder().decode(data);
        return JSON.parse(text);
      });
    }
    return wordData;
  }
  const GENIUS_PERCENT_THRESHOLD = 0.7;
  const validWordSet = /* @__PURE__ */ new Set();
  console.log("guessed woids");
  const guessedWordSet = /* @__PURE__ */ new Set();
  Alpine.store("game", {
    timestamp: 0,
    centerLetter: "",
    outerLetters: new Array(6).fill(""),
    guessedWords: [],
    previousGame: null,
    totalPossibleScore: 0,
    currentScore: 0,
    invalidWordRegex: null,
    validWordRegex: null,
    notifications: [],
    currentRank: null,
    nextRank: null,
    isGenius: false,
    isMaster: false,
    geniusScoreThreshold: 0,
    ranks: [
      {
        percent: 0,
        name: "Beginner"
      },
      {
        percent: 0.02,
        name: "Good start"
      },
      {
        percent: 0.05,
        name: "Moving up"
      },
      {
        percent: 0.08,
        name: "Good"
      },
      {
        percent: 0.15,
        name: "Solid"
      },
      {
        percent: 0.25,
        name: "Nice"
      },
      {
        percent: 0.4,
        name: "Great"
      },
      {
        percent: 0.5,
        name: "Amazing"
      },
      {
        percent: GENIUS_PERCENT_THRESHOLD,
        name: "Genius"
      },
      {
        percent: 1,
        name: "Master"
      }
    ],
    async syncWithDB() {
      try {
        const gameDB = await openGameDB();
        const gameData = await gameDB.get("dailyGames", this.timestamp);
        var letters= window.letters;
        if (letters && letters.length > 6) {
          gameData.outerLetters = letters.split("");
          gameData.centerLetter = letters[0];
          gameData.outerLetters.shift();
          //console.log(outerLetters);
          
        }
        this.updateLetterSet(gameData.centerLetter, gameData.outerLetters);
              var letters = window.letters;

         gameData.validWords = window.answer;

        //console.log(window.answers);
        if (gameData) {
          this.updateLetterSet(gameData.centerLetter, gameData.outerLetters);
          this.updateValidWords(gameData.validWords);
          guessedWordSet.clear();
          for (const word of gameData.guessedWords) {
            guessedWordSet.add(word);
          }
          this.guessedWords = Array.from(guessedWordSet);
          let currentScore = 0;
          for (const word of this.guessedWords) {
            currentScore += getWordScore(word);
          }
          this.updateScore(currentScore);
          this.updateDB();
        } else {
          console.log('againing');
          await this.getNewLetterSet(this.timestamp);
        }
      } catch (e) {
        console.error("Error retrieving existing data for today's game", e);
        await this.getNewLetterSet(this.timestamp);
      }
    },
    updateDB() {
      queueMicrotask(() => {
        const timestamp = this.timestamp;
        const centerLetter = this.centerLetter;
        const outerLetters = this.outerLetters.slice();
        const validWords = window.answers;
        const guessedWords = this.guessedWords.slice();
        openGameDB().then(
          (gameDB) => gameDB.put("dailyGames", {
            timestamp,
            centerLetter,
            outerLetters,
            validWords,
            guessedWords
          }).then(() => gameDB.close())
        ).catch((e) => console.error("Error updating DB", e));
      });
    },
    updateLetterSet(centerLetter, outerLetters) {
      this.centerLetter = centerLetter;
      this.outerLetters = outerLetters;
      const letterSetString = `${this.centerLetter}${this.outerLetters.join("")}`;
      this.invalidWordRegex = new RegExp(`[^${letterSetString}]`, "g");
      this.validWordRegex = new RegExp(
        `^[${letterSetString}]*${this.centerLetter}+[${letterSetString}]*$`
      );
    },
    updateValidWords(newValidWords) {
      validWordSet.clear();
      this.validWords = newValidWords;
      newValidWords = window.answers;
      let totalPossibleScore = 0;
      for (const word of newValidWords) {
        validWordSet.add(word);
        totalPossibleScore += getWordScore(word);
      }
      this.totalPossibleScore = totalPossibleScore;
      this.geniusScoreThreshold = Math.floor(
        GENIUS_PERCENT_THRESHOLD * this.totalPossibleScore
      );
    },
    async getPreviousGame() {
      const yesterdayTimestamp = this.timestamp - 864e5;
      const gameDB = await openGameDB();
      const yesterdayGameData = await gameDB.get(
        "dailyGames",
        yesterdayTimestamp
      );
      gameDB.close();
      if (yesterdayGameData) {
        const guessedWordSet2 = new Set(yesterdayGameData.guessedWords);
        const guessedWords = Array.from(guessedWordSet2);
        let score = 0;
        let totalPossibleScore = 0;
        const normalWords = [];
        const panagrams = [];
        for (const word of yesterdayGameData.validWords) {
          const wordScore = getWordScore(word);
          const isPanagram = wordScore > word.length;
          const guessed = guessedWordSet2.has(word);
          totalPossibleScore += wordScore;
          if (guessed) {
            score += wordScore;
          }
          const wordEntry = { word, guessed, isPanagram };
          if (isPanagram) {
            panagrams.push(wordEntry);
          } else {
            normalWords.push(wordEntry);
          }
        }
        const achievedRankPercent = score / totalPossibleScore;
        let achievedRankName = this.ranks[0].name;
        for (let i = this.ranks.length - 1; i >= 0; --i) {
          const rank = this.ranks[i];
          if (achievedRankPercent >= rank.percent || i === 0) {
            achievedRankName = rank.name;
            break;
          }
        }
        this.previousGame = {
          centerLetter: yesterdayGameData.centerLetter,
          outerLetters: yesterdayGameData.outerLetters,
          words: panagrams.concat(normalWords),
          score,
          achievedRankName,
          guessedWordCount: guessedWords.length
        };
      }
    },
    async init() {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      this.timestamp = today.getTime();
      console.log("sync");
      this.syncWithDB();
      this.getPreviousGame();
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.syncWithDB();
        }
      });
    },
    validateWord(word) {
      if (word.length < 4) {
        return {
          isValid: false,
          reason: "Words must be at least 4 letters long."
        };
      }
      if (this.invalidWordRegex.test(word)) {
        return {
          isValid: false,
          reason: "Words can only contain the center letter and outer letters."
        };
      }
      if (!this.validWordRegex.test(word)) {
        return {
          isValid: false,
          reason: "Words must include the center letter."
        };
      }
      if (!validWordSet.has(word)) {
        return {
          isValid: false,
          reason: "Not a valid word."
        };
      }
      if (guessedWordSet.has(word)) {
        return {
          isValid: false,
          reason: "You've already guessed that word."
        };
      }
      const score = getWordScore(word);
      const isPanagram = score > word.length;
      return {
        isValid: true,
        score,
        isPanagram
      };
    },
    showNotification(notificationConfig) {
      const id = Math.random().toString(36);
      const aliveTime = 1500 + notificationConfig.message.length * 50;
      this.notifications.push({
        id,
        aliveTime,
        show: false,
        ...notificationConfig
      });
      setTimeout(() => {
        this.notifications = this.notifications.filter((n) => n.id !== id);
      }, aliveTime);
    },
    updateScore(newScore) {
      this.currentScore = newScore;
      const totalPossibleScore = this.totalPossibleScore;
      const ranks = this.ranks;
      if (!totalPossibleScore)
        return;
      const currentRankPercent = newScore / totalPossibleScore;
      this.isGenius = currentRankPercent >= GENIUS_PERCENT_THRESHOLD;
      this.isMaster = currentRankPercent >= 1;
      for (let i = ranks.length - 1; i >= 0; --i) {
        const rank = ranks[i];
        if (currentRankPercent >= rank.percent || i === 0) {
          this.currentRank = rank;
          this.nextRank = ranks[i + 1];
          break;
        }
      }
    },
    submitGuess(guessWord) {
      if (!guessWord)
        return;
      const sanitizedWord = guessWord.toLowerCase();
      const { isValid, reason, score, isPanagram } = this.validateWord(sanitizedWord);
      if (isValid) {
        guessedWordSet.add(sanitizedWord);
        this.guessedWords.push(sanitizedWord);
        this.updateDB();
        this.updateScore(this.currentScore + score);
        if (isPanagram) {
          window.fireConfetti("panagram-confetti");
          this.showNotification({
            class: "valid-guess gradient-bg panagram",
            message: `Panagram! +${score}`,
            ariaLabel: `${sanitizedWord} is a panagram. Good job! +${score} points.`
          });
        } else {
          this.showNotification({
            class: "valid-guess gradient-bg",
            message: `+${score}`,
            ariaLabel: `Correct! +${score} points.`
          });
        }
      } else {
        this.showNotification({
          class: "invalid-guess",
          message: reason,
          ariaLabel: reason
        });
      }
    },
    wordIsNotPanagram(word){
       return !getIsWordPanagram(word);
    }, 
    wordIsPanagram(word){
       return getIsWordPanagram(word);
    }, 
    clearWords() {
      if(confirm("Are you sure you want to clear the words you have successfully guessed?")){
        guessedWordSet.clear();
        this.guessedWords = [];
        guessedWordSet.clear();
        this.updateScore(0);
        this.updateDB();
      }
    },
    shuffleOuterLetters() {
      this.outerLetters = shuffleArray(this.outerLetters);
    },
    getParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
      if (!results)
        return null;
      if (!results[2])
        return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    async getNewLetterSet(dateTimestamp) {
      console.log("get new");
      const [allWords, letterSets, letterSetVariants] = await loadWordData();
      let getRandomNumber = seededRandom(dateTimestamp);
      const [[letterSetIndex, centerLetterIndex], validWordIndices] = letterSetVariants[Math.floor(getRandomNumber() * letterSetVariants.length)];
      const letterSetString = letterSets[letterSetIndex];
      var centerLetter = letterSetString[centerLetterIndex];
      var outerLetters = shuffleArray(
        (letterSetString.slice(0, centerLetterIndex) + letterSetString.slice(centerLetterIndex + 1)).split("")
      );
      var letters = window.letters;
      if (letters && letters.length > 6) {
        outerLetters = letters.split("");
        //console.log(outerLetters);
        centerLetter = outerLetters.shift();
      }
      //console.log(centerLetter, outerLetters);
      const validWords = new Array(validWordIndices.length);
      for (let i = 0; i < validWordIndices.length; ++i) {
        validWords[i] = allWords[validWordIndices[i]];
      }
      this.updateLetterSet(centerLetter, outerLetters);
      this.updateValidWords(validWords);
      this.guessedWords = [];
      guessedWordSet.clear();
      this.updateScore(0);
      this.updateDB();
    }
  });
});
const a = (await importAlpine).default;
window.Alpine = a;
a.start();
