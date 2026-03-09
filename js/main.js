// ── MAIN ──────────────────────────────────────────────────────────────────────
// Зависит от: js/constants.js (LEVELS), js/engine.js (initLevel, scaleGame, resizePCanvas)

var currentLevel = 0;
var startOverlay = document.getElementById('start-overlay');
var startBtn = document.getElementById('start-btn');
var sceneEl = document.getElementById('scene');
var levelValue = document.getElementById('level-value');
var timeValue = document.getElementById('time-value');
var restartBtn = document.getElementById('restart-btn');
var requiresStartLevelIndex = 6; // Level 7 (0-based)
var startOverlayFadeMs = 300;
var tutorialHandEl = document.getElementById('tutorial-hand');
var levelTimerId = null;
var levelTimerSeconds = 50;
var defaultLevelTimeSeconds = 50;
var outTimeOverlay = document.getElementById('out-time-overlay');
var outTimeContinueBtn = document.getElementById('out-time-continue');
var outTimeCloseBtn = document.getElementById('out-time-close');
var outTimeFreeBtn = document.getElementById('out-time-free');
var holdHint = document.getElementById('hold-hint');
var outTimeActive = false;

var tutorial = {
  levelIndex: 0,
  enabled: false,
  step: 0,
  dragging: false,
  figuresByColor: {},
  handAnim: null,
  handLoopTimer: null,
};

function clearTutorialHandLoop() {
  if (tutorial.handLoopTimer) {
    clearTimeout(tutorial.handLoopTimer);
    tutorial.handLoopTimer = null;
  }
  if (tutorial.handAnim) {
    tutorial.handAnim.cancel();
    tutorial.handAnim = null;
  }
}

function hideTutorialHand(immediate) {
  clearTutorialHandLoop();
  tutorialHandEl.style.opacity = '0';
  if (immediate) {
    tutorialHandEl.style.display = 'none';
    return;
  }
  setTimeout(function() {
    if (!tutorial.enabled || tutorial.dragging) tutorialHandEl.style.display = 'none';
  }, 220);
}

function gridStepPx(fig) {
  var rect = fig.getBoundingClientRect();
  var logicalW = fig._maxC * (CELL + GAP) + CELL;
  var scale = rect.width / logicalW;
  return (CELL + GAP) * scale;
}

function handStartForFigure(fig) {
  var rect = fig.getBoundingClientRect();
  var hw = tutorialHandEl.getBoundingClientRect().width || 84;
  return {
    x: rect.left + rect.width * 0.56 - hw * 0.52,
    y: rect.top  + rect.height * 0.32 - hw * 0.72,
  };
}

function animateTutorialHand(path) {
  if (!tutorial.enabled || tutorial.dragging || !path || !path.length) return;
  clearTutorialHandLoop();
  tutorialHandEl.style.display = 'block';
  tutorialHandEl.style.left = path[0].x + 'px';
  tutorialHandEl.style.top  = path[0].y + 'px';
  tutorialHandEl.style.transform = 'translate(0,0)';
  requestAnimationFrame(function() { tutorialHandEl.style.opacity = '1'; });

  var base = path[0];
  var keyframes = path.map(function(p) {
    return { transform: 'translate(' + Math.round(p.x - base.x) + 'px,' + Math.round(p.y - base.y) + 'px)' };
  });
  var duration = path.length > 2 ? 1350 : 900;
  tutorial.handAnim = tutorialHandEl.animate(keyframes, {
    duration: duration,
    easing: 'cubic-bezier(.22,.61,.36,1)',
    fill: 'forwards',
  });
  tutorial.handAnim.onfinish = function() {
    tutorial.handAnim = null;
    if (!tutorial.enabled || tutorial.dragging) return;
    tutorial.handLoopTimer = setTimeout(function() {
      runTutorialStep();
    }, 480);
  };
}

function runTutorialStep() {
  if (!tutorial.enabled || tutorial.dragging) return;
  var fig = tutorial.step === 0
    ? tutorial.figuresByColor['#c84bdf']
    : tutorial.figuresByColor['#29b6f6'];
  if (!fig || !fig.isConnected) return;

  var start = handStartForFigure(fig);
  var stepPx = gridStepPx(fig);
  if (tutorial.step === 0) {
    animateTutorialHand([
      start,
      { x: start.x, y: start.y + stepPx },
    ]);
    return;
  }
  animateTutorialHand([
    start,
    { x: start.x - 2 * stepPx, y: start.y },
    { x: start.x - 2 * stepPx, y: start.y - stepPx },
  ]);
}

function setupTutorialForLevel(idx) {
  tutorial.enabled = idx === tutorial.levelIndex;
  tutorial.step = 0;
  tutorial.dragging = false;
  tutorial.figuresByColor = {};
  hideTutorialHand(true);
}

function clearLevelTimer() {
  if (!levelTimerId) return;
  clearInterval(levelTimerId);
  levelTimerId = null;
}

function setOutTimeOverlay(active) {
  outTimeActive = active;
  if (active) {
    outTimeOverlay.style.display = 'flex';
    outTimeOverlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function() { outTimeOverlay.style.opacity = '1'; });
    sceneEl.style.pointerEvents = 'none';
    return;
  }
  outTimeOverlay.style.opacity = '0';
  outTimeOverlay.classList.remove('preview-board');
  setTimeout(function() {
    if (outTimeActive) return;
    outTimeOverlay.style.display = 'none';
    outTimeOverlay.setAttribute('aria-hidden', 'true');
  }, 220);
  sceneEl.style.pointerEvents = '';
}

