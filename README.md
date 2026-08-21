# Hoofers Youth Sailing

## Updating the homepage slideshow

1. Copy supported `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` images into `assets/slideshow/`.
2. Prefix filenames with numbers to control order, for example `04-summer-racing.jpg`.
3. Run `node scripts/generate-slideshow-manifest.js`.
4. Commit the image and regenerated `js/slideshow-manifest.js` together.

The filename after the numeric prefix becomes the visible slide title.
