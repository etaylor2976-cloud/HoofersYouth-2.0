# Hoofers Youth Sailing

## Updating the homepage slideshow

1. Copy supported `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` images into `assets/slideshow/`.
2. Prefix filenames with numbers to control order, for example `04-summer-racing.jpg`.
3. Add a matching entry to `assets/slideshow/captions.json`:

   ```json
   "04-summer-racing.jpg": {
     "caption": "Learning to Race",
     "description": "Campers practice starts and mark roundings on Lake Mendota."
   }
   ```

4. Run `node scripts/generate-slideshow-manifest.js`.
5. Commit the image and `captions.json`. The GitHub Actions workflow regenerates and commits `js/slideshow-manifest.js` after the changes reach `main`.

Metadata is matched by the complete filename, so it stays with the correct photo when slides are reordered. If an image has no metadata entry, the generator uses its filename as the caption and leaves the description blank.
