import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpeechToText from './SpeechToText';
import Sentences from './Sentences';

function DeafCare({ language }) {
  const navigate = useNavigate();
  return (
    <div className="deaf-care-container">
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      <h2>{language === 'en' ? 'Deaf Care Services' : '聾人服務'}</h2>
      <div className="deaf-care-sections">
        <div className="speech-section">
          <h3>{language === 'en' ? 'Speech-to-Text' : '語音轉文字'}</h3>
          <SpeechToText language={language} />
        </div>
        <div className="sentences-section">
          <h3>{language === 'en' ? 'Useful Sentences' : '常用句子'}</h3>
          <Sentences language={language} />
        </div>
      </div>
    </div>
  );
}

export default DeafCare;