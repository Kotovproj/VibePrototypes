// ── ENGINE ────────────────────────────────────────────────────────────────────
// Зависит от: js/constants.js (CELL, GAP, PAD, BORDER, SHAPES, COLOR_KEY)
// Экспортирует: initLevel(cfg), scaleGame()
// Callback: window.onLevelComplete() — вызывается когда все фигуры убраны

// Состояние
var COLS, ROWS, BOARD_W, BOARD_H;
var gameScale = 1;
var occupied  = new Map();
var walls     = [];
var blockers  = [];
var figureCount = 0;
var WALL_HEX = {
  green: '#4caf50',
  cyan: '#29b6f6',
  purple: '#c84bdf',
  orange: '#ff9800',
  blue: '#1e88e5',
  yellow: '#ffc107',
  red: '#f44336',
  pink: '#ff5fa2',
};

// DOM refs
var frame = document.getElementById('frame');
var scene = document.getElementById('scene');
var board = document.getElementById('board');

scene.style.position = 'absolute';
scene.style.left = BORDER + 'px';
scene.style.top  = BORDER + 'px';

// ── Board ─────────────────────────────────────────────────────────────────────

function buildBoard(cols, rows) {
  board.style.gridTemplateColumns = 'repeat(' + cols + ', ' + CELL + 'px)';
  board.style.gridTemplateRows    = 'repeat(' + rows + ', ' + CELL + 'px)';
  board.innerHTML = '';
  for (var i = 0; i < cols * rows; i++) {
    var d = document.createElement('div');
    d.className = 'board-cell';
    board.appendChild(d);
  }
}

function cellPos(col, row) {
  return { x: PAD + col * (CELL + GAP), y: PAD + row * (CELL + GAP) };
}

// ── Walls ─────────────────────────────────────────────────────────────────────

