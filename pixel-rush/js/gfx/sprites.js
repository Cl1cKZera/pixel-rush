(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const S = {
    cache: {},
    ready: false
  };

  function makeHeroConvertible(wheelFrame, steer, nitroMode) {
    const c = U.canvas(116, 52);
    const x = c.getContext('2d');
    const sx = steer * 2;

    x.fillStyle = 'rgba(0, 0, 0, 0.65)';
    x.fillRect(8, 43, 100, 7);
    if (nitroMode) {
      x.fillStyle = 'rgba(0, 245, 212, 0.35)';
      x.fillRect(10, 44, 96, 6);
    }

    const tr = wheelFrame ? 1 : 0;
    x.fillStyle = '#090b10';
    x.fillRect(11, 35, 22, 13);
    x.fillRect(83, 35, 22, 13);
    x.fillStyle = '#252a38';
    for (let py = 37; py < 46; py += 2) {
      for (let px = 13 + ((py + tr) & 1) * 2; px < 31; px += 4) {
        x.fillRect(px, py, 2, 2);
        x.fillRect(px + 72, py, 2, 2);
      }
    }
    x.fillStyle = '#141824';
    x.fillRect(104, 26, 5, 16);
    x.fillStyle = '#6c757d';
    x.fillRect(106, 29, 2, 10);

    x.fillStyle = '#a4161a';
    x.fillRect(26 + sx, 8, 64, 2);
    x.fillStyle = '#660708';
    for (let i = 0; i < 9; i++) {
      x.fillRect(26 + sx - i, 10 + i, 3, 2);
      x.fillRect(88 + sx + i, 10 + i, 3, 2);
    }
    x.fillStyle = 'rgba(144, 224, 239, 0.28)';
    x.fillRect(26 + sx, 10, 64, 8);
    x.fillStyle = '#161a1d';
    x.fillRect(54 + sx, 10, 8, 2);

    x.fillStyle = '#3d2314';
    x.fillRect(38 + sx, 4, 11, 8);
    x.fillStyle = '#5c3822';
    x.fillRect(39 + sx, 3, 9, 6);
    x.fillStyle = '#7f4f24';
    x.fillRect(41 + sx, 4, 5, 3);
    x.fillStyle = '#e0ac69';
    x.fillRect(41 + sx, 11, 7, 4);
    x.fillStyle = '#adc178';
    x.fillRect(36 + sx, 14, 16, 4);

    const hw = wheelFrame ? 1 : 0;
    x.fillStyle = '#b68938';
    x.fillRect(67 + sx, 5, 14 + hw, 10);
    x.fillStyle = '#e9c46a';
    x.fillRect(68 + sx, 4, 11 + hw, 8);
    x.fillStyle = '#fff3b0';
    x.fillRect(70 + sx, 5, 6, 4);
    x.fillStyle = '#f4a261';
    x.fillRect(69 + sx, 12, 8, 4);
    x.fillStyle = '#ff007f';
    x.fillRect(66 + sx, 15, 14, 3);

    x.fillStyle = '#343a40';
    x.fillRect(34 + sx, 16, 48, 7);
    x.fillStyle = '#6c757d';
    x.fillRect(38 + sx, 17, 40, 5);
    x.fillStyle = '#adb5bd';
    x.fillRect(44 + sx, 18, 24, 3);
    x.fillStyle = '#212529';
    for (let gx = 40 + sx; gx < 76 + sx; gx += 6) {
      x.fillRect(gx, 17, 2, 4);
    }

    x.fillStyle = '#660708';
    x.fillRect(8, 21, 100, 22);
    x.fillStyle = '#a4161a';
    x.fillRect(10, 19, 96, 20);
    x.fillStyle = '#d90429';
    x.fillRect(12, 18, 92, 10);

    x.fillStyle = '#a4161a';
    x.fillRect(12 + sx, 14, 7, 4);
    x.fillRect(97 + sx, 14, 7, 4);
    x.fillStyle = '#ef233c';
    x.fillRect(13 + sx, 14, 5, 2);
    x.fillRect(98 + sx, 14, 5, 2);

    x.fillStyle = '#ef233c';
    x.fillRect(12, 19, 92, 3);
    x.fillStyle = '#ff758f';
    x.fillRect(16, 19, 84, 1);
    x.fillStyle = '#1b0912';
    x.fillRect(20, 22, 76, 3);

    x.fillStyle = '#0b0c10';
    x.fillRect(16, 27, 84, 9);
    x.fillStyle = '#2b303c';
    for (let gy = 28; gy <= 34; gy += 2) {
      for (let gx = 18 + (gy & 2 ? 1 : 0); gx < 98; gx += 3) {
        x.fillRect(gx, gy, 1, 1);
      }
    }

    U.pcirc(x, 26, 31, 3, '#ff002b');
    U.pcirc(x, 26, 31, 1, '#ffb3c1');
    U.pcirc(x, 35, 31, 3, '#ff4800');
    U.pcirc(x, 35, 31, 1, '#ffe5ec');

    U.pcirc(x, 81, 31, 3, '#ff4800');
    U.pcirc(x, 81, 31, 1, '#ffe5ec');
    U.pcirc(x, 90, 31, 3, '#ff002b');
    U.pcirc(x, 90, 31, 1, '#ffb3c1');

    x.fillStyle = '#6c757d';
    x.fillRect(49, 29, 18, 6);
    x.fillStyle = '#adb5bd';
    x.fillRect(50, 30, 16, 4);

    x.fillStyle = '#800f2f';
    x.fillRect(10, 36, 96, 4);
    x.fillStyle = '#4a051c';
    x.fillRect(12, 40, 92, 3);

    x.fillStyle = '#0b0c10';
    x.fillRect(48, 39, 20, 4);
    x.fillStyle = '#dee2e6';
    x.fillRect(50, 40, 3, 2);
    x.fillRect(55, 40, 3, 2);
    x.fillRect(60, 40, 3, 2);
    x.fillRect(65, 40, 2, 2);

    if (nitroMode) {
      const fh = wheelFrame ? 8 : 5;
      for (const ex of [50, 56, 62]) {
        x.fillStyle = '#ff007f';
        x.fillRect(ex - 1, 42, 5, fh);
        x.fillStyle = '#00f5d4';
        x.fillRect(ex, 42, 3, fh - 2);
      }
    }

    return c;
  }

  function makeTrafficCar3D(theme, isPolice, wheelFrame) {
    const c = U.canvas(92, 44);
    const x = c.getContext('2d');

    x.fillStyle = 'rgba(0,0,0,0.6)';
    x.fillRect(8, 36, 76, 6);

    x.fillStyle = '#0d0f17';
    x.fillRect(10, 28, 16, 12);
    x.fillRect(66, 28, 16, 12);
    x.fillStyle = '#262b3d';
    const tr = wheelFrame ? 1 : 0;
    for (let py = 30 + tr; py < 38; py += 3) {
      x.fillRect(12, py, 12, 2);
      x.fillRect(68, py, 12, 2);
    }

    x.fillStyle = theme.dark;
    x.fillRect(20, 5, 52, 13);
    x.fillStyle = theme.body;
    x.fillRect(23, 4, 46, 3);
    x.fillStyle = '#141b2d';
    x.fillRect(23, 7, 46, 9);
    x.fillStyle = '#48cae4';
    x.fillRect(26, 8, 14, 2);
    x.fillRect(24, 10, 10, 2);

    x.fillStyle = theme.dark;
    x.fillRect(8, 17, 76, 16);
    x.fillStyle = theme.body;
    x.fillRect(10, 15, 72, 12);
    x.fillStyle = theme.trim;
    x.fillRect(12, 15, 68, 2);

    x.fillStyle = '#0d101a';
    x.fillRect(14, 20, 64, 7);
    U.pcirc(x, 21, 23, 2, '#ff002b');
    U.pcirc(x, 28, 23, 2, '#ff5400');
    U.pcirc(x, 64, 23, 2, '#ff5400');
    U.pcirc(x, 71, 23, 2, '#ff002b');

    x.fillStyle = '#adb5bd';
    x.fillRect(40, 21, 12, 5);

    x.fillStyle = '#ced4da';
    x.fillRect(22, 31, 5, 2);
    x.fillRect(65, 31, 5, 2);

    if (isPolice) {
      x.fillStyle = '#111622';
      x.fillRect(28, 1, 36, 4);
      x.fillStyle = wheelFrame ? '#ff0055' : '#00bbf9';
      x.fillRect(29, 1, 15, 3);
      x.fillStyle = wheelFrame ? '#00bbf9' : '#ff0055';
      x.fillRect(48, 1, 15, 3);
      x.fillStyle = '#ffffff';
      x.fillRect(44, 1, 4, 3);
    }

    return c;
  }

  function makeTruck3D(isTanker) {
    const c = U.canvas(96, 74);
    const x = c.getContext('2d');

    x.fillStyle = 'rgba(0,0,0,0.65)';
    x.fillRect(10, 64, 76, 8);

    x.fillStyle = '#0e111a';
    x.fillRect(12, 50, 18, 18);
    x.fillRect(66, 50, 18, 18);

    if (isTanker) {
      x.fillStyle = '#343a40';
      x.fillRect(12, 8, 72, 44);
      x.fillStyle = '#adb5bd';
      x.fillRect(16, 6, 64, 44);
      x.fillStyle = '#f8f9fa';
      x.fillRect(30, 6, 36, 12);
      x.fillStyle = '#ff007f';
      x.fillRect(12, 28, 72, 6);
    } else {
      x.fillStyle = '#161b33';
      x.fillRect(10, 4, 76, 48);
      x.fillStyle = '#232b4e';
      x.fillRect(14, 8, 68, 40);
      x.strokeStyle = '#00f5d4';
      x.lineWidth = 2;
      x.strokeRect(11, 5, 74, 46);
      PR.Font.text(x, 'VICE•MATH', 48, 24, { color: '#ffd60a', scale: 1, align: 'center', shadow: '#000' });
    }

    x.fillStyle = '#1f2438';
    x.fillRect(10, 52, 76, 8);
    x.fillStyle = '#ff0055';
    x.fillRect(14, 54, 16, 4);
    x.fillRect(66, 54, 16, 4);
    x.fillStyle = '#ffd60a';
    x.fillRect(38, 54, 20, 4);

    return c;
  }

  function makeStreetlight3D() {
    const c = U.canvas(44, 114);
    const x = c.getContext('2d');

    U.pcirc(x, 22, 22, 19, 'rgba(255, 230, 90, 0.16)');
    U.pcirc(x, 22, 22, 13, 'rgba(255, 240, 140, 0.34)');
    U.pcirc(x, 22, 22, 8, 'rgba(255, 250, 190, 0.75)');
    U.pcirc(x, 22, 22, 4, '#ffffff');

    x.fillStyle = '#4a6fa5';
    x.fillRect(20, 28, 4, 76);
    x.fillStyle = '#98c1d9';
    x.fillRect(21, 28, 1, 76);

    x.fillStyle = '#293241';
    x.fillRect(16, 100, 12, 12);
    x.fillStyle = '#4a6fa5';
    x.fillRect(18, 95, 8, 7);
    x.fillStyle = '#98c1d9';
    x.fillRect(19, 96, 2, 13);

    return c;
  }

  function makePalm3D() {
    const c = U.canvas(92, 132);
    const x = c.getContext('2d');

    for (let y = 36; y < 128; y += 3) {
      const t = (y - 36) / 92;
      const curve = Math.round(Math.sin(t * Math.PI * 0.9) * 8);
      const w = Math.round(5 + t * 4);
      const tx = 44 + curve - (w >> 1);
      x.fillStyle = '#2b192e';
      x.fillRect(tx, y, w, 3);
      x.fillStyle = '#ff2a85';
      x.fillRect(tx, y, 2, 2);
      x.fillStyle = '#6c3b5e';
      x.fillRect(tx + 2, y + 1, Math.max(1, w - 3), 1);
    }

    U.pcirc(x, 45, 36, 5, '#1d1128');

    const fronds = [

      [-38, 4, 10, 4], [-32, -2, 12, 4], [-22, -6, 18, 4],
      [-34, -12, 12, 4], [-24, -18, 20, 4],
      [-18, -26, 16, 4], [-8, -30, 16, 4],
      [-28, 12, 16, 3], [-16, 6, 14, 3],

      [6, -6, 18, 4], [20, -2, 12, 4], [28, 4, 10, 4],
      [6, -18, 20, 4], [22, -12, 12, 4],
      [4, -26, 16, 4],
      [4, 6, 14, 3], [14, 12, 16, 3]
    ];
    for (const [dx, dy, w, h] of fronds) {
      x.fillStyle = '#140c2c';
      x.fillRect(45 + dx, 36 + dy + 2, w, h + 1);
      x.fillStyle = '#00b4d8';
      x.fillRect(45 + dx, 36 + dy, w, h);
      x.fillStyle = '#72efdd';
      x.fillRect(46 + dx, 36 + dy, Math.max(2, w - 2), 1);

      for (let fx = 46 + dx; fx < 45 + dx + w; fx += 3) {
        x.fillStyle = '#0077b6';
        x.fillRect(fx, 36 + dy + h, 1, 3);
      }
    }

    return c;
  }

  function makeViceBillboard(variant) {
    const c = U.canvas(88, 76);
    const x = c.getContext('2d');

    x.fillStyle = '#22273b';
    x.fillRect(20, 42, 6, 34);
    x.fillRect(62, 42, 6, 34);
    x.fillStyle = '#4a5578';
    x.fillRect(21, 42, 2, 34);
    x.fillRect(63, 42, 2, 34);

    x.fillStyle = '#141829';
    x.fillRect(6, 40, 76, 4);
    x.fillStyle = '#ffd166';
    x.fillRect(18, 38, 6, 2);
    x.fillRect(41, 38, 6, 2);
    x.fillRect(64, 38, 6, 2);

    const borderCol = variant === 0 ? '#ff007f' : '#00f5d4';
    x.fillStyle = '#0c0820';
    x.fillRect(4, 6, 80, 34);

    const grad = x.createLinearGradient(4, 6, 84, 40);
    if (variant === 0) {
      grad.addColorStop(0, '#3c096c');
      grad.addColorStop(0.6, '#b5179e');
      grad.addColorStop(1, '#ff6b6b');
    } else {
      grad.addColorStop(0, '#10002b');
      grad.addColorStop(0.6, '#7209b7');
      grad.addColorStop(1, '#00bbf9');
    }
    x.fillStyle = grad;
    x.fillRect(6, 8, 76, 30);

    x.strokeStyle = borderCol;
    x.lineWidth = 2;
    x.strokeRect(5, 7, 78, 32);

    if (variant === 0) {
      PR.Font.text(x, 'VICE CITY', 44, 12, { color: '#ffd60a', scale: 1, align: 'center', shadow: '#000' });
      PR.Font.text(x, 'LEONIDA•VI', 44, 24, { color: '#ffffff', scale: 1, align: 'center', shadow: '#000' });
    } else {
      PR.Font.text(x, '5° ADS • VIP', 44, 12, { color: '#00f5d4', scale: 1, align: 'center', shadow: '#000' });
      PR.Font.text(x, 'MATH DRIVE', 44, 24, { color: '#ffd60a', scale: 1, align: 'center', shadow: '#000' });
    }

    return c;
  }

  function makeArtDecoHotel() {
    const c = U.canvas(76, 128);
    const x = c.getContext('2d');

    x.fillStyle = '#1b1435';
    x.fillRect(6, 14, 64, 114);
    x.fillStyle = '#261c47';
    x.fillRect(12, 8, 52, 120);

    x.fillStyle = '#ff007f';
    x.fillRect(6, 14, 2, 114);
    x.fillRect(66, 14, 2, 114);
    x.fillRect(12, 8, 52, 2);
    x.fillRect(12, 24, 52, 2);

    x.fillStyle = '#00f5d4';
    x.fillRect(18, 12, 2, 116);
    x.fillRect(56, 12, 2, 116);

    PR.Font.text(x, 'VICE', 38, 13, { color: '#ffd60a', scale: 1, align: 'center', shadow: '#ff007f' });

    for (let wy = 32; wy < 116; wy += 14) {
      x.fillStyle = (wy % 28 === 0) ? '#ff70a6' : '#48cae4';
      x.fillRect(24, wy, 10, 8);
      x.fillRect(42, wy, 10, 8);
      x.fillStyle = '#ffffff';
      x.fillRect(25, wy + 1, 8, 2);
      x.fillRect(43, wy + 1, 8, 2);
    }

    return c;
  }

  function makeCurveSign(dir) {
    const c = U.canvas(32, 48);
    const x = c.getContext('2d');
    x.fillStyle = '#495057';
    x.fillRect(14, 24, 4, 24);
    x.fillStyle = '#ffffff';
    x.fillRect(2, 2, 28, 24);
    x.fillStyle = '#1d3557';
    x.fillRect(4, 4, 24, 20);
    x.fillStyle = '#ffffff';
    x.fillRect(14, 12, 4, 9);
    if (dir > 0) {
      x.fillRect(14, 9, 9, 4);
      x.fillRect(20, 6, 3, 10);
    } else {
      x.fillRect(9, 9, 9, 4);
      x.fillRect(9, 6, 3, 10);
    }
    return c;
  }

  function makeObstaclesAndItems() {
    const bar = U.canvas(42, 20);
    const bx = bar.getContext('2d');
    bx.fillStyle = '#2b2d42';
    bx.fillRect(2, 4, 38, 14);
    for (let i = 0; i < 36; i += 6) {
      bx.fillStyle = '#ffbe0b';
      bx.fillRect(3 + i, 6, 3, 10);
      bx.fillStyle = '#141622';
      bx.fillRect(6 + i, 6, 3, 10);
    }
    bx.fillStyle = '#ff0055';
    bx.fillRect(3, 1, 6, 3);
    bx.fillRect(33, 1, 6, 3);
    S.cache.barrier = bar;

    const cone = U.canvas(20, 20);
    const cx = cone.getContext('2d');
    cx.fillStyle = '#ff5400';
    cx.fillRect(8, 2, 4, 4);
    cx.fillRect(6, 6, 8, 6);
    cx.fillRect(4, 12, 12, 4);
    cx.fillStyle = '#ffffff';
    cx.fillRect(6, 8, 8, 2);
    cx.fillStyle = '#3d1e05';
    cx.fillRect(2, 16, 16, 3);
    S.cache.cone = cone;

    const oil = U.canvas(34, 16);
    const ox = oil.getContext('2d');
    U.pcirc(ox, 17, 8, 7, '#0b0914');
    ox.fillStyle = '#7209b7';
    ox.fillRect(8, 6, 18, 3);
    ox.fillStyle = '#00f5d4';
    ox.fillRect(11, 8, 12, 2);
    S.cache.oil = oil;

    S.cache.mine = [0, 1].map((f) => {
      const m = U.canvas(22, 22);
      const mx = m.getContext('2d');
      U.pcirc(mx, 11, 11, 9, '#1f2438');
      U.pcirc(mx, 11, 11, 5, f ? '#ff0055' : '#ffbe0b');
      mx.fillStyle = '#ffffff';
      mx.fillRect(10, 10, 2, 2);
      return m;
    });

    const widths = [16, 12, 8, 4, 8, 12];
    S.cache.coin = widths.map((w) => {
      const c = U.canvas(20, 20);
      const x = c.getContext('2d');
      const ox2 = Math.floor((20 - w) / 2);
      x.fillStyle = '#ff9e00';
      x.fillRect(ox2, 2, w, 16);
      if (w >= 8) {
        x.fillStyle = '#ffd60a';
        x.fillRect(ox2 + 1, 3, w - 2, 14);
      }
      if (w >= 12) {
        x.fillStyle = '#c97100';
        x.fillRect(9, 6, 2, 8);
        x.fillRect(6, 9, 8, 2);
      }
      return c;
    });

    const fuel = U.canvas(24, 26);
    const fx = fuel.getContext('2d');
    fx.fillStyle = '#ffbe0b';
    fx.fillRect(5, 2, 5, 3);
    fx.fillStyle = '#d90429';
    fx.fillRect(3, 5, 18, 19);
    fx.fillStyle = '#ef233c';
    fx.fillRect(4, 6, 16, 17);
    PR.Font.text(fx, '%', 12, 12, { color: '#ffffff', scale: 1, align: 'center', shadow: '#6a040f' });
    S.cache.fuel = fuel;

    const nitro = U.canvas(22, 26);
    const nx = nitro.getContext('2d');
    nx.fillStyle = '#ff007f';
    nx.fillRect(8, 1, 6, 3);
    nx.fillStyle = '#0077b6';
    nx.fillRect(4, 5, 14, 19);
    nx.fillStyle = '#00f5d4';
    nx.fillRect(5, 6, 12, 17);
    nx.fillStyle = '#ff007f';
    nx.fillRect(4, 12, 14, 4);
    S.cache.nitro = nitro;

    const sh = U.canvas(22, 22);
    const sx = sh.getContext('2d');
    U.pcirc(sx, 11, 11, 9, '#38b000');
    U.pcirc(sx, 11, 11, 7, '#70e000');
    PR.Font.text(sx, '+', 11, 8, { color: '#ffffff', scale: 1, align: 'center', shadow: '#004b23' });
    S.cache.shield = sh;
  }

  S.init = function () {
    if (S.ready) return;
    PR.Font.build();

    S.cache.player = {};
    for (const wf of [0, 1]) {
      for (const st of [-1, 0, 1]) {
        for (const ni of [0, 1]) {
          S.cache.player[wf + '_' + st + '_' + ni] = makeHeroConvertible(wf, st, ni === 1);
        }
      }
    }
    S.cache.menuCar = [
      S.cache.player['0_0_1'],
      S.cache.player['1_0_1']
    ];

    const themes = [
      { body: '#9e2a2b', dark: '#540b0e', trim: '#e09f3e' },
      { body: '#b5179e', dark: '#560bad', trim: '#ff70a6' },
      { body: '#0096c7', dark: '#023e8a', trim: '#90e0ef' },
      { body: '#f77f00', dark: '#9d0208', trim: '#fcbf49' },
      { body: '#38b000', dark: '#004b23', trim: '#9ef01a' },
      { body: '#7209b7', dark: '#240046', trim: '#c77dff' }
    ];
    const carsList = themes.map((th) => [
      makeTrafficCar3D(th, false, 0),
      makeTrafficCar3D(th, false, 1)
    ]);
    S.cache.cars = {
      coupe: carsList,
      muscle: carsList,
      sedan: carsList,
      police: [[
        makeTrafficCar3D({ body: '#1d2d44', dark: '#0d1321', trim: '#ffffff' }, true, 0),
        makeTrafficCar3D({ body: '#1d2d44', dark: '#0d1321', trim: '#ffffff' }, true, 1)
      ]],
      taxi: [[
        makeTrafficCar3D({ body: '#e9c46a', dark: '#b07d2b', trim: '#fff3b0' }, false, 0),
        makeTrafficCar3D({ body: '#e9c46a', dark: '#b07d2b', trim: '#fff3b0' }, false, 1)
      ]]
    };

    S.cache.trucks = {
      cargo: [makeTruck3D(false), makeTruck3D(false)],
      tanker: [makeTruck3D(true), makeTruck3D(true)]
    };

    S.cache.streetlight = makeStreetlight3D();
    S.cache.palm3D = makePalm3D();
    S.cache.billboards3D = [makeViceBillboard(0), makeViceBillboard(1)];
    S.cache.hotel3D = makeArtDecoHotel();
    S.cache.signRight = makeCurveSign(1);
    S.cache.signLeft = makeCurveSign(-1);

    makeObstaclesAndItems();
    S.ready = true;
  };

  S.getPlayer = function (wheelFrame, bank, nitro) {
    const key = (wheelFrame & 1) + '_' + U.clamp(Math.round(bank), -1, 1) + '_' + (nitro ? 1 : 0);
    return S.cache.player[key] || S.cache.player['0_0_0'];
  };

  PR.Sprites = S;
})();
