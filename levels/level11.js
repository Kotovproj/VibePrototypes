// ── Уровень 11: вертикальный стек планок ─────────────────────────────
LEVELS.push({
  cols: 3, rows: 7,
  time: 50,
  walls: [
    { color: 'pink',   dir: 'right', row: 1, cells: 1 },
    { color: 'blue',   dir: 'right', row: 2, cells: 1 },
    { color: 'red',    dir: 'right', row: 3, cells: 1 },

    { color: 'purple', dir: 'left',  row: 3, cells: 1 },
    { color: 'yellow', dir: 'left',  row: 4, cells: 1 },
    { color: 'cyan',   dir: 'left',  row: 5, cells: 1 },
  ],
  figures: [
    { shape: '3x1', color: '#00bcd4', col: 0, row: 0 },
    { shape: '3x1', color: '#ffc107', col: 0, row: 1 },
    { shape: '3x1', color: '#c84bdf', col: 0, row: 2 },
    { shape: '3x1', color: '#1e88e5', col: 0, row: 3 },
    { shape: '3x1', color: '#f44336', col: 0, row: 4 },
    { shape: '3x1', color: '#c84bdf', col: 0, row: 5 },
  ],
});
