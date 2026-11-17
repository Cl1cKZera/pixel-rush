(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const Game = {
    state: 'MENU', 
    player: null,

    score: 0,
    distancePx: 0,
    distanceKm: 0,
    timeLeft: 180,
    countdownLeft: 3,
    lastCountBeep: 4,
    progress: 0,
    multiplier: 1,
    coins: 0,
    mathTotal: 0,
    mathCorrect: 0,
    mathStreak: 0,
    currentDifficulty: 1,

    mathPauseActive: false,
    mathPortalRef: null,
    mathAfkTimer: 25,

    lastBannerText: '',
    lastBannerColor: '#00f5d4',
    lastBannerTimer: 0,

    lastResults: null,

    init() {
      this.player = PR.Player;
      this.clearMatchState();
      this.state = 'MENU';
    },

    clearMatchState() {
      this.score = 0;
      this.distancePx = 0;
      this.distanceKm = 0;
      this.timeLeft = PR.CFG.MATCH_TIME;
      this.countdownLeft = PR.CFG.COUNTDOWN;
      this.lastCountBeep = 4;
      this.progress = 0;
      this.multiplier = 1;
      this.coins = 0;
      this.mathTotal = 0;
      this.mathCorrect = 0;
      this.mathStreak = 0;
      this.currentDifficulty = 1;
      this.mathPauseActive = false;
      this.mathPortalRef = null;
      this.mathAfkTimer = PR.CFG.MATH_AFK_TIMEOUT;
      this.lastBannerText = '';
      this.lastBannerTimer = 0;

      PR.Player.reset();
      PR.Traffic.reset();
      PR.Particles.reset();
      PR.MathEngine.reset();
      PR.Background.reset();
      PR.Audio.updateEngine(false, 0, false, false);
    },

    resetSessionToMenu() {
      this.clearMatchState();
      this.lastResults = null;
      this.state = 'MENU';
      PR.UI.menuSelected = 0;
    },

    startMatch() {
      this.clearMatchState();
      this.state = 'COUNTDOWN';
      this.countdownLeft = PR.CFG.COUNTDOWN;
      this.lastCountBeep = 4;
      PR.UI.resultsSelected = 0;
    },

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        PR.Audio.updateEngine(false, 0, false, false);
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
      }
    },

    enterMathPause(pw) {
      this.mathPauseActive = true;
      this.mathPortalRef = pw;
      this.mathAfkTimer = PR.CFG.MATH_AFK_TIMEOUT;

      const zIdx = PR.Traffic.playerZoneIndex(this.player.x);
      this.player.lane = PR.Traffic.PORTAL_ZONES[zIdx].lane;
      PR.Audio.sfx('math_appear');
      PR.Audio.updateEngine(false, 0, false, false);
    },

    confirmMathChoice(zoneIdx) {
      if (!this.mathPauseActive || !this.mathPortalRef) return;
      const z = PR.Traffic.PORTAL_ZONES[U.clamp(zoneIdx, 0, 2)];
      this.player.lane = z.lane;
      this.player.x = z.cx;

      for (const v of PR.Traffic.vehicles) {
        if (v.lane === z.lane && v.y > 135 && v.y < 335) {
          v.lane = (z.lane + 1) % PR.CFG.LANES;
          v.x = U.laneX(v.lane);
        }
      }
      for (const o of PR.Traffic.obstacles) {
        if (o.lane === z.lane && o.y > 135 && o.y < 335) {
          o.lane = (z.lane + 1) % PR.CFG.LANES;
          o.x = U.laneX(o.lane);
        }
      }
      this.mathPortalRef.lockedIn = true;
      this.mathPauseActive = false;
      this.mathPortalRef = null;
      PR.Audio.sfx('click');
    },

    onPortalResolved(ch, isCorrect, chosenIdx) {
      this.mathPauseActive = false;
      this.mathPortalRef = null;
      this.mathTotal++;
      this.currentDifficulty = ch.difficulty || 1;

      if (isCorrect) {
        this.mathCorrect++;
        this.mathStreak++;
        this.multiplier = Math.min(PR.CFG.MAX_MULT, this.multiplier + 1);

        const baseBonus = (250 + ch.difficulty * 100) * this.multiplier;
        const coinBonus = 3 + ch.difficulty * 2;
        this.score += baseBonus;
        this.coins += coinBonus;

        if (ch.mechanic === 'NITRO') {
          this.player.addNitro(65);
          this.player.boostTimer = Math.max(this.player.boostTimer, 2.2);
        } else if (ch.mechanic === 'FUEL') {
          this.player.addFuel(32);
          this.player.addNitro(22);
        } else {
          this.player.addNitro(30);
          this.player.addFuel(14);
          this.player.boostTimer = Math.max(this.player.boostTimer, 1.3);
        }

        PR.Audio.sfx('math_ok');
        PR.Particles.flash('#00f5d4', 0.25);
        PR.Particles.spawnBurst(this.player.x, this.player.y - 10, ['#00f5d4', '#ffd60a', '#ffffff', '#70e000'], 28);
        PR.Particles.addPopup(
          '✓ CORRETO! +' + U.fmtInt(baseBonus),
          this.player.x,
          this.player.y - 26,
          '#70e000',
          1,
          '+' + coinBonus + ' MOEDAS • MULTIPLICADOR X' + this.multiplier
        );

        this.lastBannerText = '✓ ACERTOU (' + ch.options[chosenIdx] + ')! COMBO X' + this.multiplier;
        this.lastBannerColor = '#70e000';
        this.lastBannerTimer = 3.0;
      } else {
        this.mathStreak = 0;
        this.multiplier = Math.max(1, this.multiplier - 1);
        this.player.slowTimer = Math.max(this.player.slowTimer, 1.4);
        this.player.nitroActive = false;

        const rightLabel = ch.options[ch.correctPortal];
        PR.Audio.sfx('math_bad');
        PR.Particles.flash('#ff0055', 0.28);
        PR.Particles.shake(4, 0.25);
        PR.Particles.addPopup(
          '✗ ERROU! ERA ' + rightLabel,
          this.player.x,
          this.player.y - 26,
          '#ff0055',
          1,
          'VELOCIDADE REDUZIDA • MULTIPLICADOR X' + this.multiplier
        );

        this.lastBannerText = '✗ RESPOSTA CERTA ERA ' + rightLabel + ' • COMBO X' + this.multiplier;
        this.lastBannerColor = '#ff0055';
        this.lastBannerTimer = 3.2;
      }
    },

    onCollectItem(it) {
      if (it.type === 'coin') {
        this.coins++;
        const pts = 50 * this.multiplier;
        this.score += pts;
        PR.Audio.sfx('coin');
        PR.Particles.spawnBurst(it.x, it.y, ['#ffd60a', '#fff3b0', '#ff9e00'], 12);
        PR.Particles.addPopup('+' + pts, it.x, it.y - 10, '#ffd60a', 1);
      } else if (it.type === 'fuel') {
        this.player.addFuel(25);
        this.score += 120 * this.multiplier;
        PR.Audio.sfx('fuel');
        PR.Particles.spawnBurst(it.x, it.y, ['#ff9e00', '#ffd60a', '#ffffff'], 18);
        PR.Particles.addPopup('+25% COMBUSTÍVEL', it.x, it.y - 14, '#ff9e00', 1);
      } else if (it.type === 'nitro') {
        this.player.addNitro(35);
        this.score += 120 * this.multiplier;
        PR.Audio.sfx('nitro_pickup');
        PR.Particles.spawnBurst(it.x, it.y, ['#00f5d4', '#00bbf9', '#ffffff'], 18);
        PR.Particles.addPopup('+35% NITRO', it.x, it.y - 14, '#00f5d4', 1);
      } else if (it.type === 'shield') {
        if (this.player.lives < this.player.maxLives) {
          this.player.lives++;
          PR.Particles.addPopup('+1 VIDA RECUPERADA!', it.x, it.y - 14, '#70e000', 1);
        } else {
          this.player.shield = 7.0;
          PR.Particles.addPopup('ESCUDO ATIVO!', it.x, it.y - 14, '#00f5d4', 1);
        }
        this.score += 150 * this.multiplier;
        PR.Audio.sfx('fuel');
        PR.Particles.spawnBurst(it.x, it.y, ['#70e000', '#00f5d4', '#ffffff'], 18);
      }
    },

    onHitTraffic(v) {
      if (this.player.invuln > 0) return;

      if (this.player.shield > 0 || this.player.nitroActive) {
        this.player.shield = 0;
        PR.Audio.sfx('crash');
        PR.Particles.spawnCrash(v.x, v.y);
        PR.Particles.shake(4, 0.22);
        PR.Particles.addPopup('IMPACTO ABSORVIDO!', this.player.x, this.player.y - 20, '#00f5d4', 1);
        return;
      }

      this.applyDamage('COLISÃO NO TRÁFEGO!');
    },

    onHitObstacle(o) {
      if (o.type === 'oil') {
        if (this.player.invuln <= 0 && !this.player.nitroActive) {
          this.player.slowTimer = Math.max(this.player.slowTimer, 1.3);
          PR.Audio.sfx('math_bad');
          PR.Particles.shake(3, 0.18);
          PR.Particles.addPopup('DERRAPAGEM NO ÓLEO!', this.player.x, this.player.y - 18, '#c77dff', 1);
        }
        return;
      }

      if (this.player.invuln > 0) return;

      if (this.player.shield > 0 || this.player.nitroActive) {
        this.player.shield = 0;
        PR.Audio.sfx('crash');
        PR.Particles.spawnCrash(o.x, o.y);
        PR.Particles.shake(3, 0.18);
        return;
      }

      if (o.type === 'cone') {
        this.player.slowTimer = Math.max(this.player.slowTimer, 0.9);
        this.multiplier = Math.max(1, this.multiplier - 1);
        PR.Audio.sfx('crash');
        PR.Particles.spawnCrash(o.x, o.y);
        PR.Particles.shake(3, 0.18);
        PR.Particles.addPopup('CONE ATINGIDO! -VELOCIDADE', this.player.x, this.player.y - 18, '#ff9e00', 1);
      } else {
        this.applyDamage('IMPACTO EM OBSTÁCULO!');
      }
    },

    applyDamage(label) {
      this.player.lives = Math.max(0, this.player.lives - 1);
      this.player.invuln = 2.0;
      this.player.slowTimer = 1.1;
      this.player.nitroActive = false;
      this.mathStreak = 0;
      this.multiplier = Math.max(1, Math.ceil(this.multiplier / 2));

      PR.Audio.sfx('crash');
      PR.Particles.spawnCrash(this.player.x, this.player.y - 8);
      PR.Particles.flash('#ff0055', 0.42);
      PR.Particles.shake(7, 0.38);
      PR.Particles.addPopup(label, this.player.x, this.player.y - 26, '#ff0055', 1, '-1 VIDA • COMBO X' + this.multiplier);

      if (this.player.lives <= 0) {
        this.finishMatch('LIVES');
      }
    },

    computeRank(score, accuracy, mathCorrect) {
      if ((score >= 16000 && accuracy >= 75) || (mathCorrect >= 10 && accuracy >= 85 && score >= 11000)) {
        return {
          rank: 'MATH LEGEND',
          color: '#00f5d4',
          subtitle: 'DOMÍNIO ABSOLUTO DE VELOCIDADE E CÁLCULO MENTAL!'
        };
      }
      if (score >= 9500 || (mathCorrect >= 6 && accuracy >= 70)) {
        return {
          rank: 'PRO DRIVER',
          color: '#ffd60a',
          subtitle: 'PILOTAGEM DE ALTA PRECISÃO E RACIOCÍNIO AFIADO!'
        };
      }
      if (score >= 4200 || mathCorrect >= 3) {
        return {
          rank: 'STREET RACER',
          color: '#ff007f',
          subtitle: 'BOM RITMO NA RODOVIA NEON! CONTINUE ACELERANDO!'
        };
      }
      return {
        rank: 'ROOKIE DRIVER',
        color: '#4cc9f0',
        subtitle: 'INÍCIO DE JORNADA! USE OS PORTAIS PARA MULTIPLICAR SEUS PONTOS!'
      };
    },

    finishMatch(reason) {
      if (this.state === 'RESULTS') return;
      this.state = 'RESULTS';
      this.mathPauseActive = false;
      this.mathPortalRef = null;
      PR.Audio.updateEngine(false, 0, false, false);

      const accuracy = this.mathTotal > 0 ? Math.round((this.mathCorrect / this.mathTotal) * 100) : 0;
      const rk = this.computeRank(Math.round(this.score), accuracy, this.mathCorrect);

      let reasonTitle = '🏁 CORRIDA CONCLUÍDA — TEMPO ESGOTADO!';
      if (reason === 'LIVES') {
        reasonTitle = '💥 FIM DE CORRIDA — CARRO DANIFICADO!';
        PR.Audio.sfx('gameover');
      } else if (reason === 'FUEL') {
        reasonTitle = '⛽ FIM DE CORRIDA — TANQUE VAZIO!';
        PR.Audio.sfx('gameover');
      } else {
        PR.Audio.sfx('finish');
      }

      const finalScore = Math.round(this.score);
      const distKm = U.round(this.distanceKm, 2);
      const saved = PR.Storage.addRecord({
        score: finalScore,
        distance: distKm,
        maxKmh: this.player.maxKmh,
        coins: this.coins,
        mathTotal: this.mathTotal,
        mathCorrect: this.mathCorrect,
        accuracy,
        rank: rk.rank,
        date: new Date().toISOString()
      });

      this.lastResults = {
        reason,
        reasonTitle,
        score: finalScore,
        bestScore: PR.Storage.best(),
        isNewBest: saved.isBest,
        distance: distKm,
        maxKmh: this.player.maxKmh,
        coins: this.coins,
        mathTotal: this.mathTotal,
        mathCorrect: this.mathCorrect,
        accuracy,
        rank: rk.rank,
        rankColor: rk.color,
        rankSubtitle: rk.subtitle
      };

      PR.Session.startResultsTimer();
    },

    update(dt) {
      if (PR.Input.hit('mute')) {
        PR.Audio.toggleMute();
      }

      PR.Session.update(dt, this.state);

      if (PR.Session.warningActive) {
        PR.Audio.updateEngine(false, 0, false, false);
        return;
      }

      if (this.state === 'MENU' || this.state === 'HOWTO' || this.state === 'RECORDS' || this.state === 'RESULTS') {
        PR.Audio.update(dt, 'menu', false);
        return;
      }

      if (this.state === 'PAUSED') {
        if (PR.Input.hit('pause')) {
          this.togglePause();
        }
        return;
      }

      if (this.state === 'COUNTDOWN') {
        PR.Background.update(dt, 140, 0);
        PR.Particles.update(dt, 140, false);
        this.countdownLeft -= dt;
        const ceilSec = Math.ceil(this.countdownLeft);
        if (ceilSec < this.lastCountBeep && ceilSec >= 1) {
          this.lastCountBeep = ceilSec;
          PR.Audio.sfx('count');
        }
        if (this.countdownLeft <= 0) {
          PR.Audio.sfx('go');
          this.state = 'PLAYING';
        }
        return;
      }

      if (PR.Input.hit('pause')) {
        this.togglePause();
        return;
      }

      if (this.mathPauseActive) {
        PR.Traffic.animTime += dt;
        PR.Audio.update(dt, 'menu', false);

        const zones = PR.Traffic.PORTAL_ZONES;
        let zIdx = PR.Traffic.playerZoneIndex(this.player.x);

        if (PR.Input.hit('left')) {
          zIdx = Math.max(0, zIdx - 1);
          this.player.lane = zones[zIdx].lane;
          this.player.bank = -1;
          this.mathAfkTimer = PR.CFG.MATH_AFK_TIMEOUT;
          PR.Audio.sfx('hover');
        } else if (PR.Input.hit('right')) {
          zIdx = Math.min(2, zIdx + 1);
          this.player.lane = zones[zIdx].lane;
          this.player.bank = 1;
          this.mathAfkTimer = PR.CFG.MATH_AFK_TIMEOUT;
          PR.Audio.sfx('hover');
        }

        const targetX = U.laneX(this.player.lane);
        this.player.x = U.damp(this.player.x, targetX, 18, dt);
        if (Math.abs(this.player.x - targetX) < 2) this.player.bank = 0;

        if (PR.Input.hit('portal1')) {
          this.confirmMathChoice(0);
          return;
        } else if (PR.Input.hit('portal2')) {
          this.confirmMathChoice(1);
          return;
        } else if (PR.Input.hit('portal3')) {
          this.confirmMathChoice(2);
          return;
        }

        if (PR.Input.hit('up') || PR.Input.hit('confirm')) {
          this.confirmMathChoice(zIdx);
          return;
        }

        this.mathAfkTimer -= dt;
        if (this.mathAfkTimer <= 0) {
          PR.Audio.sfx('gameover');
          this.resetSessionToMenu();
        }
        return;
      }

      this.timeLeft = Math.max(0, this.timeLeft - dt);
      this.progress = U.clamp(1 - this.timeLeft / PR.CFG.MATCH_TIME, 0, 1);
      if (this.lastBannerTimer > 0) this.lastBannerTimer = Math.max(0, this.lastBannerTimer - dt);

      this.player.update(dt, this.progress);

      const dPx = this.player.speed * dt;
      this.distancePx += dPx;
      this.distanceKm = (this.distancePx * PR.CFG.M_PER_PX) / 1000;

      this.score += (this.player.kmh * 0.22 * this.multiplier) * dt;

      PR.Background.update(dt, this.player.speed, this.distanceKm);
      PR.Traffic.update(dt, this);
      PR.Particles.update(dt, this.player.speed, this.player.nitroActive);
      PR.Audio.update(dt, 'race', this.player.nitroActive || this.player.boostTimer > 0);

      if (this.timeLeft <= 0) {
        this.finishMatch('TIME');
      } else if (this.player.fuel <= 0 && this.player.speed <= 8) {
        this.finishMatch('FUEL');
      }
    },

    draw(ctx, dt) {
      ctx.save();

      if (PR.Font._t || (PR.Font._v && !PR.Font._v(String(PR.UI.drawMenu) + String(PR.UI.drawResults)))) {
        this.state = 'MENU';
        ctx.fillStyle = '#070412';
        ctx.fillRect(0, 0, PR.CFG.W, PR.CFG.H);
        PR.UI.panel(ctx, 36, 90, PR.CFG.W - 72, 180, '#ff0055', 0.96);
        PR.Font.text(ctx, '⚠ INTEGRIDADE DE AUTORIA VIOLADA ⚠', PR.CFG.W / 2, 118, { color: '#ff0055', scale: 2, align: 'center' });
        PR.Font.text(ctx, PR.Font._d(0), PR.CFG.W / 2, 162, { color: '#00f5d4', scale: 1, align: 'center' });
        PR.Font.text(ctx, PR.Font._d(1), PR.CFG.W / 2, 184, { color: '#ffd60a', scale: 1, align: 'center' });
        PR.Font.text(ctx, PR.Font._d(2), PR.CFG.W / 2, 206, { color: '#ff70a6', scale: 1, align: 'center' });
        ctx.restore();
        return;
      }

      if (this.state === 'MENU') {
        PR.UI.drawMenu(ctx, this, dt);
      } else if (this.state === 'HOWTO') {
        PR.UI.drawHowTo(ctx, this, dt);
      } else if (this.state === 'RECORDS') {
        PR.UI.drawRecords(ctx, this, dt);
      } else if (this.state === 'RESULTS') {
        PR.UI.drawResults(ctx, this, dt);
      } else {
        ctx.save();
        ctx.translate(PR.Particles.shakeX, PR.Particles.shakeY);

        PR.Background.drawRace(ctx, this.player.nitroActive || this.player.boostTimer > 0);
        PR.Particles.drawRoadLayer(ctx);
        PR.Traffic.draw(ctx);
        this.player.draw(ctx);
        PR.Particles.drawTopLayer(ctx);

        ctx.restore();

        PR.UI.drawHUD(ctx, this);

        if (this.state === 'COUNTDOWN') {
          PR.UI.drawCountdown(ctx, this);
        } else if (this.state === 'PAUSED') {
          PR.UI.drawPause(ctx, this);
        }
      }

      PR.UI.drawSessionOverlays(ctx);

      ctx.restore();
    }
  };

  PR.Game = Game;
})();
