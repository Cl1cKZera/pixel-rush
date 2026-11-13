/* Ponto de Entrada e Loop Principal — PIXEL RUSH: MATHEMATICS OVERDRIVE
 * Adapta o Canvas de 640x360 a qualquer resolução (1366x768, 1920x1080, etc.)
 * preservando a nitidez da pixel art sem distorção. */
(function () {
  'use strict';
  const PR = window.PR;

  let canvas = null;
  let ctx = null;
  let lastTime = 0;

  function resizeCanvas() {
    if (!canvas) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetAspect = PR.CFG.W / PR.CFG.H;
    let dw = vw;
    let dh = Math.round(vw / targetAspect);
    if (dh > vh) {
      dh = vh;
      dw = Math.round(vh * targetAspect);
    }
    canvas.style.width = dw + 'px';
    canvas.style.height = dh + 'px';
  }

  function frame(now) {
    if (!lastTime) lastTime = now;
    const rawDt = (now - lastTime) / 1000;
    lastTime = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    try {
      ctx.imageSmoothingEnabled = false;
      PR.Game.update(dt);
      PR.Game.draw(ctx, dt);
      PR.Input.endFrame();
    } catch (err) {
      console.error('Erro no loop principal do Pixel Rush:', err);
    }

    window.requestAnimationFrame(frame);
  }

  // Suíte integrada de diagnóstico/autoteste (para validar todas as mecânicas da Seção 14)
  PR.SelfTest = {
    runAll() {
      const results = {};

      // 1. Verifica inicialização de sprites e fontes
      results.spritesReady = !!(PR.Sprites.ready && PR.Sprites.cache.player && PR.Sprites.cache.menuCar);

      // 2. Verifica gerador matemático nas 5 mecânicas (100 problemas gerados)
      let mathValid = true;
      const mechsSeen = new Set();
      for (let i = 0; i < 60; i++) {
        const ch = PR.MathEngine.nextChallenge({
          progress: (i % 10) / 10,
          streak: i % 7,
          fuel: 40,
          nitro: 35,
          kmh: 120
        });
        mechsSeen.add(ch.mechanic);
        if (!ch || !Array.isArray(ch.options) || ch.options.length !== 3) mathValid = false;
        if (ch.correctPortal < 0 || ch.correctPortal > 2) mathValid = false;
        // Garante que as 3 alternativas são distintas
        const uniq = new Set(ch.options);
        if (uniq.size !== 3) mathValid = false;
      }
      results.mathValid = mathValid;
      results.mechanicsCount = mechsSeen.size; // deve conter PORTAL, NITRO, FUEL, KINEMATICS, SURPRISE

      // 3. Verifica armazenamento de recordes
      const prevBest = PR.Storage.best();
      PR.Storage.addRecord({
        score: 12345,
        distance: 4.5,
        maxKmh: 240,
        coins: 25,
        mathTotal: 10,
        mathCorrect: 9,
        accuracy: 90,
        rank: 'MATH LEGEND',
        date: new Date().toISOString()
      });
      results.storageWorks = PR.Storage.best() >= Math.max(prevBest, 12345);

      return results;
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    canvas.width = PR.CFG.W;
    canvas.height = PR.CFG.H;
    ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;

    PR.Storage.init();
    PR.Font.build();
    PR.Sprites.init();
    PR.Input.init(canvas);
    PR.Audio.init();
    PR.Background.init();
    PR.Particles.reset();
    PR.Session.init();
    PR.Game.init();

    // Tecla F alterna tela cheia para uso em quiosque/feira
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF' && document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.requestAnimationFrame(frame);
  });
})();

