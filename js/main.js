// ── MAIN ──────────────────────────────────────────────────────────────────────
// Зависит от: js/constants.js (LEVELS), js/engine.js (initLevel, scaleGame, resizePCanvas)

var currentLevel = 0;
var startOverlay = document.getElementById('start-overlay');
var startBtn = document.getElementById('start-btn');
var sceneEl = document.getElementById('scene');
var levelValue = document.getElementById('level-value');
var timeValue = document.getElementById('time-value');
var restartBtn = document.getElementById('restart-btn');
var startOverlayConfigs = {
  6: {
    arrowText: '↕',
    subtitle: 'You have unlocked the <b>Arrow Block!</b>',
    desc: 'Moves only in the given direction!',
    draw: null, // assigned below
  },
  7: {
    arrowText: '',
    subtitle: 'You have unlocked the <b style="color:#ffd740">Freeze Timer!</b>',
    desc: 'Freezes time for 10 seconds!',
    draw: null, // assigned below
  },
};
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
var timeCaptionEl = document.getElementById('time-caption');
var hudMainEl = document.getElementById('hud-main');
var boosterTutorialActive = false;
var boosterHandAnim = null;
var freezeActive = false;
var freezeTimerId = null;

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

function drawArrowBlockFigure() {
  var canvas = document.getElementById('unlock-canvas');
  if (!canvas) return;
  var cells = [[0,0],[0,1],[0,2],[1,2]]; // L-shape
  var color = '#ff9800';
  var C = 48, G = 6, R = 7;
  var W = 2 * C + G;
  var H = 3 * C + 2 * G;
  var P = 10;
  var cW = W + P * 2, cH = H + P * 2;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = cW * dpr;
  canvas.height = cH * dpr;
  canvas.style.width = cW + 'px';
  canvas.style.height = cH + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cW, cH);
  var set = new Set(cells.map(function(c) { return c[0] + ',' + c[1]; }));
  var has = function(c, r) { return set.has(c + ',' + r); };
  function buildPath() {
    ctx.beginPath();
    cells.forEach(function(cell) {
      var dc = cell[0], dr = cell[1];
      var x = dc * (C + G), y = dr * (C + G);
      var hasL = has(dc-1,dr), hasR = has(dc+1,dr);
      var hasT = has(dc,dr-1), hasB = has(dc,dr+1);
      var tl = (!hasL&&!hasT)?R:0, tr = (!hasR&&!hasT)?R:0;
      var br = (!hasR&&!hasB)?R:0, bl = (!hasL&&!hasB)?R:0;
      ctx.moveTo(x+tl, y);
      ctx.lineTo(x+C-tr, y);
      tr ? ctx.arcTo(x+C,y, x+C,y+tr, tr) : ctx.lineTo(x+C,y);
      ctx.lineTo(x+C, y+C-br);
      br ? ctx.arcTo(x+C,y+C, x+C-br,y+C, br) : ctx.lineTo(x+C,y+C);
      ctx.lineTo(x+bl, y+C);
      bl ? ctx.arcTo(x,y+C, x,y+C-bl, bl) : ctx.lineTo(x,y+C);
      ctx.lineTo(x, y+tl);
      tl ? ctx.arcTo(x,y, x+tl,y, tl) : ctx.lineTo(x,y);
      ctx.closePath();
      if (hasR) ctx.rect(x+C, y, G, C);
      if (hasB) ctx.rect(x, y+C, C, G);
      if (hasR && hasB && has(dc+1,dr+1)) ctx.rect(x+C, y+C, G, G);
    });
  }
  ctx.save();
  ctx.translate(P, P);
  buildPath();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(P, P);
  buildPath();
  ctx.globalCompositeOperation = 'source-atop';
  var hl = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  hl.addColorStop(0, 'rgba(255,255,255,0.32)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
startOverlayConfigs[6].draw = drawArrowBlockFigure;

function drawFreezeTimerFigure() {
  var canvas = document.getElementById('unlock-canvas');
  if (!canvas) return;
  var W = 152, H = 170;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  var cx = W / 2, cy = H / 2 + 10;
  var r = 55;
  // Outer glow
  var glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.55);
  glow.addColorStop(0, 'rgba(100, 210, 255, 0.38)');
  glow.addColorStop(1, 'rgba(30, 100, 255, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
  // Clock body
  var bodyGrad = ctx.createRadialGradient(cx - r*0.28, cy - r*0.28, 3, cx, cy, r);
  bodyGrad.addColorStop(0, '#84eeff');
  bodyGrad.addColorStop(0.42, '#29b6f6');
  bodyGrad.addColorStop(1, '#0262a0');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.shadowColor = 'rgba(0,50,140,0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();
  // Icy border
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(190, 238, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  // Body highlight
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  var hl = ctx.createLinearGradient(cx - r, cy - r, cx + r*0.2, cy + r*0.3);
  hl.addColorStop(0, 'rgba(255,255,255,0.28)');
  hl.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(cx - r, cy - r, r*2, r*2);
  ctx.restore();
  // Clock face inner circle
  var faceGrad = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy, r * 0.7);
  faceGrad.addColorStop(0, 'rgba(232, 250, 255, 0.96)');
  faceGrad.addColorStop(0.65, 'rgba(182, 228, 252, 0.88)');
  faceGrad.addColorStop(1, 'rgba(140, 200, 248, 0.8)');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = faceGrad;
  ctx.fill();
  ctx.restore();
  // Hour tick marks
  ctx.save();
  ctx.lineCap = 'round';
  for (var i = 0; i < 12; i++) {
    var ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    var isMain = i % 3 === 0;
    ctx.strokeStyle = isMain ? 'rgba(20,80,160,0.85)' : 'rgba(40,105,180,0.5)';
    ctx.lineWidth = isMain ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r * (isMain ? 0.50 : 0.54),
               cy + Math.sin(ang) * r * (isMain ? 0.50 : 0.54));
    ctx.lineTo(cx + Math.cos(ang) * r * 0.64,
               cy + Math.sin(ang) * r * 0.64);
    ctx.stroke();
  }
  ctx.restore();
  // Snowflake in center
  ctx.save();
  ctx.strokeStyle = 'rgba(40,110,200,0.62)';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  var sfR = r * 0.3;
  for (var j = 0; j < 6; j++) {
    var sa = (j / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sa) * sfR, cy + Math.sin(sa) * sfR);
    var brLen = sfR * 0.38, brStart = sfR * 0.52;
    [Math.PI/5, -Math.PI/5].forEach(function(da) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(sa) * brStart, cy + Math.sin(sa) * brStart);
      ctx.lineTo(cx + Math.cos(sa) * brStart + Math.cos(sa + da) * brLen,
                 cy + Math.sin(sa) * brStart + Math.sin(sa + da) * brLen);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sa) * sfR, cy + Math.sin(sa) * sfR);
    ctx.stroke();
  }
  ctx.restore();
  // Clock hands (frozen at ~10:10)
  var hAng = -Math.PI / 2 + (10 / 12) * Math.PI * 2;
  var mAng = -Math.PI / 2 + (10 / 60) * Math.PI * 2;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0,30,100,0.4)';
  ctx.shadowBlur = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.96)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(mAng) * r * 0.52, cy + Math.sin(mAng) * r * 0.52);
  ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hAng) * r * 0.36, cy + Math.sin(hAng) * r * 0.36);
  ctx.stroke();
  ctx.restore();
  // Center pin
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,30,100,0.4)';
  ctx.shadowBlur = 3;
  ctx.fill();
  ctx.restore();
  // Ice crystals on body rim
  [[0.4,0.88],[1.6,0.90],[2.8,0.86],[-0.8,0.88],[-2.2,0.89]].forEach(function(c) {
    var px = cx + Math.cos(c[0]) * r * c[1], py = cy + Math.sin(c[0]) * r * c[1];
    ctx.save();
    ctx.fillStyle = 'rgba(210,245,255,0.78)';
    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(px - 1, py - 1.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  // Bells at top
  var bellY = cy - r - 2;
  function drawBell(bx) {
    ctx.save();
    var bg = ctx.createLinearGradient(bx - 12, bellY - 12, bx + 12, bellY + 6);
    bg.addColorStop(0, '#80e8ff');
    bg.addColorStop(1, '#1a8fd1');
    ctx.shadowColor = 'rgba(0,50,140,0.4)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(bx, bellY, 12, Math.PI, 0);
    ctx.lineTo(bx + 12, bellY + 3);
    ctx.lineTo(bx - 12, bellY + 3);
    ctx.closePath();
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,238,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  drawBell(cx - 20);
  drawBell(cx + 20);
  // Floating ice sparks
  ctx.save();
  ctx.strokeStyle = 'rgba(185,235,255,0.92)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  [[cx + r*0.74+6, cy - r*0.62, 4], [cx - r*0.78-5, cy - r*0.38, 3.5],
   [cx + r*0.5+2, cy + r*0.78+4, 3.5], [cx - r*0.52, cy + r*0.72+3, 3]].forEach(function(sp) {
    for (var k = 0; k < 4; k++) {
      var ka = k * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(sp[0], sp[1]);
      ctx.lineTo(sp[0] + Math.cos(ka) * sp[2], sp[1] + Math.sin(ka) * sp[2]);
      ctx.stroke();
    }
  });
  ctx.restore();
}
startOverlayConfigs[7].draw = drawFreezeTimerFigure;

// ── Booster Tutorial ──────────────────────────────────────────────────────────

function showBoosterTutorial() {
  var overlay  = document.getElementById('booster-tutorial');
  var tutBtn   = document.getElementById('booster-tutorial-btn');
  var spotlight = document.getElementById('booster-spotlight');
  var srcBtn   = document.getElementById('booster-freeze');
  if (!overlay || !tutBtn || !spotlight || !srcBtn) return;
  boosterTutorialActive = true;
  sceneEl.style.pointerEvents = 'none';
  var rect = srcBtn.getBoundingClientRect();
  spotlight.style.left   = (rect.left - 12) + 'px';
  spotlight.style.top    = (rect.top  - 12) + 'px';
  spotlight.style.width  = (rect.width  + 24) + 'px';
  spotlight.style.height = (rect.height + 24) + 'px';
  tutBtn.style.left   = rect.left   + 'px';
  tutBtn.style.top    = rect.top    + 'px';
  tutBtn.style.width  = rect.width  + 'px';
  tutBtn.style.height = rect.height + 'px';
  tutBtn.querySelector('.booster-icon').textContent = '🔒';
  tutBtn.querySelector('.booster-lvl').textContent  = 'Lv.8';
  tutBtn.classList.remove('unlocked', 'shatter-out', 'appear-in');
  overlay.style.display = 'flex';
  requestAnimationFrame(function() { overlay.style.opacity = '1'; });
  setTimeout(function() {
    if (boosterTutorialActive) boosterBreakAnimation(tutBtn, rect);
  }, 650);
}

function boosterBreakAnimation(btn, rect) {
  btn.classList.add('shatter-out');
  spawnBoosterShards(rect);
  setTimeout(function() {
    if (!boosterTutorialActive) return;
    btn.querySelector('.booster-icon').textContent = '❄️';
    btn.querySelector('.booster-lvl').textContent  = '1';
    btn.classList.remove('shatter-out');
    btn.classList.add('unlocked', 'appear-in');
    setTimeout(function() {
      if (!boosterTutorialActive) return;
      btn.classList.remove('appear-in');
      startBoosterHandAnim(btn);
    }, 480);
  }, 440);
}

function spawnBoosterShards(rect) {
  var cx = rect.left + rect.width  / 2;
  var cy = rect.top  + rect.height / 2;
  var colors = ['#5cc8ff','#2ea8ee','#7dd8ff','#3bbbff','#a8e4ff','#1e90d6','#84e0ff'];
  for (var i = 0; i < 7; i++) {
    (function(idx) {
      var s  = document.createElement('div');
      var sz = 7 + Math.random() * 11;
      s.style.cssText =
        'position:fixed;z-index:10503;width:' + sz + 'px;height:' + sz + 'px;' +
        'left:' + (cx - sz/2 + (Math.random()-0.5)*20) + 'px;' +
        'top:'  + (cy - sz/2 + (Math.random()-0.5)*20) + 'px;' +
        'background:' + colors[idx % colors.length] + ';' +
        'border-radius:' + (Math.random() > 0.5 ? '50%' : '4px') + ';' +
        'pointer-events:none;opacity:1;';
      document.body.appendChild(s);
      var angle = (idx / 7) * Math.PI * 2 + (Math.random()-0.5) * 0.8;
      var dist  = 48 + Math.random() * 52;
      s.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(angle)*dist) + 'px,' +
                                    (Math.sin(angle)*dist) + 'px)' +
                     ' scale(0.15) rotate(' + (Math.random()*360) + 'deg)', opacity: 0 }
      ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
      setTimeout(function() { if (s.parentNode) s.parentNode.removeChild(s); }, 520);
    })(i);
  }
}

