const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const workflowPath = '.github/workflows/update-slideshow-manifest.yml';

test('slideshow workflow updates the manifest after pushes to main only', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');

  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /node scripts\/generate-slideshow-manifest\.js/);
  assert.match(workflow, /node --test/);
  assert.match(workflow, /git diff --quiet -- js\/slideshow-manifest\.js/);
  assert.match(workflow, /git add -- js\/slideshow-manifest\.js/);
  assert.match(workflow, /git commit .*slideshow manifest/);
  assert.match(workflow, /git push origin HEAD:main/);
});
