/* Sistema de Partículas, Linhas de Velocidade, Textos Flutuantes, Marcas de Pneu e Efeitos de Câmera */
(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const Particles = {
    list: [],
    popups: [],
    skids: [],
    rings: [],
    speedLines: [],
    shakeTime: 0,
    shakeMag: 0,
    shakeX: 0,
    shakeY: 0,
    flashColor: '#ffffff',
    flashAlpha: 0,

    reset() {
      this.list.length = 0;
      this.popups.length = 0;
      this.skids.length = 0;
      this.rings.length = 0;
      this.speedLines.length = 0;
      this.shakeTime = 0;
      this.shakeMag = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.flashAlpha = 0;
      // Pré-popula linhas de velocidade sutis nas laterais
      for (let i = 0; i < 24; i++) {
        this.speedLines.push({
          x: U.chance(0.5) ? U.rand(8, PR.CFG.ROAD_L - 12) : U.rand(PR.CFG.ROAD_R + 12, PR.CFG.W - 8),
          y: U.rand(0, PR.CFG.H),
          len: U.rand(14, 38),
          col: U.pick(['#00f5d4', '#ff007f', '#7209b7', '#4cc9f0'])
        });
      }
    },

    shake(mag, dur) {
      this.shakeMag = Math.max(this.shakeMag, mag || 4);
      this.shakeTime = Math.max(this.shakeTime, dur || 0.25);
    },

    flash(color, alpha) {
      this.flashColor = color || '#ffffff';
      this.flashAlpha = Math.max(this.flashAlpha, alpha || 0.35);
    },

    addPopup(text, x, y, color, scale, subtext) {
      this.popups.push({
        text: String(text),
        sub: subtext ? String(subtext) : '',
        x: U.clamp(x, 60, PR.CFG.W - 60),
        y,
        vy: -38,
        color: color || '#ffd60a',
        scale: scale || 1,
        life: 0,
        maxLife: 1.25
      });
    },

    addSkid(x, y, col) {
      if (this.skids.length > 160) this.skids.shift();
      this.skids.push({ x, y, col: col || 'rgba(15,18,28,0.65)', life: 1.4 });
    },

    addRing(x, y, color, maxR) {
      this.rings.push({ x, y, r: 4, maxR: maxR || 42, color: color || '#00f5d4', life: 0, maxLife: 0.42 });
    },

    // Fumaça / Chama de escapamento do jogador
    spawnExhaust(x, y, nitroActive, speedRatio) {
      const count = nitroActive ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const isNitro = nitroActive;
        const colors = isNitro
          ? ['#ffffff', '#00f5d4', '#00bbf9', '#ff007f']
          : ['#8d99ae', '#6c757d', '#495057'];
        this.list.push({
          x: x + U.rand(-5, 5),
          y: y + U.rand(0, 4),
          vx: U.rand(-16, 16),
          vy: U.rand(90, 160) * (0.7 + speedRatio * 0.6),
          size: isNitro ? U.randi(2, 4) : U.randi(2, 3),
          color: U.pick(colors),
          life: 0,
          maxLife: isNitro ? U.rand(0.18, 0.34) : U.rand(0.22, 0.42),
          grav: 0
        });
      }
    },

    // Explosão de faíscas e destroços em colisões
    spawnCrash(x, y) {
      this.addRing(x, y, '#ff0055', 52);
      this.addRing(x, y, '#ffbe0b', 34);
      const cols = ['#ffffff', '#ffd60a', '#ff9e00', '#ff0055', '#ff5400', '#495057'];
      for (let i = 0; i < 38; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const spd = U.rand(35, 190);
        this.list.push({
          x: x + U.rand(-6, 6),
          y: y + U.rand(-6, 6),
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: U.randi(2, 4),
          color: U.pick(cols),
          life: 0,
          maxLife: U.rand(0.28, 0.75),
          grav: 120
        });
      }
    },

    // Brilho ao coletar moedas, combustível, nitro ou acertar portal
    spawnBurst(x, y, palette, count) {
      const cols = palette || ['#ffd60a', '#ffffff', '#00f5d4'];
      const n = count || 18;
      this.addRing(x, y, cols[0], 32);
      for (let i = 0; i < n; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const spd = U.rand(25, 130);
        this.list.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 20,
          size: U.randi(2, 3),
          color: U.pick(cols),
          life: 0,
          maxLife: U.rand(0.25, 0.6),
          grav: 40
        });
      }
    },

    update(dt, roadSpeed, nitroActive) {
      // Atualiza tremor de câmera
      if (this.shakeTime > 0) {
        this.shakeTime = Math.max(0, this.shakeTime - dt);
        const m = this.shakeMag * (this.shakeTime / 0.3);
        this.shakeX = Math.round(U.rand(-m, m));
        this.shakeY = Math.round(U.rand(-m, m));
        if (this.shakeTime <= 0) { this.shakeMag = 0; this.shakeX = 0; this.shakeY = 0; }
      }
      if (this.flashAlpha > 0) {
        this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.8);
      }

      // Marcas de pneu no asfalto
      for (let i = this.skids.length - 1; i >= 0; i--) {
        const s = this.skids[i];
        s.y += roadSpeed * dt;
        s.life -= dt;
        if (s.life <= 0 || s.y > PR.CFG.H + 20) this.skids.splice(i, 1);
      }

      // Anéis de choque / energia
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.life += dt;
        r.r = U.lerp(4, r.maxR, r.life / r.maxLife);
        if (r.life >= r.maxLife) this.rings.splice(i, 1);
      }

      // Partículas
      for (let i = this.list.length - 1; i >= 0; i--) {
        const p = this.list[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          this.list.splice(i, 1);
          continue;
        }
        p.vy += (p.grav || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // Textos flutuantes
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.life += dt;
        pop.y += pop.vy * dt;
        pop.vy *= Math.pow(0.25, dt);
        if (pop.life >= pop.maxLife) this.popups.splice(i, 1);
      }

      // Linhas de velocidade
      const spdFactor = U.clamp((roadSpeed - 240) / 350, 0, 1.5) + (nitroActive ? 0.7 : 0);
      for (const sl of this.speedLines) {
        sl.y += (roadSpeed * 1.45 + 180) * dt;
        if (sl.y > PR.CFG.H + 40) {
          sl.y = -sl.len - U.rand(0, 40);
          sl.x = U.chance(0.5) ? U.rand(6, PR.CFG.ROAD_L - 10) : U.rand(PR.CFG.ROAD_R + 10, PR.CFG.W - 6);
        }
        sl.alpha = U.clamp(spdFactor * 0.55, 0, 0.85);
      }
    },

    drawRoadLayer(ctx) {
      // Desenha marcas de pneu no asfalto antes dos carros
      for (const s of this.skids) {
        ctx.fillStyle = s.col;
        ctx.fillRect(Math.round(s.x - 7), Math.round(s.y), 3, 5);
        ctx.fillRect(Math.round(s.x + 5), Math.round(s.y), 3, 5);
      }
    },

    drawTopLayer(ctx) {
      // Linhas de velocidade nas laterais da rodovia 3D (abaixo do horizonte)
      const hy = (PR.Background && PR.Background.HORIZON_Y) ? PR.Background.HORIZON_Y : 196;
      for (const sl of this.speedLines) {
        if (!sl.alpha || sl.alpha < 0.05 || sl.y < hy) continue;
        ctx.globalAlpha = sl.alpha;
        ctx.fillStyle = sl.col;
        ctx.fillRect(Math.round(sl.x), Math.round(sl.y), 2, Math.round(sl.len * 0.5));
      }
      ctx.globalAlpha = 1;

      // Anéis de energia
      for (const r of this.rings) {
        const a = 1 - r.life / r.maxLife;
        ctx.strokeStyle = U.rgba(r.color, a);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.round(r.x), Math.round(r.y), Math.round(r.r), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Partículas
      for (const p of this.list) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = U.clamp(a * 1.2, 0, 1);
        ctx.fillStyle = p.color;
        const sz = p.size;
        ctx.fillRect(Math.round(p.x - sz * 0.5), Math.round(p.y - sz * 0.5), sz, sz);
      }
      ctx.globalAlpha = 1;

      // Textos flutuantes (pontuação, acertos matemáticos, bônus)
      for (const pop of this.popups) {
        const a = pop.life < 0.8 ? 1 : 1 - (pop.life - 0.8) / (pop.maxLife - 0.8);
        PR.Font.text(ctx, pop.text, pop.x, pop.y, {
          color: pop.color,
          scale: pop.scale,
          align: 'center',
          outline: '#080914',
          alpha: U.clamp(a, 0, 1)
        });
        if (pop.sub) {
          PR.Font.text(ctx, pop.sub, pop.x, pop.y + 9 * pop.scale, {
            color: '#ffffff',
            scale: 1,
            align: 'center',
            outline: '#080914',
            alpha: U.clamp(a, 0, 1)
          });
        }
      }

      // Flash de tela (colisão, nitro ou portal)
      if (this.flashAlpha > 0.01) {
        ctx.fillStyle = U.rgba(this.flashColor, this.flashAlpha);
        ctx.fillRect(0, 0, PR.CFG.W, PR.CFG.H);
      }
    }
  };

  PR.Particles = Particles;
})();

