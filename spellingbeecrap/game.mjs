// mulberry32 seeded PRNG
const seededRandom = (seed) => () => {
  var t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function shuffleArray(array) {
  const arrayCopy = array.slice();
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy;
}


alert("FSDD");

// Shared Set used for calculating word scores to avoid
// re-creating one every time we need to calculate a word score
const uniqueCharSet = new Set();

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
  // 4-letter words are worth 1 point, but all longer words are worth their length (ie, 5-letter words are worth 5 points)
  const wordLengthScore = wordLength > 4 ? wordLength : 1;

  if (word.length < 7) {
    // If the word is less than 7 characters long, it can't be a panagram
    // so we won't bother to check
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
        keyPath: "timestamp",
      });
    },
  });
}

let wordData;
async function loadWordData() {
  if (!wordData) {
    const importBrotli = import(
      "https://cdn.jsdelivr.net/npm/brotli-compress@1.3.3/js.mjs"
    );
    /*
    wordData = await fetch("/words/en.json.br")
      .then((res) => res.arrayBuffer())
      .then(async (compressedData) => {
        const brotli = await importBrotli;
        const decompressedData = brotli.decompress(compressedData);
        const text = new TextDecoder().decode(decompressedData);
        return JSON.parse(text);
      });
      */
      wordData = await fetch("/words/en.json")
      .then((res) => res.arrayBuffer())
      .then(async (data) => {
        var text = new TextDecoder().decode(data)
        //console.log(text);
        return JSON.parse(text);
      });
  }
  return wordData;
}

const GENIUS_PERCENT_THRESHOLD = 0.7;

