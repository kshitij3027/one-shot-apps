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
    btnReset: document.getElementById('btn-reset')
  };

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function render() {
    if (elements.timerDisplay) elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
    if (elements.sessionLabel) elements.sessionLabel.textContent = state.session === 'work' ? 'Work' : (state.session === 'longBreak' ? 'Long break' : 'Break');
  }

  function tick() {
    if (state.remainingSeconds <= 0) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      state.isRunning = false;
      render();
      return;
    }
    state.remainingSeconds -= 1;
    render();
  }

  function start() {
    if (state.isRunning) return;
    state.isRunning = true;
    state.intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (!state.isRunning) return;
    state.isRunning = false;
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
    render();
  }

  if (elements.btnStart) elements.btnStart.addEventListener('click', start);
  if (elements.btnPause) elements.btnPause.addEventListener('click', pause);
  if (elements.btnStop) elements.btnStop.addEventListener('click', stop);
  if (elements.btnReset) elements.btnReset.addEventListener('click', reset);

  init();
})();
