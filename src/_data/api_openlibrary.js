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
      // get book key
      let bookKey = entry.work.key.replace('/works/', '');

      // get book endpoint and data
      let bookEndpoint = `https://openlibrary.org/works/${bookKey}.json`;
      let bookData = await EleventyFetch(bookEndpoint, {
        duration: '1d',
        type: 'json'
      });

      entry.bookData = bookData;

      // get author key
      let authorKey = entry.work.author_keys[0].replace('/authors/', '');

      // get author endpoint and data
      let authorEndpoint = `https://openlibrary.org/authors/${authorKey}.json`;
      let authorData = await EleventyFetch(authorEndpoint, {
        duration: '1d',
        type: 'json'
      });

      entry.authorData = authorData;

      // get path to author image and store in input folder
      let imagePath = path.join(outputDir, `${authorKey}-L.jpg`);
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

        // if (imageData.byteLength < 10240) {
        //   console.log(`Image ${imageUrl} is smaller than 10KB. Skipping.`);
        // } else {
        //   await fs.writeFile(imagePath, imageData);
        //   entry.authorImageUrl = `/assets/images/authors/${authorKey}-L.jpg`;
        // }
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
