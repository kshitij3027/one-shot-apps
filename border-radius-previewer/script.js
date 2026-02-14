// Border Radius Previewer

(function () {
  const previewBox = document.getElementById('preview-box');
  const cssOutput = document.getElementById('css-output');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedInputs = document.getElementById('advanced-inputs');
  const simpleInputs = document.getElementById('simple-inputs');

  const cornerIds = ['tl', 'tr', 'br', 'bl'];
  const advancedIds = ['tl-h', 'tr-h', 'br-h', 'bl-h', 'tl-v', 'tr-v', 'br-v', 'bl-v'];

  function getValue(id) {
    const el = document.getElementById(id);
    return Math.max(0, parseInt(el?.value || '0', 10) || 0);
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = String(val);
  }

  function buildCSS() {
    const isAdvanced = advancedInputs && !advancedInputs.hidden;

    if (isAdvanced) {
      const h = advancedIds.slice(0, 4).map(getValue);
      const v = advancedIds.slice(4, 8).map(getValue);
      const parts = h.map((hv, i) => `${hv}px`).join(' ') + ' / ' + v.map((vv) => `${vv}px`).join(' ');
      return `border-radius: ${parts};`;
    }

    const values = cornerIds.map(getValue);
    const parts = values.map((v) => `${v}px`).join(' ');
    return `border-radius: ${parts};`;
  }

  function updatePreview() {
    const css = buildCSS();
    if (previewBox) previewBox.style.borderRadius = css.replace('border-radius: ', '').replace(';', '').trim();
    if (cssOutput) cssOutput.textContent = css;
  }

  function syncSimpleToAdvanced() {
    cornerIds.forEach((id, i) => {
      const v = getValue(id);
      setValue(advancedIds[i], v);
      setValue(advancedIds[i + 4], v);
    });
  }

  function syncAdvancedToSimple() {
    cornerIds.forEach((id, i) => {
      const h = getValue(advancedIds[i]);
      const v = getValue(advancedIds[i + 4]);
      setValue(id, Math.round((h + v) / 2));
    });
  }

  function setupInputListeners() {
    cornerIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (advancedInputs && !advancedInputs.hidden) syncSimpleToAdvanced();
          updatePreview();
        });
      }
    });

    advancedIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          syncAdvancedToSimple();
          updatePreview();
        });
      }
    });
  }

  function setupAdvancedToggle() {
    if (!advancedToggle || !advancedInputs) return;

    advancedToggle.addEventListener('click', () => {
      const isOpen = !advancedInputs.hidden;
      advancedInputs.hidden = isOpen;
      advancedToggle.setAttribute('aria-pressed', isOpen ? 'false' : 'true');
      advancedToggle.textContent = isOpen ? 'Advanced (8 values)' : 'Simple (4 values)';

      if (!advancedInputs.hidden) {
        syncSimpleToAdvanced();
      } else {
        syncAdvancedToSimple();
      }
      updatePreview();
    });
  }

  function setupCopyButton() {
    if (!copyBtn || !copyFeedback) return;

    copyBtn.addEventListener('click', async () => {
      const css = buildCSS();
      try {
        await navigator.clipboard.writeText(css);
        copyFeedback.textContent = 'Copied!';
        copyFeedback.style.color = '#4ade80';
        setTimeout(() => {
          copyFeedback.textContent = '';
        }, 2000);
      } catch (err) {
        copyFeedback.textContent = 'Failed to copy';
        copyFeedback.style.color = '#f87171';
        setTimeout(() => {
          copyFeedback.textContent = '';
        }, 2000);
      }
    });
  }

  setupInputListeners();
  setupAdvancedToggle();
  setupCopyButton();
  updatePreview();
})();
