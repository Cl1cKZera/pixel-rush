(function () {
  'use strict';
  const PR = window.PR;
  const MAP = {
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    nitro: ['Space'],
    pause: ['Escape', 'KeyP'],
    confirm: ['Enter', 'NumpadEnter', 'Space'],
    back: ['Escape', 'Backspace'],
    mute: ['KeyM'],
    fullscreen: ['KeyF'],
    portal1: ['Digit1', 'Numpad1'],
    portal2: ['Digit2', 'Numpad2'],
    portal3: ['Digit3', 'Numpad3']
  };
  const PREVENT = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Backspace', 'Tab']);

  const Input = {
    down: {},
    pressed: {},
    mouse: { x: -100, y: -100, clicked: false, down: false, moved: false },
    listeners: [],
    canvas: null,
    _lastMove: { x: 0, y: 0 },

    init(canvas) {
      this.canvas = canvas;
      window.addEventListener('keydown', (e) => {
        if (PREVENT.has(e.code)) e.preventDefault();
        if (!e.repeat) this.pressed[e.code] = true;
        this.down[e.code] = true;
        this.emit('key', e);
      });
      window.addEventListener('keyup', (e) => { this.down[e.code] = false; });
      window.addEventListener('blur', () => { this.down = {}; });

      canvas.addEventListener('mousemove', (e) => {
        const p = this.toLocal(e.clientX, e.clientY);
        this.mouse.x = p.x; this.mouse.y = p.y; this.mouse.moved = true;
        const dx = e.clientX - this._lastMove.x, dy = e.clientY - this._lastMove.y;
        if (dx * dx + dy * dy > 64) { 
          this._lastMove.x = e.clientX; this._lastMove.y = e.clientY;
          this.emit('move', e);
        }
      });
      canvas.addEventListener('mousedown', (e) => {
        const p = this.toLocal(e.clientX, e.clientY);
        this.mouse.x = p.x; this.mouse.y = p.y;
        this.mouse.down = true; this.mouse.clicked = true;
        this.emit('mouse', e);
      });
      window.addEventListener('mouseup', () => { this.mouse.down = false; });
      canvas.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        if (t) {
          const p = this.toLocal(t.clientX, t.clientY);
          this.mouse.x = p.x; this.mouse.y = p.y; this.mouse.clicked = true;
        }
        this.emit('touch', e);
      }, { passive: true });
      window.addEventListener('wheel', (e) => this.emit('wheel', e), { passive: true });
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    toLocal(cx, cy) {
      const r = this.canvas.getBoundingClientRect();
      return { x: ((cx - r.left) / r.width) * PR.CFG.W, y: ((cy - r.top) / r.height) * PR.CFG.H };
    },
    on(fn) { this.listeners.push(fn); },
    emit(type, e) { for (const f of this.listeners) { try { f(type, e); } catch (err) { console.error(err); } } },
    held(a) { return MAP[a].some((c) => this.down[c]); },
    hit(a) { return MAP[a].some((c) => this.pressed[c]); },
    anyHeld() { for (const k in this.down) if (this.down[k]) return true; return false; },
    mouseIn(x, y, w, h) { const m = this.mouse; return m.x >= x && m.x < x + w && m.y >= y && m.y < y + h; },
    consume() { this.pressed = {}; this.mouse.clicked = false; },
    endFrame() { this.pressed = {}; this.mouse.clicked = false; this.mouse.moved = false; },

    _simulate(code, isDown) {
      if (isDown) { if (!this.down[code]) this.pressed[code] = true; this.down[code] = true; }
      else this.down[code] = false;
    }
  };
  PR.Input = Input;
})();
