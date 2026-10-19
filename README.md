# test-slackcode

A simple todo app for testing. Plain HTML, CSS and JavaScript, no dependencies and no build step.

## Features

- Add, complete and delete todos
- Filter by All / Active / Completed
- Clear all completed todos
- Count of items left
- Todos are saved in your browser (`localStorage`), so they survive a page reload

## Run it

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Files

- `index.html` - page markup
- `style.css` - styles
- `app.js` - app logic and storage
