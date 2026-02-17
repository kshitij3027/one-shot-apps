(function () {
  'use strict';

  const MAX_DIGITS = 8;
  const DISPLAY = document.getElementById('display');

  let state = {
    displayValue: '0',
    currentInput: '',
    previousValue: null,
    pendingOperation: null,
    lastAction: null, // 'digit' | 'operation' | null
    inError: false
  };

  function updateDisplay(value) {
    state.displayValue = String(value);
    DISPLAY.textContent = state.displayValue;
  }

  function formatResult(num) {
    const isInt = Number.isInteger(num);
    if (isInt) return String(num);
    const s = String(num);
    return s.length > MAX_DIGITS + 2 ? String(Number(num.toFixed(MAX_DIGITS - 1))) : s;
  }

  function exceedsMaxDigits(str) {
    const normalized = str.replace(/^-/, '').replace(/\.\d*$/, '');
    return normalized.length > MAX_DIGITS;
  }

  function compute(a, op, b) {
    const x = Number(a);
    const y = Number(b);
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
      case '/': return y === 0 ? null : x / y;
      default: return null;
    }
  }

  function showErr() {
    state.inError = true;
    state.currentInput = '';
    state.previousValue = null;
    state.pendingOperation = null;
    state.lastAction = null;
    updateDisplay('ERR');
  }

  function clearAll() {
    state.displayValue = '0';
    state.currentInput = '';
    state.previousValue = null;
    state.pendingOperation = null;
    state.lastAction = null;
    state.inError = false;
    updateDisplay('0');
  }

  function clearLast() {
    if (state.inError) {
      clearAll();
      return;
    }
    if (state.lastAction === 'digit') {
      state.currentInput = '';
      const prev = state.previousValue != null ? String(state.previousValue) : '0';
      state.displayValue = prev;
      updateDisplay(prev);
      state.lastAction = state.pendingOperation != null ? 'operation' : null;
    } else if (state.lastAction === 'operation') {
      state.pendingOperation = null;
      const prev = state.previousValue != null ? String(state.previousValue) : '0';
      state.displayValue = prev;
      updateDisplay(prev);
      state.lastAction = null;
    }
  }

  function applyOperation(op) {
    if (state.inError) {
      clearAll();
      return;
    }

    const currentNum = state.currentInput || state.displayValue;
    const num = currentNum === '' ? null : Number(currentNum);

    if (state.pendingOperation != null && state.previousValue != null && currentNum !== '') {
      const result = compute(state.previousValue, state.pendingOperation, currentNum);
      if (result === null) {
        showErr();
        return;
      }
      const resultStr = formatResult(result);
      if (exceedsMaxDigits(resultStr)) {
        showErr();
        return;
      }
      state.previousValue = result;
      state.displayValue = resultStr;
      updateDisplay(resultStr);
      state.currentInput = '';
    } else if (op !== '=' && num !== null && !isNaN(num)) {
      state.previousValue = num;
      state.currentInput = '';
    }

    if (op === '=') {
      state.pendingOperation = null;
      state.lastAction = null;
      return;
    }

    state.pendingOperation = op;
    state.lastAction = 'operation';
  }

  function inputDigit(digit) {
    if (state.inError) clearAll();
    if (state.currentInput.length >= MAX_DIGITS) return;
    if (state.lastAction === 'operation') state.currentInput = '';
    state.currentInput += digit;
    state.displayValue = state.currentInput;
    state.lastAction = 'digit';
    updateDisplay(state.displayValue);
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const value = btn.getAttribute('data-value');

    switch (action) {
      case 'clearAll':
        clearAll();
        break;
      case 'clear':
        clearLast();
        break;
      case 'digit':
        inputDigit(value);
        break;
      case 'operation':
        applyOperation(value);
        break;
      case 'equals':
        applyOperation('=');
        break;
    }
  }

  document.querySelector('.entry-pad').addEventListener('click', handleClick);
})();
