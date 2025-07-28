import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Bus from './components/Bus';
import Minibus from './components/Minibus';
import MTR from './components/MTR';
import DeafCare from './components/DeafCare';

function App() {
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="language-switcher">
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('zh')}>中文</button>
      </div>

      <Routes>
        <Route path="/bus" element={<Bus language={language} />} />
        <Route path="/minibus" element={<Minibus language={language} />} />
        <Route path="/mtr" element={<MTR language={language} />} />
        <Route path="/deafcare" element={<DeafCare language={language} />} />
        <Route path="/" element={
          <div className="home-page">
            <h1>{language === 'en' ? 'HelloCity Transport' : '你好城市交通'}</h1>
            <div className="function-buttons">
              <button className="bus-btn" onClick={() => navigate('/bus')}>
                {language === 'en' ? 'Bus' : '巴士'}
              </button>
              <button className="minibus-btn" onClick={() => navigate('/minibus')}>
                {language === 'en' ? 'Minibus' : '小巴'}
              </button>
              <button className="mtr-btn" onClick={() => navigate('/mtr')}>
                {language === 'en' ? 'MTR' : '港鐵'}
              </button>
              <button className="deafcare-btn" onClick={() => navigate('/deafcare')}>
                {language === 'en' ? 'Deaf Care' : '聾人服務'}
              </button>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
