function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var src = getParameterByName("src");
if (src && src.length > 0) {
} else {
  document.open();
  document.write("<div style='font-family:courier'><form method='post' action='handle.php'>Paste <a target=_new href=view-source:https://www.nytimes.com/puzzles/spelling-bee target=source>source for today's New York Times Spelling Bee</a><br/> here:<br/>");
  document.write("<textarea name='src'></textarea><br/><input type='submit' value='Play Spelling Bee'/></form></div>");
  document.close();
}
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
