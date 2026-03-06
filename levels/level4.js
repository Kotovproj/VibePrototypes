// ── Уровень 4: четыре стенки, три фигуры ──────────────────────────────
LEVELS.push({
  cols: 6, rows: 7,
  time: 50,
  walls: [
    { color: 'yellow', dir: 'top'              },  // центр col 1
    { color: 'orange', dir: 'left',  row: 1    },  // rows 1–3
    { color: 'orange', dir: 'right', row: 3    },  // rows 3–5
    { color: 'blue',   dir: 'bottom'           },  // центр col 1
  ],
  figures: [
    { shape: '3x3', color: '#1e88e5', col: 0, row: 0 },  // синяя 3×3
    { shape: '2x3', color: '#ff9800', col: 3, row: 1 },  // оранжевая 2×3
    { shape: '3x3', color: '#ffc107', col: 3, row: 4 },  // жёлтая 3×3
  ],
});
