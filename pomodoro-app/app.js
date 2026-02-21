(function () {
  'use strict';

  const state = {
    session: 'work',
    remainingSeconds: 25 * 60,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 10,
    longBreakEvery: 4,
    breakCount: 0,
    intervalId: null,
    isRunning: false
  };

  const elements = {
    timerDisplay: document.getElementById('timer-display'),
    sessionLabel: document.getElementById('session-label'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnReset: document.getElementById('btn-reset'),
    inputWork: document.getElementById('input-work'),
    inputShortBreak: document.getElementById('input-short-break'),
    inputLongBreak: document.getElementById('input-long-break'),
    inputLongEvery: document.getElementById('input-long-every')
  };

  function setInputsEnabled(enabled) {
    var inputs = [elements.inputWork, elements.inputShortBreak, elements.inputLongBreak, elements.inputLongEvery];
    inputs.forEach(function (el) { if (el) el.disabled = !enabled; });
  }

  function readSettings() {
    function num(el, def, min, max) {
      if (!el) return def;
      var n = parseInt(el.value, 10);
      if (isNaN(n)) return def;
      return Math.max(min, Math.min(max, n));
    }
    state.workMinutes = num(elements.inputWork, 25, 1, 60);
    state.shortBreakMinutes = num(elements.inputShortBreak, 5, 1, 60);
    state.longBreakMinutes = num(elements.inputLongBreak, 10, 1, 60);
    state.longBreakEvery = num(elements.inputLongEvery, 4, 2, 20);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function render() {
    if (elements.timerDisplay) elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
    if (elements.sessionLabel) elements.sessionLabel.textContent = state.session === 'work' ? 'Work' : (state.session === 'longBreak' ? 'Long break' : 'Break');
  }

  function switchToNextSession() {
    if (state.session === 'work') {
      state.breakCount += 1;
      state.session = 'break';
      state.remainingSeconds = state.shortBreakMinutes * 60;
    } else {
      state.session = 'work';
      state.remainingSeconds = state.workMinutes * 60;
    }
  }

  function tick() {
    if (state.remainingSeconds <= 0) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      state.isRunning = false;
      setInputsEnabled(true);
      switchToNextSession();
      render();
      return;
    }
    state.remainingSeconds -= 1;
    render();
  }

  function start() {
    if (state.isRunning) return;
    readSettings();
    state.remainingSeconds = getSessionDurationSeconds();
    render();
    state.isRunning = true;
    setInputsEnabled(false);
    state.intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (!state.isRunning) return;
    state.isRunning = false;
    setInputsEnabled(true);
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
    render();
  }

  function getSessionDurationSeconds() {
    if (state.session === 'work') return state.workMinutes * 60;
    if (state.session === 'longBreak') return state.longBreakMinutes * 60;
    return state.shortBreakMinutes * 60;
  }

  function stop() {
    pause();
    state.remainingSeconds = getSessionDurationSeconds();
    render();
  }

  function reset() {
    stop();
  }

  function init() {
    state.remainingSeconds = state.workMinutes * 60;
    state.session = 'work';
    setInputsEnabled(true);
    render();
  }

  if (elements.btnStart) elements.btnStart.addEventListener('click', start);
  if (elements.btnPause) elements.btnPause.addEventListener('click', pause);
  if (elements.btnStop) elements.btnStop.addEventListener('click', stop);
  if (elements.btnReset) elements.btnReset.addEventListener('click', reset);

  init();
})();
