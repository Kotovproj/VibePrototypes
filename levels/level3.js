// ── Уровень 3: три фигуры — синяя, красная, жёлтая ────────────────────
// Раскладка (5×6):
//   Col:  0  1  2  3  4
//   Row 0: B  B  .  Y  Y
//   Row 1: B  B  .  Y  Y
//   Row 2: B  B  .  Y  Y
//   Row 3: B  B  R  R  R
//   Row 4: .  .  R  R  R
//   Row 5: .  .  .  .  .
LEVELS.push({
  cols: 5, rows: 6,
  walls: [
    { color: 'blue',   dir: 'top',    col: 0, cells: 2 },  // синяя   — сверху слева (cols 0–1)
    { color: 'red',    dir: 'left',   row: 3, cells: 2 },  // красная — слева в центре (rows 3–4)
    { color: 'red',    dir: 'right',  row: 3, cells: 2 },  // красная — справа в центре (rows 3–4)
    { color: 'yellow', dir: 'bottom', col: 3, cells: 2 },  // жёлтая  — снизу справа (cols 3–4)
  ],
  figures: [
    { shape: '2x4', color: '#1e88e5', col: 0, row: 0 },  // синяя  2×4 (cols 0–1, rows 0–3)
    { shape: '3x2', color: '#f44336', col: 2, row: 3 },  // красная 3×2 (cols 2–4, rows 3–4)
    { shape: '2x3', color: '#ffc107', col: 3, row: 0 },  // жёлтая 2×3 (cols 3–4, rows 0–2)
  ],
});
