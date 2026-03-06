// ── Уровень 8: скользящий пазл (6×9) ────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 9,
  time: 50,
  walls: [
    { color: 'purple', dir: 'top',    col: 0, cells: 2 },  // cols 0–1
    { color: 'green',  dir: 'top',    col: 2, cells: 2 },  // cols 2–3
    { color: 'blue',   dir: 'top',    col: 4, cells: 2 },  // cols 4–5
    { color: 'red',    dir: 'right',  row: 0, cells: 2 },  // rows 0–1
    { color: 'yellow', dir: 'right',  row: 4, cells: 3 },  // rows 4–6
    { color: 'red',    dir: 'left',   row: 5, cells: 1 },  // row 5
    { color: 'orange', dir: 'bottom', col: 1, cells: 3 },  // cols 1–3
  ],
  figures: [
    // row 0
    { shape: '2x1', color: '#f44336', col: 3, row: 0, axis: 'x' },  // red_h_top

    // row 1
    { shape: '1x2', color: '#ff9800', col: 0, row: 1 },              // orange_v_left
    { shape: '1x1', color: '#f44336', col: 2, row: 1 },              // red_1
    { shape: '1x1', color: '#c84bdf', col: 3, row: 1 },              // purple_1

    // row 3
    { shape: '1x1', color: '#c84bdf', col: 1, row: 3, axis: 'y' },  // purple_v_small

    // row 4
    { shape: '2x1', color: '#4caf50', col: 0, row: 4 },              // green_h_left
    { shape: '1x1', color: '#ffc107', col: 2, row: 4, axis: 'x' },  // yellow_center

    // row 5
    { shape: '1x1', color: '#1976d2', col: 0, row: 5 },              // blue_1
    { shape: '2x1', color: '#f44336', col: 1, row: 5, axis: 'x' },  // red_h_mid
    { shape: '1x1', color: '#4caf50', col: 4, row: 5 },              // green_1
    { shape: '1x2', color: '#1976d2', col: 5, row: 5 },              // blue_v_right (1×2)

    // row 6
    { shape: '1x2', color: '#c84bdf', col: 1, row: 6, axis: 'y' },  // purple_v_big
    { shape: '2x1', color: '#ffc107', col: 2, row: 6 },              // yellow_h_bottom

    // row 7
    { shape: '1x1', color: '#ff9800', col: 0, row: 7 },              // orange_1
    { shape: '2x1', color: '#c84bdf', col: 2, row: 7 },              // purple_h_bottom
    { shape: '2x2', color: '#1976d2', col: 4, row: 7 },              // blue_big
  ],
});
