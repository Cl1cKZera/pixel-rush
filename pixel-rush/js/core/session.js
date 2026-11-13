/* Sistema de Sessão Automática para a Feira de Matemática (Seção 9):
 * - Monitora inatividade global (60s -> aviso de 10s -> reinicialização completa da sessão).
 * - Qualquer interação válida durante os 10s de aviso cancela o encerramento.
 * - Na tela de Resultados, retorna automaticamente ao Menu Principal após 20 segundos.
 * - Detecta eventos Offline/Online discretamente sem interromper a partida (offline-first). */
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

      // Qualquer interação de teclado, mouse ou toque reseta o timer de inatividade
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

    // Executa limpeza completa da sessão do participante atual (preservando recordes e configurações)
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

      // Se alguma tecla estiver mantida pressionada, conta como atividade contínua
      if (PR.Input.anyHeld()) {
        this.registerInteraction();
      }

      // Timer automático de 20 segundos na tela de Resultados
      if (gameState === 'RESULTS' && !this.warningActive) {
        this.resultsLeft -= dt;
        if (this.resultsLeft <= 0) {
          this.fullSessionReset();
          return;
        }
      }

      // Contagem de inatividade (60 segundos sem interação -> tela de aviso por 10 segundos)
      if (!this.warningActive) {
        // No menu inicial sem partida em andamento ainda monitora para limpar modais ou sessões abandonadas
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

