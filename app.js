(function () {
  "use strict";

  var STORAGE_KEY = "simple-todo-app.todos";
  var MAX_LENGTH = 200;
  var RING_LENGTH = 113.1; // 2 * pi * r (r = 18), matches style.css

  var ICON_EDIT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
  var ICON_DELETE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var form = document.getElementById("new-todo-form");
  var input = document.getElementById("new-todo");
  var list = document.getElementById("todo-list");
  var empty = document.getElementById("empty");
  var emptyTitle = document.getElementById("empty-title");
  var emptyHint = document.getElementById("empty-hint");
  var footer = document.getElementById("footer");
  var count = document.getElementById("count");
  var clearBtn = document.getElementById("clear-completed");
  var filterBtns = document.querySelectorAll("[data-filter]");
  var progress = document.getElementById("progress");
  var progressBar = document.getElementById("progress-bar");
  var progressLabel = document.getElementById("progress-label");
  var status = document.getElementById("status");
  var today = document.getElementById("today");

  var todos = load();
  var filter = "all";
  var editingId = null;
  var justAddedId = null;

  /* ---------- Persistence ---------- */

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(data)) return [];
      // Drop malformed entries instead of crashing on them.
      return data.filter(function (t) {
        return t && typeof t.text === "string" && t.text.trim() !== "" && t.id != null;
      }).map(function (t) {
        return { id: String(t.id), text: t.text, completed: !!t.completed };
      });
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      /* storage unavailable (private mode etc.) - keep working in memory */
    }
  }

  /* ---------- Helpers ---------- */

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function find(id) {
    for (var i = 0; i < todos.length; i++) if (todos[i].id === id) return todos[i];
    return null;
  }

  function matchesFilter(todo) {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  }

  function visibleTodos() {
    return todos.filter(matchesFilter);
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  function announce(message) {
    // Clear first so repeating the same message is still announced.
    status.textContent = "";
    window.setTimeout(function () { status.textContent = message; }, 30);
  }

  function rowFor(id) {
    return list.querySelector('.todo[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }

  /* ---------- Rendering ---------- */

  function createRow(todo) {
    var li = document.createElement("li");
    li.className = "todo";
    li.dataset.id = todo.id;

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle";
    checkbox.id = "todo-" + todo.id;

    var label = document.createElement("label");
    label.className = "todo-text";
    label.htmlFor = checkbox.id;
    label.appendChild(document.createElement("span"));

    var actions = document.createElement("div");
    actions.className = "actions";

    var edit = document.createElement("button");
    edit.type = "button";
    edit.className = "icon-btn edit";
    edit.innerHTML = ICON_EDIT;

    var del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn delete";
    del.innerHTML = ICON_DELETE;

    actions.appendChild(edit);
    actions.appendChild(del);
    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    return li;
  }

  function updateRow(li, todo) {
    var checkbox = li.querySelector(".toggle");
    var span = li.querySelector(".todo-text span");
    li.classList.toggle("completed", todo.completed);
    checkbox.checked = todo.completed;
    // textContent keeps user input from ever being parsed as HTML.
    if (span.textContent !== todo.text) span.textContent = todo.text;
    li.querySelector(".edit").setAttribute("aria-label", "Edit “" + todo.text + "”");
    li.querySelector(".delete").setAttribute("aria-label", "Delete “" + todo.text + "”");
  }

  // Reuses existing rows (keyed by id) so focus, CSS transitions and
  // in-progress edits survive a re-render.
  function render() {
    var visible = visibleTodos();
    var existing = {};
    Array.prototype.forEach.call(list.children, function (li) { existing[li.dataset.id] = li; });

    visible.forEach(function (todo, index) {
      var li = existing[todo.id];
      if (li) {
        delete existing[todo.id];
      } else {
        li = createRow(todo);
        if (todo.id === justAddedId) li.classList.add("is-new");
      }
      if (li.classList.contains("editing")) {
        li.classList.toggle("completed", todo.completed);
      } else {
        updateRow(li, todo);
      }
      if (list.children[index] !== li) list.insertBefore(li, list.children[index] || null);
    });

    Object.keys(existing).forEach(function (id) { list.removeChild(existing[id]); });
    justAddedId = null;

    var total = todos.length;
    var remaining = todos.filter(function (t) { return !t.completed; }).length;
    var completed = total - remaining;

    count.textContent = plural(remaining, "item") + " left";
    clearBtn.hidden = completed === 0;
    clearBtn.textContent = completed > 0 ? "Clear completed (" + completed + ")" : "Clear completed";
    footer.hidden = total === 0;
    list.hidden = visible.length === 0;
    empty.hidden = visible.length > 0;

    if (total === 0) {
      emptyTitle.textContent = "Nothing to do yet";
      emptyHint.textContent = "Add your first todo above and press Enter.";
    } else if (filter === "active") {
      emptyTitle.textContent = "All done";
      emptyHint.textContent = "Every todo is completed. Switch to Completed to review them.";
    } else {
      emptyTitle.textContent = "No completed todos";
      emptyHint.textContent = "Tick a todo’s circle to mark it done.";
    }

    filterBtns.forEach(function (btn) {
      var on = btn.dataset.filter === filter;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var ratio = total ? completed / total : 0;
    progressBar.style.strokeDashoffset = String(RING_LENGTH * (1 - ratio));
    progressLabel.textContent = completed + "/" + total;
    progress.classList.toggle("is-empty", total === 0);
    progress.classList.toggle("is-done", total > 0 && completed === total);
    progress.setAttribute("aria-label", total
      ? completed + " of " + plural(total, "todo") + " completed"
      : "No todos yet");
  }

  // After a row disappears, keep keyboard focus nearby instead of losing it.
  function focusNear(index) {
    var rows = list.querySelectorAll(".todo");
    var target = rows[Math.min(index, rows.length - 1)];
    if (target) target.querySelector(".toggle").focus();
    else input.focus();
  }

  /* ---------- Editing ---------- */

  function startEdit(li) {
    var todo = find(li.dataset.id);
    if (!todo || editingId) return;
    editingId = todo.id;
    li.classList.add("editing");

    var field = document.createElement("input");
    field.type = "text";
    field.className = "edit-input";
    field.value = todo.text;
    field.maxLength = MAX_LENGTH;
    field.setAttribute("aria-label", "Edit todo");

    var label = li.querySelector(".todo-text");
    label.hidden = true;
    li.querySelector(".actions").hidden = true;
    li.insertBefore(field, label);
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }

  function finishEdit(li, commit) {
    if (!li || !li.classList.contains("editing")) return;
    var field = li.querySelector(".edit-input");
    var todo = find(li.dataset.id);
    var text = field.value.trim();
    editingId = null;
    li.classList.remove("editing");
    field.remove();
    li.querySelector(".todo-text").hidden = false;
    li.querySelector(".actions").hidden = false;

    if (commit && todo && text && text !== todo.text) {
      todo.text = text;
      save();
      announce("Todo updated");
    }
    render();
    var row = rowFor(li.dataset.id);
    if (row) row.querySelector(".edit").focus();
  }

  /* ---------- Events ---------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim().slice(0, MAX_LENGTH);
    if (!text) {
      input.value = "";
      input.focus();
      return;
    }
    var todo = { id: newId(), text: text, completed: false };
    todos.push(todo);
    justAddedId = todo.id;
    input.value = "";
    // A new todo is active, so make sure it is visible.
    if (filter === "completed") filter = "all";
    save();
    render();
    announce("Added “" + text + "”");
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") input.value = "";
  });

  list.addEventListener("change", function (e) {
    if (!e.target.classList.contains("toggle")) return;
    var li = e.target.closest(".todo");
    var todo = find(li.dataset.id);
    if (!todo) return;
    var index = Array.prototype.indexOf.call(list.children, li);
    todo.completed = e.target.checked;
    save();
    render();
    announce((todo.completed ? "Completed " : "Marked active ") + "“" + todo.text + "”");
    if (!rowFor(todo.id)) focusNear(index);
  });

  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".icon-btn");
    if (!btn) return;
    var li = btn.closest(".todo");

    if (btn.classList.contains("edit")) {
      startEdit(li);
      return;
    }

    if (btn.classList.contains("delete")) {
      var todo = find(li.dataset.id);
      var index = Array.prototype.indexOf.call(list.children, li);
      todos = todos.filter(function (t) { return t.id !== li.dataset.id; });
      save();
      render();
      if (todo) announce("Deleted “" + todo.text + "”");
      focusNear(index);
    }
  });

  list.addEventListener("keydown", function (e) {
    if (!e.target.classList.contains("edit-input")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      finishEdit(e.target.closest(".todo"), true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      finishEdit(e.target.closest(".todo"), false);
    }
  });

  list.addEventListener("focusout", function (e) {
    if (!e.target.classList.contains("edit-input")) return;
    finishEdit(e.target.closest(".todo"), true);
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", function () {
    var removed = todos.length;
    todos = todos.filter(function (t) { return !t.completed; });
    removed -= todos.length;
    save();
    render();
    announce("Cleared " + plural(removed, "completed todo"));
    input.focus();
  });

  // Keep tabs in sync when the list changes in another window.
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY || editingId) return;
    todos = load();
    render();
  });

  /* ---------- Start ---------- */

  try {
    today.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  } catch (e) {
    today.hidden = true;
  }

  render();
})();
