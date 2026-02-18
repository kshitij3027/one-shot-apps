(function () {
  "use strict";

  var STORAGE_KEY = "notes_app_data";

  // ===== State =====
  var state = {
    notes: [],
    selectedId: null,
    previewMode: false,
    mobileEditorOpen: false
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

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function snippet(text, maxLen) {
    if (!text) return "";
    var clean = text.replace(/[#*_`~>\-\[\]()!]/g, "").replace(/\s+/g, " ").trim();
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen) + "...";
  }

  // ===== Persistence =====
  function loadNotes() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.notes = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }

  function persistNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
  }

  // ===== Markdown =====
  function renderMarkdown(str) {
    if (typeof marked !== "undefined" && marked.parse) {
      try {
        return marked.parse(str);
      } catch (e) { /* fall through */ }
    }
    // Fallback: escaped text with line breaks
    return escapeHtml(str).replace(/\n/g, "<br>");
  }

  function configureMarked() {
    if (typeof marked !== "undefined" && marked.setOptions) {
      marked.setOptions({ breaks: true, gfm: true });
    }
  }

  // ===== CRUD =====
  function createNote() {
    var note = {
      id: uid(),
      title: "",
      body: "",
      createdAt: Date.now()
    };
    state.notes.unshift(note);
    persistNotes();
    return note;
  }

  function updateNote(id, title, body) {
    for (var i = 0; i < state.notes.length; i++) {
      if (state.notes[i].id === id) {
        state.notes[i].title = title;
        state.notes[i].body = body;
        persistNotes();
        return;
      }
    }
  }

  function deleteNote(id) {
    state.notes = state.notes.filter(function (n) { return n.id !== id; });
    persistNotes();
    if (state.selectedId === id) {
      state.selectedId = null;
      state.previewMode = false;
    }
  }

  function findNote(id) {
    for (var i = 0; i < state.notes.length; i++) {
      if (state.notes[i].id === id) return state.notes[i];
    }
    return null;
  }

  // ===== Rendering =====
  function renderList() {
    if (state.notes.length === 0) {
      dom.noteList.innerHTML = '<div class="empty-state">No notes yet. Create one!</div>';
      return;
    }

    // Display newest-first (already stored newest-first via unshift, but sort to be safe)
    var sorted = state.notes.slice().sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });

    var html = "";
    for (var i = 0; i < sorted.length; i++) {
      var n = sorted[i];
      var selected = n.id === state.selectedId ? " selected" : "";
      var title = n.title ? escapeHtml(n.title) : "Untitled";
      html +=
        '<div class="note-card' + selected + '" data-action="select-note" data-note-id="' + n.id + '">' +
          '<div class="note-card-title">' + title + '</div>' +
          '<div class="note-card-snippet">' + escapeHtml(snippet(n.body, 80)) + '</div>' +
          '<div class="note-card-date">' + formatDate(n.createdAt) + '</div>' +
        '</div>';
    }
    dom.noteList.innerHTML = html;
  }

  function renderEditor() {
    var note = findNote(state.selectedId);

    if (!note) {
      dom.editorEmpty.hidden = false;
      dom.editorContent.hidden = true;
      return;
    }

    dom.editorEmpty.hidden = true;
    dom.editorContent.hidden = false;

    dom.editorTitle.value = note.title;
    dom.editorBody.value = note.body;

    // Tabs
    var tabs = dom.editorContent.querySelectorAll(".tab");
    tabs[0].classList.toggle("active", !state.previewMode);
    tabs[1].classList.toggle("active", state.previewMode);

    if (state.previewMode) {
      dom.editorBody.hidden = true;
      dom.editorPreview.hidden = false;
      dom.editorPreview.innerHTML = renderMarkdown(note.body);
    } else {
      dom.editorBody.hidden = false;
      dom.editorPreview.hidden = true;
    }
  }

  function render() {
    renderList();
    renderEditor();
    updateMobileView();
  }

  // ===== Mobile =====
  function updateMobileView() {
    var isMobile = window.innerWidth < 768;
    if (!isMobile) {
      dom.sidebar.hidden = false;
      dom.editor.hidden = false;
      dom.backBtn.hidden = true;
      return;
    }

    if (state.mobileEditorOpen && state.selectedId) {
      dom.sidebar.hidden = true;
      dom.editor.hidden = false;
      dom.backBtn.hidden = false;
    } else {
      dom.sidebar.hidden = false;
      dom.editor.hidden = true;
      dom.backBtn.hidden = true;
      state.mobileEditorOpen = false;
    }
  }

  // ===== Actions =====
  function selectNote(id) {
    state.selectedId = id;
    state.previewMode = false;
    state.mobileEditorOpen = true;
    render();
  }

  function startNewNote() {
    var note = createNote();
    state.selectedId = note.id;
    state.previewMode = false;
    state.mobileEditorOpen = true;
    render();
    dom.editorTitle.focus();
  }

  function saveCurrentNote() {
    if (!state.selectedId) return;
    var title = dom.editorTitle.value.trim();
    var body = dom.editorBody.value;
    updateNote(state.selectedId, title, body);
    render();
  }

  function deleteCurrentNote() {
    if (!state.selectedId) return;
    deleteNote(state.selectedId);
    state.mobileEditorOpen = false;
    render();
  }

  function togglePreviewMode(on) {
    // Save current edits to state before toggling
    if (!state.previewMode && state.selectedId) {
      var note = findNote(state.selectedId);
      if (note) {
        note.title = dom.editorTitle.value.trim();
        note.body = dom.editorBody.value;
      }
    }
    state.previewMode = on;
    renderEditor();
  }

  function goBack() {
    state.mobileEditorOpen = false;
    state.selectedId = null;
    state.previewMode = false;
    render();
  }

  // ===== Event Delegation =====
  function handleClick(e) {
    var actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    var action = actionEl.dataset.action;

    switch (action) {
      case "new-note":
        startNewNote();
        break;
      case "select-note":
        selectNote(actionEl.dataset.noteId);
        break;
      case "save-note":
        saveCurrentNote();
        break;
      case "delete-note":
        deleteCurrentNote();
        break;
      case "tab-edit":
        togglePreviewMode(false);
        break;
      case "tab-preview":
        togglePreviewMode(true);
        break;
      case "back":
        goBack();
        break;
    }
  }

  // ===== Init =====
  function init() {
    dom.noteList = $("#note-list");
    dom.sidebar = $("#sidebar");
    dom.editor = $("#editor");
    dom.editorEmpty = $("#editor-empty");
    dom.editorContent = $("#editor-content");
    dom.editorTitle = $("#editor-title");
    dom.editorBody = $("#editor-body");
    dom.editorPreview = $("#editor-preview");
    dom.backBtn = $("#back-btn");

    configureMarked();
    loadNotes();
    render();

    document.addEventListener("click", handleClick);
    window.addEventListener("resize", updateMobileView);
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
