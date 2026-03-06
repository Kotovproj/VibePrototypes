// ── Уровень 3: три фигуры — синяя, красная, жёлтая ────────────────────
// Раскладка (5×6):
//   Col:  0  1  2  3  4
//   Row 0: B  B  R  R  .
//   Row 1: B  B  R  R  .
//   Row 2: B  B  R  R  .
//   Row 3: B  B  .  Y  Y
//   Row 4: .  .  .  Y  Y
//   Row 5: .  .  Y  Y  Y
LEVELS.push({
  cols: 5, rows: 6,
  time: 50,
  walls: [
    { color: 'blue',   dir: 'top',    col: 0, cells: 2 },  // синяя   — сверху слева   (cols 0–1)
    { color: 'red',    dir: 'left',   row: 1, cells: 3 },  // красная — слева в центре  (rows 1–3)
    { color: 'red',    dir: 'right',  row: 1, cells: 3 },  // красная — справа в центре (rows 1–3)
    { color: 'yellow', dir: 'bottom', col: 2, cells: 3 },  // жёлтая  — снизу справа   (cols 2–4)
  ],
  figures: [
    { shape: '2x4',  color: '#1e88e5', col: 0, row: 0 },  // синяя   2×4   (cols 0–1, rows 0–3)
    { shape: '2x3',  color: '#f44336', col: 2, row: 0 },  // красная 2×3   (cols 2–3, rows 0–2)
    { shape: 'fat_J', color: '#ffc107', col: 2, row: 3 }, // жёлтая  fat_J (cols 3–4 top, 2–4 bottom)
  ],
});
