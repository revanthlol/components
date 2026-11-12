Malnadu menu with Super Hover

Run it (needed because the page uses root-relative paths like /assets/...):
  cd malnadu-menu
  python -m http.server 8000
  open http://localhost:8000/index.html

Your /assets files (fonts, logos, footer-bundle.js) were not in the upload,
so locally the page falls back to system fonts and the footer script is skipped.
Drop your assets folder next to index.html to see it fully styled.

What changed in index.html:
  1. CSS: .item hover state, plus .art (the revealed image tile).
  2. render(): each row gets an .art tile. A dish can carry its own image as an
     optional 5th field in DATA, e.g. ["Name", [...], "veg", "note", "/assets/dishes/x.jpg"].
     Without one it shows the "PHOTO SOON" placeholder (--art-default in :root).
  3. JS: a small "super hover" block at the end of the main script.
Nothing else was touched. The tile is hidden on touch devices and under 860px.
