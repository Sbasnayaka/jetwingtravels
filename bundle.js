const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const baseDir = path.join(__dirname, 'scraped_site');
const htmlFile = path.join(baseDir, 'index.html');

if (!fs.existsSync(htmlFile)) {
  console.error('HTML file not found!');
  process.exit(1);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

let mainCss = '';
let mainJs = '';

// Process CSS
$('link[rel="stylesheet"]').each((i, el) => {
  const href = $(el).attr('href');
  if (href && !href.startsWith('http') && !href.startsWith('//')) {
    const cssPath = path.join(baseDir, href.split('?')[0]);
    if (fs.existsSync(cssPath)) {
      // Fix relative paths in CSS (e.g., url('../assets/img.jpg') -> url('../assets/img.jpg'))
      // Wait, since main.css will be in css/ directory, paths relative to css/ like ../assets/ will still work!
      mainCss += `/* --- CSS from ${href} --- */\n` + fs.readFileSync(cssPath, 'utf8') + '\n';
      $(el).remove();
    }
  }
});

$('style').each((i, el) => {
  mainCss += `/* --- Inline CSS --- */\n` + $(el).html() + '\n';
  $(el).remove();
});

$('head').append('<link rel="stylesheet" href="css/main.css">\n');

// Process JS
const priorityScripts = [];

$('script').each((i, el) => {
  const src = $(el).attr('src');
  const type = $(el).attr('type');
  
  if (type && type !== 'text/javascript' && type !== 'application/javascript') {
    // leave things like application/ld+json or template alone
    return;
  }

  if (src && !src.startsWith('http') && !src.startsWith('//')) {
    const jsPath = path.join(baseDir, src.split('?')[0]);
    if (fs.existsSync(jsPath)) {
        if (src.includes('jquery.min.js') || src.includes('jquery.js')) {
            priorityScripts.push(`/* --- JS from ${src} --- */\n` + fs.readFileSync(jsPath, 'utf8') + ';\n');
        } else {
            mainJs += `/* --- JS from ${src} --- */\n` + fs.readFileSync(jsPath, 'utf8') + ';\n';
        }
      $(el).remove();
    }
  } else if (!src) {
    const inlineContent = $(el).html();
    if (inlineContent && inlineContent.trim().length > 0) {
      mainJs += `/* --- Inline JS --- */\n` + inlineContent + ';\n';
      $(el).remove();
    }
  }
});

$('body').append('<script src="js/main.js"></script>\n');

mainJs = priorityScripts.join('') + mainJs;

// Fix paths for assets to just be 'assets/...' if they are not already
// Since website-scraper put them in 'assets/', in the HTML they should be 'assets/filename.ext'
// The scraper already did this.

// Create final output directories
if (!fs.existsSync(path.join(__dirname, 'css'))) fs.mkdirSync(path.join(__dirname, 'css'));
if (!fs.existsSync(path.join(__dirname, 'js'))) fs.mkdirSync(path.join(__dirname, 'js'));

// Write files to main directories
fs.writeFileSync(path.join(__dirname, 'css', 'main.css'), mainCss);
fs.writeFileSync(path.join(__dirname, 'js', 'main.js'), mainJs);
fs.writeFileSync(path.join(__dirname, 'index.html'), $.html());

console.log('Bundling complete!');
