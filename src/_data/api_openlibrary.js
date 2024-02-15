const EleventyFetch = require('@11ty/eleventy-fetch');
const fs = require('fs').promises;
const path = require('path');

module.exports = async function () {
  let url = 'https://openlibrary.org/people/madrilene586/books/already-read.json';

  try {
    let data = await EleventyFetch(url, {
      duration: '1d',
      type: 'json'
    });

    const outputDir = 'src/assets/images/authors';
    await fs.mkdir(outputDir, {recursive: true});

    for (let entry of data.reading_log_entries) {
      let authorKey = entry.work.author_keys[0].replace('/authors/', '');
      let imagePath = path.join(outputDir, `${authorKey}-L.jpg`);

      // Check if the image file already exists
      try {
        await fs.access(imagePath);
        entry.authorImageUrl = `/assets/images/authors/${authorKey}-L.jpg`;
      } catch (error) {
        let imageUrl = `https://covers.openlibrary.org/a/olid/${authorKey}-L.jpg`;
        let imageData = await EleventyFetch(imageUrl, {
          responseType: 'buffer'
        });
        await fs.writeFile(imagePath, imageData);
        entry.authorImageUrl = `/assets/images/authors/${authorKey}-L.jpg`;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
