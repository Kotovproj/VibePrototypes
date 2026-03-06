// ── Уровень 12: по референсу со скриншота ─────────────────────────────
LEVELS.push({
  cols: 6, rows: 8,
  time: 50,
  walls: [
    { color: 'purple', dir: 'top',    col: 0, cells: 1 },
    { color: 'blue',   dir: 'top',    col: 2, cells: 2 },
    { color: 'yellow', dir: 'top',    col: 5, cells: 1 },
    { color: 'red',    dir: 'left',   row: 3, cells: 1 },
    { color: 'cyan',   dir: 'right',  row: 3, cells: 1 },
    { color: 'orange', dir: 'left',   row: 6, cells: 1 },
    { color: 'orange', dir: 'right',  row: 6, cells: 1 },
    { color: 'green',  dir: 'bottom', col: 2, cells: 2 },
  ],
  figures: [
    { shape: 'mini_J', color: '#29b6f6', col: 0, row: 0 },
    { shape: '2x1',    color: '#c84bdf', col: 2, row: 0, axis: 'x' },
    { shape: 'mini_L', color: '#f44336', col: 4, row: 0 },
    { shape: '2x1',    color: '#ffc107', col: 2, row: 1, axis: 'x' },

    { shape: '1x2',    color: '#388e3c', col: 0, row: 2 },
    { shape: '2x2',    color: '#ff9800', col: 1, row: 3 },
    { shape: '1x1',    color: '#1e88e5', col: 3, row: 3 },
    { shape: '2x2',    color: '#ffc107', col: 4, row: 3 },
    { shape: '1x2',    color: '#1976d2', col: 5, row: 3 },
    { shape: '1x1',    color: '#388e3c', col: 3, row: 4 },
    { shape: '1x2',    color: '#1e88e5', col: 0, row: 4 },
    { shape: '1x2',    color: '#c84bdf', col: 5, row: 5 },

    { shape: 'mini_L', color: '#29b6f6', col: 0, row: 6 },
    { shape: 'T',      color: '#ff9800', col: 1, row: 6, axis: 'x' },
    { shape: 'mini_J', color: '#388e3c', col: 4, row: 6 },
  ],
});
