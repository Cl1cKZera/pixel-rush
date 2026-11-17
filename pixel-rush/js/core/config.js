(function () {
  'use strict';
  const PR = (window.PR = window.PR || {});
  const params = new URLSearchParams(window.location.search);
  const num = (k, d) => {
    const v = parseFloat(params.get(k));
    return isFinite(v) && v > 0 ? v : d;
  };

  PR.CFG = {
    W: 640,                 
    H: 360,
    LANES: 3,               
    LANE_W: 90,
    ROAD_L: 185,
    ROAD_R: 455,
    CENTER: 320,
    PLAYER_Y: 314,          

    MATCH_TIME: num('match', 180),        
    COUNTDOWN: 3,
    RESULTS_TIMEOUT: num('results', 20),  
    IDLE_TIMEOUT: num('idle', 60),        
    IDLE_WARNING: num('warn', 10),        
    MATH_AFK_TIMEOUT: num('mathafk', 25), 

    KMH: 0.4,               
    M_PER_PX: 0.4 / 3.6,
    SPEED: {
      min: 150, cruise0: 290, cruise1: 370, max0: 500, max1: 590,
      nitroAdd: 230, accel: 270, brake: 430, coast: 110
    },
    LIVES: 3,
    FUEL_DRAIN: 1.05,       
    MAX_MULT: 6,

    DEBUG: params.has('debug'),
    SELFTEST: params.has('selftest')
  };
})();
