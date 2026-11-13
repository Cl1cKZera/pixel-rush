/* Fonte bitmap pixelada própria (5x7) com acentos do português e símbolos matemáticos.
 * Renderização via atlas + cache de cores, nítida em qualquer escala inteira. */
(function () {
  'use strict';
  const PR = window.PR;

  const RAW = {
    ' ': '00000,00000,00000,00000,00000,00000,00000',
    'A': '01110,10001,10001,11111,10001,10001,10001',
    'B': '11110,10001,10001,11110,10001,10001,11110',
    'C': '01110,10001,10000,10000,10000,10001,01110',
    'D': '11110,10001,10001,10001,10001,10001,11110',
    'E': '11111,10000,10000,11110,10000,10000,11111',
    'F': '11111,10000,10000,11110,10000,10000,10000',
    'G': '01110,10001,10000,10111,10001,10001,01111',
    'H': '10001,10001,10001,11111,10001,10001,10001',
    'I': '01110,00100,00100,00100,00100,00100,01110',
    'J': '00111,00010,00010,00010,00010,10010,01100',
    'K': '10001,10010,10100,11000,10100,10010,10001',
    'L': '10000,10000,10000,10000,10000,10000,11111',
    'M': '10001,11011,10101,10101,10001,10001,10001',
    'N': '10001,11001,10101,10011,10001,10001,10001',
    'O': '01110,10001,10001,10001,10001,10001,01110',
    'P': '11110,10001,10001,11110,10000,10000,10000',
    'Q': '01110,10001,10001,10001,10101,10010,01101',
    'R': '11110,10001,10001,11110,10100,10010,10001',
    'S': '01111,10000,10000,01110,00001,00001,11110',
    'T': '11111,00100,00100,00100,00100,00100,00100',
    'U': '10001,10001,10001,10001,10001,10001,01110',
    'V': '10001,10001,10001,10001,10001,01010,00100',
    'W': '10001,10001,10001,10101,10101,10101,01010',
    'X': '10001,10001,01010,00100,01010,10001,10001',
    'Y': '10001,10001,01010,00100,00100,00100,00100',
    'Z': '11111,00001,00010,00100,01000,10000,11111',
    '0': '01110,10001,10011,10101,11001,10001,01110',
    '1': '00100,01100,00100,00100,00100,00100,01110',
    '2': '01110,10001,00001,00010,00100,01000,11111',
    '3': '11111,00010,00100,00010,00001,10001,01110',
    '4': '00010,00110,01010,10010,11111,00010,00010',
    '5': '11111,10000,11110,00001,00001,10001,01110',
    '6': '00110,01000,10000,11110,10001,10001,01110',
    '7': '11111,00001,00010,00100,01000,01000,01000',
    '8': '01110,10001,10001,01110,10001,10001,01110',
    '9': '01110,10001,10001,01111,00001,00010,01100',
    '.': '00000,00000,00000,00000,00000,01100,01100',
    ',': '00000,00000,00000,00000,01100,00100,01000',
    ':': '00000,01100,01100,00000,01100,01100,00000',
    ';': '00000,01100,01100,00000,01100,00100,01000',
    '!': '00100,00100,00100,00100,00100,00000,00100',
    '?': '01110,10001,00001,00010,00100,00000,00100',
    '-': '00000,00000,00000,11111,00000,00000,00000',
    '+': '00000,00100,00100,11111,00100,00100,00000',
    '=': '00000,00000,11111,00000,11111,00000,00000',
    '×': '00000,10001,01010,00100,01010,10001,00000',
    '÷': '00000,00100,00000,11111,00000,00100,00000',
    '/': '00001,00001,00010,00100,01000,10000,10000',
    '%': '11001,11001,00010,00100,01000,10011,10011',
    '(': '00010,00100,01000,01000,01000,00100,00010',
    ')': '01000,00100,00010,00010,00010,00100,01000',
    '[': '01110,01000,01000,01000,01000,01000,01110',
    ']': '01110,00010,00010,00010,00010,00010,01110',
    "'": '00100,00100,01000,00000,00000,00000,00000',
    '"': '01010,01010,00000,00000,00000,00000,00000',
    '√': '00011,00010,00010,00010,10100,01100,00100',
    '^': '00100,01010,10001,00000,00000,00000,00000',
    '→': '00000,00100,00010,11111,00010,00100,00000',
    '←': '00000,00100,01000,11111,01000,00100,00000',
    '↑': '00100,01110,10101,00100,00100,00100,00100',
    '↓': '00100,00100,00100,00100,10101,01110,00100',
    '*': '00000,10101,01110,11111,01110,10101,00000',
    '#': '01010,11111,01010,01010,11111,01010,00000',
    '<': '00010,00100,01000,10000,01000,00100,00010',
    '>': '01000,00100,00010,00001,00010,00100,01000',
    '_': '00000,00000,00000,00000,00000,00000,11111',
    '&': '01100,10010,10100,01000,10101,10010,01101',
    '|': '00100,00100,00100,00100,00100,00100,00100',
    '•': '00000,00000,01110,01110,01110,00000,00000',
    '°': '01100,10010,01100,00000,00000,00000,00000',
    '♥': '00000,01010,11111,11111,01110,00100,00000',
    '✓': '00000,00001,00010,10100,01000,00000,00000',
    '✗': '00000,10001,01010,00100,01010,10001,00000',
    '▲': '00100,01110,01110,11111,11111,00000,00000',
    '►': '01000,01100,01110,01111,01110,01100,01000',
    '◄': '00010,00110,01110,11110,01110,00110,00010',
    '★': '00100,00100,11111,01110,01110,10001,00000',
    '⚠': '00100,01110,01010,11011,11111,11011,00000',
    '⏸': '01010,01010,01010,01010,01010,01010,00000',
    '≈': '00000,01101,10110,00000,01101,10110,00000',
    'π': '00000,11111,01010,01010,01010,01010,10011',
    'Σ': '11111,10000,01000,00100,01000,10000,11111',
    'Δ': '00000,00100,01010,01010,10001,10001,11111',
    '∞': '00000,00000,01010,10101,10101,01010,00000',
    '$': '00100,01111,10100,01110,00101,11110,00100',
    '@': '01110,10001,10111,10101,10111,10000,01110'
  };
  const SUP = {
    '⁰': '111,101,101,101,111', '¹': '010,110,010,010,111', '²': '111,001,111,100,111',
    '³': '111,001,111,001,111', '⁴': '101,101,111,001,001', '⁵': '111,100,111,001,111',
    '⁶': '111,100,111,101,111', '⁷': '111,001,010,010,010', '⁸': '111,101,111,101,111',
    '⁹': '111,101,111,001,111'
  };
  const ACC = {
    acute: ['00010', '00100'], grave: ['01000', '00100'], circ: ['00100', '01010'],
    tilde: ['01101', '10110'], diaer: ['01010', '00000']
  };
  const COMP = {
    'Á': ['A', 'acute'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ã': ['A', 'tilde'],
    'É': ['E', 'acute'], 'Ê': ['E', 'circ'], 'Í': ['I', 'acute'], 'Ó': ['O', 'acute'],
    'Ô': ['O', 'circ'], 'Õ': ['O', 'tilde'], 'Ú': ['U', 'acute'], 'Ü': ['U', 'diaer'],
    'Ç': ['C', 'cedil']
  };
  const NARROW = ".,:;!'()|•°[]";
  const ALIAS = { '−': '-', '–': '-', '—': '-', '·': '•', 'º': '°', 'ª': '°', '\u00a0': ' ' };
  const CW = 6, CH = 10;

  let atlas = null;
  const map = {};
  const tintCache = {};
  const logoCache = {};

  function build() {
    if (atlas) return;
    const chars = Object.keys(RAW).concat(Object.keys(SUP), Object.keys(COMP));
    atlas = PR.U.canvas(chars.length * CW, CH);
    const c = atlas.getContext('2d');
    c.fillStyle = '#fff';
    chars.forEach((ch, i) => {
      const ox = i * CW;
      let rows;
      if (RAW[ch]) rows = RAW[ch].split(',');
      else if (SUP[ch]) rows = SUP[ch].split(',');
      else {
        const base = COMP[ch][0], acc = COMP[ch][1];
        rows = RAW[base].split(',');
        if (acc === 'cedil') { c.fillRect(ox + 2, 9, 1, 1); c.fillRect(ox + 1, 9, 1, 1); }
        else ACC[acc].forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '1') c.fillRect(ox + x, y, 1, 1); });
      }
      let minX = 9, maxX = -1;
      rows.forEach((r, y) => {
        for (let x = 0; x < r.length; x++) if (r[x] === '1') {
          c.fillRect(ox + x, 2 + y, 1, 1);
          if (x < minX) minX = x; if (x > maxX) maxX = x;
        }
      });
      let sx = 0, w = 5;
      if (ch === ' ') w = 3;
      else if (NARROW.indexOf(ch) >= 0 || SUP[ch]) { sx = minX; w = maxX - minX + 1; }
      map[ch] = { x: ox + sx, w };
    });
  }

  function tinted(color) {
    let t = tintCache[color];
    if (t) return t;
    t = PR.U.canvas(atlas.width, atlas.height);
    const c = t.getContext('2d');
    c.drawImage(atlas, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = color;
    c.fillRect(0, 0, t.width, t.height);
    tintCache[color] = t;
    return t;
  }

  function glyph(ch) {
    const a = ALIAS[ch] || ch;
    return map[a] || map['?'];
  }

  function measure(str, s) {
    s = s || 1;
    str = String(str).toUpperCase();
    let w = 0;
    for (const ch of str) w += (glyph(ch).w + 1) * s;
    return w > 0 ? w - s : 0;
  }

  function drawRaw(ctx, str, x, y, color, s) {
    const img = tinted(color);
    let cx = x;
    for (const ch of str) {
      const g = glyph(ch);
      ctx.drawImage(img, g.x, 0, g.w, CH, cx, y - 2 * s, g.w * s, CH * s);
      cx += (g.w + 1) * s;
    }
  }

  /* opções: color, scale, align ('left'|'center'|'right'), shadow (cor|true), outline (cor), alpha */
  function text(ctx, str, x, y, o) {
    o = o || {};
    if (!atlas) build();
    const s = o.scale || 1;
    str = String(str).toUpperCase();
    let px = Math.round(x), py = Math.round(y);
    if (o.align === 'center') px = Math.round(x - measure(str, s) / 2);
    else if (o.align === 'right') px = Math.round(x - measure(str, s));
    const prevA = ctx.globalAlpha;
    if (o.alpha !== undefined) ctx.globalAlpha = prevA * o.alpha;
    if (o.outline) {
      const oc = o.outline, d = o.outlineW || Math.max(1, Math.floor(s / 2));
      drawRaw(ctx, str, px - d, py, oc, s); drawRaw(ctx, str, px + d, py, oc, s);
      drawRaw(ctx, str, px, py - d, oc, s); drawRaw(ctx, str, px, py + d, oc, s);
      drawRaw(ctx, str, px + d, py + d, oc, s);
    }
    if (o.shadow) drawRaw(ctx, str, px + Math.max(1, s >> 1), py + Math.max(1, s >> 1), o.shadow === true ? '#000000' : o.shadow, s);
    drawRaw(ctx, str, px, py, o.color || '#ffffff', s);
    ctx.globalAlpha = prevA;
    return measure(str, s);
  }

  function wrap(str, maxW, s) {
    const words = String(str).toUpperCase().split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (measure(t, s) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /* Logotipo: gradiente vertical, contorno, extrusão 3D e itálico (skew) — resultado em cache */
  function logo(str, s, stops, o) {
    o = o || {};
    const key = [str, s, stops.join('|'), o.skew, o.extrude, o.outline].join('#');
    if (logoCache[key]) return logoCache[key];
    if (!atlas) build();
    str = String(str).toUpperCase();
    const tw = measure(str, s), th = 7 * s;
    const pad = s * 2, ext = o.extrude || 0;
    const W = tw + pad * 2, H = th + pad * 2 + ext;
    const mask = PR.U.canvas(W, H);
    drawRaw(mask.getContext('2d'), str, pad, pad, '#ffffff', s);
    const tint = (col) => {
      const c = PR.U.canvas(W, H), x = c.getContext('2d');
      x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-in';
      x.fillStyle = col; x.fillRect(0, 0, W, H); return c;
    };
    const comp = PR.U.canvas(W, H), cx = comp.getContext('2d');
    if (ext) { const dark = tint(o.extrudeColor || '#1a0630'); for (let i = ext; i >= 1; i--) cx.drawImage(dark, 0, i); }
    if (o.outline) {
      const ol = tint(o.outline), d = Math.max(1, Math.floor(s / 3));
      for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d]]) cx.drawImage(ol, dx, dy);
    }
    const grad = PR.U.canvas(W, H), gx = grad.getContext('2d');
    gx.drawImage(mask, 0, 0);
    gx.globalCompositeOperation = 'source-in';
    const lg = gx.createLinearGradient(0, pad, 0, pad + th);
    stops.forEach((c, i) => lg.addColorStop(i / (stops.length - 1), c));
    gx.fillStyle = lg; gx.fillRect(0, 0, W, H);
    // faixa de brilho horizontal (estilo cromado arcade)
    gx.fillStyle = 'rgba(255,255,255,0.55)';
    gx.fillRect(0, pad + Math.floor(th * 0.28), W, Math.max(1, Math.floor(s / 2)));
    cx.drawImage(grad, 0, 0);
    let out = comp;
    if (o.skew) {
      const sk = o.skew, extra = Math.ceil(H * sk);
      out = PR.U.canvas(W + extra, H);
      const ox = out.getContext('2d');
      for (let y = 0; y < H; y++) ox.drawImage(comp, 0, y, W, 1, Math.round((H - y) * sk), y, W, 1);
    }
    logoCache[key] = out;
    return out;
  }

  PR.Font = { build, text, measure, wrap, logo, tinted: (c) => { if (!atlas) build(); return tinted(c); } };
})();

