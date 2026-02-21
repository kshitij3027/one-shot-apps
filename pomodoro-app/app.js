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

  function init() {
    state.remainingSeconds = state.workMinutes * 60;
    state.session = 'work';
    render();
  }

  init();
})();