const validWordSet = new Set();
const guessedWordSet = new Set();

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
      name: "Beginner",
    },
    {
      percent: 0.02,
      name: "Good start",
    },
    {
      percent: 0.05,
      name: "Moving up",
    },
    {
      percent: 0.08,
      name: "Good",
    },
    {
      percent: 0.15,
      name: "Solid",
    },
    {
      percent: 0.25,
      name: "Nice",
    },
    {
      percent: 0.4,
      name: "Great",
    },
    {
      percent: 0.5,
      name: "Amazing",
    },
    {
      percent: GENIUS_PERCENT_THRESHOLD,
      name: "Genius",
    },
    {
      percent: 1,
      name: "Master",
    },
  ],
  async syncWithDB() {
    try {
      const gameDB = await openGameDB();
      const gameData = await gameDB.get("dailyGames", this.timestamp);

      //console.log(gameData);
      //gameDB.close();
      //turn off game data for now
      this.updateLetterSet(gameData.centerLetter, gameData.outerLetters);
      //gameData.validWords = ["head", "glade", "glad", "heed"];
      window.answers = gameData.validWords; 
      console.log(window.answers);
      if (gameData) {
        this.updateLetterSet(gameData.centerLetter, gameData.outerLetters);
        this.updateValidWords(gameData.validWords);
        // Sanitize the user's persisted list of guessed words to ensure there aren't duplicate words
        guessedWordSet.clear();
        for (const word of gameData.guessedWords) {
          guessedWordSet.add(word);
        }
        this.guessedWords = Array.from(guessedWordSet);
        // Calculate the user's current score based on their initial persisted list of guessed words
        let currentScore = 0;
        for (const word of this.guessedWords) {
          currentScore += getWordScore(word);
        }
        this.updateScore(currentScore);
        this.updateDB();
      } else {
        await this.getNewLetterSet(this.timestamp);
      }
    } catch (e) {
      console.error("Error retrieving existing data for today's game", e);
      // If something goes wrong while attempting to hydrate the data,
      // something may have been tampered with so we'll just bail out and get a new
      // letter set.
      await this.getNewLetterSet(this.timestamp);
    }
  },
  updateDB() {
    queueMicrotask(() => {
      const timestamp = this.timestamp;
      const centerLetter = this.centerLetter;
      const outerLetters = this.outerLetters.slice();
      const validWords = this.validWords.slice();
      const guessedWords = this.guessedWords.slice();

      openGameDB()
        .then((gameDB) =>
          gameDB
            .put("dailyGames", {
              timestamp,
              centerLetter,
              outerLetters,
              validWords,
              guessedWords,
            })
            .then(() => gameDB.close())
        )
        .catch((e) => console.error("Error updating DB", e));
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
    const yesterdayTimestamp = this.timestamp - 86400000;
    const gameDB = await openGameDB();
    const yesterdayGameData = await gameDB.get(
      "dailyGames",
      yesterdayTimestamp
    );
    gameDB.close();

    if (yesterdayGameData) {
      const guessedWordSet = new Set(yesterdayGameData.guessedWords);
      const guessedWords = Array.from(guessedWordSet);

      let score = 0;
      let totalPossibleScore = 0;

      const normalWords = [];
      const panagrams = [];

      for (const word of yesterdayGameData.validWords) {
        const wordScore = getWordScore(word);
        const isPanagram = wordScore > word.length;
        const guessed = guessedWordSet.has(word);

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
        guessedWordCount: guessedWords.length,
      };
    }
  },
  async init() {
    const today = new Date();
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
        reason: "Words must be at least 4 letters long.",
      };
    }

    if (this.invalidWordRegex.test(word)) {
      return {
        isValid: false,
        reason: "Words can only contain the center letter and outer letters.",
      };
    }

    if (!this.validWordRegex.test(word)) {
      return {
        isValid: false,
        reason: "Words must include the center letter.",
      };
    }

    if (!validWordSet.has(word)) {
      return {
        isValid: false,
        reason: "Not a valid word.",
      };
    }

    if (guessedWordSet.has(word)) {
      return {
        isValid: false,
        reason: "You've already guessed that word.",
      };
    }

    const score = getWordScore(word);
    const isPanagram = score > word.length;

    return {
      isValid: true,
      score,
      isPanagram,
    };
  },
  showNotification(notificationConfig) {
    const id = Math.random().toString(36);
    const aliveTime = 1500 + notificationConfig.message.length * 50;

    this.notifications.push({
      id,
      aliveTime,
      show: false,
      ...notificationConfig,
    });

    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    }, aliveTime);
  },
  updateScore(newScore) {
    this.currentScore = newScore;

    const totalPossibleScore = this.totalPossibleScore;
    const ranks = this.ranks;

    if (!totalPossibleScore) return;

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
    if (!guessWord) return;

    const sanitizedWord = guessWord.toLowerCase();

    const { isValid, reason, score, isPanagram } =
      this.validateWord(sanitizedWord);

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
          ariaLabel: `${sanitizedWord} is a panagram. Good job! +${score} points.`,
        });
      } else {
        this.showNotification({
          class: "valid-guess gradient-bg",
          message: `+${score}`,
          ariaLabel: `Correct! +${score} points.`,
        });
      }
    } else {
      this.showNotification({
        class: "invalid-guess",
        message: reason,
        ariaLabel: reason,
      });
    }
  },
  shuffleOuterLetters() {
    this.outerLetters = shuffleArray(this.outerLetters);
  },

  getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
},

  async getNewLetterSet(dateTimestamp) {
    console.log("get new");
    const [allWords, letterSets, letterSetVariants] = await loadWordData();
    let getRandomNumber = seededRandom(dateTimestamp);

    const [[letterSetIndex, centerLetterIndex], validWordIndices] =
      letterSetVariants[
        Math.floor(getRandomNumber() * letterSetVariants.length)
      ];

    const letterSetString = letterSets[letterSetIndex];
    
    var centerLetter = letterSetString[centerLetterIndex];
    var outerLetters = shuffleArray(
      (
        letterSetString.slice(0, centerLetterIndex) +
        letterSetString.slice(centerLetterIndex + 1)
      ).split("")
    );

    //centerLetter = "a";
    //outerLetters = ["y", "p", "u", "d", "f", "j"];
    var letters = window.letters;
    if(letters && letters.length>6){
      outerLetters = letters.split('');
      console.log(outerLetters);
      centerLetter = outerLetters.shift(); 

    }
    console.log(centerLetter, outerLetters);
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
  },
});
