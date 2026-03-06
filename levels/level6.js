// ── Уровень 6: раскладка по схеме (6×6) ───────────────────────────────
LEVELS.push({
  cols: 6, rows: 6,
  time: 50,
  walls: [
    { color: 'purple', dir: 'top',    col: 0, cells: 3 },  // cols 0–2
    { color: 'red',    dir: 'top',    col: 3, cells: 3 },  // cols 3–5
    { color: 'green',  dir: 'left',   row: 2, cells: 2 },  // rows 2–3
    { color: 'green',  dir: 'right',  row: 2, cells: 2 },  // rows 2–3
    { color: 'blue',   dir: 'bottom', col: 0, cells: 2 },  // cols 0–1
    { color: 'yellow', dir: 'bottom', col: 4, cells: 2 },  // cols 4–5
  ],
  figures: [
    { shape: '3x1',   color: '#f44336', col: 0, row: 1 },
    { shape: '3x1',   color: '#c84bdf', col: 3, row: 1 },
    { shape: '1x2',   color: '#ffc107', col: 0, row: 2 },
    { shape: '3x1',   color: '#4caf50', col: 2, row: 2 },
    { shape: '1x2',   color: '#1e88e5', col: 5, row: 2 },
    { shape: '3x1',   color: '#388e3c', col: 1, row: 3 },
    { shape: 'mini_L', color: '#1e88e5', col: 1, row: 4 },
    { shape: 'mini_J', color: '#ffc107', col: 3, row: 4 },
  ],
});
