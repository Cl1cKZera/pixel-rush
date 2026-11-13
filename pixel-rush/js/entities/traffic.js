/* Sistema Pseudo-3D de Tráfego, Postes Laterais, Coletáveis e Pórticos de Portais Matemáticos
 * Unificado em 3 Faixas Largas (0 = Esquerda, 1 = Centro, 2 = Direita):
 * - Cada carro adversário anda perfeitamente no centro de uma das 3 faixas e cresce na mesma proporção do jogador!
 * - Os 3 Portais Matemáticos (ESQ | CEN | DIR) correspondem 1-para-1 às 3 faixas da rodovia! */
(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  // As 3 Faixas Largas da rodovia 3D são exatamente as 3 Zonas de Portal!
  const PORTAL_ZONES = [
    { x0: 90,  x1: 245, cx: 155, lane: 0, lp0: -0.98, lp1: -0.333, lpc: -0.667, label: 'ESQ', keyHint: '1' },
    { x0: 245, x1: 395, cx: 320, lane: 1, lp0: -0.333, lp1:  0.333, lpc:  0.000, label: 'CEN', keyHint: '2' },
    { x0: 395, x1: 550, cx: 485, lane: 2, lp0:  0.333, lp1:  0.98,  lpc:  0.667, label: 'DIR', keyHint: '3' }
  ];

  const Traffic = {
    PORTAL_ZONES,
    vehicles: [],
    obstacles: [],
    items: [],
    portals: [],

    pendingChallenge: null,
    prepTimer: 0,
    prepDuration: 2.2,

    waveTimer: 1.0,
    itemTimer: 1.2,
    portalTimer: 2.0,
    animTime: 0,

    reset() {
      this.vehicles.length = 0;
      this.obstacles.length = 0;
      this.items.length = 0;
      this.portals.length = 0;
      this.pendingChallenge = null;
      this.prepTimer = 0;
      this.prepDuration = 2.2;
      this.waveTimer = 1.0;
      this.itemTimer = 1.2;
      this.portalTimer = 2.0;
      this.animTime = 0;
    },

    playerZoneIndex(playerX) {
      if (playerX < 245) return 0;
      if (playerX > 395) return 2;
      return 1;
    },

    nearPortal(y, margin) {
      const m = margin || 140;
      for (const p of this.portals) {
        if (Math.abs(p.y - y) < m) return true;
      }
      if (this.pendingChallenge && this.prepTimer < 1.2 && y < 60) return true;
      return false;
    },

    isLaneFree(lane, y, margin) {
      const m = margin || 85;
      for (const v of this.vehicles) {
        if (v.lane === lane && Math.abs(v.y - y) < m + v.h * 0.5) return false;
      }
      for (const o of this.obstacles) {
        if (o.lane === lane && Math.abs(o.y - y) < m) return false;
      }
      return true;
    },

    // Gera no máximo 1 ou 2 veículos nas 3 faixas, deixando sempre pelo menos 1 faixa 100% livre!
    spawnTrafficWave(progress) {
      const spawnY = -40;
      if (this.nearPortal(spawnY, 155)) return;

      const hasQuestion = !!(this.pendingChallenge || this.activePortal());
      const maxCars = hasQuestion ? 1 : (U.chance(0.45 + progress * 0.25) ? 2 : 1);
      const lanes = U.shuffle([0, 1, 2]);
      const chosen = lanes.slice(0, maxCars);

      for (let i = 0; i < chosen.length; i++) {
        const lane = chosen[i];
        // Escalonamento vertical entre os carros para nunca parecerem "colados" lado a lado
        const y = spawnY - i * U.rand(45, 75);
        if (!this.isLaneFree(lane, y, 95)) continue;

        if (U.chance(0.18 + progress * 0.06)) {
          this.spawnObstacle(lane, y);
        } else {
          this.spawnVehicle(lane, y, progress);
        }
      }
    },

    spawnVehicle(lane, y, progress) {
      const roll = Math.random();
      let kind = 'coupe', w = 74, h = 34, spd = U.rand(120, 155), variant = 0;

      if (roll < 0.16) {
        kind = U.chance(0.5) ? 'cargo' : 'tanker';
        w = 78;
        h = 52;
        spd = U.rand(105, 135);
      } else if (roll < 0.28) {
        kind = 'police';
        spd = U.rand(140, 168);
      } else if (roll < 0.40) {
        kind = 'taxi';
        spd = U.rand(120, 150);
      } else {
        kind = U.pick(['coupe', 'muscle', 'sedan']);
        variant = U.randi(0, 5);
        spd = U.rand(122, 160) + progress * 12;
      }

      // Se já houver um veículo na mesma faixa, sincroniza a velocidade para nunca se atravessarem
      for (const other of this.vehicles) {
        if (other.lane === lane) {
          spd = other.speed;
          break;
        }
      }

      this.vehicles.push({
        kind,
        variant,
        lane,
        targetLane: lane,
        x: U.laneX(lane),
        y,
        w,
        h,
        speed: spd,
        canSwitch: false,
        switchCooldown: 4.0,
        blinker: 0
      });
    },

    spawnObstacle(lane, y) {
      const type = U.weighted([
        ['cone', 3],
        ['barrier', 3],
        ['oil', 2],
        ['mine', 2]
      ]);
      const dims = {
        cone: [36, 18],
        barrier: [58, 18],
        oil: [48, 18],
        mine: [38, 18]
      }[type];

      this.obstacles.push({
        type,
        lane,
        x: U.laneX(lane),
        y,
        w: dims[0],
        h: dims[1],
        hit: false
      });
    },

    spawnCollectibles(player) {
      const spawnY = -30;
      if (this.nearPortal(spawnY, 95)) return;

      const candidates = U.shuffle([0, 1, 2]).filter((l) => this.isLaneFree(l, spawnY, 55));
      if (!candidates.length) return;
      const lane = candidates[0];
      const x = U.laneX(lane);

      const needFuel = player.fuel < 55;
      const needLife = player.lives < player.maxLives;

      if (needFuel && U.chance(0.52)) {
        this.items.push({ type: 'fuel', lane, x, y: spawnY, r: 24 });
      } else if (needLife && U.chance(0.18)) {
        this.items.push({ type: 'shield', lane, x, y: spawnY, r: 24 });
      } else if (U.chance(0.24)) {
        this.items.push({ type: 'nitro', lane, x, y: spawnY, r: 24 });
      } else if (U.chance(0.22)) {
        this.items.push({ type: 'fuel', lane, x, y: spawnY, r: 24 });
      } else {
        const n = U.randi(3, 5);
        for (let i = 0; i < n; i++) {
          const cy = spawnY - i * 28;
          if (!this.nearPortal(cy, 70)) {
            this.items.push({ type: 'coin', lane, x: U.laneX(lane), y: cy, r: 22 });
          }
        }
      }
    },

    spawnPortalWave(challenge) {
      const y = -40;
      // Mantém todos os carros visíveis na pista; limpa apenas se algum acabou de nascer colado no pórtico lá no horizonte (y < -5)
      this.obstacles = this.obstacles.filter((o) => o.y > -5 || Math.abs(o.y - y) > 55);
      this.vehicles = this.vehicles.filter((v) => v.y > -5 || Math.abs(v.y - y) > 65);

      this.portals.push({
        y,
        h: 28,
        challenge,
        pausedOnce: false,
        lockedIn: false,
        resolved: false,
        chosenIndex: -1,
        wasCorrect: false
      });
    },

    // Mapeia coordenada lógica y (-40 no horizonte .. 314 no jogador) para profundidade d (0.015 .. 0.772)
    yToDepth(y) {
      return U.clamp(0.015 + ((y + 40) / 354) * 0.757, 0.015, 1.06);
    },

    update(dt, game) {
      const player = game.player;
      const roadSpeed = player.speed;
      const progress = game.progress;
      this.animTime += dt;

      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.spawnTrafficWave(progress);
        this.waveTimer = U.lerp(1.45, 0.90, progress) * U.rand(0.88, 1.18);
      }

      this.itemTimer -= dt;
      if (this.itemTimer <= 0) {
        this.spawnCollectibles(player);
        this.itemTimer = U.rand(1.4, 2.3);
      }

      if (!this.pendingChallenge && this.portals.length === 0) {
        this.portalTimer -= dt;
        if (this.portalTimer <= 0) {
          this.pendingChallenge = PR.MathEngine.nextChallenge({
            progress,
            streak: game.mathStreak,
            fuel: player.fuel,
            nitro: player.nitro,
            kmh: player.kmh
          });
          this.prepDuration = 2.0;
          this.prepTimer = this.prepDuration;
          PR.Audio.sfx('math_appear');
        }
      } else if (this.pendingChallenge) {
        this.prepTimer -= dt;
        if (this.prepTimer <= 0) {
          this.spawnPortalWave(this.pendingChallenge);
          this.pendingChallenge = null;
        }
      }

      // Atualiza Pórticos dos Portais Matemáticos
      for (let i = this.portals.length - 1; i >= 0; i--) {
        const pw = this.portals[i];
        const portalSpd = pw.lockedIn ? Math.max(roadSpeed * 1.45, 440) : Math.min(roadSpeed * 0.78, 235);
        pw.y += portalSpd * dt;

        // Pausa Tática quando o pórtico chega em y >= 152 (mantendo todos os outros carros visíveis na pista!)
        if (!pw.pausedOnce && !pw.resolved && pw.y >= 152) {
          pw.y = 152;
          pw.pausedOnce = true;
          game.enterMathPause(pw);
          return;
        }

        if (!pw.resolved && pw.y >= player.y - 12) {
          pw.resolved = true;
          const idx = this.playerZoneIndex(player.x);
          pw.chosenIndex = idx;
          pw.wasCorrect = idx === pw.challenge.correctPortal;
          game.onPortalResolved(pw.challenge, pw.wasCorrect, idx);
          this.portalTimer = 6.2;
        }

        if (pw.y > PR.CFG.H + 90) {
          this.portals.splice(i, 1);
        }
      }

      // Atualiza Veículos de Tráfego (movimento 100% proporcional à escala de perspectiva da pista!)
      for (let i = this.vehicles.length - 1; i >= 0; i--) {
        const v = this.vehicles[i];
        const d = this.yToDepth(v.y);
        const perspScale = PR.Background.project(0, d).scale;
        const relSpeed = Math.max(50, roadSpeed - v.speed) * perspScale;
        v.y += relSpeed * dt;

        // Mantém distância segura entre carros na mesma faixa sem saltos de velocidade
        for (let j = 0; j < this.vehicles.length; j++) {
          if (i === j) continue;
          const other = this.vehicles[j];
          if (other.lane === v.lane && other.y < v.y && v.y - other.y < 90) {
            const commonSpd = Math.min(v.speed, other.speed);
            v.speed = commonSpd;
            other.speed = commonSpd;
            if (v.y - other.y < 76) {
              other.y = v.y - 76;
            }
          }
        }

        v.x = U.laneX(v.lane);

        if (Math.abs(v.x - player.x) < (v.w + player.w) * 0.44 &&
            Math.abs(v.y - player.y) < (v.h + player.h) * 0.44) {
          game.onHitTraffic(v);
          this.vehicles.splice(i, 1);
          continue;
        }

        if (v.y > PR.CFG.H + 90 || v.y < -220) {
          this.vehicles.splice(i, 1);
        }
      }

      // Atualiza Obstáculos (mesma progressão de perspectiva dos carros)
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const o = this.obstacles[i];
        const d = this.yToDepth(o.y);
        const perspScale = PR.Background.project(0, d).scale;
        o.y += roadSpeed * perspScale * dt;

        if (!o.hit &&
            Math.abs(o.x - player.x) < (o.w + player.w) * 0.45 &&
            Math.abs(o.y - player.y) < (o.h + player.h) * 0.45) {
          o.hit = true;
          game.onHitObstacle(o);
          if (o.type !== 'oil') {
            this.obstacles.splice(i, 1);
            continue;
          }
        }

        if (o.y > PR.CFG.H + 50) {
          this.obstacles.splice(i, 1);
        }
      }

      // Atualiza Coletáveis (mesma progressão de perspectiva dos carros)
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        const d = this.yToDepth(it.y);
        const perspScale = PR.Background.project(0, d).scale;
        it.y += roadSpeed * perspScale * dt;

        const dx = player.x - it.x;
        const dy = player.y - it.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 52) {
          it.x += (dx / Math.max(1, dist)) * 155 * dt;
          it.y += (dy / Math.max(1, dist)) * 155 * dt;
        }

        if (dist < it.r + 20) {
          game.onCollectItem(it);
          this.items.splice(i, 1);
          continue;
        }

        if (it.y > PR.CFG.H + 40) {
          this.items.splice(i, 1);
        }
      }
    },

    // Desenha um Pórtico Eletrônico de Rodovia em 3D (sem paredes quadradas saindo da pista!)
    drawPortal3D(ctx, pw, playerZone) {
      const d = this.yToDepth(pw.y);
      const dBack = Math.max(0.02, d - 0.05);
      const dFront = Math.min(0.98, d + 0.05);

      const pLeft = PR.Background.project(-0.98, d);
      const pRight = PR.Background.project(0.98, d);
      const py = Math.round(pLeft.y);
      const s = pLeft.scale;
      const ch = pw.challenge;
      const archH = Math.round(54 * s);
      const beamH = Math.max(14, Math.round(24 * s));

      // Pilares laterais metálicos do Pórtico da Rodovia (fora da pista, no acostamento)
      const pilW = Math.max(3, Math.round(6 * s));
      ctx.fillStyle = '#2b3452';
      ctx.fillRect(Math.round(pLeft.x - pilW), py - archH - beamH, pilW, archH + beamH);
      ctx.fillRect(Math.round(pRight.x), py - archH - beamH, pilW, archH + beamH);

      // Treliça metálica horizontal ligando os 3 painéis eletrônicos
      ctx.fillStyle = '#1b2038';
      ctx.fillRect(Math.round(pLeft.x - pilW), py - archH - beamH, Math.round(pRight.x - pLeft.x + pilW * 2), beamH);

      // Desenha cada um dos 3 Portais exatamente alinhado com as 3 faixas em perspectiva trapezoidal!
      for (let idx = 0; idx < 3; idx++) {
        const z = PORTAL_ZONES[idx];
        const isChosen = pw.resolved && pw.chosenIndex === idx;
        const isRight = idx === ch.correctPortal;
        const isAimed = !pw.resolved && playerZone === idx;

        let gateCol = idx === 0 ? '#00f5d4' : idx === 1 ? '#ffd60a' : '#ff007f';
        if (pw.resolved) {
          gateCol = isRight ? '#38b000' : (isChosen ? '#ff0055' : '#495057');
        }

        // Tapete luminoso trapezoidal no asfalto seguindo a perspectiva exata da faixa!
        const bL = PR.Background.project(z.lp0 + 0.02, dBack);
        const bR = PR.Background.project(z.lp1 - 0.02, dBack);
        const fL = PR.Background.project(z.lp0 + 0.02, dFront);
        const fR = PR.Background.project(z.lp1 - 0.02, dFront);

        ctx.fillStyle = U.rgba(gateCol, isAimed ? 0.42 : 0.20);
        ctx.beginPath();
        ctx.moveTo(bL.x, bL.y);
        ctx.lineTo(bR.x, bR.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.lineTo(fL.x, fL.y);
        ctx.closePath();
        ctx.fill();

        // Bordas laterais laser no piso da faixa
        ctx.strokeStyle = isAimed ? '#ffffff' : gateCol;
        ctx.lineWidth = isAimed ? 2 : 1;
        ctx.stroke();

        // Painel Eletrônico Superior acima da faixa
        const g0 = PR.Background.project(z.lp0, d);
        const g1 = PR.Background.project(z.lp1, d);
        const gc = PR.Background.project(z.lpc, d);
        const gx0 = Math.round(g0.x) + 2;
        const gx1 = Math.round(g1.x) - 2;
        const gw = Math.max(12, gx1 - gx0);

        // Feixe vertical translúcido sutil nas divisórias
        ctx.fillStyle = U.rgba(gateCol, isAimed ? 0.18 : 0.08);
        ctx.fillRect(gx0, py - archH, gw, archH);

        // Placa LED da resposta no pórtico
        const signY = py - archH - beamH;
        ctx.fillStyle = isAimed ? 'rgba(20, 32, 72, 0.98)' : 'rgba(8, 10, 26, 0.96)';
        ctx.fillRect(gx0, signY, gw, beamH);
        ctx.strokeStyle = isAimed ? '#ffffff' : gateCol;
        ctx.lineWidth = isAimed ? 2 : 1;
        ctx.strokeRect(gx0 + 0.5, signY + 0.5, gw - 1, beamH - 1);

        const textScale = s >= 0.48 ? 2 : 1;
        const textH = 7 * textScale;
        PR.Font.text(ctx, ch.options[idx], gc.x, signY + Math.floor((beamH - textH) / 2), {
          color: isAimed ? '#ffd60a' : '#ffffff',
          scale: textScale,
          align: 'center',
          shadow: '#000'
        });
      }
    },

    draw(ctx) {
      const sp = PR.Sprites.cache;
      const wf = Math.floor(this.animTime * 12) & 1;
      const coinFrame = Math.floor(this.animTime * 10) % 6;
      const curChallenge = this.currentChallenge();
      const playerZone = this.playerZoneIndex(PR.Player.x);

      // 0. Guia luminosa suave no asfalto indicando a faixa escolhida pelo conversível
      if (curChallenge) {
        const z = PORTAL_ZONES[playerZone];
        const col = playerZone === 0 ? '#00f5d4' : playerZone === 1 ? '#ffd60a' : '#ff007f';
        const pTopL = PR.Background.project(z.lp0 + 0.03, 0.40);
        const pTopR = PR.Background.project(z.lp1 - 0.03, 0.40);
        const pBotL = PR.Background.project(z.lp0 + 0.03, 0.72);
        const pBotR = PR.Background.project(z.lp1 - 0.03, 0.72);

        ctx.fillStyle = U.rgba(col, 0.16);
        ctx.beginPath();
        ctx.moveTo(pTopL.x, pTopL.y);
        ctx.lineTo(pTopR.x, pTopR.y);
        ctx.lineTo(pBotR.x, pBotR.y);
        ctx.lineTo(pBotL.x, pBotL.y);
        ctx.closePath();
        ctx.fill();
      }

      // 1. Ordena todos os objetos 3D por profundidade (do horizonte d=0.02 até a câmera d=1.0)
      const drawables = [];

      for (const rp of PR.Background.roadProps) {
        drawables.push({ kind: 'prop', d: rp.d, ref: rp });
      }
      for (const pw of this.portals) {
        drawables.push({ kind: 'portal', d: this.yToDepth(pw.y), ref: pw });
      }
      for (const o of this.obstacles) {
        drawables.push({ kind: 'obstacle', d: this.yToDepth(o.y), ref: o });
      }
      for (const it of this.items) {
        drawables.push({ kind: 'item', d: this.yToDepth(it.y), ref: it });
      }
      for (const v of this.vehicles) {
        drawables.push({ kind: 'vehicle', d: this.yToDepth(v.y), ref: v });
      }

      drawables.sort((a, b) => a.d - b.d);

      // 2. Renderiza em perspectiva 3D
      for (const item of drawables) {
        const d = item.d;
        if (d < 0.02 || d > 1.08) continue;

        if (item.kind === 'prop') {
          const rp = item.ref;
          const proj = PR.Background.project(rp.lanePos, d);
          const s = proj.scale;
          if (rp.type === 'lamp') {
            const w = Math.max(4, Math.round(44 * s));
            const h = Math.max(10, Math.round(114 * s));
            ctx.drawImage(sp.streetlight, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
          } else if (rp.type === 'palm') {
            const w = Math.max(6, Math.round(84 * s));
            const h = Math.max(10, Math.round(122 * s));
            ctx.drawImage(sp.palm3D, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
          } else if (rp.type === 'hotel') {
            const w = Math.max(8, Math.round(76 * s));
            const h = Math.max(12, Math.round(128 * s));
            ctx.drawImage(sp.hotel3D, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
          } else if (rp.type === 'billboard') {
            const bImg = sp.billboards3D[(rp.variant || 0) % sp.billboards3D.length];
            const w = Math.max(8, Math.round(88 * s));
            const h = Math.max(8, Math.round(76 * s));
            ctx.drawImage(bImg, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
          } else {
            const img = rp.type === 'signRight' ? sp.signRight : sp.signLeft;
            const w = Math.max(4, Math.round(28 * s));
            const h = Math.max(6, Math.round(42 * s));
            ctx.drawImage(img, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
          }
        } else if (item.kind === 'portal') {
          this.drawPortal3D(ctx, item.ref, playerZone);
        } else if (item.kind === 'obstacle') {
          const o = item.ref;
          const lp = ((o.x - 320) / 165) * 0.667;
          const proj = PR.Background.project(lp, d);
          const s = proj.scale;
          const img = o.type === 'mine' ? sp.mine[wf] : sp[o.type];
          const w = Math.max(6, Math.round(img.width * s));
          const h = Math.max(6, Math.round(img.height * s));
          ctx.drawImage(img, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
        } else if (item.kind === 'item') {
          const it = item.ref;
          const lp = ((it.x - 320) / 165) * 0.667;
          const proj = PR.Background.project(lp, d);
          const s = proj.scale;
          const img = it.type === 'coin' ? sp.coin[coinFrame] : sp[it.type];
          const w = Math.max(6, Math.round(img.width * s));
          const h = Math.max(6, Math.round(img.height * s));
          const bob = Math.round(Math.sin(this.animTime * 6 + it.y) * 3 * s);
          ctx.drawImage(img, Math.round(proj.x - w * 0.5), Math.round(proj.y - h + bob), w, h);
        } else if (item.kind === 'vehicle') {
          const v = item.ref;
          const lp = ((v.x - 320) / 165) * 0.667;
          const proj = PR.Background.project(lp, d);
          const s = proj.scale;
          let img;
          if (v.kind === 'cargo' || v.kind === 'tanker') {
            img = sp.trucks[v.kind][wf];
          } else {
            const arr = sp.cars[v.kind];
            img = arr[v.variant % arr.length][wf];
          }
          // Proporção 1:1 com o carro principal na mesma profundidade!
          const w = Math.max(8, Math.round(img.width * s));
          const h = Math.max(6, Math.round(img.height * s));
          ctx.drawImage(img, Math.round(proj.x - w * 0.5), Math.round(proj.y - h), w, h);
        }
      }
    },

    activePortal() {
      for (const pw of this.portals) {
        if (!pw.resolved) return pw;
      }
      return null;
    },

    currentChallenge() {
      const pw = this.activePortal();
      if (pw) return pw.challenge;
      return this.pendingChallenge;
    }
  };

  PR.Traffic = Traffic;
})();
