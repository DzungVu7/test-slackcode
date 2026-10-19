(function () {
  "use strict";

  var STORAGE_KEY = "simple-todo-app.todos";

  var form = document.getElementById("new-todo-form");
  var input = document.getElementById("new-todo");
  var list = document.getElementById("todo-list");
  var empty = document.getElementById("empty");
  var footer = document.getElementById("footer");
  var count = document.getElementById("count");
  var clearBtn = document.getElementById("clear-completed");
  var filterBtns = document.querySelectorAll("[data-filter]");

  var todos = load();
  var filter = "all";

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
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

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function visibleTodos() {
    if (filter === "active") return todos.filter(function (t) { return !t.completed; });
    if (filter === "completed") return todos.filter(function (t) { return t.completed; });
    return todos;
  }

  function render() {
    list.innerHTML = "";

    visibleTodos().forEach(function (todo) {
      var li = document.createElement("li");
      li.className = "todo" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "toggle";
      checkbox.checked = todo.completed;
      checkbox.id = "todo-" + todo.id;

      var label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = todo.text;

      var del = document.createElement("button");
      del.type = "button";
      del.className = "delete";
      del.setAttribute("aria-label", "Delete " + todo.text);
      del.textContent = "×";

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    });

    var remaining = todos.filter(function (t) { return !t.completed; }).length;
    var completed = todos.length - remaining;

    count.textContent = remaining + (remaining === 1 ? " item" : " items") + " left";
    clearBtn.hidden = completed === 0;
    footer.hidden = todos.length === 0;
    empty.hidden = visibleTodos().length > 0;
    empty.textContent = todos.length === 0 ? "Nothing here yet." : "No " + filter + " todos.";

    filterBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    todos.push({ id: newId(), text: text, completed: false });
    input.value = "";
    save();
    render();
  });

  list.addEventListener("change", function (e) {
    if (!e.target.classList.contains("toggle")) return;
    var id = e.target.closest(".todo").dataset.id;
    todos.forEach(function (t) { if (t.id === id) t.completed = e.target.checked; });
    save();
    render();
  });

  list.addEventListener("click", function (e) {
    if (!e.target.classList.contains("delete")) return;
    var id = e.target.closest(".todo").dataset.id;
    todos = todos.filter(function (t) { return t.id !== id; });
    save();
    render();
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", function () {
    todos = todos.filter(function (t) { return !t.completed; });
    save();
    render();
  });

  render();
})();
