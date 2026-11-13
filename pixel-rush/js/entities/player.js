/* Entidade do Jogador — Superconversível Esportivo em Rodovia 3D de 3 Faixas Largas (Estilo Slipstream / OutRun) */
(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  // Mapeia as 3 faixas largas (0 = Esquerda, 1 = Centro, 2 = Direita)
  U.laneX = (l) => 320 + (l - 1) * 165;
  U.laneAt = (x) => U.clamp(Math.round((x - 320) / 165) + 1, 0, PR.CFG.LANES - 1);

  const Player = {
    lane: 1,          // faixa central (0, 1, 2)
    x: 320,
    y: 314,
    vx: 0,
    w: 76,
    h: 34,
    speed: 290,
    kmh: 116,
    rpm: 3200,
    maxKmh: 116,
    fuel: 100,
    nitro: 50,
    nitroActive: false,
    lives: 3,
    maxLives: 3,
    invuln: 0,
    shield: 0,
    slowTimer: 0,
    boostTimer: 0,
    wheelTimer: 0,
    wheelFrame: 0,
    exhaustTimer: 0,
    lowFuelTimer: 0,
    bank: 0,
    holdSteerTimer: 0,

    reset() {
      this.lane = 1;
      this.x = U.laneX(1);
      this.y = PR.CFG.PLAYER_Y;
      this.vx = 0;
      this.speed = PR.CFG.SPEED.cruise0;
      this.kmh = Math.round(this.speed * PR.CFG.KMH);
      this.rpm = 3200;
      this.maxKmh = this.kmh;
      this.fuel = 100;
      this.nitro = 50;
      this.nitroActive = false;
      this.lives = PR.CFG.LIVES;
      this.maxLives = PR.CFG.LIVES;
      this.invuln = 0;
      this.shield = 0;
      this.slowTimer = 0;
      this.boostTimer = 0;
      this.wheelTimer = 0;
      this.wheelFrame = 0;
      this.exhaustTimer = 0;
      this.lowFuelTimer = 0;
      this.bank = 0;
      this.holdSteerTimer = 0;
    },

    update(dt, progress) {
      const inp = PR.Input;
      const S = PR.CFG.SPEED;

      // 1. Direção entre as 3 faixas largas (0 = Esquerda, 1 = Centro, 2 = Direita)
      let dir = 0;
      if (inp.hit('portal1')) {
        this.lane = 0;
        dir = -1;
      } else if (inp.hit('portal2')) {
        this.lane = 1;
      } else if (inp.hit('portal3')) {
        this.lane = 2;
        dir = 1;
      } else if (inp.hit('left')) {
        this.lane = Math.max(0, this.lane - 1);
        this.holdSteerTimer = 0.22;
        dir = -1;
      } else if (inp.hit('right')) {
        this.lane = Math.min(PR.CFG.LANES - 1, this.lane + 1);
        this.holdSteerTimer = 0.22;
        dir = 1;
      } else if (inp.held('left') || inp.held('right')) {
        this.holdSteerTimer -= dt;
        if (this.holdSteerTimer <= 0) {
          if (inp.held('left')) { this.lane = Math.max(0, this.lane - 1); dir = -1; }
          else if (inp.held('right')) { this.lane = Math.min(PR.CFG.LANES - 1, this.lane + 1); dir = 1; }
          this.holdSteerTimer = 0.18;
        }
      } else {
        this.holdSteerTimer = 0;
      }

      const targetX = U.laneX(this.lane);
      const prevX = this.x;
      this.x = U.damp(this.x, targetX, 14, dt);
      const dx = this.x - prevX;
      this.bank = Math.abs(targetX - this.x) > 5 ? (targetX < this.x ? -1 : 1) : (dir || 0);

      if (Math.abs(dx) > 65 * dt || inp.held('down')) {
        PR.Particles.addSkid(this.x - 32, this.y + 16);
        PR.Particles.addSkid(this.x + 32, this.y + 16);
      }

      // 2. NITRO OVERDRIVE (ESPAÇO)
      if (inp.hit('nitro') && !this.nitroActive && this.nitro >= 20 && this.fuel > 0) {
        this.nitroActive = true;
        PR.Audio.sfx('nitro_fire');
        PR.Particles.flash('#00f5d4', 0.22);
        PR.Particles.shake(3, 0.2);
      }
      if (this.nitroActive) {
        this.nitro = Math.max(0, this.nitro - 26 * dt);
        if (this.nitro <= 0 || this.fuel <= 0) {
          this.nitroActive = false;
        }
      } else {
        this.nitro = Math.min(100, this.nitro + 1.4 * dt);
      }

      // 3. Velocidade (KPH) e Conta-giros (RPM)
      const cruise = U.lerp(S.cruise0, S.cruise1, progress);
      const maxSpd = U.lerp(S.max0, S.max1, progress);
      const accelerating = inp.held('up') && this.fuel > 0;
      const braking = inp.held('down');

      if (this.fuel <= 0) {
        this.speed = U.approach(this.speed, 0, S.brake * 0.75 * dt);
      } else if (this.nitroActive || this.boostTimer > 0) {
        const nitroTarget = maxSpd + S.nitroAdd;
        this.speed = U.approach(this.speed, nitroTarget, (S.accel * 2.4) * dt);
      } else if (this.slowTimer > 0) {
        this.speed = U.approach(this.speed, S.min * 0.85, S.brake * 1.2 * dt);
      } else if (accelerating) {
        this.speed = U.approach(this.speed, maxSpd, S.accel * dt);
      } else if (braking) {
        this.speed = U.approach(this.speed, S.min, S.brake * dt);
      } else {
        this.speed = U.approach(this.speed, cruise, S.coast * dt);
      }

      this.kmh = Math.round(this.speed * PR.CFG.KMH);
      if (this.kmh > this.maxKmh) this.maxKmh = this.kmh;

      const gearRatio = (this.kmh % 65) / 65;
      this.rpm = Math.round(U.lerp(2200, 7800, gearRatio * 0.65 + (this.kmh / 320) * 0.35));
      if (this.nitroActive) this.rpm = Math.min(8800, this.rpm + 1100);

      // 4. Consumo de combustível
      const spdRatio = U.clamp(this.speed / S.max1, 0, 1.5);
      const drainRate = PR.CFG.FUEL_DRAIN * (0.65 + spdRatio * 0.65) * (this.nitroActive ? 1.15 : 1);
      this.fuel = Math.max(0, this.fuel - drainRate * dt);

      if (this.fuel > 0 && this.fuel < 22) {
        this.lowFuelTimer -= dt;
        if (this.lowFuelTimer <= 0) {
          this.lowFuelTimer = 1.4;
          PR.Audio.sfx('low_fuel');
        }
      }

      // 5. Timers e animações
      if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
      if (this.shield > 0) this.shield = Math.max(0, this.shield - dt);
      if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - dt);
      if (this.boostTimer > 0) this.boostTimer = Math.max(0, this.boostTimer - dt);

      this.wheelTimer += dt * (6 + spdRatio * 14);
      if (this.wheelTimer >= 1) {
        this.wheelTimer %= 1;
        this.wheelFrame = 1 - this.wheelFrame;
      }

      this.exhaustTimer += dt;
      const exInterval = (this.nitroActive || this.boostTimer > 0) ? 0.025 : 0.08;
      if (this.exhaustTimer >= exInterval && this.speed > 40) {
        this.exhaustTimer = 0;
        PR.Particles.spawnExhaust(this.x, this.y + 16, this.nitroActive || this.boostTimer > 0, spdRatio);
      }

      PR.Audio.updateEngine(true, spdRatio, accelerating, this.nitroActive || this.boostTimer > 0);
    },

    addFuel(amount) {
      this.fuel = U.clamp(this.fuel + amount, 0, 100);
    },

    addNitro(amount) {
      this.nitro = U.clamp(this.nitro + amount, 0, 100);
    },

    // Retorna a posição X projetada exatamente no centro da faixa 3D na profundidade do jogador (d = 0.772, y = 314)
    screenX() {
      const lp = ((this.x - 320) / 165) * 0.667;
      return PR.Background.project(lp, 0.772).x;
    },

    draw(ctx) {
      if (this.invuln > 0 && Math.floor(this.invuln * 16) % 2 === 0) return;

      const px = Math.round(this.screenX());
      const bounce = Math.round(Math.sin(this.wheelTimer * Math.PI * 2) * 0.6);
      const py = Math.round(this.y + bounce);
      const isOverdrive = this.nitroActive || this.boostTimer > 0;

      // Desenha o Superconversível Esportivo (116x52) perfeitamente encaixado dentro da faixa!
      const spr = PR.Sprites.getPlayer(this.wheelFrame, this.bank, isOverdrive);
      ctx.drawImage(spr, px - 58, py - 32);

      // Escudo energético discreto
      if (this.shield > 0) {
        ctx.strokeStyle = (this.shield < 1.5 && Math.floor(this.shield * 10) % 2 === 0)
          ? '#ffffff'
          : '#00f5d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py - 4, 58, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  PR.Player = Player;
})();
