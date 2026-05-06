const scrape = require('website-scraper');
const fs = require('fs');

class RewritePlugin {
  apply(registerAction) {
    registerAction('afterResponse', async ({ response }) => {
      return response;
    });
    registerAction('onResourceSaved', ({ resource }) => {
      console.log(`Saved resource ${resource.url} to ${resource.filename}`);
    });
  }
}

const options = {
  urls: ['https://jetwingtravels.com/'],
  directory: './scraped_site',
  subdirectories: [
    { directory: 'assets', extensions: ['.jpg', '.png', '.svg', '.gif', '.webp', '.ico'] },
    { directory: 'js', extensions: ['.js'] },
    { directory: 'css', extensions: ['.css'] },
    { directory: 'fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot'] }
  ],
  plugins: [new RewritePlugin()]
};

console.log('Starting scraper...');
scrape(options).then((result) => {
  console.log('Successfully scraped!');
}).catch((err) => {
  console.error('Error scraping:', err);
});
