/* Utilidades matemáticas, formatação e aleatoriedade */
(function () {
  'use strict';
  const PR = window.PR;
  const U = {};

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invLerp = (a, b, v) => U.clamp((v - a) / (b - a), 0, 1);
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  U.approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
  U.damp = (cur, target, k, dt) => target + (cur - target) * Math.exp(-k * dt);
  U.weighted = (items) => {
    let tot = 0;
    for (const it of items) tot += it[1];
    let r = Math.random() * tot;
    for (const it of items) { r -= it[1]; if (r <= 0) return it[0]; }
    return items[items.length - 1][0];
  };
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.round = (n, d) => { const f = Math.pow(10, d || 0); return Math.round(n * f) / f; };

  // Formatação brasileira
  U.fmtInt = (n) => {
    n = Math.round(n);
    const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : '') + s;
  };
  U.fmtDec = (n, d) => {
    const neg = n < 0;
    const parts = Math.abs(n).toFixed(d).split('.');
    return (neg ? '-' : '') + U.fmtInt(+parts[0]) + (d > 0 ? ',' + parts[1] : '');
  };
  // Números de respostas matemáticas: sem separador de milhar, vírgula decimal
  U.fmtNum = (n) => {
    const r = Math.round(n * 10000) / 10000;
    return String(r).replace('.', ',');
  };
  U.fmtTime = (s) => {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  U.hexToRgb = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgba = (hex, a) => { const c = U.hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  U.mix = (h1, h2, t) => {
    const a = U.hexToRgb(h1), b = U.hexToRgb(h2);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  U.mulberry32 = (seed) => function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  U.laneX = (l) => PR.CFG.ROAD_L + PR.CFG.LANE_W * (l + 0.5);
  U.laneAt = (x) => U.clamp(Math.floor((x - PR.CFG.ROAD_L) / PR.CFG.LANE_W), 0, PR.CFG.LANES - 1);

  U.canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
    return c;
  };
  // círculo pixelado nítido (sem antialias)
  U.pcirc = (ctx, cx, cy, r, col) => {
    ctx.fillStyle = col;
    for (let y = -r; y <= r; y++) {
      const hw = Math.floor(Math.sqrt(r * r - y * y) + 0.3);
      ctx.fillRect(cx - hw, cy + y, hw * 2 + 1, 1);
    }
  };

  PR.U = U;
})();

