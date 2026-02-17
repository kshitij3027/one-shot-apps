(function () {
  "use strict";

  // ===== Constants =====
  var STORAGE_EVENTS = "cal_events";
  var STORAGE_THEME = "cal_theme";
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var MAX_CHIPS = 3;

  // ===== State =====
  var state = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    events: [],
    theme: "dark",
    dragEventId: null,
    modal: { open: false, mode: "create", editId: null }
  };

  // ===== DOM Refs =====
  function $(sel) { return document.querySelector(sel); }
  var dom = {};

  // ===== Helpers =====
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dateStr(y, m, d) {
    return y + "-" + pad2(m + 1) + "-" + pad2(d);
  }

  // ===== Persistence =====
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_EVENTS);
      if (raw) state.events = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    var t = localStorage.getItem(STORAGE_THEME);
    if (t === "light" || t === "dark") state.theme = t;
  }

  function persist() {
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(state.events));
  }

  function persistTheme() {
    localStorage.setItem(STORAGE_THEME, state.theme);
  }

  // ===== Calendar Computation =====
  function getCalendarDays(year, month) {
    var days = [];
    var firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevMonthDays = new Date(year, month, 0).getDate();
    var today = todayStr();

    // Previous month fill
    for (var i = firstDay - 1; i >= 0; i--) {
      var d = prevMonthDays - i;
      var pm = month === 0 ? 11 : month - 1;
      var py = month === 0 ? year - 1 : year;
      days.push({ day: d, date: dateStr(py, pm, d), other: true, today: false });
    }

    // Current month
    for (var j = 1; j <= daysInMonth; j++) {
      var ds = dateStr(year, month, j);
      days.push({ day: j, date: ds, other: false, today: ds === today });
    }

    // Next month fill
    var remaining = 42 - days.length;
    for (var k = 1; k <= remaining; k++) {
      var nm = month === 11 ? 0 : month + 1;
      var ny = month === 11 ? year + 1 : year;
      days.push({ day: k, date: dateStr(ny, nm, k), other: true, today: false });
    }

    return days;
  }

  // ===== Rendering =====
  function renderHeader() {
    dom.title.textContent = MONTHS[state.currentMonth] + " " + state.currentYear;
    dom.themeIcon.textContent = state.theme === "dark" ? "\u263E" : "\u2600";
  }

  function buildChipHTML(evt) {
    var time = evt.time
      ? '<span class="chip-time">' + escapeHtml(evt.time) + "</span>"
      : "";
    return '<div class="chip" draggable="true" data-action="open-edit" data-event-id="' +
      evt.id + '" data-color="' + evt.color + '">' +
      time + escapeHtml(evt.title) + "</div>";
  }

  function buildCellHTML(dayObj) {
    var cls = "cal-cell";
    if (dayObj.other) cls += " other-month";
    if (dayObj.today) cls += " today";

    var evts = state.events.filter(function (e) { return e.date === dayObj.date; });
    // Sort by time
    evts.sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); });

    var chipsHTML = "";
    var shown = evts.slice(0, MAX_CHIPS);
    for (var i = 0; i < shown.length; i++) {
      chipsHTML += buildChipHTML(shown[i]);
    }
    if (evts.length > MAX_CHIPS) {
      chipsHTML += '<div class="more-events">+' + (evts.length - MAX_CHIPS) + " more</div>";
    }

    return '<div class="' + cls + '" data-date="' + dayObj.date + '" data-action="open-create">' +
      '<span class="day-number">' + dayObj.day + "</span>" +
      '<div class="chips-wrapper">' + chipsHTML + "</div></div>";
  }

  function renderGrid() {
    var days = getCalendarDays(state.currentYear, state.currentMonth);
    var html = "";
    for (var i = 0; i < days.length; i++) {
      html += buildCellHTML(days[i]);
    }
    dom.grid.innerHTML = html;
  }

  function render() {
    renderHeader();
    renderGrid();
  }

  // ===== CRUD =====
  function createEvent(data) {
    var evt = {
      id: uid(),
      title: data.title.trim(),
      date: data.date,
      time: data.time || "",
      description: data.description || "",
      color: data.color || "blue",
      reminder: parseInt(data.reminder, 10) || 0
    };
    state.events.push(evt);
    persist();
    scheduleReminder(evt);
    render();
  }

  function updateEvent(id, data) {
    for (var i = 0; i < state.events.length; i++) {
      if (state.events[i].id === id) {
        state.events[i].title = data.title.trim();
        state.events[i].date = data.date;
        state.events[i].time = data.time || "";
        state.events[i].description = data.description || "";
        state.events[i].color = data.color || "blue";
        state.events[i].reminder = parseInt(data.reminder, 10) || 0;
        persist();
        scheduleReminder(state.events[i]);
        break;
      }
    }
    render();
  }

  function deleteEvent(id) {
    state.events = state.events.filter(function (e) { return e.id !== id; });
    persist();
    render();
  }

  // ===== Modal =====
  function openCreateModal(dateString) {
    state.modal = { open: true, mode: "create", editId: null };
    dom.modalTitle.textContent = "New Event";
    dom.form.reset();
    dom.evtDate.value = dateString || todayStr();
    dom.deleteBtn.hidden = true;
    dom.modal.showModal();
  }

  function openEditModal(id) {
    var evt = state.events.find(function (e) { return e.id === id; });
    if (!evt) return;

    state.modal = { open: true, mode: "edit", editId: id };
    dom.modalTitle.textContent = "Edit Event";
    dom.evtTitle.value = evt.title;
    dom.evtDate.value = evt.date;
    dom.evtTime.value = evt.time;
    dom.evtDesc.value = evt.description;
    dom.evtColor.value = evt.color;
    dom.evtReminder.value = String(evt.reminder);
    dom.deleteBtn.hidden = false;
    dom.modal.showModal();
  }

  function closeModal() {
    state.modal = { open: false, mode: "create", editId: null };
    dom.modal.close();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    var data = {
      title: dom.evtTitle.value,
      date: dom.evtDate.value,
      time: dom.evtTime.value,
      description: dom.evtDesc.value,
      color: dom.evtColor.value,
      reminder: dom.evtReminder.value
    };

    if (!data.title.trim() || !data.date) return;

    if (state.modal.mode === "edit" && state.modal.editId) {
      updateEvent(state.modal.editId, data);
    } else {
      createEvent(data);
    }
    closeModal();
  }

  // ===== Drag & Drop =====
  function handleDragStart(e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    state.dragEventId = chip.dataset.eventId;
    chip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", state.dragEventId);
  }

  function handleDragOver(e) {
    var cell = e.target.closest(".cal-cell");
    if (!cell || !state.dragEventId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    cell.classList.add("drag-over");
  }

  function handleDragLeave(e) {
    var cell = e.target.closest(".cal-cell");
    if (!cell) return;
    // Only remove if truly leaving the cell
    if (e.relatedTarget && cell.contains(e.relatedTarget)) return;
    cell.classList.remove("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    var cell = e.target.closest(".cal-cell");
    if (!cell || !state.dragEventId) return;
    cell.classList.remove("drag-over");

    var newDate = cell.dataset.date;
    var evt = state.events.find(function (ev) { return ev.id === state.dragEventId; });
    if (evt && evt.date !== newDate) {
      evt.date = newDate;
      persist();
      scheduleReminder(evt);
      render();
    }
    state.dragEventId = null;
  }

  function handleDragEnd(e) {
    state.dragEventId = null;
    var chips = document.querySelectorAll(".chip.dragging");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.remove("dragging");
    }
    var cells = document.querySelectorAll(".cal-cell.drag-over");
    for (var j = 0; j < cells.length; j++) {
      cells[j].classList.remove("drag-over");
    }
  }

  // ===== Reminders =====
  var reminderTimers = {};

  function scheduleReminder(evt) {
    // Clear existing timer for this event
    if (reminderTimers[evt.id]) {
      clearTimeout(reminderTimers[evt.id]);
      delete reminderTimers[evt.id];
    }

    if (!evt.reminder || !evt.time) return;

    var eventDate = new Date(evt.date + "T" + evt.time);
    var reminderTime = new Date(eventDate.getTime() - evt.reminder * 60 * 1000);
    var delay = reminderTime.getTime() - Date.now();

    if (delay <= 0) return;

    reminderTimers[evt.id] = setTimeout(function () {
      var msg = "Reminder: " + evt.title + " at " + evt.time;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Calendar Reminder", { body: msg });
      } else {
        alert(msg);
      }
      delete reminderTimers[evt.id];
    }, delay);
  }

  function scheduleAllReminders() {
    for (var i = 0; i < state.events.length; i++) {
      scheduleReminder(state.events[i]);
    }
  }

  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // ===== Theme =====
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    persistTheme();
    renderHeader();
  }

  // ===== Navigation =====
  function prevMonth() {
    if (state.currentMonth === 0) {
      state.currentMonth = 11;
      state.currentYear--;
    } else {
      state.currentMonth--;
    }
    render();
  }

  function nextMonth() {
    if (state.currentMonth === 11) {
      state.currentMonth = 0;
      state.currentYear++;
    } else {
      state.currentMonth++;
    }
    render();
  }

  function goToday() {
    var now = new Date();
    state.currentYear = now.getFullYear();
    state.currentMonth = now.getMonth();
    render();
  }

  // ===== Event Delegation =====
  function handleClick(e) {
    var target = e.target;
    var actionEl = target.closest("[data-action]");
    if (!actionEl) return;

    var action = actionEl.dataset.action;

    switch (action) {
      case "prev-month":
        prevMonth();
        break;
      case "next-month":
        nextMonth();
        break;
      case "go-today":
        goToday();
        break;
      case "toggle-theme":
        toggleTheme();
        break;
      case "open-edit":
        e.stopPropagation();
        openEditModal(actionEl.dataset.eventId);
        break;
      case "open-create":
        // Don't open if we clicked on a chip
        if (target.closest(".chip")) return;
        openCreateModal(actionEl.dataset.date);
        break;
      case "fab-create":
        openCreateModal(todayStr());
        break;
      case "close-modal":
        closeModal();
        break;
      case "delete-event":
        if (state.modal.editId) {
          deleteEvent(state.modal.editId);
          closeModal();
        }
        break;
    }
  }

  // ===== Keyboard =====
  function handleKeydown(e) {
    if (e.key === "Escape" && state.modal.open) {
      closeModal();
    }
  }

  // ===== Init =====
  function init() {
    // Cache DOM refs
    dom.title = $("#month-title");
    dom.themeIcon = $("#theme-icon");
    dom.grid = $("#cal-grid");
    dom.modal = $("#event-modal");
    dom.modalTitle = $("#modal-title");
    dom.form = $("#event-form");
    dom.evtTitle = $("#evt-title");
    dom.evtDate = $("#evt-date");
    dom.evtTime = $("#evt-time");
    dom.evtDesc = $("#evt-desc");
    dom.evtColor = $("#evt-color");
    dom.evtReminder = $("#evt-reminder");
    dom.deleteBtn = $("#delete-btn");

    // Load persisted state
    loadState();
    applyTheme();

    // Initial render
    render();

    // Event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    dom.form.addEventListener("submit", handleFormSubmit);

    // Drag & Drop — delegated on the grid
    dom.grid.addEventListener("dragstart", handleDragStart);
    dom.grid.addEventListener("dragover", handleDragOver);
    dom.grid.addEventListener("dragleave", handleDragLeave);
    dom.grid.addEventListener("drop", handleDrop);
    dom.grid.addEventListener("dragend", handleDragEnd);

    // Close modal on backdrop click
    dom.modal.addEventListener("click", function (e) {
      if (e.target === dom.modal) closeModal();
    });

    // Reminders
    requestNotificationPermission();
    scheduleAllReminders();
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
