// ── Уровень 5: пять стенок, пять фигур ────────────────────────────────
LEVELS.push({
  cols: 5, rows: 6,
  time: 50,
  walls: [
    { color: 'purple', dir: 'top',    col: 0, cells: 2 },  // фиолетовая — cols 0–1
    { color: 'green',  dir: 'top',    col: 3, cells: 2 },  // зелёная    — cols 3–4
    { color: 'orange', dir: 'left',   row: 4, cells: 2 },  // оранжевая  — rows 4–5
    { color: 'red',    dir: 'right',  row: 4, cells: 2 },  // красная    — rows 4–5
    { color: 'cyan',   dir: 'bottom', col: 1 },            // голубая    — cols 1–3
  ],
  figures: [
    { shape: '2x2', color: '#c84bdf', col: 0, row: 2 },  // фиолетовая 2×2 (cols 0–1, rows 2–3)
    { shape: '2x2', color: '#4caf50', col: 3, row: 2 },  // зелёная 2×2    (cols 3–4, rows 2–3)
    { shape: '1x3', color: '#29b6f6', col: 2, row: 0 },  // голубая 1×3    (col 2, rows 0–2)
    { shape: '3x1', color: '#ff9800', col: 1, row: 4 },  // оранжевая 3×1  (cols 1–3, row 4)
    { shape: '3x1', color: '#f44336', col: 1, row: 5 },  // красная 3×1    (cols 1–3, row 5)
  ],
});
