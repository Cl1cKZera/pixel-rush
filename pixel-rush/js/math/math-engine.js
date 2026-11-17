(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const MathEngine = {
    history: [],
    maxHistory: 25,
    seqIndex: 0,

    reset() {
      this.history.length = 0;
      this.seqIndex = 0;
    },

    computeDifficulty(progress, streak) {
      if (progress < 0.35 && streak < 3) return 1;
      if (progress < 0.70 && streak < 6) return 2;
      return U.chance(0.5) ? 2 : 3;
    },

    makeNumericOptions(correct, unit, opts) {
      opts = opts || {};
      const minVal = opts.min !== undefined ? opts.min : 1;
      const step = opts.step || 2;
      const set = new Set([correct]);
      const candidates = [
        correct + step,
        correct - step,
        correct + step * 2,
        correct - step * 2,
        correct + 10,
        correct - 10,
        correct + 5,
        correct - 5,
        correct + 3,
        correct - 3
      ];

      U.shuffle(candidates);
      for (const c of candidates) {
        if (set.size >= 3) break;
        if (c >= minVal && c !== correct && (!opts.max || c <= opts.max)) {
          set.add(c);
        }
      }
      let fallback = correct + step;
      while (set.size < 3) {
        if (fallback !== correct && fallback >= minVal) set.add(fallback);
        fallback += step;
      }

      const values = U.shuffle(Array.from(set));
      const correctPortal = values.indexOf(correct);
      const labels = values.map((v) => U.fmtNum(v) + (unit ? ' ' + unit : ''));
      return { values, labels, correctPortal };
    },

    genOperation(diff, isNitro) {
      const subTypes = diff === 1
        ? ['add', 'sub', 'mul']
        : diff === 2
          ? ['add', 'sub', 'mul', 'div', 'pct', 'pow', 'sqrt']
          : ['mul', 'div', 'pct', 'pow', 'sqrt', 'eq'];
      const kind = U.pick(subTypes);
      let prompt = '', context = '', correct = 0, step = 2, opLabel = '';

      if (kind === 'add') {
        const a = diff === 1 ? U.randi(4, 15) : U.randi(10, 30);
        const b = diff === 1 ? U.randi(3, 12) : U.randi(5, 25);
        correct = a + b;
        step = U.pick([2, 3, 5]);
        prompt = a + ' + ' + b + ' = ?';
        opLabel = 'SOMA';
        context = 'SOME OS DOIS NÚMEROS:';
      } else if (kind === 'sub') {
        const b = diff === 1 ? U.randi(3, 10) : U.randi(5, 18);
        correct = diff === 1 ? U.randi(4, 15) : U.randi(6, 22);
        const a = correct + b;
        step = U.pick([2, 3, 5]);
        prompt = a + ' - ' + b + ' = ?';
        opLabel = 'SUBTRAÇÃO';
        context = 'CALCULE A SUBTRAÇÃO:';
      } else if (kind === 'mul') {
        const a = diff === 1 ? U.randi(2, 6) : U.randi(3, 9);
        const b = diff === 1 ? U.randi(2, 6) : U.randi(2, 8);
        correct = a * b;
        step = Math.max(2, Math.min(a, b));
        prompt = a + ' × ' + b + ' = ?';
        opLabel = 'TABUADA';
        context = 'QUAL É O RESULTADO DA MULTIPLICAÇÃO?';
      } else if (kind === 'div') {
        const b = U.randi(2, 6);
        correct = U.randi(2, 8);
        const a = b * correct;
        step = 2;
        prompt = a + ' ÷ ' + b + ' = ?';
        opLabel = 'DIVISÃO';
        context = 'DIVIDA OS VALORES:';
      } else if (kind === 'pct') {
        const pairs = [
          [50, 20, 'METADE (50%) DE 20:'],
          [50, 40, 'METADE (50%) DE 40:'],
          [50, 60, 'METADE (50%) DE 60:'],
          [50, 100, 'METADE (50%) DE 100:'],
          [10, 50, '10% DE 50:'],
          [10, 80, '10% DE 80:'],
          [10, 100, '10% DE 100:'],
          [25, 40, 'UM QUARTO (25%) DE 40:'],
          [20, 50, '20% DE 50:']
        ];
        const [p, tot, ctx] = U.pick(pairs);
        correct = Math.round((p * tot) / 100);
        step = 5;
        prompt = p + '% DE ' + tot + ' = ?';
        opLabel = 'PORCENTAGEM';
        context = ctx;
      } else if (kind === 'pow') {
        const powers = [
          ['2²', 4, '2 AO QUADRADO (2 × 2):'],
          ['3²', 9, '3 AO QUADRADO (3 × 3):'],
          ['4²', 16, '4 AO QUADRADO (4 × 4):'],
          ['5²', 25, '5 AO QUADRADO (5 × 5):'],
          ['6²', 36, '6 AO QUADRADO (6 × 6):'],
          ['10²', 100, '10 AO QUADRADO (10 × 10):'],
          ['2³', 8, '2 AO CUBO (2 × 2 × 2):']
        ];
        const [expr, val, ctx] = U.pick(powers);
        correct = val;
        step = 3;
        prompt = expr + ' = ?';
        opLabel = 'POTÊNCIA';
        context = ctx;
      } else if (kind === 'sqrt') {
        const roots = [
          [9, 3], [16, 4], [25, 5], [36, 6], [49, 7], [64, 8], [81, 9], [100, 10]
        ];
        const [n, r] = U.pick(roots);
        correct = r;
        step = 2;
        prompt = '√' + n + ' = ?';
        opLabel = 'RAIZ QUADRADA';
        context = 'QUAL NÚMERO VEZES ELE MESMO DÁ ' + n + '?';
      } else {

        if (U.chance(0.6)) {
          correct = U.randi(3, 12);
          const a = U.randi(2, 10);
          const b = correct + a;
          prompt = 'X + ' + a + ' = ' + b + '  (X = ?)';
          context = 'QUAL NÚMERO SOMADO COM ' + a + ' DÁ ' + b + '?';
        } else {
          const a = U.pick([2, 3, 4, 5]);
          correct = U.randi(2, 8);
          const b = a * correct;
          prompt = a + ' × X = ' + b + '  (X = ?)';
          context = 'QUAL NÚMERO MULTIPLICADO POR ' + a + ' DÁ ' + b + '?';
        }
        step = 2;
        opLabel = 'EQUAÇÃO';
      }

      if (isNitro) {
        context = '⚡ ACERTE PARA GANHAR +65% DE SUPER NITRO!';
      }

      const opt = this.makeNumericOptions(correct, '', { min: 1, step });
      return {
        mechanic: isNitro ? 'NITRO' : 'PORTAL',
        badge: isNitro ? '⚡ NITRO MATEMÁTICO • ' + opLabel : 'PORTAL MATEMÁTICO • ' + opLabel,
        context,
        prompt,
        correct,
        options: opt.labels,
        correctPortal: opt.correctPortal,
        difficulty: diff,
        color: isNitro ? '#00f5d4' : '#ff007f'
      };
    },

    genFuelChallenge(diff, playerFuelPct) {
      const tank = U.clamp(Math.round((playerFuelPct || 50) / 10) * 10, 20, 70);
      const gallon = U.pick([10, 20, 25, 30]);
      const correct = Math.min(100, tank + gallon);
      const context = 'SEU TANQUE TEM ' + tank + '% + GALÃO DE ' + gallon + '%:';
      const prompt = tank + '% + ' + gallon + '% = ?';

      const opt = this.makeNumericOptions(correct, '%', { min: 10, max: 100, step: 10 });
      return {
        mechanic: 'FUEL',
        badge: '⛽ COMBUSTÍVEL MATEMÁTICO (%)',
        context,
        prompt,
        correct,
        options: opt.labels,
        correctPortal: opt.correctPortal,
        difficulty: diff,
        color: '#ff9e00'
      };
    },

    genKinematics(diff) {
      const templates = [
        () => {
          const v = U.pick([50, 60, 80, 100]);
          const t = U.pick([2, 3]);
          const d = v * t;
          return {
            context: 'A ' + v + ' KM POR HORA, EM ' + t + ' HORAS VOCÊ ANDA:',
            prompt: v + ' × ' + t + ' = ? KM',
            correct: d,
            unit: 'KM',
            step: 20
          };
        },
        () => {
          const v = U.pick([40, 50, 60, 80, 100]);
          const t = 2;
          const d = v * t;
          return {
            context: 'PERCORREU ' + d + ' KM EM 2 HORAS. QUAL A VELOCIDADE?',
            prompt: d + ' ÷ 2 = ? KM/H',
            correct: v,
            unit: 'KM/H',
            step: 10
          };
        },
        () => {
          const v = U.pick([80, 100, 120, 150]);
          const boost = U.pick([20, 30, 40, 50]);
          return {
            context: 'VELOCIDADE DE ' + v + ' KM/H + TURBO DE ' + boost + ' KM/H:',
            prompt: v + ' + ' + boost + ' = ? KM/H',
            correct: v + boost,
            unit: 'KM/H',
            step: 10
          };
        }
      ];

      const item = U.pick(templates)();
      const opt = this.makeNumericOptions(item.correct, item.unit, { min: 10, step: item.step });
      return {
        mechanic: 'KINEMATICS',
        badge: '🏁 VELOCIDADE & DISTÂNCIA',
        context: item.context,
        prompt: item.prompt,
        correct: item.correct,
        options: opt.labels,
        correctPortal: opt.correctPortal,
        difficulty: diff,
        color: '#4cc9f0'
      };
    },

    genSurprise(diff) {
      const templates = [
        () => ({
          context: 'QUAL É O PRÓXIMO NÚMERO (CONTANDO DE 2 EM 2)?',
          prompt: '2, 4, 6, 8, ?',
          correct: 10,
          step: 2
        }),
        () => ({
          context: 'QUAL É O PRÓXIMO NÚMERO (CONTANDO DE 5 EM 5)?',
          prompt: '5, 10, 15, 20, ?',
          correct: 25,
          step: 5
        }),
        () => ({
          context: 'QUAL É O PRÓXIMO NÚMERO (CONTANDO DE 10 EM 10)?',
          prompt: '10, 20, 30, 40, ?',
          correct: 50,
          step: 10
        }),
        () => ({
          context: 'QUAL É O PRÓXIMO NÚMERO (CONTANDO DE 3 EM 3)?',
          prompt: '3, 6, 9, 12, ?',
          correct: 15,
          step: 3
        }),
        () => ({
          context: 'SEMPRE DOBRANDO O VALOR:',
          prompt: '2, 4, 8, 16, ?',
          correct: 32,
          step: 4
        }),
        () => {
          const n = U.pick([10, 15, 20, 25, 30, 40]);
          return {
            context: 'QUAL É O DOBRO DE ' + n + '?',
            prompt: '2 × ' + n + ' = ?',
            correct: n * 2,
            step: 5
          };
        }
      ];

      const item = U.pick(templates)();
      const opt = this.makeNumericOptions(item.correct, '', { min: 1, step: item.step });
      return {
        mechanic: 'SURPRISE',
        badge: '★ DESAFIO SURPRESA • RACIOCÍNIO',
        context: item.context,
        prompt: item.prompt,
        correct: item.correct,
        options: opt.labels,
        correctPortal: opt.correctPortal,
        difficulty: diff,
        color: '#ffd60a'
      };
    },

    nextChallenge(state) {
      state = state || {};
      const progress = state.progress || 0;
      const streak = state.streak || 0;
      const fuel = state.fuel !== undefined ? state.fuel : 60;
      const nitro = state.nitro !== undefined ? state.nitro : 40;
      const diff = this.computeDifficulty(progress, streak);

      let mech;
      this.seqIndex++;
      if (fuel < 52 && U.chance(0.5)) {
        mech = 'FUEL';
      } else if (this.seqIndex % 5 === 1) {
        mech = 'PORTAL';
      } else if (this.seqIndex % 5 === 2) {
        mech = nitro < 75 ? 'NITRO' : 'PORTAL';
      } else if (this.seqIndex % 5 === 3) {
        mech = 'FUEL';
      } else if (this.seqIndex % 5 === 4) {
        mech = 'KINEMATICS';
      } else {
        mech = 'SURPRISE';
      }

      let ch = null;
      for (let attempt = 0; attempt < 14; attempt++) {
        if (mech === 'FUEL') ch = this.genFuelChallenge(diff, fuel);
        else if (mech === 'KINEMATICS') ch = this.genKinematics(diff);
        else if (mech === 'SURPRISE') ch = this.genSurprise(diff);
        else if (mech === 'NITRO') ch = this.genOperation(diff, true);
        else ch = this.genOperation(diff, false);

        if (this.history.indexOf(ch.prompt) === -1) break;
      }

      this.history.push(ch.prompt);
      if (this.history.length > this.maxHistory) this.history.shift();
      return ch;
    }
  };

  PR.MathEngine = MathEngine;
})();
