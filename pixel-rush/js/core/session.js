(function () {
  'use strict';
  const PR = window.PR;

  const Session = {
    idleTime: 0,
    warningActive: false,
    warningLeft: 10,
    resultsLeft: 20,
    isOffline: false,
    netToastTimer: 0,
    netToastMsg: '',

    init() {
      this.idleTime = 0;
      this.warningActive = false;
      this.warningLeft = PR.CFG.IDLE_WARNING;
      this.resultsLeft = PR.CFG.RESULTS_TIMEOUT;
      this.isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

      PR.Input.on(() => {
        this.registerInteraction();
      });

      window.addEventListener('offline', () => {
        this.isOffline = true;
        this.netToastMsg = 'MODO OFFLINE ATIVO • JOGO 100% FUNCIONAL LOCALMENTE';
        this.netToastTimer = 6.0;
      });

      window.addEventListener('online', () => {
        this.isOffline = false;
        this.netToastMsg = 'CONEXÃO RESTABELECIDA • SESSÃO CONTINUA NORMALMENTE';
        this.netToastTimer = 4.0;
      });
    },

    registerInteraction() {
      this.idleTime = 0;
      if (this.warningActive) {
        this.warningActive = false;
        this.warningLeft = PR.CFG.IDLE_WARNING;
        PR.Audio.sfx('click');
      }
    },

    startResultsTimer() {
      this.resultsLeft = PR.CFG.RESULTS_TIMEOUT;
    },

    fullSessionReset() {
      this.idleTime = 0;
      this.warningActive = false;
      this.warningLeft = PR.CFG.IDLE_WARNING;
      this.resultsLeft = PR.CFG.RESULTS_TIMEOUT;
      if (PR.Game) {
        PR.Game.resetSessionToMenu();
      }
    },

    update(dt, gameState) {
      if (this.netToastTimer > 0) {
        this.netToastTimer = Math.max(0, this.netToastTimer - dt);
      }

      if (PR.Input.anyHeld()) {
        this.registerInteraction();
      }

      if (gameState === 'RESULTS' && !this.warningActive) {
        this.resultsLeft -= dt;
        if (this.resultsLeft <= 0) {
          this.fullSessionReset();
          return;
        }
      }

      if (!this.warningActive) {

        this.idleTime += dt;
        if (this.idleTime >= PR.CFG.IDLE_TIMEOUT) {
          this.warningActive = true;
          this.warningLeft = PR.CFG.IDLE_WARNING;
          PR.Audio.sfx('low_fuel');
        }
      } else {
        this.warningLeft -= dt;
        if (this.warningLeft <= 0) {
          this.fullSessionReset();
        }
      }
    }
  };

  PR.Session = Session;
})();