function makeWall(colorKey, dir, col, row, cells) {
  cells = cells || WALL_CELLS;
  var WALL_LONG_N = cells * CELL + (cells - 1) * GAP;
  var el = document.createElement('div');
  el.className = 'wall ' + colorKey;
  el.textContent = { top: '▲', bottom: '▼', right: '▶', left: '◀' }[dir];
  el._colorKey  = colorKey;
  el._dir       = dir;
  el._wallCells = cells;
  var horiz = dir === 'top' || dir === 'bottom';
  var w = horiz ? WALL_LONG_N : WALL_SHORT;
  var h = horiz ? WALL_SHORT  : WALL_LONG_N;
  el.style.width  = w + 'px';
  el.style.height = h + 'px';
  var offset  = (BORDER - WALL_SHORT) / 2;
  var wallCol = col !== undefined ? col : Math.floor((COLS - cells) / 2);
  var wallRow = row !== undefined ? row : Math.floor((ROWS - cells) / 2);
  var wallLeft = BORDER + PAD + wallCol * (CELL + GAP);
  var wallTop  = BORDER + PAD + wallRow * (CELL + GAP);
  if (dir === 'top')    { el.style.left = wallLeft + 'px'; el.style.top    = offset + 'px'; el._startCell = wallCol; }
  if (dir === 'bottom') { el.style.left = wallLeft + 'px'; el.style.bottom = offset + 'px'; el._startCell = wallCol; }
  if (dir === 'right')  { el.style.top  = wallTop  + 'px'; el.style.right  = offset + 'px'; el._startCell = wallRow; }
  if (dir === 'left')   { el.style.top  = wallTop  + 'px'; el.style.left   = offset + 'px'; el._startCell = wallRow; }
  frame.appendChild(el);
  walls.push(el);
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

function prepCanvas(canvas, W, H) {
  var dpr = window.devicePixelRatio || 1;
  canvas.width  = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W+'px'; canvas.style.height = H+'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

function buildFigurePath(ctx, cells) {
  var set = new Set(cells.map(function(c) { return c[0]+','+c[1]; }));
  var has = function(c, r) { return set.has(c+','+r); };
  var R = 10;
  ctx.beginPath();
  cells.forEach(function(cell) {
    var dc = cell[0], dr = cell[1];
    var x = dc * (CELL + GAP), y = dr * (CELL + GAP);
    var hasL = has(dc-1,dr), hasR = has(dc+1,dr);
    var hasT = has(dc,dr-1), hasB = has(dc,dr+1);
    var tl = (!hasL&&!hasT)?R:0, tr = (!hasR&&!hasT)?R:0;
    var br = (!hasR&&!hasB)?R:0, bl = (!hasL&&!hasB)?R:0;
    ctx.moveTo(x+tl, y);
    ctx.lineTo(x+CELL-tr, y);
    tr ? ctx.arcTo(x+CELL,y,      x+CELL,y+tr,    tr) : ctx.lineTo(x+CELL,y);
    ctx.lineTo(x+CELL, y+CELL-br);
    br ? ctx.arcTo(x+CELL,y+CELL, x+CELL-br,y+CELL,br) : ctx.lineTo(x+CELL,y+CELL);
    ctx.lineTo(x+bl, y+CELL);
    bl ? ctx.arcTo(x,y+CELL,      x,y+CELL-bl,    bl) : ctx.lineTo(x,y+CELL);
    ctx.lineTo(x, y+tl);
    tl ? ctx.arcTo(x,y,           x+tl,y,         tl) : ctx.lineTo(x,y);
    ctx.closePath();
    if (hasR) ctx.rect(x+CELL, y, GAP, CELL);
    if (hasB) ctx.rect(x, y+CELL, CELL, GAP);
    if (hasR && hasB && has(dc+1,dr+1)) ctx.rect(x+CELL, y+CELL, GAP, GAP);
  });
}

function drawFigureCanvas(canvas, cells, color, W, H, outlineColor) {
  var OUTLINE_PAD = 9;
  var canvasW = W + OUTLINE_PAD * 2;
  var canvasH = H + OUTLINE_PAD * 2;
  var ctx = prepCanvas(canvas, canvasW, canvasH);
  ctx.clearRect(0, 0, canvasW, canvasH);
  if (outlineColor) {
    var outlineOffsets = [
      [ 8,  0], [-8,  0], [ 0,  8], [ 0, -8],
      [ 6,  6], [-6,  6], [ 6, -6], [-6, -6]
    ];
    outlineOffsets.forEach(function(ofs) {
      ctx.save();
      ctx.translate(OUTLINE_PAD + ofs[0], OUTLINE_PAD + ofs[1]);
      buildFigurePath(ctx, cells);
      ctx.fillStyle = outlineColor;
      ctx.fill();
      ctx.restore();
    });
  }
  ctx.save();
  ctx.translate(OUTLINE_PAD, OUTLINE_PAD);
  buildFigurePath(ctx, cells);
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(OUTLINE_PAD, OUTLINE_PAD);
  ctx.globalCompositeOperation = 'source-atop';
  var hl = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  hl.addColorStop(0, 'rgba(255,255,255,0.32)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function normalizeHexColor(color) {
  if (!color || typeof color !== 'string') return null;
  var c = color.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(c)) return c;
  if (/^#[0-9a-f]{3}$/.test(c)) {
    return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  return null;
}

function hexToRgb(hex) {
  var n = normalizeHexColor(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function rgbToHsv(r, g, b) {
  var rn = r / 255;
  var gn = g / 255;
  var bn = b / 255;
  var max = Math.max(rn, gn, bn);
  var min = Math.min(rn, gn, bn);
  var d = max - min;
  var h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  var s = max === 0 ? 0 : d / max;
  return { h: h, s: s, v: max };
}

function hueDelta(a, b) {
  var d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function closestWallKeyByHue(color) {
  var rgb = hexToRgb(color);
  if (!rgb) return null;
  var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  var bestKey = null;
  var bestScore = Infinity;
  Object.keys(WALL_HEX).forEach(function(key) {
    var wallRgb = hexToRgb(WALL_HEX[key]);
    if (!wallRgb) return;
    var wallHsv = rgbToHsv(wallRgb.r, wallRgb.g, wallRgb.b);
    var score = hueDelta(hsv.h, wallHsv.h) * 4 +
      Math.abs(hsv.s - wallHsv.s) * 100 +
      Math.abs(hsv.v - wallHsv.v) * 40;
    if (score < bestScore) {
      bestScore = score;
      bestKey = key;
    }
  });
  return bestKey;
}

function toColorKey(color) {
  var normalized = normalizeHexColor(color);
  if (!normalized) return null;
  return COLOR_KEY[normalized] || closestWallKeyByHue(normalized);
}

function currentFigureColorKey(fig) {
  return fig._outlineActive && fig._outlineColorKey
    ? fig._outlineColorKey
    : fig._coreColorKey;
}

function redrawFigureCanvas(fig) {
  if (!fig || !fig._canvas) return;
  drawFigureCanvas(
    fig._canvas,
    fig._cells,
    fig._color,
    fig._W,
    fig._H,
    fig._outlineVisible ? fig._outlineColor : null
  );
}

function drawBlockerCanvas(canvas, cells, W, H) {
  var ctx = prepCanvas(canvas, W, H);
  buildFigurePath(ctx, cells);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#6c7888';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  var hl = ctx.createLinearGradient(0, 0, 0, H * 0.42);
  hl.addColorStop(0, 'rgba(255,255,255,0.22)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ── Ghost ─────────────────────────────────────────────────────────────────────

var ghostEl = document.createElement('div');
ghostEl.id = 'ghost';
ghostEl.style.display = 'none';
scene.appendChild(ghostEl);
var ghostCanvas = null;

function showGhost(fig, col, row, valid) {
  var W = fig._maxC * (CELL + GAP) + CELL;
  var H = fig._maxR * (CELL + GAP) + CELL;
  ghostEl.style.width  = W + 'px';
  ghostEl.style.height = H + 'px';
  var p = cellPos(col, row);
  ghostEl.style.left = p.x + 'px';
  ghostEl.style.top  = p.y + 'px';
  if (!ghostCanvas) { ghostCanvas = document.createElement('canvas'); ghostEl.appendChild(ghostCanvas); }
  var ctx = prepCanvas(ghostCanvas, W, H);
  ctx.clearRect(0, 0, W, H);
  buildFigurePath(ctx, fig._cells);
  ctx.fillStyle = valid ? 'rgba(255,255,255,0.22)' : 'rgba(255,60,60,0.28)';
  ctx.fill();
  ctx.strokeStyle = valid ? 'rgba(255,255,255,0.55)' : 'rgba(255,80,80,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ghostEl.style.display = 'block';
}

function hideGhost() { ghostEl.style.display = 'none'; }

// ── Particles ─────────────────────────────────────────────────────────────────

var pCanvas = document.createElement('canvas');
pCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
document.body.appendChild(pCanvas);
var pctx = pCanvas.getContext('2d');
var pDPR = 1, parts = [], pRafId = null;

function resizePCanvas() {
  pDPR = window.devicePixelRatio || 1;
  pCanvas.width  = window.innerWidth  * pDPR;
  pCanvas.height = window.innerHeight * pDPR;
  pCanvas.style.width  = window.innerWidth  + 'px';
  pCanvas.style.height = window.innerHeight + 'px';
}
resizePCanvas();

function lightenHex(hex, amt) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgb('+Math.min(255,r+amt)+','+Math.min(255,g+amt)+','+Math.min(255,b+amt)+')';
}

function spawnParticles(cx, cy, color, count) {
  var COUNT = count || 52;
  var light = lightenHex(color, 80);
  var colors = [color, color, color, light, light, '#ffffff'];
  for (var i = 0; i < COUNT; i++) {
    var angle = (Math.PI * 2 * i / COUNT) + (Math.random() - 0.5) * 0.9;
    var spd   = 1.8 + Math.random() * 8;
    parts.push({
      x:     cx + (Math.random() - 0.5) * 24,
      y:     cy + (Math.random() - 0.5) * 24,
      vx:    Math.cos(angle) * spd,
      vy:    Math.sin(angle) * spd - 2,
      size:  3.5 + Math.random() * 7.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      op:    0.92 + Math.random() * 0.08,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.28,
      round: Math.random() > 0.42,
    });
  }
  if (!pRafId) tickParticles();
}

function tickParticles() {
  pctx.setTransform(pDPR, 0, 0, pDPR, 0, 0);
  pctx.clearRect(0, 0, pCanvas.width / pDPR, pCanvas.height / pDPR);
  parts = parts.filter(function(p) { return p.op > 0.015; });
  parts.forEach(function(p) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.21;
    p.vx *= 0.979;
    p.op -= 0.019;
    p.rot += p.rotV;
    pctx.save();
    pctx.globalAlpha = Math.max(0, p.op);
    pctx.translate(p.x, p.y);
    pctx.rotate(p.rot);
    pctx.fillStyle = p.color;
    if (p.round) {
      pctx.beginPath();
      pctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      pctx.fill();
    } else {
      pctx.fillRect(-p.size * 0.5, -p.size * 0.38, p.size, p.size * 0.76);
    }
    pctx.restore();
  });
  if (parts.length) {
    pRafId = requestAnimationFrame(tickParticles);
  } else {
    pRafId = null;
  }
}

// ── Figures ───────────────────────────────────────────────────────────────────

function occupyCells(fig, col, row) {
  fig._cells.forEach(function(cell) { occupied.set((col+cell[0])+','+(row+cell[1]), fig); });
}
function freeCells(fig) {
  fig._cells.forEach(function(cell) { occupied.delete((fig._col+cell[0])+','+(fig._row+cell[1])); });
}
function canPlace(fig, col, row) {
  col = Math.max(0, Math.min(COLS - 1 - fig._maxC, col));
  row = Math.max(0, Math.min(ROWS - 1 - fig._maxR, row));
  return fig._cells.every(function(cell) {
    var v = occupied.get((col+cell[0])+','+(row+cell[1]));
    return !v || v === fig;
  });
}
function placeFigure(fig, col, row, animate) {
  col = Math.max(0, Math.min(COLS - 1 - fig._maxC, col));
  row = Math.max(0, Math.min(ROWS - 1 - fig._maxR, row));
  var p = cellPos(col, row);
  if (animate) {
    fig.classList.add('returning');
    setTimeout(function() { fig.classList.remove('returning'); }, 220);
  }
  fig.style.left = p.x + 'px';
  fig.style.top  = p.y + 'px';
  fig._col = col;
  fig._row = row;
}
function addJelly(fig) {
  fig.classList.add('jelly');
  fig.addEventListener('animationend', function() { fig.classList.remove('jelly'); }, { once: true });
}
function createFigure(shapeName, color, startCol, startRow, moveAxis, outlineColor) {
  var cells = SHAPES[shapeName];
  if (!cells) return null;
  var maxC  = Math.max.apply(null, cells.map(function(c) { return c[0]; }));
  var maxR  = Math.max.apply(null, cells.map(function(c) { return c[1]; }));
  var W = maxC * (CELL + GAP) + CELL;
  var H = maxR * (CELL + GAP) + CELL;
  var fig = document.createElement('div');
  fig.className    = 'figure';
  fig.style.width  = W + 'px';
  fig.style.height = H + 'px';
  fig._cells    = cells;
  fig._maxC     = maxC;
  fig._maxR     = maxR;
  fig._color    = color;
  fig._coreColorKey = toColorKey(color);
  fig._outlineColor = outlineColor || null;
  fig._outlineVisible = !!fig._outlineColor;
  fig._outlineColorKey = toColorKey(outlineColor || null);
  fig._outlineActive = !!fig._outlineColorKey;
  fig._colorKey = currentFigureColorKey(fig);
  fig._moveAxis = moveAxis || null;
  fig._W = W;
  fig._H = H;
  var canvas = document.createElement('canvas');
  canvas.style.left = '-9px';
  canvas.style.top = '-9px';
  fig._canvas = canvas;
  redrawFigureCanvas(fig);
  fig.appendChild(canvas);
  if (fig._moveAxis === 'x' || fig._moveAxis === 'y') {
    var arrow = document.createElement('div');
    arrow.className = 'figure-arrow';
    arrow.textContent = fig._moveAxis === 'x' ? '↔' : '↕';
    arrow.style.fontSize = Math.max(30, Math.floor(Math.min(W, H) * 0.62)) + 'px';
    fig.appendChild(arrow);
  }
  scene.appendChild(fig);
  placeFigure(fig, startCol, startRow, false);
  if (!canPlace(fig, fig._col, fig._row)) {
    fig.remove();
    return null;
  }
  occupyCells(fig, fig._col, fig._row);
  figureCount++;
  attachDrag(fig);
  if (typeof window.onFigureCreated === 'function') window.onFigureCreated(fig);
  return fig;
}

function createBlocker(shapeName, startCol, startRow) {
  var cells = SHAPES[shapeName];
  if (!cells) return null;
  var maxC  = Math.max.apply(null, cells.map(function(c) { return c[0]; }));
  var maxR  = Math.max.apply(null, cells.map(function(c) { return c[1]; }));
  var col = Math.max(0, Math.min(COLS - 1 - maxC, startCol));
  var row = Math.max(0, Math.min(ROWS - 1 - maxR, startRow));
  var canSet = cells.every(function(cell) { return !occupied.has((col + cell[0]) + ',' + (row + cell[1])); });
  if (!canSet) return null;
  var W = maxC * (CELL + GAP) + CELL;
  var H = maxR * (CELL + GAP) + CELL;
  var el = document.createElement('div');
  el.className = 'blocker';
  el.style.width = W + 'px';
  el.style.height = H + 'px';
  var p = cellPos(col, row);
  el.style.left = p.x + 'px';
  el.style.top = p.y + 'px';
  var canvas = document.createElement('canvas');
  drawBlockerCanvas(canvas, cells, W, H);
  el.appendChild(canvas);
  scene.appendChild(el);
  cells.forEach(function(cell) {
    occupied.set((col + cell[0]) + ',' + (row + cell[1]), el);
  });
  blockers.push(el);
  return el;
}

// ── Drag & drop ───────────────────────────────────────────────────────────────

function getXY(e) {
  if (e.touches && e.touches.length > 0)
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0)
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function isPointInsideFigureShape(fig, clientX, clientY) {
  var rect = fig.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  var localX = (clientX - rect.left) / gameScale;
  var localY = (clientY - rect.top) / gameScale;
  if (localX < 0 || localY < 0 || localX > fig._W || localY > fig._H) return false;
  if (!fig._hitCtx) {
    var hitCanvas = document.createElement('canvas');
    hitCanvas.width = Math.max(1, Math.ceil(fig._W));
    hitCanvas.height = Math.max(1, Math.ceil(fig._H));
    fig._hitCtx = hitCanvas.getContext('2d');
  }
  var ctx = fig._hitCtx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  buildFigurePath(ctx, fig._cells);
  return ctx.isPointInPath(localX, localY);
}

function findUnderlyingFigureAtPoint(fig, clientX, clientY) {
  var prev = fig.style.pointerEvents;
  fig.style.pointerEvents = 'none';
  var hit = document.elementFromPoint(clientX, clientY);
  fig.style.pointerEvents = prev || '';
  if (!hit || !hit.closest) return null;
  var targetFig = hit.closest('.figure');
  return targetFig && targetFig !== fig ? targetFig : null;
}

function attachDrag(fig) {
  function startDrag(e) {
    var xy = getXY(e);
    if (!isPointInsideFigureShape(fig, xy.x, xy.y)) {
      var underlying = findUnderlyingFigureAtPoint(fig, xy.x, xy.y);
      if (underlying && typeof underlying._startDrag === 'function') {
        underlying._startDrag(e);
      }
      return;
    }
    if (typeof window.onFigureDragState === 'function') window.onFigureDragState(fig, true);
    var prevCol = fig._col, prevRow = fig._row;
    var lastValidCol = prevCol, lastValidRow = prevRow;
    fig.classList.add('dragging');
    fig.style.zIndex = 20;
    fig.style.filter = 'drop-shadow(0 16px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 18px ' + fig._color + 'cc)';
    var rect = fig.getBoundingClientRect();
    var grabX = xy.x - rect.left;
    var grabY = xy.y - rect.top;
    freeCells(fig);
    e.preventDefault();
    e.stopPropagation();
    var figW = fig._maxC * (CELL + GAP) + CELL;
    var figH = fig._maxR * (CELL + GAP) + CELL;
    var lockedRawX = cellPos(prevCol, prevRow).x;
    var lockedRawY = cellPos(prevCol, prevRow).y;

    function pickBestWall(candidates) {
      if (!candidates.length) return null;
      if (candidates.length === 1) return candidates[0];
      var matching = candidates.filter(function(w) {
        return !!currentFigureColorKey(fig) && currentFigureColorKey(fig) === w._colorKey;
      });
      var pool = matching.length ? matching : candidates;
      return pool.reduce(function(best, w) {
        var horiz = w._dir === 'top' || w._dir === 'bottom';
        var figPos = horiz ? lastValidCol : lastValidRow;
        var wMid = w._startCell + (w._wallCells - 1) / 2;
        var bestMid = best._startCell + (best._wallCells - 1) / 2;
        return Math.abs(figPos - wMid) < Math.abs(figPos - bestMid) ? w : best;
      });
    }
    function hoveredWall(pointerX, pointerY) {
      var beyond = {
        left:   pointerX < 0,
        right:  pointerX > BOARD_W,
        top:    pointerY < 0,
        bottom: pointerY > BOARD_H,
      };
      var candidates = walls.filter(function(w) { return beyond[w._dir]; });
      return pickBestWall(candidates);
    }
    function fitsThroughWall(wall) {
      var horiz = wall._dir === 'top' || wall._dir === 'bottom';
      return horiz ? fig._maxC + 1 <= wall._wallCells : fig._maxR + 1 <= wall._wallCells;
    }
    function isAdjacentToWall(wall) {
      if (wall._dir === 'top') return lastValidRow === 0;
      if (wall._dir === 'bottom') return lastValidRow === ROWS - fig._maxR - 1;
      if (wall._dir === 'left') return lastValidCol === 0;
      return lastValidCol === COLS - fig._maxC - 1;
    }
    function alignedWithWall(wall) {
      var horiz = wall._dir === 'top' || wall._dir === 'bottom';
      if (horiz) {
        return lastValidCol >= wall._startCell &&
               lastValidCol + fig._maxC <= wall._startCell + wall._wallCells - 1;
      } else {
        return lastValidRow >= wall._startCell &&
               lastValidRow + fig._maxR <= wall._startCell + wall._wallCells - 1;
      }
    }
    function trySnapToWall(wall) {
      var requiredColorKey = currentFigureColorKey(fig);
      if (!requiredColorKey || requiredColorKey !== wall._colorKey || !fitsThroughWall(wall)) return null;
      if (!isAdjacentToWall(wall) || !alignedWithWall(wall)) return null;
      var snapCol, snapRow;
      if (wall._dir === 'top' || wall._dir === 'bottom') {
        snapCol = lastValidCol;
        snapRow = lastValidRow;
      } else {
        snapRow = lastValidRow;
        snapCol = lastValidCol;
      }
      return { col: snapCol, row: snapRow };
    }
    function findAutoSnapWall() {
      var eligible = walls.filter(function(w) {
        var snap = trySnapToWall(w);
        return !!snap && canPlace(fig, snap.col, snap.row);
      });
      return pickBestWall(eligible);
    }
    function removeFigureThroughWall(wall) {
      var wallHex = WALL_HEX[wall._colorKey] || '#ffffff';
      wall.style.transition = 'transform 0.15s, filter 0.15s';
      wall.style.transform  = 'scale(1.18)';
      wall.style.filter     = 'brightness(2) drop-shadow(0 0 18px ' + wallHex + ')';
      setTimeout(function() { wall.style.transform = ''; wall.style.filter = ''; }, 300);
      var fr = fig.getBoundingClientRect();
      spawnParticles(fr.left + fr.width * 0.5, fr.top + fr.height * 0.5, fig._color);
      fig.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-in, filter 0.1s';
      fig.style.filter     = 'brightness(4) drop-shadow(0 0 28px ' + fig._color + ')';
      fig.style.transform  = 'scale(1.15)';
      fig.style.opacity    = '0';
      setTimeout(function() {
        fig.remove();
        if (typeof window.onFigureRemoved === 'function') window.onFigureRemoved(fig);
        figureCount--;
        if (figureCount === 0) {
          setTimeout(function() {
            if (typeof window.onLevelComplete === 'function') window.onLevelComplete();
          }, 500);
        }
      }, 180);
      return true;
    }
    function breakFigureOutlineThroughWall(wall) {
      var wallHex = WALL_HEX[wall._colorKey] || '#ffffff';
      wall.style.transition = 'transform 0.15s, filter 0.15s';
      wall.style.transform  = 'scale(1.15)';
      wall.style.filter     = 'brightness(1.8) drop-shadow(0 0 16px ' + wallHex + ')';
      setTimeout(function() { wall.style.transform = ''; wall.style.filter = ''; }, 260);
      var fr = fig.getBoundingClientRect();
      spawnParticles(fr.left + fr.width * 0.5, fr.top + fr.height * 0.5, fig._outlineColor || wallHex, 26);
      fig.classList.add('outline-break');
      setTimeout(function() { fig.classList.remove('outline-break'); }, 320);
      fig._outlineVisible = false;
      fig._outlineActive = false;
      fig._colorKey = currentFigureColorKey(fig);
      redrawFigureCanvas(fig);
      return false;
    }
    function resolveWallMatch(wall) {
      if (fig._outlineActive) {
        if (fig._outlineColorKey && wall._colorKey === fig._outlineColorKey) {
          return breakFigureOutlineThroughWall(wall);
        }
        return false;
      }
      return removeFigureThroughWall(wall);
    }
    function getNearWall(rawX, rawY) {
      var SNAP = CELL + GAP;
      var near = {
        left:   rawX >= 0 && rawX < SNAP,
        right:  rawX <= BOARD_W - figW && rawX > BOARD_W - figW - SNAP,
        top:    rawY >= 0 && rawY < SNAP,
        bottom: rawY <= BOARD_H - figH && rawY > BOARD_H - figH - SNAP,
      };
      var candidates = walls.filter(function(w) { return near[w._dir]; });
      return pickBestWall(candidates);
    }
    function updateWallHighlight(rawX, rawY, pointerX, pointerY) {
      var w = hoveredWall(pointerX, pointerY);
      var n = w ? null : getNearWall(rawX, rawY);
      walls.forEach(function(wall) {
        if (wall === w) {
          var match = trySnapToWall(wall) !== null;
          wall.style.transform = 'scale(1.1)';
          wall.style.filter    = match
            ? 'brightness(1.5) drop-shadow(0 0 14px rgba(255,255,255,0.9))'
            : 'brightness(0.55) saturate(0.3)';
        } else if (n && wall === n && trySnapToWall(wall) !== null) {
          wall.style.transform = 'scale(1.05)';
          wall.style.filter    = 'brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        } else {
          wall.style.transform = '';
          wall.style.filter    = '';
        }
      });
      return w;
    }
    function moveToward(targetCol, targetRow) {
      var curCol = lastValidCol;
      var curRow = lastValidRow;
      var dCol = targetCol - curCol;
      var dRow = targetRow - curRow;
      if (!dCol && !dRow) return;

      function stepAxis(axis) {
        if (axis === 'x') {
          if (targetCol === curCol) return;
          var sx = targetCol > curCol ? 1 : -1;
          while (curCol !== targetCol) {
            var nx = curCol + sx;
            if (!canPlace(fig, nx, curRow)) break;
            curCol = nx;
          }
          return;
        }
        if (targetRow === curRow) return;
        var sy = targetRow > curRow ? 1 : -1;
        while (curRow !== targetRow) {
          var ny = curRow + sy;
          if (!canPlace(fig, curCol, ny)) break;
          curRow = ny;
        }
      }

      var firstAxis = Math.abs(dCol) >= Math.abs(dRow) ? 'x' : 'y';
      var secondAxis = firstAxis === 'x' ? 'y' : 'x';
      stepAxis(firstAxis);
      stepAxis(secondAxis);
      lastValidCol = curCol;
      lastValidRow = curRow;
    }

    var onMove = function(e) {
      if (e.cancelable) e.preventDefault();
      var xy = getXY(e);
      var sr   = scene.getBoundingClientRect();
      var rawX = (xy.x - grabX - sr.left) / gameScale;
      var rawY = (xy.y - grabY - sr.top)  / gameScale;
      var pointerX = (xy.x - sr.left) / gameScale;
      var pointerY = (xy.y - sr.top) / gameScale;
      if (fig._moveAxis === 'x') rawY = lockedRawY;
      if (fig._moveAxis === 'y') rawX = lockedRawX;
      var overWall = updateWallHighlight(rawX, rawY, pointerX, pointerY);
      if (overWall) {
        var snap = trySnapToWall(overWall);
        if (snap && canPlace(fig, snap.col, snap.row)) {
          lastValidCol = snap.col;
          lastValidRow = snap.row;
        }
        var p = cellPos(lastValidCol, lastValidRow);
        fig.style.left = p.x + 'px';
        fig.style.top  = p.y + 'px';
        hideGhost();
        return;
      }
      var px = Math.max(0, Math.min(BOARD_W - figW, rawX));
      var py = Math.max(0, Math.min(BOARD_H - figH, rawY));
      var col = Math.round((px - PAD) / (CELL + GAP));
      var row = Math.round((py - PAD) / (CELL + GAP));
      var clampedCol = Math.max(0, Math.min(COLS - 1 - fig._maxC, col));
      var clampedRow = Math.max(0, Math.min(ROWS - 1 - fig._maxR, row));
      if (fig._moveAxis === 'x') clampedRow = prevRow;
      if (fig._moveAxis === 'y') clampedCol = prevCol;
      moveToward(clampedCol, clampedRow);
      var p = cellPos(lastValidCol, lastValidRow);
      fig.style.left = p.x + 'px';
      fig.style.top  = p.y + 'px';
      showGhost(fig, lastValidCol, lastValidRow, true);
    };

    var onUp = function(e) {
      if (typeof window.onFigureDragState === 'function') window.onFigureDragState(fig, false);
      fig.classList.remove('dragging');
      fig.style.filter = '';
      fig.style.zIndex = 10;
      hideGhost();
      walls.forEach(function(w) { w.style.transform = ''; w.style.filter = ''; });
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
      var xy = getXY(e);
      var sr2  = scene.getBoundingClientRect();
      var rawX = (xy.x - grabX - sr2.left) / gameScale;
      var rawY = (xy.y - grabY - sr2.top)  / gameScale;
      var pointerX = (xy.x - sr2.left) / gameScale;
      var pointerY = (xy.y - sr2.top) / gameScale;
      if (fig._moveAxis === 'x') rawY = lockedRawY;
      if (fig._moveAxis === 'y') rawX = lockedRawX;
      var wall = hoveredWall(pointerX, pointerY);
      var snapOnDrop = wall ? trySnapToWall(wall) : null;
      var match = !!snapOnDrop && canPlace(fig, snapOnDrop.col, snapOnDrop.row);
      if (!match && !wall) {
        wall = findAutoSnapWall();
        snapOnDrop = wall ? trySnapToWall(wall) : null;
        match = !!snapOnDrop && canPlace(fig, snapOnDrop.col, snapOnDrop.row);
      }
      if (wall) {
        if (match) {
          placeFigure(fig, snapOnDrop.col, snapOnDrop.row, false);
          if (!resolveWallMatch(wall)) {
            occupyCells(fig, fig._col, fig._row);
            addJelly(fig);
          }
        } else {
          placeFigure(fig, prevCol, prevRow, true);
          occupyCells(fig, fig._col, fig._row);
          fig.classList.add('shake');
          fig.addEventListener('animationend', function() { fig.classList.remove('shake'); }, { once: true });
          setTimeout(function() { addJelly(fig); }, 220);
        }
      } else {
        placeFigure(fig, lastValidCol, lastValidRow, false);
        addJelly(fig);
        occupyCells(fig, fig._col, fig._row);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onUp);
  }

  fig.addEventListener('mousedown', startDrag);
  fig.addEventListener('touchstart', startDrag, { passive: false });
  fig._startDrag = startDrag;
}

// ── Scale ─────────────────────────────────────────────────────────────────────

function scaleGame() {
  var frameW = BOARD_W + 2 * BORDER;
  var frameH = BOARD_H + 2 * BORDER;
  var topAnchors = ['hud-top', 'back-btn', 'soft-currency'];
  var topMax = 0;
  topAnchors.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    if (!rect.height) return;
    topMax = Math.max(topMax, rect.bottom);
  });

  var boosters = document.getElementById('boosters-bar');
  var boostersRect = boosters ? boosters.getBoundingClientRect() : null;

  var reservedTop = Math.max(8, Math.ceil(topMax) + 10);
  var reservedBottom = boostersRect && boostersRect.height
    ? Math.max(10, Math.ceil(window.innerHeight - boostersRect.top) + 10)
    : Math.min(116, window.innerHeight * 0.17);
  var availW = window.innerWidth;
  var availH = Math.max(220, window.innerHeight - reservedTop - reservedBottom);
  gameScale = Math.min(
    availW / frameW,
    availH / frameH,
    1
  ) * 0.98;
  frame.style.left = '50%';
  frame.style.top = Math.round(reservedTop + availH / 2) + 'px';
  frame.style.transform = 'translate(-50%, -50%) scale(' + gameScale.toFixed(4) + ')';
}

// ── initLevel ─────────────────────────────────────────────────────────────────

function initLevel(cfg) {
  COLS    = cfg.cols;
  ROWS    = cfg.rows;
  BOARD_W = COLS * CELL + (COLS - 1) * GAP + 2 * PAD;
  BOARD_H = ROWS * CELL + (ROWS - 1) * GAP + 2 * PAD;

  frame.style.width  = (BOARD_W + 2 * BORDER) + 'px';
  frame.style.height = (BOARD_H + 2 * BORDER) + 'px';

  buildBoard(COLS, ROWS);

  walls.forEach(function(w) { w.remove(); });
  walls.length = 0;
  blockers.forEach(function(b) { b.remove(); });
  blockers.length = 0;
  document.querySelectorAll('.figure').forEach(function(f) { f.remove(); });
  occupied.clear();
  figureCount = 0;

  (cfg.walls || []).forEach(function(w) { makeWall(w.color, w.dir, w.col, w.row, w.cells); });
  (cfg.blocks || cfg.obstacles || []).forEach(function(b) { createBlocker(b.shape, b.col, b.row); });
  (cfg.figures || []).forEach(function(f) { createFigure(f.shape, f.color, f.col, f.row, f.axis, f.outlineColor); });

  scaleGame();
}