function startBoosterHandAnim(btn) {
  if (!boosterTutorialActive) return;
  var rect   = btn.getBoundingClientRect();
  var hw     = 84;
  var handX  = rect.left + rect.width * 0.44 - hw * 0.4;
  var startY = window.innerHeight + 10;
  var tapY   = rect.bottom - rect.height * 0.32 - hw * 0.18;
  tutorialHandEl.style.display   = 'block';
  tutorialHandEl.style.left      = handX + 'px';
  tutorialHandEl.style.top       = startY + 'px';
  tutorialHandEl.style.zIndex    = '10503';
  requestAnimationFrame(function() { tutorialHandEl.style.opacity = '1'; });
  var dy = tapY - startY;
  boosterHandAnim = tutorialHandEl.animate([
    { transform: 'translateY(0)',                               opacity: 0 },
    { transform: 'translateY(' + (dy * 0.58) + 'px)',          opacity: 1, offset: 0.16 },
    { transform: 'translateY(' + dy + 'px)',                    offset: 0.40 },
    { transform: 'translateY(' + dy + 'px) scale(0.88)',        offset: 0.52, easing: 'ease-in-out' },
    { transform: 'translateY(' + dy + 'px)',                    offset: 0.64 },
    { transform: 'translateY(' + (dy * 0.86) + 'px)',          offset: 0.82 },
    { transform: 'translateY(' + dy + 'px)',                    offset: 1 },
  ], { duration: 1500, easing: 'ease-in-out', iterations: Infinity });
}

