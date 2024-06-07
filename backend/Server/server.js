const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

const urlSchema = new mongoose.Schema({
  shortUrl: String,
  longUrl: String
});

const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.json());
app.use(cors());

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const base = alphabet.length;

function generateShortUrl() {
  let shortUrl;
  do {
    shortUrl = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * base)]).join('');
  } while (Url.findOne({ shortUrl }));
  return shortUrl;
}

app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const shortUrl = generateShortUrl();
  const newUrl = new Url({ shortUrl, longUrl });

  try {
    await newUrl.save();
    res.json({ shortUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to redirect to URL' });
  }
});

const server = app.listen(port, () => {
  console.log(`URL shortener service listening at http://localhost:${port}`);
});

module.exports = server;
