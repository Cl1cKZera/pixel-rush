(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const HORIZON_Y = 158; 

  const Background = {
    HORIZON_Y,
    scroll: 0,
    zOffset: 0,
    curve: 0.28,
    targetCurve: 0.36,
    curveTimer: 4.5,
    skyOffset: 0,

    stars: [],
    farCity: [],
    nearCity: [],
    roadProps: [],
    propSpawnTimer: 0,
    propStep: 0,

    init() {
      const rng = U.mulberry32(1986);

      this.stars.length = 0;
      for (let i = 0; i < 75; i++) {
        this.stars.push({
          x: Math.floor(rng() * PR.CFG.W),
          y: Math.floor(rng() * (HORIZON_Y - 52)),
          cross: rng() < 0.18,
          col: rng() < 0.35 ? '#90e0ef' : rng() < 0.7 ? '#ffffff' : '#ffccd5',
          phase: rng() * Math.PI * 2
        });
      }

      this.farCity.length = 0;
      let fx = 0;
      while (fx < 960) {
        const w = 16 + Math.floor(rng() * 22);
        const h = 24 + Math.floor(rng() * 52);
        this.farCity.push({
          x: fx,
          w,
          h,
          col: rng() < 0.5 ? '#1f1137' : '#2a1548',
          winCol: rng() < 0.5 ? '#ffd166' : rng() < 0.8 ? '#00f5d4' : '#ff70a6'
        });
        fx += w + 2;
      }

      this.nearCity = [
        { x: 14,  w: 58, h: 108, col: '#16132b', win: '#00f5d4', neon: '#ff007f', style: 'double' },
        { x: 84,  w: 44, h: 74,  col: '#261834', win: '#ffd166', neon: '#00f5d4', style: 'single' },
        { x: 136, w: 48, h: 86,  col: '#191630', win: '#48cae4', neon: '#ffbe0b', style: 'double' },
        { x: 204, w: 40, h: 114, col: '#141229', win: '#fff3b0', neon: '#ff007f', style: 'double' },
        { x: 252, w: 46, h: 98,  col: '#1b1635', win: '#ff70a6', neon: '#00f5d4', style: 'double' },
        { x: 344, w: 36, h: 62,  col: '#231738', win: '#ff70a6', neon: '#ffd60a', style: 'single' },
        { x: 388, w: 44, h: 78,  col: '#18162e', win: '#ffd166', neon: '#00f5d4', style: 'double' },
        { x: 540, w: 56, h: 102, col: '#16142c', win: '#00f5d4', neon: '#ff007f', style: 'double' },
        { x: 608, w: 46, h: 80,  col: '#261936', win: '#ffd166', neon: '#ff007f', style: 'single' },
        { x: 680, w: 52, h: 106, col: '#15152b', win: '#48cae4', neon: '#00f5d4', style: 'double' },
        { x: 748, w: 44, h: 74,  col: '#241836', win: '#ff70a6', neon: '#ffd60a', style: 'single' },
        { x: 812, w: 58, h: 96,  col: '#17162d', win: '#fff3b0', neon: '#ff007f', style: 'double' }
      ];

      this.reset();
    },

    reset() {
      this.scroll = 0;
      this.zOffset = 0;
      this.curve = 0.24;
      this.targetCurve = 0.34;
      this.curveTimer = 4.0;
      this.skyOffset = 0;
      this.roadProps.length = 0;
      this.propSpawnTimer = 0;
      this.propStep = 0;

      for (let d = 0.02; d < 0.96; d += 0.065) {
        this.spawnPropRow(d);
      }
    },

    spawnPropRow(d) {
      this.propStep++;
      const mod = this.propStep % 6;

      const leftInnerType = (mod === 0 || mod === 3) ? 'lamp' : (mod === 5 ? 'signRight' : 'palm');
      const rightInnerType = (mod === 0 || mod === 3) ? 'lamp' : (mod === 5 ? 'signLeft' : 'palm');

      this.roadProps.push({
        d,
        lanePos: -1.10,
        type: leftInnerType
      });

      this.roadProps.push({
        d,
        lanePos: 1.10,
        type: rightInnerType
      });

      if (mod === 1 || mod === 4) {
        this.roadProps.push({
          d,
          lanePos: -1.52,
          type: mod === 1 ? 'hotel' : 'billboard',
          variant: (this.propStep >> 1) & 1
        });
      }
      if (mod === 2) {
        this.roadProps.push({
          d,
          lanePos: 1.48,
          type: 'billboard',
          variant: (this.propStep + 1) & 1
        });
      } else if (mod === 4) {
        this.roadProps.push({
          d,
          lanePos: 1.42,
          type: 'palm'
        });
      }
    },

    project(lanePos, d) {
      const H = PR.CFG.H, W = PR.CFG.W;
      const dc = U.clamp(d, 0, 1.12);
      const y = HORIZON_Y + dc * (H - HORIZON_Y);
      const halfW = U.lerp(30, 382, dc);
      const curveShift = this.curve * Math.pow(1 - Math.min(1, dc), 1.85) * 105;
      const cx = W * 0.5 + curveShift;
      const x = cx + lanePos * halfW;
      const scale = halfW / 302; 
      return { x, y, cx, halfW, scale };
    },

    update(dt, roadSpeed) {
      this.scroll += roadSpeed * dt;
      this.zOffset += (roadSpeed / 265) * dt;

      this.curveTimer -= dt;
      if (this.curveTimer <= 0) {
        this.curveTimer = U.rand(4.5, 7.5);
        this.targetCurve = U.pick([-0.40, -0.22, 0.22, 0.40, 0.30]);
      }
      this.curve = U.damp(this.curve, this.targetCurve, 1.0, dt);

      this.skyOffset = (this.skyOffset + this.curve * roadSpeed * 0.12 * dt) % 900;
      if (this.skyOffset < 0) this.skyOffset += 900;

      for (let i = this.roadProps.length - 1; i >= 0; i--) {
        const p = this.roadProps[i];
        const scale = U.lerp(30, 382, U.clamp(p.d, 0, 1.1)) / 302;
        p.d += (roadSpeed / 410) * scale * dt;
        if (p.d > 1.08) {
          this.roadProps.splice(i, 1);
        }
      }

      this.propSpawnTimer -= (roadSpeed / 330) * dt;
      if (this.propSpawnTimer <= 0) {
        this.spawnPropRow(0.015);
        this.propSpawnTimer = 0.16;
      }
    },

    drawSkyAndRoad(ctx, time, nitroActive) {
      const W = PR.CFG.W, H = PR.CFG.H;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
      skyGrad.addColorStop(0, '#040310');
      skyGrad.addColorStop(0.38, '#140734');
      skyGrad.addColorStop(0.68, '#4a1272');
      skyGrad.addColorStop(0.88, '#b5179e');
      skyGrad.addColorStop(1, '#ff6d00');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, HORIZON_Y);

      for (const st of this.stars) {
        ctx.fillStyle = st.col;
        if (st.cross) {
          ctx.fillRect(st.x - 1, st.y, 3, 1);
          ctx.fillRect(st.x, st.y - 1, 1, 3);
        } else {
          ctx.fillRect(st.x, st.y, 1, 1);
        }
      }

      const sunX = Math.round(W * 0.5 + this.curve * 48);
      const sunY = HORIZON_Y - 14;
      const sunR = 46;
      const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + 12);
      sunGrad.addColorStop(0, '#ffd60a');
      sunGrad.addColorStop(0.55, '#ff5400');
      sunGrad.addColorStop(1, '#ff007f');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, Math.PI, 0, false);
      ctx.fill();

      ctx.fillStyle = '#5a1478';
      for (let sy = sunY - 22; sy < sunY; sy += 5) {
        ctx.fillRect(sunX - sunR, sy, sunR * 2, 2);
      }

      const farShift = Math.floor(this.skyOffset * 0.45) % 960;
      for (let rep = -1; rep <= 1; rep++) {
        for (const b of this.farCity) {
          const bx = Math.round(b.x - farShift + rep * 960);
          if (bx + b.w < 0 || bx > W) continue;
          const by = HORIZON_Y - 18 - b.h;
          ctx.fillStyle = b.col;
          ctx.fillRect(bx, by, b.w, b.h + 18);
          ctx.fillStyle = b.winCol;
          for (let wy = by + 4; wy < HORIZON_Y - 20; wy += 4) {
            for (let wx = bx + 3; wx < bx + b.w - 3; wx += 4) {
              ctx.fillRect(wx, wy, 2, 2);
            }
          }
        }
      }

      ctx.fillStyle = '#24173d';
      ctx.fillRect(0, HORIZON_Y - 18, W, 18);

      const nearShift = Math.floor(this.skyOffset) % 900;
      for (let rep = -1; rep <= 1; rep++) {
        const bridgeX = Math.round(350 - nearShift + rep * 900);
        if (bridgeX + 180 > 0 && bridgeX < W) {
          const by = HORIZON_Y - 15;
          ctx.fillStyle = '#3a2c5c';
          ctx.fillRect(bridgeX, by, 180, 2);
          ctx.fillRect(bridgeX, by + 10, 180, 2);
          ctx.fillStyle = '#00f5d4';
          ctx.fillRect(bridgeX, by + 1, 180, 1);
          ctx.fillStyle = '#414868';
          for (let gx = bridgeX; gx < bridgeX + 180; gx += 12) {
            ctx.fillRect(gx, by, 2, 12);
            ctx.fillRect(gx + 4, by + 3, 4, 2);
            ctx.fillRect(gx + 6, by + 6, 4, 2);
          }
        }

        for (const b of this.nearCity) {
          const bx = Math.round(b.x - nearShift + rep * 900);
          if (bx + b.w < 0 || bx > W) continue;
          const by = HORIZON_Y - b.h;

          ctx.fillStyle = b.col;
          ctx.fillRect(bx, by, b.w, b.h);

          ctx.fillStyle = b.neon;
          ctx.fillRect(bx, by, 1, b.h);
          ctx.fillRect(bx + b.w - 1, by, 1, b.h);
          ctx.fillRect(bx + 2, by, b.w - 4, 2);

          for (let wy = by + 7; wy < HORIZON_Y - 7; wy += 10) {
            for (let wx = bx + 5; wx < bx + b.w - 7; wx += 11) {
              if (((wx * 3 + wy) % 5) === 0) continue;
              ctx.fillStyle = b.win;
              ctx.fillRect(wx, wy, 3, 5);
              if (b.style === 'double' && wx + 5 < bx + b.w - 4) {
                ctx.fillRect(wx + 5, wy, 3, 5);
              }
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(wx, wy, 2, 2);
            }
          }
        }
      }

      ctx.fillStyle = '#ff007f';
      ctx.fillRect(0, HORIZON_Y - 2, W, 1);
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(0, HORIZON_Y - 1, W, 1);

      for (let y = HORIZON_Y; y < H; y += 2) {
        const d = (y - HORIZON_Y) / (H - HORIZON_Y);

        const zMap = 1 / (d + 0.052);
        const band = Math.floor(zMap * 5.0 - this.zOffset * 6.5);
        const isAlt = (band & 1) === 0;
        const isDash = (Math.floor(zMap * 7.2 - this.zOffset * 9.0) % 3) === 0;

        const halfW = U.lerp(30, 382, d);
        const curveShift = this.curve * Math.pow(1 - d, 1.85) * 105;
        const cx = Math.round(W * 0.5 + curveShift);
        const rl = Math.round(cx - halfW);
        const rr = Math.round(cx + halfW);
        const rw = rr - rl;

        if (rl > 0) {
          const promW = Math.round(halfW * 0.34);
          const grassEnd = Math.max(0, rl - promW);

          ctx.fillStyle = isAlt ? '#0c2d2c' : '#082223';
          ctx.fillRect(0, y, grassEnd, 2);

          ctx.fillStyle = isAlt ? '#291a44' : '#201437';
          ctx.fillRect(grassEnd, y, rl - grassEnd, 2);

          ctx.fillStyle = isAlt ? '#ff007f' : '#00f5d4';
          ctx.fillRect(grassEnd, y, Math.max(1, Math.round(3 * d)), 2);
        }

        if (rr < W) {
          const guardW = Math.max(3, Math.round(18 * d));
          const sandW = Math.max(4, Math.round(28 * d));
          const waterX = rr + guardW + sandW;

          ctx.fillStyle = isAlt ? '#382a40' : '#2d2136';
          ctx.fillRect(rr, y, sandW + guardW, 2);

          if (waterX < W) {
            ctx.fillStyle = isAlt ? '#0a1c3e' : '#071530';
            ctx.fillRect(waterX, y, W - waterX, 2);

            const shimmer = Math.sin(y * 0.35 + this.zOffset * 4) * 14;
            const refW = Math.max(8, Math.round((W - waterX) * 0.45));
            const refX = Math.round(waterX + 10 + Math.abs(shimmer));
            ctx.fillStyle = (band % 3 === 0) ? '#ff007f' : (band % 3 === 1 ? '#00f5d4' : '#ff9e00');
            ctx.fillRect(refX, y, Math.min(refW, W - refX), 1);
          }

          ctx.fillStyle = isAlt ? '#1c1624' : '#120e18';
          ctx.fillRect(rr - guardW, y, guardW, 2);
          ctx.fillStyle = isAlt ? '#00f5d4' : '#ff007f';
          ctx.fillRect(rr - guardW, y, Math.max(1, Math.round(2 * d)), 2);
        }

        const curbW = Math.max(2, Math.round(10 * d));
        ctx.fillStyle = isAlt ? '#ff007f' : '#00f5d4';
        ctx.fillRect(rl - curbW, y, curbW, 2);

        ctx.fillStyle = d < 0.14
          ? (isAlt ? '#2c3148' : '#262b40')
          : (isAlt ? '#434b63' : '#3c445a');
        ctx.fillRect(rl, y, rw, 2);

        ctx.fillStyle = d < 0.14
          ? (isAlt ? '#323852' : '#2c324a')
          : (isAlt ? '#4b5570' : '#444e67');
        for (const laneCenter of [-0.667, 0.0, 0.667]) {
          const stripX = Math.round(cx + laneCenter * halfW);
          const stripW = Math.max(2, Math.round(halfW * 0.34));
          ctx.fillRect(stripX - (stripW >> 1), y, stripW, 2);
        }

        if (isDash) {
          const lineW = Math.max(1, Math.round(7 * d));
          ctx.fillStyle = nitroActive ? '#00f5d4' : (d < 0.12 ? '#9aa6c8' : '#e0e6f8');
          for (const lp of [-0.333, 0.333]) {
            const lx = Math.round(cx + lp * halfW);
            ctx.fillRect(lx - (lineW >> 1), y, lineW, 2);
          }
        }
      }
    },

    drawRace(ctx, nitroActive) {
      this.drawSkyAndRoad(ctx, this.zOffset, nitroActive);
    },

    drawMenuBackdrop(ctx, time) {
      this.zOffset = time * 1.2;
      this.curve = Math.sin(time * 0.45) * 0.32;
      this.skyOffset = (time * 24) % 900;
      this.drawSkyAndRoad(ctx, time, true);

      const sp = PR.Sprites.cache;
      let step = 0;
      for (let d = 0.06; d < 0.94; d += 0.12) {
        step++;
        const pL = this.project(-1.10, d);
        const pR = this.project(1.10, d);
        if (step % 2 === 0) {
          const w = Math.max(4, Math.round(44 * pL.scale));
          const h = Math.max(8, Math.round(114 * pL.scale));
          ctx.drawImage(sp.streetlight, Math.round(pL.x - w * 0.5), Math.round(pL.y - h), w, h);
          ctx.drawImage(sp.streetlight, Math.round(pR.x - w * 0.5), Math.round(pR.y - h), w, h);
        } else {
          const w = Math.max(6, Math.round(78 * pL.scale));
          const h = Math.max(10, Math.round(114 * pL.scale));
          ctx.drawImage(sp.palm3D, Math.round(pL.x - w * 0.5), Math.round(pL.y - h), w, h);
          ctx.drawImage(sp.palm3D, Math.round(pR.x - w * 0.5), Math.round(pR.y - h), w, h);
        }
      }
    }
  };

  PR.Background = Background;
})();