function hideBoosterTutorial() {
  if (!boosterTutorialActive) return;
  boosterTutorialActive = false;
  if (boosterHandAnim) { boosterHandAnim.cancel(); boosterHandAnim = null; }
  tutorialHandEl.style.opacity = '0';
  tutorialHandEl.style.zIndex  = '';
  setTimeout(function() { tutorialHandEl.style.display = 'none'; }, 220);
  var overlay = document.getElementById('booster-tutorial');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.style.display = 'none'; }, 300);
  }
  sceneEl.style.pointerEvents = '';
}

function activateFreeze() {
  hideBoosterTutorial();
  // Update original booster button to unlocked state
  var srcBtn = document.getElementById('booster-freeze');
  if (srcBtn) {
    srcBtn.querySelector('.booster-icon').textContent = '❄️';
    srcBtn.querySelector('.booster-lvl').textContent  = '1';
    srcBtn.classList.add('unlocked');
  }
  // Freeze timer
  freezeActive = true;
  clearLevelTimer();
  timeValue.classList.add('frozen');
  if (timeCaptionEl) timeCaptionEl.classList.add('frozen');
  if (hudMainEl) hudMainEl.classList.add('frozen');
  freezeTimerId = setTimeout(deactivateFreeze, 10000);
}

function deactivateFreeze() {
  if (!freezeActive) return;
  freezeActive = false;
  if (freezeTimerId) { clearTimeout(freezeTimerId); freezeTimerId = null; }
  timeValue.classList.remove('frozen');
  if (timeCaptionEl) timeCaptionEl.classList.remove('frozen');
  if (hudMainEl) hudMainEl.classList.remove('frozen');
  runLevelTimer();
}

