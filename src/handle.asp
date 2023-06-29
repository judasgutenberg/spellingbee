
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="An open-source Spelling Bee game for the web">
    <meta name="generator" content="Eleventy v2.0.1">
    <title>Open Spelling Bee</title>
    <link rel="icon" type="image/png" href="/icon32x32.png">

    <link rel="manifest" href="/manifest.json">

    <!-- Pre-connect to the jsdelivr cdn since we'll be loading a few 3rd party libraries from there -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">

    <!-- Critical JS and CSS -->
    <script type="module">if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}


<%
 
Dim src, wordsArray, centerLetter, outerLetters, answers
src = Request.Form("src")


 
 









Function GetValueBetween( haystack,  startStr,  endStr)
    Dim startPos, endPos

    ' Find the starting position of the specified start string
    startPos = InStr(haystack, startStr)
    
    ' If the start string is found
    If startPos > 0 Then
        ' Find the ending position of the specified end string
        endPos = InStr(startPos + Len(startStr), haystack, endStr)
        
        ' If the end string is found
        If endPos > 0 Then
            ' Extract the value between the start and end strings
            GetValueBetween = Mid(haystack, startPos + Len(startStr), endPos - startPos - Len(startStr))
        Else
            ' Handle the case when the end string is not found
            GetValueBetween = ""
        End If
    Else
        ' Handle the case when the start string is not found
        GetValueBetween = ""
    End If
End Function

