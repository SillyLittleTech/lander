# lander
Lander website for [SillyLittleTech](https://sillylittle.tech) <br>
Check out https://github.com/SillyLittleTech/Tree for how to build a website like this.

## Editing the links

Links for the link-tree UI are now stored in `links.json` at the project root. Edit that file to add, remove, or reorder link entries. Each entry is an object with at least:

- `title`: string shown on the button
- `url`: href for the button
- optional `subtitle`: smaller text shown under the title
- optional `target`: link target (e.g. `_blank`)

Example:

```
[
	{ "title": "My Site", "url": "/" },
	{ "title": "Docs", "url": "https://example.com/docs", "target": "_blank" }
]
```

To test locally, serve the folder (the page needs to fetch `links.json`) e.g.:

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```
