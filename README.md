# test-slackcode

A small todo app in plain HTML, CSS and JavaScript, with no dependencies, no build step and no backend.

## Features

- Add, complete, edit and delete todos
- Filter the list by **All**, **Active** or **Completed**
- Clear all completed todos at once
- Live "items left" counter and a progress ring showing how many todos are done
- Todos are saved in your browser, so they survive a page reload
- Light and dark themes: pick **Light**, **Dark** or **System** with the switch in the top-right corner. System (the default) follows your OS setting, including when it changes while the page is open. The choice is remembered
- Keyboard and screen reader friendly: visible focus, labelled controls, and announcements when todos are added, completed, edited or deleted
- Respects "reduce motion": the strike-through sweep and row animations are turned off
- Responsive layout; on small screens (under 560px) the filters move to their own full-width row

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
| Complete a todo | Tick its circle, or click its text. Completed todos are struck through. Untick to make it active again. |
| Edit a todo | Click the pencil button on the row (shown on hover or keyboard focus, always shown on touch screens). Press **Enter** or click away to save, **Escape** to cancel. Saving an empty edit keeps the old text. |
| Delete a todo | Click the **×** button at the end of the row. |
| Filter | Use **All**, **Active** or **Completed** in the footer. |
| Clear completed | Click **Clear completed** in the footer. It shows how many will be removed and only appears when at least one todo is completed. |
| Change theme | Click the sun (Light), moon (Dark) or screen (System) icon in the top-right corner. From the keyboard, **Tab** to the switch and use the arrow keys. |

Everything works from the keyboard: **Tab** moves between controls, **Space** ticks a todo, and **Escape** clears the new-todo box. After a todo is deleted, focus moves to the next one.

The footer is hidden while the list is empty, and an empty state invites you to add your first todo. If a filter matches nothing, the list says so, for example "No completed todos".

## Project structure

```
.
├── index.html   Page markup: the header with the theme switch and progress ring, the add form, the list, the empty state and the footer
├── style.css    Styling. Colors, type sizes, spacing and motion are design tokens (CSS custom properties) on :root, with a dark palette under [data-theme="dark"]
├── app.js       App logic: state, rendering, event handling and persistence
└── README.md
```

## How it works

- **State.** `app.js` keeps an array of todos in memory, each shaped like
  `{ id, text, completed }`, plus the current filter (`all`, `active` or `completed`).
- **Rendering.** Every change calls `render()`, which syncs the list with the current state. Rows are keyed by todo id and reused, so keyboard focus and CSS transitions survive a re-render. It also updates the counter, the progress ring, the filter buttons, the empty state and the visibility of the footer and the clear button. Todo text is set with `textContent`, so user input is never interpreted as HTML.
- **Events.** Toggle, edit and delete use event delegation: one `change`, one `click` and one `keydown` listener on the list handle every row.
- **Persistence.** Todos are stored as JSON in `localStorage` under the key `simple-todo-app.todos`. If storage is unavailable (for example in some private browsing modes) or holds invalid data, the app starts with an empty list and keeps working in memory. Malformed entries are skipped rather than breaking the app. Changes made in another tab are picked up automatically. The selected filter is not saved and resets to **All** on reload.
- **Theme.** The theme choice (`light`, `dark` or `system`) is stored separately under `simple-todo-app.theme`. A small inline script in the `<head>` of `index.html` reads it and sets `data-theme="light"` or `data-theme="dark"` on `<html>` before the stylesheet paints, so there is no flash of the wrong theme. In System mode `app.js` resolves the theme from `prefers-color-scheme` and listens for changes. It also updates `color-scheme` and the `theme-color` meta tag. If storage is unavailable the app follows the system setting.

To reset the app, clear the todos key (and optionally the theme key) in your browser's dev tools, or run this in the console:

```js
localStorage.removeItem("simple-todo-app.todos");
localStorage.removeItem("simple-todo-app.theme"); // optional: back to System theme
```

## Browser support and notes

- Works in current versions of Chrome, Edge, Firefox and Safari. It uses only standard DOM APIs and ES5-style JavaScript.
- The heading font, Bricolage Grotesque, loads from Google Fonts. Without a network connection the app falls back to your system font and works the same.
- Data lives only in the browser you used. It does not sync across browsers or devices, and clearing site data deletes it.

## Contributing

This is a small test project. Issues and pull requests are welcome. Keep it dependency-free and build-free so it still runs by opening `index.html`.

## License

No license has been specified yet.