function resetFreezeState() {
  freezeActive = false;
  if (freezeTimerId) { clearTimeout(freezeTimerId); freezeTimerId = null; }
  timeValue.classList.remove('frozen');
  if (timeCaptionEl) timeCaptionEl.classList.remove('frozen');
  if (hudMainEl) hudMainEl.classList.remove('frozen');
}

function setStartGate(active) {
  if (active) {
    var cfg = startOverlayConfigs[currentLevel];
    if (cfg) {
      document.getElementById('start-subtitle').innerHTML = cfg.subtitle;
      document.getElementById('start-desc').textContent = cfg.desc;
      document.getElementById('unlock-fig-arrow').textContent = cfg.arrowText || '';
      cfg.draw();
    }
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
  hideBoosterTutorial();
  resetFreezeState();
  var cfg = LEVELS[idx] || {};
  defaultLevelTimeSeconds = typeof cfg.time === 'number' ? Math.max(1, cfg.time) : 50;
  setupTutorialForLevel(idx);
  initLevel(cfg);
  startLevelTimer();
  setStartGate(idx in startOverlayConfigs);
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
  var chainBoosterTut = (currentLevel === 7);
  setStartGate(false);
  if (chainBoosterTut) {
    setTimeout(showBoosterTutorial, startOverlayFadeMs + 60);
  }
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

var boosterTutorialBtn = document.getElementById('booster-tutorial-btn');
if (boosterTutorialBtn) {
  boosterTutorialBtn.addEventListener('click', function() {
    if (boosterTutorialActive) activateFreeze();
  });
}

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
