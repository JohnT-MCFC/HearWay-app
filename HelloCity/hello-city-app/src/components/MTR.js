import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Components.css';

function MTR() {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [nextTrains, setNextTrains] = useState([]);
  const [loadingTrains, setLoadingTrains] = useState(false);
  const [error, setError] = useState(null);

  // MTR API endpoints from Next Train API Specification v1.7
  const MTR_NEXT_TRAIN_API_BASE_URL = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php';

  // MTR lines and stations based on the API specification
  const mtrLines = [
    { id: 'AEL', name: 'Airport Express' },
    { id: 'TCL', name: 'Tung Chung Line' },
    { id: 'TML', name: 'Tuen Ma Line' },
    { id: 'TKL', name: 'Tseung Kwan O Line' },
    { id: 'EAL', name: 'East Rail Line' },
    { id: 'SIL', name: 'South Island Line' },
    { id: 'TWL', name: 'Tsuen Wan Line' },
    { id: 'ISL', name: 'Island Line' },
    { id: 'KTL', name: 'Kwun Tong Line' },
    { id: 'DRL', name: 'Disneyland Resort Line' },
  ];

  const mtrStations = {
    'AEL': [
      { id: 'HOK', name: 'Hong Kong' }, { id: 'KOW', name: 'Kowloon' },
      { id: 'TSY', name: 'Tsing Yi' }, { id: 'AIR', name: 'Airport' },
      { id: 'AWE', name: 'AsiaWorld Expo' },
    ],
    'TCL': [
      { id: 'HOK', name: 'Hong Kong' }, { id: 'KOW', name: 'Kowloon' },
      { id: 'OLY', name: 'Olympic' }, { id: 'NAC', name: 'Nam Cheong' },
      { id: 'LAK', name: 'Lai King' }, { id: 'TSY', name: 'Tsing Yi' },
      { id: 'SUN', name: 'Sunny Bay' }, { id: 'TUC', name: 'Tung Chung' },
    ],
    'TML': [
      { id: 'WKS', name: 'Wu Kai Sha' }, { id: 'MOS', name: 'Ma On Shan' },
      { id: 'HEO', name: 'Heng On' }, { id: 'TSH', name: 'Tai Shui Hang' },
      { id: 'SHM', name: 'Shek Mun' }, { id: 'CIO', name: 'City One' },
      { id: 'STW', name: 'Sha Tin Wai' }, { id: 'TAW', name: 'Tai Wai' },
      { id: 'HIK', name: 'Hin Keng' }, { id: 'DIH', name: 'Diamond Hill' },
      { id: 'KAT', name: 'Kai Tak' }, { id: 'SUW', name: 'Sung Wong Toi' },
      { id: 'TKW', name: 'To Kwa Wan' }, { id: 'HOM', name: 'Ho Man Tin' },
      { id: 'HUH', name: 'Hung Hom' }, { id: 'ETS', name: 'East Tsim Sha Tsui' },
      { id: 'AUS', name: 'Austin' }, { id: 'NAC', name: 'Nam Cheong' },
      { id: 'MEF', name: 'Mei Foo' }, { id: 'TWW', name: 'Tsuen Wan West' },
      { id: 'KSR', name: 'Kam Sheung Road' }, { id: 'YUL', name: 'Yuen Long' },
      { id: 'LOP', name: 'Long Ping' }, { id: 'TIS', name: 'Tin Shui Wai' },
      { id: 'SIH', name: 'Siu Hong' }, { id: 'TUM', name: 'Tuen Mun' },
    ],
    'TKL': [
      { id: 'NOP', name: 'North Point' }, { id: 'QUB', name: 'Quarry Bay' },
      { id: 'YAT', name: 'Yau Tong' }, { id: 'TIK', name: 'Tiu Keng Leng' },
      { id: 'TKO', name: 'Tseung Kwan O' }, { id: 'LHP', name: 'LOHAS Park' },
      { id: 'HAH', name: 'Hang Hau' }, { id: 'POA', name: 'Po Lam' },
    ],
    'EAL': [
      { id: 'ADM', name: 'Admiralty' }, { id: 'EXC', name: 'Exhibition Centre' },
      { id: 'HUH', name: 'Hung Hom' }, { id: 'MKK', name: 'Mong Kok East' },
      { id: 'KOT', name: 'Kowloon Tong' }, { id: 'TAW', name: 'Tai Wai' },
      { id: 'SHT', name: 'Sha Tin' }, { id: 'FOT', name: 'Fo Tan' },
      { id: 'RAC', name: 'Racecourse' }, { id: 'UNI', name: 'University' },
      { id: 'TAP', name: 'Tai Po Market' }, { id: 'TWO', name: 'Tai Wo' },
      { id: 'FAN', name: 'Fanling' }, { id: 'SHS', name: 'Sheung Shui' },
      { id: 'LOW', name: 'Lo Wu' }, { id: 'LMC', name: 'Lok Ma Chau' },
    ],
    'SIL': [
      { id: 'ADM', name: 'Admiralty' }, { id: 'OCP', name: 'Ocean Park' },
      { id: 'WCH', name: 'Wong Chuk Hang' }, { id: 'LET', name: 'Lei Tung' },
      { id: 'SOH', name: 'South Horizons' },
    ],
    'TWL': [
      { id: 'CEN', name: 'Central' }, { id: 'ADM', name: 'Admiralty' },
      { id: 'TST', name: 'Tsim Sha Tsui' }, { id: 'JOR', name: 'Jordan' },
      { id: 'YMT', name: 'Yau Ma Tei' }, { id: 'MOK', name: 'Mong Kok' },
      { id: 'PRE', name: 'Prince Edward' }, { id: 'SSP', name: 'Sham Shui Po' },
      { id: 'CSW', name: 'Cheung Sha Wan' }, { id: 'LCK', name: 'Lai Chi Kok' },
      { id: 'MEF', name: 'Mei Foo' }, { id: 'LAK', name: 'Lai King' },
      { id: 'KWF', name: 'Kwai Fong' }, { id: 'KWH', name: 'Kwai Hing' },
      { id: 'TWH', name: 'Tai Wo Hau' }, { id: 'TSW', name: 'Tsuen Wan' },
    ],
    'ISL': [
      { id: 'KET', name: 'Kennedy Town' }, { id: 'HKU', name: 'HKU' },
      { id: 'SYP', name: 'Sai Ying Pun' }, { id: 'SHW', name: 'Sheung Wan' },
      { id: 'CEN', name: 'Central' }, { id: 'ADM', name: 'Admiralty' },
      { id: 'WAC', name: 'Wan Chai' }, { id: 'CAB', name: 'Causeway Bay' },
      { id: 'TIH', name: 'Tin Hau' }, { id: 'FOH', name: 'Fortress Hill' },
      { id: 'NOP', name: 'North Point' }, { id: 'QUB', name: 'Quarry Bay' },
      { id: 'TAK', name: 'Tai Koo' }, { id: 'SWH', name: 'Sai Wan Ho' },
      { id: 'SKW', name: 'Shau Kei Wan' }, { id: 'HFC', name: 'Heng Fa Chuen' },
      { id: 'CHW', name: 'Chai Wan' },
    ],
    'KTL': [
      { id: 'WHA', name: 'Whampoa' }, { id: 'HOM', name: 'Ho Man Tin' },
      { id: 'YMT', name: 'Yau Ma Tei' }, { id: 'MOK', name: 'Mong Kok' },
      { id: 'PRE', name: 'Prince Edward' }, { id: 'SKM', name: 'Shek Kip Mei' },
      { id: 'KOT', name: 'Kowloon Tong' }, { id: 'LOF', name: 'Lok Fu' },
      { id: 'WTS', name: 'Wong Tai Sin' }, { id: 'DIH', name: 'Diamond Hill' },
      { id: 'CHH', name: 'Choi Hung' }, { id: 'KOB', name: 'Kowloon Bay' },
      { id: 'NTK', name: 'Ngau Tau Kok' }, { id: 'KWT', name: 'Kwun Tong' },
      { id: 'LAT', name: 'Lam Tin' }, { id: 'YAT', name: 'Yau Tong' },
      { id: 'TIK', name: 'Tiu Keng Leng' },
    ],
    'DRL': [
      { id: 'SUN', name: 'Sunny Bay' }, { id: 'DIS', name: 'Disneyland Resort' },
    ],
  };

  const fetchNextTrains = async (lineId, stationId) => {
    setLoadingTrains(true);
    setError(null);
    try {
      const response = await fetch(`${MTR_NEXT_TRAIN_API_BASE_URL}?line=${lineId}&sta=${stationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.data && data.data[`${lineId}-${stationId}`]) {
        const stationData = data.data[`${lineId}-${stationId}`];
        const trains = [];

        // Process UP trains
        if (stationData.UP && stationData.UP.length > 0) {
          stationData.UP.forEach(train => {
            trains.push(`${train.ttnt} mins (${train.dest} bound - UP)`);
          });
        }

        // Process DOWN trains
        if (stationData.DOWN && stationData.DOWN.length > 0) {
          stationData.DOWN.forEach(train => {
            trains.push(`${train.ttnt} mins (${train.dest} bound - DOWN)`);
          });
        }
        setNextTrains(trains.length > 0 ? trains : ['No data available']);
      } else if (data.status === 0) {
        // Handle special train service arrangements or other messages
        setNextTrains([data.message]);
      }
      else {
        setNextTrains(['No data available']);
      }
    } catch (err) {
      setError(`Failed to fetch next train times. Error: ${err.message}`);
      console.error('Error fetching MTR next train times:', err);
      setNextTrains(['N/A']);
    } finally {
      setLoadingTrains(false);
    }
  };

  useEffect(() => {
    if (selectedLine && selectedStation) {
      fetchNextTrains(selectedLine, selectedStation);
    } else {
      setNextTrains([]);
    }
  }, [selectedLine, selectedStation]);

  return (
    <div>
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      <h2>MTR Information</h2>
      <div>
        <label htmlFor="mtrLine">Select Line:</label>
        <select id="mtrLine" value={selectedLine} onChange={(e) => {
          setSelectedLine(e.target.value);
          setSelectedStation(''); // Reset station when line changes
        }}>
          <option value="">-- Select MTR Line --</option>
          {mtrLines.map(line => (
            <option key={line.id} value={line.id}>{line.name}</option>
          ))}
        </select>
      </div>

      {selectedLine && (
        <div>
          <label htmlFor="mtrStation">Select Station:</label>
          <select id="mtrStation" value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}>
            <option value="">-- Select Station --</option>
            {mtrStations[selectedLine] && mtrStations[selectedLine].map(station => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedStation && (
        <div>
          <h3>Next Trains for {mtrStations[selectedLine]?.find(s => s.id === selectedStation)?.name}:</h3>
          {loadingTrains ? (
            <p>Loading next train times...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : (
            <ul>
              {nextTrains.map((train, index) => (
                <li key={index}>{train}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default MTR;