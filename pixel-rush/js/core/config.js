/* PIXEL RUSH: MATHEMATICS OVERDRIVE — configuração global
 * Todos os módulos compartilham o namespace global `PR` (scripts clássicos,
 * para funcionar direto via file:// sem servidor). */
(function () {
  'use strict';
  const PR = (window.PR = window.PR || {});
  const params = new URLSearchParams(window.location.search);
  const num = (k, d) => {
    const v = parseFloat(params.get(k));
    return isFinite(v) && v > 0 ? v : d;
  };

  PR.CFG = {
    W: 640,                 // resolução interna (pixel art) — escalada sem distorção
    H: 360,
    LANES: 3,               // 3 faixas largas em perspectiva 3D (Esquerda, Centro, Direita)
    LANE_W: 90,
    ROAD_L: 185,
    ROAD_R: 455,
    CENTER: 320,
    PLAYER_Y: 314,          // posição vertical do conversível na câmera traseira 3D

    MATCH_TIME: num('match', 180),        // duração da partida (s)
    COUNTDOWN: 3,
    RESULTS_TIMEOUT: num('results', 20),  // resultados → menu (s)
    IDLE_TIMEOUT: num('idle', 60),        // inatividade até o aviso (s)
    IDLE_WARNING: num('warn', 10),        // duração do aviso (s)
    MATH_AFK_TIMEOUT: num('mathafk', 25), // tempo máximo AFK na pausa da pergunta antes de voltar ao menu (s)

    KMH: 0.4,               // km/h por px/s   (1 px ≈ 0,111 m)
    M_PER_PX: 0.4 / 3.6,
    SPEED: {
      min: 150, cruise0: 290, cruise1: 370, max0: 500, max1: 590,
      nitroAdd: 230, accel: 270, brake: 430, coast: 110
    },
    LIVES: 3,
    FUEL_DRAIN: 1.05,       // % por segundo em velocidade de cruzeiro
    MAX_MULT: 6,

    DEBUG: params.has('debug'),
    SELFTEST: params.has('selftest')
  };
})();

