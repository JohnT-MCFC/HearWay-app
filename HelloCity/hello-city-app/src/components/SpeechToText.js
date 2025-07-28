import React, { useState, useEffect } from 'react';
import './Components.css';

function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-HK'; // Set language to Cantonese (Hong Kong)

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div>
      <h2>Speech-to-Text Feature</h2>
      <p>Click the button to start speaking. The transcribed text will appear below.</p>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      {isListening && <p>Listening...</p>}
      {transcript && (
        <div>
          <h3>Transcribed Text:</h3>
          <p>{transcript}</p>
        </div>
      )}
      {!('webkitSpeechRecognition' in window) && (
        <p style={{ color: 'red' }}>Your browser does not support Web Speech API.</p>
      )}
    </div>
  );
}

export default SpeechToText;