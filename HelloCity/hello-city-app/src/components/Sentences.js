import React, { useState, useEffect } from 'react';
import './Components.css';

function Sentences() {
  const [sentence, setSentence] = useState('');
  const [savedSentences, setSavedSentences] = useState([]);

  useEffect(() => {
    // Load sentences from local storage on component mount
    const storedSentences = JSON.parse(localStorage.getItem('usefulSentences')) || [];
    setSavedSentences(storedSentences);
  }, []);

  const handleAddSentence = () => {
    if (sentence.trim()) {
      const newSentences = [...savedSentences, sentence.trim()];
      setSavedSentences(newSentences);
      localStorage.setItem('usefulSentences', JSON.stringify(newSentences));
      setSentence('');
    }
  };

  const handlePlaySentence = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-HK'; // Set language to Cantonese (Hong Kong)
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser.');
    }
  };

  return (
    <div>
      <h2>Useful Sentences</h2>
      <div>
        <input
          type="text"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Enter a useful sentence"
        />
        <button onClick={handleAddSentence}>Add Sentence</button>
      </div>

      <h3>Saved Sentences:</h3>
      {savedSentences.length === 0 ? (
        <p>No sentences saved yet.</p>
      ) : (
        <ul>
          {savedSentences.map((s, index) => (
            <li key={index}>
              {s}
              <button onClick={() => handlePlaySentence(s)}>Play</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sentences;