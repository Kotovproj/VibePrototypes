// ── Уровень 2: два высоких столбца 2×5 ────────────────────────────────
LEVELS.push({
  cols: 5, rows: 6,
  time: 50,
  walls: [
    { color: 'green',  dir: 'top'    },
    { color: 'orange', dir: 'bottom' },
  ],
  figures: [
    { shape: '2x5', color: '#4caf50', col: 0, row: 0 },
    { shape: '2x5', color: '#ff9800', col: 3, row: 0 },
  ],
});
