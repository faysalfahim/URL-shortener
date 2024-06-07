import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/shorten', { longUrl });
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError('Failed to shorten URL');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter long URL"
            required
          />
          <button type="submit">Shorten</button>
        </form>
        {shortUrl && (
          <div>
            <h2>Short URL:</h2>
            <a href={`http://localhost:5000/${shortUrl}`}>{`http://localhost:5000/${shortUrl}`}</a>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>
    </div>
  );
}

export default App;
