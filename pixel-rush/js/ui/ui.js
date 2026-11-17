(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const CREDITS_ROTATION = [
    { text: 'DESENVOLVIDO POR ARTUR GUIMARÃES', col: '#00f5d4' },
    { text: 'FATEC | 5º SEMESTRE – ADS',        col: '#ffd60a' },
    { text: 'COLAB.: WENDER CORSI',             col: '#ff70a6' },
    { text: 'COLAB.: JOÃO P. CAVALLI',          col: '#90e0ef' },
    { text: 'COLAB.: HEITOR RUBI',              col: '#70e000' },
    { text: 'COLAB.: PEDRO CARVALHO',           col: '#ffd60a' }
  ];

  const UI = {
    hoverId: null,
    menuSelected: 0,
    pauseSelected: 0,
    resultsSelected: 0,
    animTime: 0,

    getRotatingCredit() {
      const clock = (typeof performance !== 'undefined' ? performance.now() * 0.001 : 0) + this.animTime * 0.5;
      const idx = Math.floor(clock / 2.6) % CREDITS_ROTATION.length;
      return CREDITS_ROTATION[idx];
    },

    panel(ctx, x, y, w, h, borderCol, bgAlpha) {
      ctx.fillStyle = 'rgba(10, 8, 26, ' + (bgAlpha !== undefined ? bgAlpha : 0.88) + ')';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = borderCol || '#00f5d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = borderCol || '#00f5d4';
      ctx.fillRect(x, y, 3, 3);
      ctx.fillRect(x + w - 3, y, 3, 3);
      ctx.fillRect(x, y + h - 3, 3, 3);
      ctx.fillRect(x + w - 3, y + h - 3, 3, 3);
    },

    arcadeBadge(ctx, text, x, y, w, h, bgCol, textCol) {
      ctx.fillStyle = '#05050c';
      ctx.fillRect(x + 2, y + 2, w, h);
      ctx.fillStyle = '#e0fbfc';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = bgCol || '#1f243a';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      PR.Font.text(ctx, text, x + w / 2, y + Math.floor((h - 7) / 2), {
        color: textCol || '#ffffff',
        scale: 1,
        align: 'center',
        shadow: '#000'
      });
    },

    button(ctx, id, label, x, y, w, h, opts) {
      opts = opts || {};
      const m = PR.Input.mouse;
      const isMouseOver = m.x >= x && m.x < x + w && m.y >= y && m.y < y + h;
      if (isMouseOver && this.hoverId !== id) {
        this.hoverId = id;
        PR.Audio.sfx('hover');
      }
      const active = isMouseOver || opts.selected;
      const col = opts.color || '#00f5d4';
      const fill = active ? U.rgba(col, 0.34) : 'rgba(14, 12, 34, 0.92)';

      ctx.fillStyle = '#04050c';
      ctx.fillRect(x + 2, y + 2, w, h);

      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = active ? '#ffffff' : col;
      ctx.lineWidth = active ? 2 : 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      if (active) {
        PR.Font.text(ctx, '►', x + 8, y + Math.floor((h - 7 * (opts.scale || 1)) / 2), {
          color: '#ffd60a',
          scale: opts.scale || 1
        });
      }

      const sc = opts.scale || 1;
      PR.Font.text(ctx, label, x + w / 2, y + Math.floor((h - 7 * sc) / 2), {
        color: active ? '#ffffff' : (opts.textColor || '#e0fbfc'),
        scale: sc,
        align: 'center',
        shadow: '#04050c'
      });

      return { hovered: isMouseOver, clicked: isMouseOver && m.clicked };
    },

    bar(ctx, x, y, w, h, ratio, col, bgCol) {
      ratio = U.clamp(ratio, 0, 1);
      ctx.fillStyle = bgCol || '#090c1a';
      ctx.fillRect(x, y, w, h);
      const fw = Math.round((w - 2) * ratio);
      if (fw > 0) {
        ctx.fillStyle = col;
        ctx.fillRect(x + 1, y + 1, fw, h - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x + 1, y + 1, fw, Math.max(1, Math.floor((h - 2) * 0.35)));
      }
      ctx.strokeStyle = '#3a4168';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    },

    drawAnalogGauge(ctx, cx, cy, r, ratio, label, subLabel, redlineStart, numLabels) {
      ratio = U.clamp(ratio, 0, 1);

      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#5c677d';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 14, 24, 0.92)';
      ctx.fill();

      const a0 = Math.PI * 0.75;
      const a1 = Math.PI * 2.25;

      if (redlineStart !== undefined) {
        ctx.beginPath();
        if (redlineStart >= 0) {
          ctx.arc(cx, cy, r - 3, a0 + (a1 - a0) * redlineStart, a1);
        } else {

          ctx.arc(cx, cy, r - 3, a0, a0 + (a1 - a0) * Math.abs(redlineStart));
        }
        ctx.strokeStyle = '#ef233c';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      const ticks = 18;
      for (let i = 0; i <= ticks; i++) {
        const t = i / ticks;
        const ang = a0 + (a1 - a0) * t;
        const isMajor = (i % 3) === 0;
        const rIn = r - (isMajor ? 6 : 4);
        const rOut = r - 1;
        ctx.strokeStyle = (redlineStart > 0 && t >= redlineStart) ? '#ff0055' : '#e0fbfc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
        ctx.lineTo(cx + Math.cos(ang) * rOut, cy + Math.sin(ang) * rOut);
        ctx.stroke();
      }

      if (label) {
        PR.Font.text(ctx, label, cx, cy - 8, {
          color: '#90e0ef',
          scale: 1,
          align: 'center'
        });
      }
      if (subLabel) {
        PR.Font.text(ctx, subLabel, cx, cy + Math.floor(r * 0.38), {
          color: '#ffd60a',
          scale: 1,
          align: 'center',
          shadow: '#000'
        });
      }

      const needleAng = a0 + (a1 - a0) * ratio;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(needleAng) * 4, cy - Math.sin(needleAng) * 4);
      ctx.lineTo(cx + Math.cos(needleAng) * (r - 5), cy + Math.sin(needleAng) * (r - 5));
      ctx.stroke();

      U.pcirc(ctx, cx, cy, 2, '#ff007f');
    },

    drawMenu(ctx, game, dt) {
      this.animTime += dt;
      const W = PR.CFG.W, H = PR.CFG.H;

      PR.Background.drawMenuBackdrop(ctx, this.animTime);

      this.panel(ctx, 12, 8, 232, 22, '#ffd60a', 0.88);
      const best = PR.Storage.best();
      PR.Font.text(ctx, '★ RECORDE: ' + U.fmtInt(best) + ' PTS', 20, 16, {
        color: '#ffd60a',
        scale: 1,
        shadow: '#000'
      });

      const muted = PR.Storage.settings.muted;
      const muteBtn = this.button(ctx, 'menu_mute', muted ? 'SOM: MUDO [M]' : 'SOM: ATIVO [M]', W - 124, 8, 112, 22, {
        color: muted ? '#ff0055' : '#00f5d4'
      });
      if (muteBtn.clicked) {
        PR.Audio.toggleMute();
        PR.Audio.sfx('click');
      }

      const logoImg = PR.Font.logo('PIXEL RUSH', 4, ['#00f5d4', '#ffffff', '#ff007f', '#ff9e00'], {
        extrude: 4,
        extrudeColor: '#240046',
        outline: '#050312',
        skew: 0.14
      });
      const logoBob = Math.round(Math.sin(this.animTime * 2.6) * 2);
      ctx.drawImage(logoImg, Math.round((W - logoImg.width) / 2), 26 + logoBob);

      this.panel(ctx, W / 2 - 156, 74, 312, 18, '#ff007f', 0.92);
      PR.Font.text(ctx, '🌴 MATHEMATICS OVERDRIVE • VICE EDITION 🌴', W / 2, 80, {
        color: '#00f5d4',
        scale: 1,
        align: 'center',
        shadow: '#000000'
      });

      const carFrame = Math.floor(this.animTime * 14) % 2;
      const carOscX = Math.round(Math.sin(this.animTime * 1.6) * 22);
      const steer = Math.cos(this.animTime * 1.6) > 0.35 ? 1 : Math.cos(this.animTime * 1.6) < -0.35 ? -1 : 0;
      const heroImg = PR.Sprites.getPlayer(carFrame, steer, true);
      ctx.drawImage(heroImg, Math.round(W / 2 - heroImg.width / 2 + carOscX), 242);

      if (PR.Input.hit('up')) {
        this.menuSelected = (this.menuSelected + 2) % 3;
        PR.Audio.sfx('hover');
      } else if (PR.Input.hit('down')) {
        this.menuSelected = (this.menuSelected + 1) % 3;
        PR.Audio.sfx('hover');
      }

      const bw = 216, bx = Math.round((W - bw) / 2);
      const bPlay = this.button(ctx, 'btn_play', 'JOGAR AGORA', bx, 102, bw, 28, {
        selected: this.menuSelected === 0,
        color: '#00f5d4',
        scale: 2
      });
      const bHow = this.button(ctx, 'btn_how', 'COMO JOGAR', bx, 136, bw, 22, {
        selected: this.menuSelected === 1,
        color: '#ff007f',
        scale: 1
      });
      const bRec = this.button(ctx, 'btn_rec', 'RECORDES TOP 10', bx, 163, bw, 22, {
        selected: this.menuSelected === 2,
        color: '#ffd60a',
        scale: 1
      });

      if (bPlay.hovered) this.menuSelected = 0;
      if (bHow.hovered) this.menuSelected = 1;
      if (bRec.hovered) this.menuSelected = 2;

      const confirmKey = PR.Input.hit('confirm');
      if (bPlay.clicked || (confirmKey && this.menuSelected === 0)) {
        PR.Audio.sfx('click');
        game.startMatch();
      } else if (bHow.clicked || (confirmKey && this.menuSelected === 1)) {
        PR.Audio.sfx('click');
        game.state = 'HOWTO';
      } else if (bRec.clicked || (confirmKey && this.menuSelected === 2)) {
        PR.Audio.sfx('click');
        game.state = 'RECORDS';
      }

      this.panel(ctx, 12, H - 60, W - 24, 54, '#ff007f', 0.90);
      PR.Font.text(ctx, 'DESENVOLVIDO POR ARTUR GUIMARÃES', W / 2, H - 55, {
        color: '#00f5d4',
        scale: 1,
        align: 'center',
        outline: '#050510'
      });
      PR.Font.text(ctx, 'COLABORAÇÃO: WENDER CORSI, JOÃO P. CAVALLI, HEITOR RUBI E PEDRO CARVALHO', W / 2, H - 44, {
        color: '#ffd60a',
        scale: 1,
        align: 'center',
        outline: '#050510'
      });
      PR.Font.text(ctx, 'FATEC | 5º SEMESTRE – ADS', W / 2, H - 33, {
        color: '#ff70a6',
        scale: 1,
        align: 'center',
        outline: '#050510'
      });

      ctx.fillStyle = 'rgba(255, 0, 127, 0.35)';
      ctx.fillRect(20, H - 22, W - 40, 1);
      PR.Font.text(ctx, '[A/D] OU [←/→] DIREÇÃO • [W/S] ACELERAR/FREAR • [ESPAÇO] NITRO • [1/2/3] PORTAIS', W / 2, H - 18, {
        color: '#e0fbfc',
        scale: 1,
        align: 'center'
      });
    },

    drawHowTo(ctx, game, dt) {
      this.animTime += dt;
      PR.Background.drawMenuBackdrop(ctx, this.animTime);
      const W = PR.CFG.W, H = PR.CFG.H;

      this.panel(ctx, 28, 16, W - 56, H - 32, '#00f5d4', 0.95);
      PR.Font.text(ctx, 'COMO JOGAR — PIXEL RUSH: MATHEMATICS OVERDRIVE', W / 2, 28, {
        color: '#ffd60a',
        scale: 1,
        align: 'center',
        shadow: '#000'
      });

      this.panel(ctx, 42, 46, 268, 132, '#ff007f', 0.88);
      PR.Font.text(ctx, '1. PILOTAGEM DO CONVERSÍVEL', 52, 54, { color: '#ff70a6', scale: 1 });
      const ctrlLines = [
        '[A / D] OU [← / →] : MUDAR DE FAIXA',
        '[W] OU [↑] : ACELERAR / CONFIRMAR PORTAL',
        '[S] OU [↓] : FREAR NO TRÁFEGO',
        '[ESPAÇO] : ATIVAR SUPER NITRO',
        '[1 / 2 / 3] OU CLIQUE : ESCOLHER PORTAL',
        '[ESC] OU [P] : PAUSAR PARTIDA',
        '',
        'DURAÇÃO: 3 MINUTOS DE CORRIDA!',
        'FIQUE DE OLHO NO COMBUSTÍVEL (%) E NAS VIDAS!'
      ];
      ctrlLines.forEach((l, i) => {
        PR.Font.text(ctx, l, 52, 70 + i * 11, { color: '#ffffff', scale: 1 });
      });

      this.panel(ctx, 322, 46, 276, 132, '#00f5d4', 0.88);
      PR.Font.text(ctx, '2. PAUSA PARA PENSAR NOS PORTAIS', 332, 54, { color: '#00f5d4', scale: 1 });
      const mathLines = [
        '• QUANDO O PÓRTICO DE 3 PORTAIS CHEGA NA',
        '  SUA FRENTE, O JOGO FAZ UMA PAUSA TÁTICA!',
        '• LEIA A CONTA SIMPLES NO PAINEL DO CÉU,',
        '  ALINHE O CARRO COM [A/D] E APERTE [W]',
        '  (OU CLIQUE / APERTE 1, 2 OU 3)!',
        '• SE FICAR AUSENTE (AFK) NA PERGUNTA,',
        '  O JOGO VOLTA SOZINHO AO MENU INICIAL.',
        '• INCLUI TABUADA, SOMA, %, COMBUSTÍVEL,',
        '  VELOCIDADE E SEQUÊNCIAS FÁCEIS!'
      ];
      mathLines.forEach((l, i) => {
        PR.Font.text(ctx, l, 332, 70 + i * 11, { color: '#e0fbfc', scale: 1 });
      });

      this.panel(ctx, 42, 186, W - 84, 110, '#ffd60a', 0.88);
      PR.Font.text(ctx, 'ACERTAR O PORTAL:', 56, 196, { color: '#70e000', scale: 1 });
      PR.Font.text(ctx, '+PONTOS BÔNUS • +MOEDAS • +NITRO • +COMBUSTÍVEL • AUMENTA MULTIPLICADOR (ATÉ X6!)', 56, 210, { color: '#ffffff', scale: 1 });

      PR.Font.text(ctx, 'ERRAR O PORTAL:', 56, 232, { color: '#ff0055', scale: 1 });
      PR.Font.text(ctx, 'PERDE VELOCIDADE TEMPORÁRIA • REDUZ O MULTIPLICADOR (NÃO PERDE VIDA!)', 56, 246, { color: '#ffffff', scale: 1 });

      PR.Font.text(ctx, 'DICA: ACERTE OS PORTAIS EM SEQUÊNCIA PARA ALCANÇAR O RANK MÁXIMO "MATH LEGEND"!', 56, 272, {
        color: '#ffd60a',
        scale: 1
      });

      const bBack = this.button(ctx, 'how_back', 'VOLTAR AO MENU [ESC / ENTER]', W / 2 - 110, H - 52, 220, 26, {
        selected: true,
        color: '#00f5d4',
        scale: 1
      });
      if (bBack.clicked || PR.Input.hit('back') || PR.Input.hit('confirm')) {
        PR.Audio.sfx('click');
        game.state = 'MENU';
      }
    },

    drawRecords(ctx, game, dt) {
      this.animTime += dt;
      PR.Background.drawMenuBackdrop(ctx, this.animTime);
      const W = PR.CFG.W, H = PR.CFG.H;

      this.panel(ctx, 28, 16, W - 56, H - 32, '#ffd60a', 0.95);
      PR.Font.text(ctx, '★ HALL DA FAMA — TOP 10 RECORDES DA FEIRA ★', W / 2, 28, {
        color: '#ffd60a',
        scale: 1,
        align: 'center',
        shadow: '#000'
      });

      const recs = PR.Storage.records();
      this.panel(ctx, 44, 46, W - 88, 240, '#00f5d4', 0.88);

      PR.Font.text(ctx, '#', 58, 56, { color: '#00f5d4', scale: 1 });
      PR.Font.text(ctx, 'PONTUAÇÃO', 92, 56, { color: '#00f5d4', scale: 1 });
      PR.Font.text(ctx, 'DISTÂNCIA', 196, 56, { color: '#00f5d4', scale: 1 });
      PR.Font.text(ctx, 'VEL.MÁX', 284, 56, { color: '#00f5d4', scale: 1 });
      PR.Font.text(ctx, 'PRECISÃO MAT.', 362, 56, { color: '#00f5d4', scale: 1 });
      PR.Font.text(ctx, 'CLASSIFICAÇÃO', 478, 56, { color: '#00f5d4', scale: 1 });

      ctx.fillStyle = '#2b345c';
      ctx.fillRect(52, 68, W - 104, 1);

      if (recs.length === 0) {
        PR.Font.text(ctx, 'NENHUMA PARTIDA REGISTRADA AINDA. SEJA O PRIMEIRO A CORRER!', W / 2, 155, {
          color: '#90e0ef',
          scale: 1,
          align: 'center'
        });
      } else {
        recs.slice(0, 10).forEach((r, idx) => {
          const ry = 76 + idx * 20;
          const isTop = idx === 0;
          const col = isTop ? '#ffd60a' : idx < 3 ? '#00f5d4' : '#ffffff';
          if (idx % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(50, ry - 3, W - 100, 16);
          }
          PR.Font.text(ctx, (idx + 1) + 'º', 58, ry, { color: col, scale: 1 });
          PR.Font.text(ctx, U.fmtInt(r.score || 0), 92, ry, { color: col, scale: 1 });
          PR.Font.text(ctx, U.fmtDec(r.distance || 0, 2) + ' KM', 196, ry, { color: col, scale: 1 });
          PR.Font.text(ctx, (r.maxKmh || 0) + ' KM/H', 284, ry, { color: col, scale: 1 });
          PR.Font.text(ctx, (r.accuracy || 0) + '% (' + (r.mathCorrect || 0) + '/' + (r.mathTotal || 0) + ')', 362, ry, { color: col, scale: 1 });
          PR.Font.text(ctx, r.rank || 'STREET RACER', 478, ry, { color: isTop ? '#ff007f' : col, scale: 1 });
        });
      }

      const bBack = this.button(ctx, 'rec_back', 'VOLTAR AO MENU [ESC / ENTER]', W / 2 - 110, H - 52, 220, 26, {
        selected: true,
        color: '#ffd60a',
        scale: 1
      });
      if (bBack.clicked || PR.Input.hit('back') || PR.Input.hit('confirm')) {
        PR.Audio.sfx('click');
        game.state = 'MENU';
      }
    },

    drawHUD(ctx, game) {
      this.animTime += 1 / 60;
      const p = game.player;
      const W = PR.CFG.W, H = PR.CFG.H;

      this.arcadeBadge(ctx, 'PTS', 12, 6, 38, 16, '#1b4332', '#70e000');
      PR.Font.text(ctx, U.fmtInt(game.score), 56, 7, {
        color: '#70e000',
        scale: 2,
        outline: '#050510'
      });
      this.arcadeBadge(ctx, 'X' + game.multiplier, 152, 6, 30, 16, '#3c096c', '#ff007f');

      this.arcadeBadge(ctx, 'TIME', 226, 6, 44, 16, '#3d3112', '#ffd60a');
      const secLeft = Math.max(0, Math.ceil(game.timeLeft));
      PR.Font.text(ctx, String(secLeft), 276, 7, {
        color: secLeft <= 30 && (Math.floor(game.timeLeft * 4) % 2 === 0) ? '#ff0055' : '#ffd60a',
        scale: 2,
        outline: '#050510'
      });

      this.arcadeBadge(ctx, 'MATH', 376, 6, 44, 16, '#102a43', '#4cc9f0');
      PR.Font.text(ctx, game.mathCorrect + '/' + game.mathTotal, 426, 7, {
        color: '#4cc9f0',
        scale: 2,
        outline: '#050510'
      });
      for (let i = 0; i < p.maxLives; i++) {
        PR.Font.text(ctx, '♥', 498 + i * 16, 8, {
          color: i < p.lives ? '#ff0055' : '#2b3048',
          scale: 2,
          outline: '#050510'
        });
      }

      if (this.button(ctx, 'hud_pause', 'PAUSA', W - 56, 6, 46, 16, { color: '#4cc9f0' }).clicked) {
        PR.Audio.sfx('click');
        game.togglePause();
      }

      const barX0 = 24, barX1 = 468, barY = 30;
      const barW = barX1 - barX0;
      PR.Font.text(ctx, 'S', barX0 - 11, barY - 3, { color: '#ffd60a', scale: 1, outline: '#000' });
      PR.Font.text(ctx, 'G', barX1 + 5, barY - 3, { color: '#ffd60a', scale: 1, outline: '#000' });

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(barX0, barY - 1, barW, 4);
      ctx.fillStyle = '#ffd60a';
      const progW = Math.round(barW * U.clamp(game.progress, 0, 1));
      ctx.fillRect(barX0, barY, progW, 2);

      const markerX = barX0 + progW;
      PR.Font.text(ctx, '▲ ' + U.fmtDec(game.distanceKm, 2) + 'KM', markerX, barY + 5, {
        color: '#fff3b0',
        scale: 1,
        align: 'center',
        outline: '#000'
      });

      this.drawAnalogGauge(ctx, 48, 314, 34, p.kmh / 320, 'KPH', String(p.kmh), 0.78);

      const gear = p.kmh < 40 ? 1 : p.kmh < 85 ? 2 : p.kmh < 130 ? 3 : p.kmh < 175 ? 4 : p.kmh < 220 ? 5 : 6;
      PR.Font.text(ctx, String(gear), 88, 282, {
        color: '#ffffff',
        scale: 2,
        align: 'center',
        outline: '#000'
      });

      this.drawAnalogGauge(ctx, 126, 314, 34, p.rpm / 9000, 'RPM', U.fmtDec(p.rpm / 1000, 1), 0.78);

      const fuelPct = Math.round(p.fuel);
      this.drawAnalogGauge(ctx, 182, 328, 20, p.fuel / 100, 'COMB', fuelPct + '%', -0.25);

      if (fuelPct <= 22 && Math.floor(this.animTime * 6) % 2 === 0) {
        PR.Font.text(ctx, '⚠ TANQUE BAIXO!', 182, 296, {
          color: '#ff0055',
          scale: 1,
          align: 'center',
          outline: '#000'
        });
      }

      const nbW = 128, nbH = 11, nbX = Math.round(W / 2 - nbW / 2), nbY = 338;
      ctx.fillStyle = 'rgba(8, 10, 20, 0.9)';
      ctx.fillRect(nbX, nbY, nbW, nbH);
      const nFill = Math.round((nbW - 2) * U.clamp(p.nitro / 100, 0, 1));
      ctx.fillStyle = p.nitroActive ? '#00f5d4' : (p.nitro >= 20 ? '#9d0258' : '#3a4168');
      ctx.fillRect(nbX + 1, nbY + 1, nFill, nbH - 2);
      ctx.strokeStyle = p.nitroActive ? '#ffffff' : '#5c677d';
      ctx.lineWidth = 1;
      ctx.strokeRect(nbX + 0.5, nbY + 0.5, nbW - 1, nbH - 1);
      PR.Font.text(
        ctx,
        p.nitroActive ? '⚡ OVERDRIVE ATIVO!' : (p.nitro >= 20 ? 'NITRO PRONTO [ESPAÇO]' : 'CARREGANDO NITRO'),
        W / 2,
        nbY + 2,
        {
          color: p.nitroActive ? '#ffffff' : '#ff70a6',
          scale: 1,
          align: 'center',
          shadow: '#000'
        }
      );

      PR.Font.text(ctx, 'MOEDAS: ' + game.coins, W - 14, 314, {
        color: '#ffd60a',
        scale: 1,
        align: 'right',
        outline: '#000'
      });
      PR.Font.text(ctx, 'STAGE  ' + game.currentDifficulty, W - 14, 327, {
        color: '#90e0ef',
        scale: 2,
        align: 'right',
        outline: '#050510'
      });
      const rotCred = this.getRotatingCredit();
      PR.Font.text(ctx, rotCred.text, W - 14, 347, {
        color: rotCred.col,
        scale: 1,
        align: 'right',
        alpha: 0.88,
        outline: '#050510'
      });

      const activePortal = PR.Traffic.activePortal();
      const curChallenge = PR.Traffic.currentChallenge();

      if (curChallenge) {
        const ch = curChallenge;
        const isMathPause = game.mathPauseActive;
        const pw = 340, ph = isMathPause ? 100 : 70;
        const px = Math.round((W - pw) / 2), py = 38;
        const borderCol = ch.color || '#ffd60a';
        this.panel(ctx, px, py, pw, ph, borderCol, 0.96);

        ctx.fillStyle = U.rgba(borderCol, 0.28);
        ctx.fillRect(px + 2, py + 2, pw - 4, 12);
        PR.Font.text(ctx, isMathPause ? '⏸ PAUSA PARA PENSAR — ESCOLHA O PORTAL CORRETO!' : ch.badge, W / 2, py + 4, {
          color: isMathPause ? '#ffd60a' : borderCol,
          scale: 1,
          align: 'center',
          shadow: '#000'
        });

        if (ch.context) {
          PR.Font.text(ctx, ch.context, W / 2, py + 16, {
            color: '#e0fbfc',
            scale: 1,
            align: 'center'
          });
        }

        const w2 = PR.Font.measure(ch.prompt, 2);
        const promptScale = w2 <= pw - 16 ? 2 : 1;
        const promptY = promptScale === 2 ? py + 26 : py + 29;
        PR.Font.text(ctx, ch.prompt, W / 2, promptY, {
          color: '#ffd60a',
          scale: promptScale,
          align: 'center',
          outline: '#050712'
        });

        const playerZone = PR.Traffic.playerZoneIndex(p.x);
        const boxW = 104, boxH = 18, boxY = py + 43;
        const startX = px + 9;
        const zoneCols = ['#00f5d4', '#ffd60a', '#ff007f'];
        const zoneNames = ['[1] ESQ:', '[2] CEN:', '[3] DIR:'];

        for (let idx = 0; idx < 3; idx++) {
          const bx = startX + idx * (boxW + 5);
          const isAimed = playerZone === idx;
          const zCol = zoneCols[idx];
          const m = PR.Input.mouse;
          const zRoad = PR.Traffic.PORTAL_ZONES[idx];
          const overBox = m.x >= bx && m.x < bx + boxW && m.y >= boxY && m.y < boxY + boxH;
          const overRoad = isMathPause && m.x >= zRoad.x0 && m.x < zRoad.x1 && m.y >= 160 && m.y <= 330;

          if ((overBox || overRoad) && isMathPause && m.moved) {
            p.lane = zRoad.lane;
          }

          ctx.fillStyle = (isAimed || overBox) ? U.rgba(zCol, 0.42) : 'rgba(14, 18, 38, 0.95)';
          ctx.fillRect(bx, boxY, boxW, boxH);
          ctx.strokeStyle = (isAimed || overBox) ? '#ffffff' : zCol;
          ctx.lineWidth = (isAimed || overBox) ? 2 : 1;
          ctx.strokeRect(bx + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

          PR.Font.text(ctx, zoneNames[idx] + ' ' + ch.options[idx], bx + boxW / 2, boxY + 5, {
            color: (isAimed || overBox) ? '#ffffff' : zCol,
            scale: 1,
            align: 'center',
            shadow: '#000'
          });

          if (isMathPause && m.clicked && (overBox || overRoad)) {
            game.confirmMathChoice(idx);
          }
        }

        if (isMathPause) {
          PR.Font.text(ctx, '[A/D] MOVER CONVERSÍVEL • [W / ESPAÇO / ENTER] ENTRAR NO PORTAL!', W / 2, py + 65, {
            color: '#70e000',
            scale: 1,
            align: 'center',
            shadow: '#000'
          });

          const afkSec = Math.max(1, Math.ceil(game.mathAfkTimer));
          const afkRatio = game.mathAfkTimer / PR.CFG.MATH_AFK_TIMEOUT;
          const afkUrgent = afkSec <= 10;
          PR.Font.text(
            ctx,
            afkUrgent
              ? '⚠ INATIVO (AFK)! VOLTANDO AO MENU EM ' + afkSec + 'S'
              : 'TEMPO PARA PENSAR: ' + afkSec + 'S (AFK VOLTA AO MENU)',
            W / 2,
            py + 77,
            {
              color: afkUrgent ? '#ff0055' : '#90e0ef',
              scale: 1,
              align: 'center'
            }
          );
          this.bar(ctx, px + 9, py + 88, pw - 18, 7, afkRatio, afkUrgent ? '#ff0055' : '#00f5d4');
        } else {
          let approachRatio = 1;
          if (!activePortal && PR.Traffic.prepDuration > 0) {
            approachRatio = 1 - (PR.Traffic.prepTimer / PR.Traffic.prepDuration);
          }
          this.bar(ctx, px + 9, py + 63, pw - 18, 5, approachRatio, borderCol);
        }
      } else if (game.lastBannerTimer > 0 && game.lastBannerText) {
        const pw = 290, ph = 26;
        const px = Math.round((W - pw) / 2), py = 46;
        this.panel(ctx, px, py, pw, ph, game.lastBannerColor, 0.94);
        PR.Font.text(ctx, game.lastBannerText, W / 2, py + 9, {
          color: game.lastBannerColor,
          scale: 1,
          align: 'center'
        });
      }
    },

    drawCountdown(ctx, game) {
      const W = PR.CFG.W, H = PR.CFG.H;
      const sec = Math.ceil(game.countdownLeft);
      const label = sec > 0 ? String(sec) : 'VAI!';
      const col = sec === 3 ? '#ff0055' : sec === 2 ? '#ffbe0b' : sec === 1 ? '#00f5d4' : '#70e000';

      this.panel(ctx, W / 2 - 125, H / 2 - 58, 250, 88, col, 0.94);
      PR.Font.text(ctx, 'PREPARE-SE PARA ACELERAR!', W / 2, H / 2 - 46, {
        color: '#ffffff',
        scale: 1,
        align: 'center'
      });
      PR.Font.text(ctx, label, W / 2, H / 2 - 24, {
        color: col,
        scale: 4,
        align: 'center',
        shadow: '#000000'
      });
      PR.Font.text(ctx, 'CALCULE E ATRAVESSE OS PORTAIS CERTOS!', W / 2, H / 2 + 14, {
        color: '#90e0ef',
        scale: 1,
        align: 'center'
      });
    },

    drawPause(ctx, game) {
      const W = PR.CFG.W, H = PR.CFG.H;
      ctx.fillStyle = 'rgba(4, 6, 16, 0.78)';
      ctx.fillRect(0, 0, W, H);

      this.panel(ctx, W / 2 - 150, 38, 300, 284, '#00f5d4', 0.96);
      PR.Font.text(ctx, 'JOGO PAUSADO', W / 2, 52, {
        color: '#ffd60a',
        scale: 2,
        align: 'center',
        shadow: '#000'
      });

      const s = PR.Storage.settings;
      PR.Font.text(ctx, 'VOLUME DA MÚSICA: ' + Math.round(s.music * 100) + '%', W / 2 - 126, 86, { color: '#90e0ef', scale: 1 });
      this.bar(ctx, W / 2 - 126, 98, 176, 12, s.music, '#ff007f');
      if (this.button(ctx, 'mus_minus', '-', W / 2 + 58, 95, 28, 18, { color: '#ff007f' }).clicked) {
        PR.Audio.setVolume('music', s.music - 0.1);
        PR.Audio.sfx('click');
      }
      if (this.button(ctx, 'mus_plus', '+', W / 2 + 92, 95, 28, 18, { color: '#ff007f' }).clicked) {
        PR.Audio.setVolume('music', s.music + 0.1);
        PR.Audio.sfx('click');
      }

      PR.Font.text(ctx, 'EFEITOS SONOROS: ' + Math.round(s.sfx * 100) + '%', W / 2 - 126, 122, { color: '#90e0ef', scale: 1 });
      this.bar(ctx, W / 2 - 126, 134, 176, 12, s.sfx, '#00f5d4');
      if (this.button(ctx, 'sfx_minus', '-', W / 2 + 58, 131, 28, 18, { color: '#00f5d4' }).clicked) {
        PR.Audio.setVolume('sfx', s.sfx - 0.1);
        PR.Audio.sfx('click');
      }
      if (this.button(ctx, 'sfx_plus', '+', W / 2 + 92, 131, 28, 18, { color: '#00f5d4' }).clicked) {
        PR.Audio.setVolume('sfx', s.sfx + 0.1);
        PR.Audio.sfx('click');
      }

      const bMute = this.button(ctx, 'pause_mute', s.muted ? 'ÁUDIO: SILENCIADO (ATIVAR)' : 'ÁUDIO: ATIVO (SILENCIAR)', W / 2 - 115, 160, 230, 24, {
        color: s.muted ? '#ff0055' : '#ffd60a'
      });
      if (bMute.clicked) {
        PR.Audio.toggleMute();
        PR.Audio.sfx('click');
      }

      const bResume = this.button(ctx, 'pause_resume', 'CONTINUAR CORRIDA [ESC]', W / 2 - 115, 196, 230, 28, {
        selected: true,
        color: '#00f5d4',
        scale: 1
      });
      const bRestart = this.button(ctx, 'pause_restart', 'REINICIAR PARTIDA', W / 2 - 115, 232, 230, 26, {
        color: '#ffd60a',
        scale: 1
      });
      const bMenu = this.button(ctx, 'pause_menu', 'VOLTAR AO MENU PRINCIPAL', W / 2 - 115, 266, 230, 26, {
        color: '#ff007f',
        scale: 1
      });

      if (bResume.clicked) {
        PR.Audio.sfx('click');
        game.togglePause();
      } else if (bRestart.clicked) {
        PR.Audio.sfx('click');
        game.startMatch();
      } else if (bMenu.clicked) {
        PR.Audio.sfx('click');
        game.resetSessionToMenu();
      }
    },

    drawResults(ctx, game, dt) {
      this.animTime += dt;
      PR.Background.drawMenuBackdrop(ctx, this.animTime);
      const W = PR.CFG.W, H = PR.CFG.H;
      const res = game.lastResults;
      if (!res) return;

      this.panel(ctx, 24, 12, W - 48, H - 24, '#00f5d4', 0.95);

      PR.Font.text(ctx, res.reasonTitle, W / 2, 22, {
        color: '#ffd60a',
        scale: 2,
        align: 'center',
        shadow: '#000'
      });

      if (res.isNewBest) {
        PR.Font.text(ctx, '★ NOVO RECORDE PESSOAL! ★', W / 2, 41, {
          color: Math.floor(this.animTime * 6) % 2 === 0 ? '#00f5d4' : '#ff007f',
          scale: 1,
          align: 'center'
        });
      }

      this.panel(ctx, 40, 54, 316, 186, '#4cc9f0', 0.88);
      const rows = [
        ['PONTUAÇÃO FINAL:', U.fmtInt(res.score), '#ffd60a'],
        ['RECORDE PESSOAL:', U.fmtInt(res.bestScore), '#00f5d4'],
        ['DISTÂNCIA PERCORRIDA:', U.fmtDec(res.distance, 2) + ' KM', '#ffffff'],
        ['MAIOR VELOCIDADE:', res.maxKmh + ' KM/H', '#ffffff'],
        ['MOEDAS COLETADAS:', String(res.coins), '#ffd60a'],
        ['OPERAÇÕES RESPONDIDAS:', String(res.mathTotal), '#90e0ef'],
        ['QUANTIDADE DE ACERTOS:', String(res.mathCorrect), '#70e000'],
        ['PRECISÃO MATEMÁTICA:', res.accuracy + '%', res.accuracy >= 75 ? '#70e000' : '#ff9e00']
      ];
      rows.forEach(([k, v, col], idx) => {
        const ry = 66 + idx * 21;
        if (idx % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(46, ry - 4, 304, 16);
        }
        PR.Font.text(ctx, k, 52, ry, { color: '#e0fbfc', scale: 1 });
        PR.Font.text(ctx, v, 344, ry, { color: col, scale: 1, align: 'right' });
      });

      this.panel(ctx, 368, 54, 232, 186, res.rankColor, 0.88);
      PR.Font.text(ctx, 'CLASSIFICAÇÃO FINAL', 484, 68, {
        color: '#90e0ef',
        scale: 1,
        align: 'center'
      });

      this.panel(ctx, 382, 86, 204, 54, res.rankColor, 0.95);
      PR.Font.text(ctx, res.rank, 484, 106, {
        color: res.rankColor,
        scale: 2,
        align: 'center',
        shadow: '#000'
      });

      const rankDesc = PR.Font.wrap(res.rankSubtitle, 200, 1);
      rankDesc.forEach((line, i) => {
        PR.Font.text(ctx, line, 484, 152 + i * 13, {
          color: '#ffffff',
          scale: 1,
          align: 'center'
        });
      });

      const secLeft = Math.ceil(PR.Session.resultsLeft);
      PR.Font.text(ctx, 'PRÓXIMO JOGADOR / MENU EM: ' + secLeft + 'S', 484, 222, {
        color: '#ffd60a',
        scale: 1,
        align: 'center'
      });

      if (PR.Input.hit('left') || PR.Input.hit('up')) this.resultsSelected = 0;
      if (PR.Input.hit('right') || PR.Input.hit('down')) this.resultsSelected = 1;

      const bAgain = this.button(ctx, 'res_again', 'JOGAR NOVAMENTE', 40, 250, 316, 40, {
        selected: this.resultsSelected === 0,
        color: '#00f5d4',
        scale: 2
      });
      const bMenu = this.button(ctx, 'res_menu', 'VOLTAR AO MENU', 368, 250, 232, 40, {
        selected: this.resultsSelected === 1,
        color: '#ff007f',
        scale: 2
      });

      if (bAgain.hovered) this.resultsSelected = 0;
      if (bMenu.hovered) this.resultsSelected = 1;

      const confirm = PR.Input.hit('confirm');
      if (bAgain.clicked || (confirm && this.resultsSelected === 0)) {
        PR.Audio.sfx('click');
        game.startMatch();
      } else if (bMenu.clicked || PR.Input.hit('back') || (confirm && this.resultsSelected === 1)) {
        PR.Audio.sfx('click');
        game.resetSessionToMenu();
      }

      PR.Font.text(ctx, 'PRESSIONE [ENTER / ESPAÇO] PARA JOGAR NOVAMENTE OU [ESC] PARA MENU', W / 2, 296, {
        color: '#90e0ef',
        scale: 1,
        align: 'center'
      });
      PR.Font.text(ctx, 'DESENVOLVIDO POR ARTUR GUIMARÃES  •  FATEC | 5º SEMESTRE – ADS', W / 2, 312, {
        color: '#00f5d4',
        scale: 1,
        align: 'center',
        shadow: '#000'
      });
      PR.Font.text(ctx, 'COLABORAÇÃO: WENDER CORSI, JOÃO P. CAVALLI, HEITOR RUBI E PEDRO CARVALHO', W / 2, 324, {
        color: '#ffd60a',
        scale: 1,
        align: 'center',
        shadow: '#000'
      });
    },

    drawSessionOverlays(ctx) {
      const W = PR.CFG.W, H = PR.CFG.H;

      if (PR.Session.isOffline || PR.Session.netToastTimer > 0) {
        const msg = PR.Session.netToastTimer > 0
          ? PR.Session.netToastMsg
          : 'MODO OFFLINE • JOGO 100% FUNCIONAL';
        const col = PR.Session.isOffline ? '#ff9e00' : '#00f5d4';
        const tw = PR.Font.measure(msg, 1) + 18;
        const bx = Math.round((W - tw) / 2);
        this.panel(ctx, bx, H - 18, tw, 15, col, 0.92);
        PR.Font.text(ctx, msg, W / 2, H - 14, {
          color: col,
          scale: 1,
          align: 'center'
        });
      }

      if (PR.Session.warningActive) {
        ctx.fillStyle = 'rgba(5, 6, 18, 0.88)';
        ctx.fillRect(0, 0, W, H);

        this.panel(ctx, 56, 86, W - 112, 188, '#ff0055', 0.97);

        PR.Font.text(ctx, '⚠ AVISO DE INATIVIDADE ⚠', W / 2, 106, {
          color: '#ffd60a',
          scale: 2,
          align: 'center',
          shadow: '#000'
        });

        PR.Font.text(ctx, 'SESSÃO ENCERRADA POR INATIVIDADE.', W / 2, 142, {
          color: '#ffffff',
          scale: 1,
          align: 'center'
        });
        PR.Font.text(ctx, 'PREPARANDO O PRÓXIMO JOGADOR...', W / 2, 158, {
          color: '#00f5d4',
          scale: 1,
          align: 'center'
        });

        const sec = Math.max(1, Math.ceil(PR.Session.warningLeft));
        PR.Font.text(ctx, 'REINICIANDO EM ' + sec + ' SEGUNDOS', W / 2, 188, {
          color: '#ff0055',
          scale: 2,
          align: 'center',
          shadow: '#000'
        });

        PR.Font.text(ctx, 'PRESSIONE QUALQUER TECLA OU MOVA O MOUSE PARA CONTINUAR JOGANDO', W / 2, 236, {
          color: '#90e0ef',
          scale: 1,
          align: 'center'
        });
      }
    }
  };

  PR.UI = UI;
})();
