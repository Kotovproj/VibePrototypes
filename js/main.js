// ── MAIN ──────────────────────────────────────────────────────────────────────
// Зависит от: js/constants.js (LEVELS), js/engine.js (initLevel, scaleGame, resizePCanvas)

var currentLevel = 0;

// Вызывается движком когда все фигуры убраны
window.onLevelComplete = function() {
  window.location = "uniwebview://complete";
  transitionToLevel((currentLevel + 1) % LEVELS.length);
};

function loadLevel(idx) {
  initLevel(LEVELS[idx]);
}

// ── Fade ──────────────────────────────────────────────────────────────────────

var fadeOverlay = document.getElementById('fade-overlay');

function fadeIn() {
  fadeOverlay.style.transition = 'opacity 0.35s ease';
  fadeOverlay.style.opacity = '0';
}

function fadeOut(cb) {
  fadeOverlay.style.transition = 'opacity 0.35s ease';
  fadeOverlay.style.opacity = '1';
  setTimeout(cb, 350);
}

function transitionToLevel(idx) {
  fadeOut(function() {
    currentLevel = idx;
    loadLevel(currentLevel);
    updateNavLabel();
    fadeIn();
  });
}

function setLevel(value) {
  transitionToLevel(Math.max(0, Math.min(LEVELS.length - 1, parseInt(value) - 1)));
}

// ── Nav ───────────────────────────────────────────────────────────────────────

var levelLabel = document.getElementById('level-label');

function updateNavLabel() {
  levelLabel.textContent = 'Level ' + (currentLevel + 1);
}

document.getElementById('prev-btn').addEventListener('click', function() {
  transitionToLevel((currentLevel - 1 + LEVELS.length) % LEVELS.length);
});

document.getElementById('next-btn').addEventListener('click', function() {
  transitionToLevel((currentLevel + 1) % LEVELS.length);
});

document.getElementById('back-btn').addEventListener('click', function() {
  window.location = "uniwebview://close";
});

window.addEventListener('resize', function() {
  resizePCanvas();
  scaleGame();
});

// ── Init ──────────────────────────────────────────────────────────────────────

loadLevel(0);
updateNavLabel();
fadeIn();
