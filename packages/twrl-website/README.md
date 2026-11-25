# Twrl website & showcase

See top-level doc for build commands.

## Favicon

Additionally, here are the steps for creating the favicons from the SVG (inspired by [this](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)):

```bash
inkscape ./public/favicon.svg --export-width=32 --export-filename=./tmp.png
magick ./tmp.png ./public/favicon.ico
rm ./tmp.png
inkscape --export-type="png" --export-width=140 --export-filename="./tmp.png" ./public/favicon.svg
magick ./tmp.png -background "#ffffff" -gravity center -extent 180x180 ./public/apple-touch-icon.png
rm ./tmp.png
```