If Len(src) > 0 Then
    centerLetter = GetValueBetween(src, """centerLetter"":""", """")
    outerLetters = GetValueBetween(src, """outerLetters"":[", "]")
    answers = GetValueBetween(src, """answers"":[", "]")
    panagrams = GetValueBetween(src, """pangrams"":[", "]")
    response.write "window.answers = [" & answers & "];"   & vbCrLf
    response.write "window.panagrams = [" & panagrams & "];"   & vbCrLf
    response.write "var centerLetter = """ & centerLetter & """;" & vbCrLf
    response.write "var outerLetters = [" & outerLetters & "]" & vbCrLf
    response.write "window.letters = centerLetter +outerLetters.join("""")" + ";"  &  vbCrLf
 
End If
 
%>


</script>
    

    <style>@keyframes loaderFadeIn{0%{opacity:0}to{opacity:1}}@keyframes hover{0%{transform:translate(-50%,0)}to{transform:translate(-50%,-30%)}}.wxlbk3w-_{font-size:2rem;font-weight:700;position:absolute;top:40%;left:50%;display:inline-block;background:#fff;animation:loaderFadeIn .3s,hover 1.5s ease-in-out infinite alternate}.wxlbk3w-_ .gradient-bg{mix-blend-mode:lighten;position:absolute;inset:0}:root{--black:#1a1a1a;--gray:#e6e6e6;--yellow:#fdd000;--yellow:oklch(87% 0.2 93);--orange:hsla(33, 100%, 53%, 1);--gradient:linear-gradient(110deg, var(--orange) 0%, var(--yellow) 100%);--shadow:0px 0px 2px rgba(0, 0, 0, 0.25)}body{font-family:Helvetica,Arial,sans-serif;line-height:1.1;color:#1a1a1a;width:calc(100% - 2rem);margin:0;padding:1rem}.gradient-bg{background-image:var(--gradient);color:#fff}canvas.confetti{pointer-events:none}@media (prefers-reduced-motion:reduce){canvas.confetti{display:none}}button{appearance:none;-webkit-appearance:none;color:var(--black);touch-action:manipulation;padding:0}button[type=submit]{font-weight:400}[x-cloak]{display:none}</style>

    

    <!-- Defer non-critical CSS -->
    <link rel="preload" href="/bundle/kn5R8N9MZZ.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

    <!-- AlpineJS -->
    <script src="/bundle/game.js" type="module"></script>
    
  </head>
  <body x-data>
  
    <div x-show="false" class="wxlbk3w-_">
  <div class="gradient-bg"></div>
  Loading...
</div>


    <div x-cloak>
      <header class="wdhdpb0si">
  <div class="wjrd-sxgj">
  <button type="button" x-on:click="$refs.scoremodal.showModal()" class="rank-display">
    <div x-text="$store.game.currentRank?.name" x-show="$store.game.currentRank" x-transition.opacity class="current-rank-label"></div>
    <div class="progress-bar-wrapper">
      <progress aria-label="Current score" x-bind:value="$store.game.currentScore" x-bind:max="$store.game.geniusScoreThreshold" x-text="`${$store.game.currentScore} points`"></progress>
      <div aria-hidden x-data="currentScoreDot">
        <span x-text="$store.game.currentScore"></span>
      </div>
      <template x-for="rank in $store.game.ranks.slice(1, -1)">
        <div x-bind:class="rank.percent <= $store.game.currentRank?.percent || 0 ? 'filled' : ''" aria-hidden x-bind:style="`left: ${100 * Math.min(1, (rank.percent / 0.7))}%`" class="rank-dot"></div>
      </template>
    </div>
  </button>
  <div x-show="$store.game.previousGame" class="wyts38hxf">
  <button x-on:click="document.getElementById('prev-game-modal').showModal()" aria-label="See yesterday's words">
    Yesterday
  </button>
  <template x-if="$store.game.previousGame">
    <dialog x-on:click="if($event.target === $el) { $el.close() }" id="prev-game-modal" class="wqk0ugk03">
  <button autofocus type="button" x-on:click="$el.parentNode.close()" aria-label="close">
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24">
  <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"></path>
</svg>

  </button>
  <div class="modal-contents">
    
      <h2>Yesterday's game</h2>
      <p>
        You reached rank
        <strong x-text="$store.game.previousGame.achievedRankName.toLowerCase()" class="rank"></strong>
        with
        <strong x-text="`${$store.game.previousGame.score} point${$store.game.previousGame.score===1 ?'':'s'}`"></strong>
        and
        <strong x-text="`${$store.game.previousGame.guessedWordCount} word${$store.game.previousGame.guessedWordCount===1 ?'':'s'}`"></strong>.
      </p>
      <p class="letters">
        <span x-text="$store.game.previousGame.centerLetter" class="center-letter"></span>
        <template x-for="letter in $store.game.previousGame.outerLetters">
          <span x-text="letter"></span>
        </template>
      </p>
      <ul>
        <template x-for="{word,guessed,isPanagram} in $store.game.previousGame.words">
          <li x-text="word" x-bind:class="`${guessed?'guessed':''} ${isPanagram?'panagram':''}`"></li>
        </template>
      </ul>
    
  </div>
</dialog>


  </template>
</div>


  <dialog x-on:click="if($event.target === $el) { $el.close() }" x-ref="scoremodal" id="score-modal" class="wqk0ugk03">
  <button autofocus type="button" x-on:click="$el.parentNode.close()" aria-label="close">
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24">
  <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"></path>
</svg>

  </button>
  <div class="modal-contents">
    
    <h2>Rankings</h2>
    <p>Current score: <span x-text="$store.game.currentScore"></span></p>
    <template x-if="$store.game.nextRank">
      <p x-text="`${Math.floor($store.game.nextRank.percent * $store.game.totalPossibleScore) - $store.game.currentScore} points to next rank: ${$store.game.nextRank.name}`"></p>
    </template>
    <template x-if="$store.game.isMaster">
      <p>You found every word! Great job!</p>
    </template>
    <ol>
      <template x-for="rank in $store.game.ranks.slice(0, $store.game.isMaster ? $store.game.ranks.length : -1)" x-bind:key="rank.name">
        <li x-bind:class="rank === $store.game.currentRank ? 'current' : ''">
          <span x-text="rank.name" class="name"></span>
          <span x-text="`${Math.floor(rank.percent * $store.game.totalPossibleScore)} points`"></span>
        </li>
      </template>
    </ol>
  
  </div>
</dialog>


</div>



  <div class="wydj8slb5">
  <button x-data="prevGuessModalBtn" x-bind="tmpl">
    <span x-show="mostRecentGuesses.length === 0">No words guessed yet</span>
    <template x-for="word in mostRecentGuesses" x-bind:key="word">
      <span x-text="word + '&nbsp;'" x-data="{show: isInitialRender}" x-show="show" x-init="$nextTick(()=>show=true)" x-transition:enter="enter" x-transition:enter-start="enter-start" x-transition:enter-end="enter-end"></span>
    </template>
  </button>
  
  <dialog x-on:click="if($event.target === $el) { $el.close() }" x-data="prevGuessModal" class="wqk0ugk03">
  <button autofocus type="button" x-on:click="$el.parentNode.close()" aria-label="close">
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24">
  <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"></path>
</svg>

  </button>
  <div class="modal-contents">
    
    <h2 x-text="`You have found ${$store.game.guessedWords.length} word${$store.game.guessedWords.length === 1 ? '' : 's'}`"></h2>
    <div id="word-page-wrapper" x-bind:style="`--max-row-count: ${maxPageSize/2};`">
      <template x-for="(page, index) in guessedWordPages" x-bind:key="page.id">
        <ul x-bind:data-idx="index" class="word-page">
          <template x-for="word in page.words" x-bind:key="word">
            <li x-text="word"></li>
          </template>
        </ul>
      </template>
    </div>
    <div class="page-scroll-buttons">
      <template x-for="(page, index) in guessedWordPages" x-bind:key="page.id">
        <button x-data="{index}" x-bind="PageScrollButton"></button>
      </template>
    </div>
  
  </div>
</dialog>






</div>



</header>


      <main>
  <div class="guess-notifications">
  <div class="confetti-wrapper">
    <canvas id="panagram-confetti" class="confetti"></canvas>
  </div>
  <template x-for="(notification, index) in $store.game.notifications" x-bind:key="notification.id">
    <div role="alert" aria-live="polite" x-bind:class="`notification ${notification.class}`" x-text="notification.message" x-bind:aria-label="notification.ariaLabel" x-bind:style="`--i: ${$store.game.notifications.slice(0,index).filter(n=>n.show).length}`" x-show="notification.show" x-transition:enter-start="enter" x-transition:leave-end="leave" x-init="$nextTick(()=>{notification.show = true}); setTimeout(()=>{notification.show = false}, notification.aliveTime - 300)"></div>
  </template>
</div>


  <form id="letter-form" x-data="{ guess: '' }" x-on:submit.prevent="$store.game.submitGuess(guess); guess = '';" autocomplete="off" class="w2oqvvxug">
  <div name="guess" class="wxoaa7uhq">
  <input type="text" maxlength="25" id="guess-input" x-model="guess" x-bind:aria-label="`Input your guess. The word must contain the letter ${$store.game.centerLetter} along with any of the letters ${$store.game.outerLetters.join(', ')}.`" x-on:input="guess = $event.target.value.toLowerCase().replaceAll($store.game.invalidWordRegex, '')">
  <div x-html="guess.replaceAll($store.game.centerLetter, `<span class='center-letter'>${$store.game.centerLetter}</span>`)" aria-hidden class="guess-display"></div>
</div>


  <div class="whaxk8rwm">
  <template x-for="(letter, idx) in $store.game.outerLetters" x-bind:key="`${letter}_${idx}`">
    <div class="outer letter">
      <button x-data="letterButton(letter)" x-bind="tmpl"></button>
    </div>
  </template>
  <div class="center letter">
    <button x-data="letterButton($store.game.centerLetter)" x-effect="letter = $store.game.centerLetter" x-bind="tmpl" class="gradient-bg"></button>
  </div>
</div>



  <div class="form-buttons">
      <button type="button" x-on:click="$store.game.clearWords()" aria-hidden class="delete">
      Clear Words
    </button>
    <button type="button" x-on:click="guess = guess.slice(0, -1)" aria-hidden class="delete">
      Delete
    </button>
    <button type="button" x-on:click="$store.game.shuffleOuterLetters()" aria-label="Shuffle the outer letters" class="shuffle">
      <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 96 960 960" width="2rem">
  <path d="M167 896v-60h130l-15-12q-64-51-93-111t-29-134q0-106 62.5-190.5T387 272v62q-75 29-121 96.5T220 579q0 63 23.5 109.5T307 769l30 21V666h60v230H167Zm407-15v-63q76-29 121-96.5T740 573q0-48-23.5-97.5T655 388l-29-26v124h-60V256h230v60H665l15 14q60 56 90 120t30 123q0 106-62 191T574 881Z"></path>
</svg>

    </button>
    <button type="submit">Enter</button>
  </div>
</form>


  
  <dialog x-on:click="if($event.target === $el) { $el.close() }" id="win-modal" x-data="winModal" class="wqk0ugk03">
  <button autofocus type="button" x-on:click="$el.parentNode.close()" aria-label="close">
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24">
  <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"></path>
</svg>

  </button>
  <div class="modal-contents">
    
    <h2 x-text="`${$store.game.currentRank?.name}!`"></h2>
    <template x-if="$store.game.isMaster">
      <p>
        You found all
        <strong x-text="`${$store.game.guessedWords.length} words`"></strong>
        for <strong x-text="`${$store.game.currentScore} points`"></strong>.
        Great job!
      </p>
    </template>
    <template x-if="$store.game.isGenius">
      <p>
        You have reached the highest rank, with
        <strong x-text="`${$store.game.guessedWords.length} words`"></strong>
        and <strong x-text="`${$store.game.currentScore} points`"></strong>
      </p>
    </template>
    <canvas id="win-confetti" class="confetti"></canvas>
  
  </div>
</dialog>






</main>

    </div>

    <!-- Non-critical JS -->
<script>
 
 
const randomInRange = (min, max) => Math.random() * (max - min) + min;
let confettiPromise = null;
window.fireConfetti = async (canvasId) => {
  try {
    if (!confettiPromise) {
      confettiPromise = import("https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js/+esm");
    }
    const confettiModule = await confettiPromise;
    const confetti = confettiModule.default.confetti;
    const canvas = document.getElementById(canvasId);
    canvas.confetti = canvas.confetti || await confetti.create(canvas);
    canvas.confetti({
      angle: randomInRange(75, 105),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(30, 45),
      origin: { y: 0.8 }
    });
  } catch (e) {
    console.error("Failed to fire confetti and ruined the party :(", e);
  }
};

</script>

    
  

</body>
</html>
