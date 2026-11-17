(function () {
  'use strict';
  const PR = window.PR;
  const KEY = 'pixelrush_mo_v1';
  const DEFAULTS = {
    settings: { master: 0.8, music: 0.55, sfx: 0.85, muted: false, scanlines: true },
    records: [],
    plays: 0
  };
  let data = null;
  let available = true;

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : clone(DEFAULTS);
    } catch (e) {
      available = false;
      data = clone(DEFAULTS);
    }
    if (!data || typeof data !== 'object') data = clone(DEFAULTS);
    data.settings = Object.assign({}, DEFAULTS.settings, data.settings || {});
    if (!Array.isArray(data.records)) data.records = [];
    data.records = data.records.filter((r) => r && typeof r.score === 'number' && isFinite(r.score));
    data.records.sort((a, b) => b.score - a.score);
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      available = false;
      return false;
    }
  }

  PR.Storage = {
    init() { load(); },
    get settings() { return data.settings; },
    saveSettings(s) { Object.assign(data.settings, s || {}); save(); },
    records() { return data.records.slice(); },
    best() { return data.records.length ? data.records[0].score : 0; },
    bestRecord() { return data.records[0] || null; },
    addRecord(r) {
      const prevBest = this.best();
      data.records.push(r);
      data.records.sort((a, b) => b.score - a.score);
      data.records = data.records.slice(0, 10);
      data.plays = (data.plays || 0) + 1;
      save();
      return { position: data.records.indexOf(r), isBest: r.score > prevBest && r.score > 0, prevBest };
    },
    get plays() { return data.plays || 0; },
    get available() { return available; },
    _key: KEY
  };
})();
