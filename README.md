# test-slackcode

A small todo app in plain HTML, CSS and JavaScript, with no dependencies, no build step and no backend.

## Features

- Add, complete and delete todos
- Filter the list by **All**, **Active** or **Completed**
- Clear all completed todos at once
- Live "items left" counter
- Todos are saved in your browser, so they survive a page reload
- Responsive layout that goes full-width on small screens (under 560px)

## Getting started

No install needed. Either open the file directly:

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

or serve the folder with any static file server, for example:

```sh
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Usage

| Action | How |
| --- | --- |
| Add a todo | Type in the "What needs doing?" box and press **Enter** or click **Add**. Empty or whitespace-only entries are ignored; text is limited to 200 characters. |
| Complete a todo | Tick its checkbox, or click its text. Completed todos are struck through. Untick to make it active again. |
| Delete a todo | Click the **×** button at the end of the row. |
| Filter | Use **All**, **Active** or **Completed** in the footer. |
| Clear completed | Click **Clear completed** in the footer (it only shows when at least one todo is completed). |

The footer is hidden while the list is empty. If a filter matches nothing, the list shows a short message such as "No completed todos."

## Project structure

```
.
├── index.html   Page markup: the add form, the list, and the footer (counter, filters, clear button)
├── style.css    Styling, with colors defined as CSS custom properties on :root
├── app.js       App logic: state, rendering, event handling and persistence
└── README.md
```

## How it works

- **State.** `app.js` keeps an array of todos in memory, each shaped like
  `{ id, text, completed }`, plus the current filter (`all`, `active` or `completed`).
- **Rendering.** Every change calls `render()`, which rebuilds the list from the current state and updates the counter, the filter buttons, the empty message and the visibility of the footer and the clear button. Todo text is set with `textContent`, so user input is never interpreted as HTML.
- **Events.** Toggle and delete use event delegation: a single `change` and a single `click` listener on the list handle every row.
- **Persistence.** Todos are stored as JSON in `localStorage` under the key `simple-todo-app.todos`. If storage is unavailable (for example in some private browsing modes) or holds invalid data, the app starts with an empty list and keeps working in memory. The selected filter is not saved and resets to **All** on reload.

To reset the app, clear that key in your browser's dev tools, or run this in the console:

```js
localStorage.removeItem("simple-todo-app.todos");
```

## Browser support and notes

- Works in current versions of Chrome, Edge, Firefox and Safari. It uses only standard DOM APIs and ES5-style JavaScript.
- Data lives only in the browser you used. It does not sync across browsers or devices, and clearing site data deletes it.

## Contributing

This is a small test project. Issues and pull requests are welcome. Keep it dependency-free and build-free so it still runs by opening `index.html`.

## License

No license has been specified yet.