function formatTimer(seconds) {
  var safe = Math.max(0, seconds);
  var mm = Math.floor(safe / 60);
  var ss = safe % 60;
  return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

function renderTimer() {
  timeValue.textContent = formatTimer(levelTimerSeconds);
}

function restartCurrentLevel() {
  clearLevelTimer();
  setOutTimeOverlay(false);
  transitionToLevel(currentLevel);
}

function runLevelTimer() {
  clearLevelTimer();
  levelTimerId = setInterval(function() {
    levelTimerSeconds -= 1;
    renderTimer();
    if (levelTimerSeconds > 0) return;
    clearLevelTimer();
    setOutTimeOverlay(true);
  }, 1000);
}

function startLevelTimer() {
  clearLevelTimer();
  levelTimerSeconds = defaultLevelTimeSeconds;
  renderTimer();
  runLevelTimer();
}

function addBonusTime(seconds) {
  levelTimerSeconds = Math.max(0, levelTimerSeconds + seconds);
  renderTimer();
  setOutTimeOverlay(false);
  runLevelTimer();
}

window.onFigureCreated = function(fig) {
  if (!tutorial.enabled) return;
  tutorial.figuresByColor[fig._color] = fig;
};

window.onFigureDragState = function(fig, isDragging) {
  if (!tutorial.enabled) return;
  tutorial.dragging = isDragging;
  if (isDragging) {
    hideTutorialHand(false);
    return;
  }
  if (tutorial.step < 2) {
    setTimeout(function() {
      if (tutorial.enabled && !tutorial.dragging) runTutorialStep();
    }, 150);
  }
};

window.onFigureRemoved = function(fig) {
  if (!tutorial.enabled) return;
  if (tutorial.step === 0 && fig._color === '#c84bdf') {
    tutorial.step = 1;
    setTimeout(function() {
      if (tutorial.enabled && !tutorial.dragging) runTutorialStep();
    }, 220);
    return;
  }
  if (tutorial.step === 1 && fig._color === '#29b6f6') {
    tutorial.step = 2;
    tutorial.enabled = false;
    hideTutorialHand(false);
  }
};

function setStartGate(active) {
  if (active) {
    startOverlay.style.display = 'flex';
    requestAnimationFrame(function() { startOverlay.style.opacity = '1'; });
    sceneEl.style.pointerEvents = 'none';
    return;
  }
  startOverlay.style.opacity = '0';
  setTimeout(function() { startOverlay.style.display = 'none'; }, startOverlayFadeMs);
  sceneEl.style.pointerEvents = '';
}

// Вызывается движком когда все фигуры убраны
window.onLevelComplete = function() {
  window.location = "uniwebview://complete";
  transitionToLevel((currentLevel + 1) % LEVELS.length);
};

function loadLevel(idx) {
  var cfg = LEVELS[idx] || {};
  defaultLevelTimeSeconds = typeof cfg.time === 'number' ? Math.max(1, cfg.time) : 50;
  setupTutorialForLevel(idx);
  initLevel(cfg);
  startLevelTimer();
  setStartGate(idx === requiresStartLevelIndex);
  if (tutorial.enabled) {
    setTimeout(function() {
      if (tutorial.enabled && !tutorial.dragging) runTutorialStep();
    }, 260);
  }
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
  clearLevelTimer();
  setOutTimeOverlay(false);
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
var editorBtn = document.getElementById('editor-btn');

function updateNavLabel() {
  levelLabel.textContent = 'Lvl ' + (currentLevel + 1);
  levelValue.textContent = String(currentLevel + 1);
}

document.getElementById('prev-btn').addEventListener('click', function() {
  transitionToLevel((currentLevel - 1 + LEVELS.length) % LEVELS.length);
});

document.getElementById('next-btn').addEventListener('click', function() {
  transitionToLevel((currentLevel + 1) % LEVELS.length);
});

if (editorBtn) {
  editorBtn.addEventListener('click', function() {
    window.location.href = 'editor.html';
  });
}

document.getElementById('back-btn').addEventListener('click', function() {
  window.location = "uniwebview://close";
});
restartBtn.addEventListener('click', function() {
  restartCurrentLevel();
});
startBtn.addEventListener('click', function() {
  setStartGate(false);
});
outTimeContinueBtn.addEventListener('click', function() {
  addBonusTime(20);
});
outTimeFreeBtn.addEventListener('click', function() {
  addBonusTime(20);
});
outTimeCloseBtn.addEventListener('click', function() {
  restartCurrentLevel();
});

holdHint.addEventListener('pointerdown', function() {
  if (!outTimeActive) return;
  outTimeOverlay.classList.add('preview-board');
});
holdHint.addEventListener('pointerup', function() {
  outTimeOverlay.classList.remove('preview-board');
});
holdHint.addEventListener('pointerleave', function() {
  outTimeOverlay.classList.remove('preview-board');
});
holdHint.addEventListener('pointercancel', function() {
  outTimeOverlay.classList.remove('preview-board');
});

window.addEventListener('resize', function() {
  resizePCanvas();
  scaleGame();
});

// ── Init ──────────────────────────────────────────────────────────────────────

loadLevel(0);
updateNavLabel();
fadeIn();
