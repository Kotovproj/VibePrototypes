// ── ENGINE ────────────────────────────────────────────────────────────────────
// Зависит от: js/constants.js (CELL, GAP, PAD, BORDER, SHAPES, COLOR_KEY)
// Экспортирует: initLevel(cfg), scaleGame()
// Callback: window.onLevelComplete() — вызывается когда все фигуры убраны

// Состояние
var COLS, ROWS, BOARD_W, BOARD_H;
var gameScale = 1;
var occupied  = new Map();
var walls     = [];
var figureCount = 0;

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

function drawFigureCanvas(canvas, cells, color, W, H) {
  var ctx = prepCanvas(canvas, W, H);
  buildFigurePath(ctx, cells);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  var hl = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  hl.addColorStop(0, 'rgba(255,255,255,0.32)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
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

function spawnParticles(cx, cy, color) {
  var COUNT = 52;
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
function createFigure(shapeName, color, startCol, startRow) {
  var cells = SHAPES[shapeName];
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
  fig._colorKey = COLOR_KEY[color] || null;
  var canvas = document.createElement('canvas');
  drawFigureCanvas(canvas, cells, color, W, H);
  fig.appendChild(canvas);
  scene.appendChild(fig);
  figureCount++;
  placeFigure(fig, startCol, startRow, false);
  occupyCells(fig, fig._col, fig._row);
  attachDrag(fig);
  return fig;
}

// ── Drag & drop ───────────────────────────────────────────────────────────────

function getXY(e) {
  if (e.touches && e.touches.length > 0)
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0)
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function attachDrag(fig) {
  function startDrag(e) {
    var prevCol = fig._col, prevRow = fig._row;
    var lastValidCol = prevCol, lastValidRow = prevRow;
    fig.classList.add('dragging');
    fig.style.zIndex = 20;
    fig.style.filter = 'drop-shadow(0 16px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 18px ' + fig._color + 'cc)';
    var xy = getXY(e);
    var rect = fig.getBoundingClientRect();
    var grabX = xy.x - rect.left;
    var grabY = xy.y - rect.top;
    freeCells(fig);
    e.preventDefault();
    e.stopPropagation();
    var figW = fig._maxC * (CELL + GAP) + CELL;
    var figH = fig._maxR * (CELL + GAP) + CELL;

    function hoveredWall(rawX, rawY) {
      var beyond = {
        left:   rawX < 0,
        right:  rawX > BOARD_W - figW,
        top:    rawY < 0,
        bottom: rawY > BOARD_H - figH,
      };
      var candidates = walls.filter(function(w) { return beyond[w._dir]; });
      if (!candidates.length) return null;
      if (candidates.length === 1) return candidates[0];
      return candidates.reduce(function(best, w) {
        var horiz = w._dir === 'top' || w._dir === 'bottom';
        var figPos  = horiz ? lastValidCol : lastValidRow;
        var wMid    = w._startCell    + (w._wallCells    - 1) / 2;
        var bestMid = best._startCell + (best._wallCells - 1) / 2;
        return Math.abs(figPos - wMid) < Math.abs(figPos - bestMid) ? w : best;
      });
    }
    function fitsThroughWall(wall) {
      var horiz = wall._dir === 'top' || wall._dir === 'bottom';
      return horiz ? fig._maxC + 1 <= wall._wallCells : fig._maxR + 1 <= wall._wallCells;
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
      if (!fig._colorKey || fig._colorKey !== wall._colorKey || !fitsThroughWall(wall)) return null;
      var snapCol, snapRow;
      if (wall._dir === 'top' || wall._dir === 'bottom') {
        snapCol = Math.max(wall._startCell,
                  Math.min(wall._startCell + wall._wallCells - fig._maxC - 1, lastValidCol));
        snapRow = wall._dir === 'top' ? 0 : ROWS - fig._maxR - 1;
      } else {
        snapRow = Math.max(wall._startCell,
                  Math.min(wall._startCell + wall._wallCells - fig._maxR - 1, lastValidRow));
        snapCol = wall._dir === 'left' ? 0 : COLS - fig._maxC - 1;
      }
      return { col: snapCol, row: snapRow };
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
      if (!candidates.length) return null;
      if (candidates.length === 1) return candidates[0];
      return candidates.reduce(function(best, w) {
        var horiz = w._dir === 'top' || w._dir === 'bottom';
        var figPos  = horiz ? lastValidCol : lastValidRow;
        var wMid    = w._startCell    + (w._wallCells    - 1) / 2;
        var bestMid = best._startCell + (best._wallCells - 1) / 2;
        return Math.abs(figPos - wMid) < Math.abs(figPos - bestMid) ? w : best;
      });
    }
    function updateWallHighlight(rawX, rawY) {
      var w = hoveredWall(rawX, rawY);
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

    var onMove = function(e) {
      if (e.cancelable) e.preventDefault();
      var xy = getXY(e);
      var sr   = scene.getBoundingClientRect();
      var rawX = (xy.x - grabX - sr.left) / gameScale;
      var rawY = (xy.y - grabY - sr.top)  / gameScale;
      var overWall = updateWallHighlight(rawX, rawY);
      if (overWall) {
        var snap = trySnapToWall(overWall);
        if (snap) {
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
      if (canPlace(fig, clampedCol, clampedRow)) {
        lastValidCol = clampedCol;
        lastValidRow = clampedRow;
      }
      var p = cellPos(lastValidCol, lastValidRow);
      fig.style.left = p.x + 'px';
      fig.style.top  = p.y + 'px';
      showGhost(fig, lastValidCol, lastValidRow, true);
    };

    var onUp = function(e) {
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
      var wall = hoveredWall(rawX, rawY);
      if (wall) {
        var match = trySnapToWall(wall) !== null;
        if (match) {
          wall.style.transition = 'transform 0.15s, filter 0.15s';
          wall.style.transform  = 'scale(1.18)';
          wall.style.filter     = 'brightness(2) drop-shadow(0 0 18px white)';
          setTimeout(function() { wall.style.transform = ''; wall.style.filter = ''; }, 300);
          var fr = fig.getBoundingClientRect();
          spawnParticles(fr.left + fr.width * 0.5, fr.top + fr.height * 0.5, fig._color);
          fig.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-in, filter 0.1s';
          fig.style.filter     = 'brightness(4) drop-shadow(0 0 28px ' + fig._color + ')';
          fig.style.transform  = 'scale(1.15)';
          fig.style.opacity    = '0';
          setTimeout(function() {
            fig.remove();
            figureCount--;
            if (figureCount === 0) {
              setTimeout(function() {
                if (typeof window.onLevelComplete === 'function') window.onLevelComplete();
              }, 500);
            }
          }, 180);
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
}

// ── Scale ─────────────────────────────────────────────────────────────────────

function scaleGame() {
  var frameW = BOARD_W + 2 * BORDER;
  var frameH = BOARD_H + 2 * BORDER;
  gameScale = Math.min(
    window.innerWidth  / frameW,
    window.innerHeight / frameH,
    1
  ) * 0.94;
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
  document.querySelectorAll('.figure').forEach(function(f) { f.remove(); });
  occupied.clear();
  figureCount = 0;

  cfg.walls.forEach(function(w) { makeWall(w.color, w.dir, w.col, w.row, w.cells); });
  cfg.figures.forEach(function(f) { createFigure(f.shape, f.color, f.col, f.row); });

  scaleGame();
}
