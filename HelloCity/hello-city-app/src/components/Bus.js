import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Components.css';

function Bus() {
  const navigate = useNavigate();
  const [route, setRoute] = useState('');
  const [stops, setStops] = useState([]);
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const [error, setError] = useState(null);

  // KMB API Base URL from the specification
  const KMB_API_BASE_URL = 'https://data.etabus.gov.hk/';
  const allKMBStops = useRef({}); // To store all KMB stops fetched once

  // Function to calculate time difference
  const getTimeDifference = (etaTimestamp) => {
    const now = new Date();
    const etaTime = new Date(etaTimestamp);
    const diffMs = etaTime - now;
    const diffMins = Math.round(diffMs / 60000); // Convert milliseconds to minutes
    return diffMins > 0 ? `${diffMins} mins` : 'Arriving / Departed';
  };

  // Fetch all KMB stops once on component mount
  useEffect(() => {
    const fetchAllKMBStops = async () => {
      try {
        const response = await fetch(`${KMB_API_BASE_URL}v1/transport/kmb/stop`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
          data.data.forEach(stop => {
            allKMBStops.current[stop.stop] = stop.name_en;
          });
        }
      } catch (err) {
        console.error('Error fetching all KMB stops:', err);
      }
    };
    fetchAllKMBStops();
  }, []); // Empty dependency array means this runs once on mount

  const fetchStopsForRoute = async (selectedRoute) => {
    setLoadingStops(true);
    setError(null);
    try {
      // Using Route-Stop API to get stop IDs for a given route
      // Assuming default direction 'outbound' and service_type '1' for simplicity
      const direction = 'outbound'; // Can be 'inbound' or 'outbound'
      const serviceType = '1'; // Can be '1', '2', etc. (refer to API spec)

      const response = await fetch(`${KMB_API_BASE_URL}v1/transport/kmb/route-stop/${selectedRoute}/${direction}/${serviceType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.data) {
        // Map stop IDs to their English names using the allKMBStops data
        const routeStops = data.data.map(rs => ({
          id: rs.stop,
          name: allKMBStops.current[rs.stop] || 'Unknown Stop',
        }));
        setStops(routeStops);
      } else {
        setStops([]);
      }
    } catch (err) {
      setError(`Failed to fetch stops for route ${selectedRoute}. Error: ${err.message}`);
      console.error('Error fetching KMB stops:', err);
      setStops([]);
    } finally {
      setLoadingStops(false);
    }
  };

  const fetchArrivalTimes = async (stopId, selectedRoute) => {
    setLoadingArrivals(true);
    setError(null);
    try {
      // Using ETA API to get arrival times for a specific stop and route
      const serviceType = '1'; // Assuming default service_type '1'
      const response = await fetch(`${KMB_API_BASE_URL}v1/transport/kmb/eta/${stopId}/${selectedRoute}/${serviceType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.data) {
        const etas = data.data.map(eta => getTimeDifference(eta.eta));
        setArrivalTimes(prevTimes => ({
          ...prevTimes,
          [stopId]: etas
        }));
      } else {
        setArrivalTimes(prevTimes => ({ ...prevTimes, [stopId]: ['No ETA available'] }));
      }
    } catch (err) {
      setError(`Failed to fetch arrival times for stop ${stopId}. Error: ${err.message}`);
      console.error('Error fetching KMB arrival times:', err);
      setArrivalTimes(prevTimes => ({ ...prevTimes, [stopId]: ['N/A'] }));
    } finally {
      setLoadingArrivals(false);
    }
  };

  useEffect(() => {
    if (route) {
      fetchStopsForRoute(route);
    } else {
      setStops([]);
      setArrivalTimes({});
    }
  }, [route]);

  const handleRouteChange = (event) => {
    setRoute(event.target.value);
  };

  return (
    <div>
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      <h2>KMB Bus Information</h2>
      <div>
        <label htmlFor="busRoute">Enter Bus Route:</label>
        <input
          type="text"
          id="busRoute"
          value={route}
          onChange={handleRouteChange}
          placeholder="e.g., 1A"
        />
      </div>

      {loadingStops && <p>Loading stops...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {stops.length > 0 && (
        <div>
          <h3>Stops for Route {route}:</h3>
          <ul>
            {stops.map(stop => (
              <li key={stop.id}>
                {stop.name}
                <button onClick={() => fetchArrivalTimes(stop.id, route)}>
                  Get Arrival Times
                </button>
                {loadingArrivals && <p>Loading arrivals...</p>}
                {arrivalTimes[stop.id] && (
                  <p>Arrivals: {arrivalTimes[stop.id].join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stops.length === 0 && route && !loadingStops && !error && <p>No stops found for route {route}.</p>}
      {!route && <p>Please enter a bus route to see stops and arrival times.</p>}
    </div>
  );
}

export default Bus;