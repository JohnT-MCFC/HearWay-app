import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Components.css';

function Minibus() {
  const navigate = useNavigate();
  const [route, setRoute] = useState('');
  const [stops, setStops] = useState([]);
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const [error, setError] = useState(null);

  // HK Green Minibus API endpoints from official specification
  const GMB_API_BASE_URL = 'https://data.etagmb.gov.hk';
  const allGMBStops = useRef({}); // To store all GMB stops fetched once

  const fetchStopsForRoute = async (selectedRoute) => {
    setLoadingStops(true);
    setError(null);
    try {
      // First get route details to find route_id
      const routeResponse = await fetch(`${GMB_API_BASE_URL}/route/HKI/${selectedRoute}`);
      if (!routeResponse.ok) {
        throw new Error(`HTTP error! status: ${routeResponse.status}`);
      }
      const routeData = await routeResponse.json();
      
      if (routeData.data && routeData.data.length > 0) {
        const routeId = routeData.data[0].route_id;
        const routeSeq = routeData.data[0].directions[0].route_seq;
        
        // Get stops for this route
        const stopsResponse = await fetch(`${GMB_API_BASE_URL}/route-stop/${routeId}/${routeSeq}`);
        if (!stopsResponse.ok) {
          throw new Error(`HTTP error! status: ${stopsResponse.status}`);
        }
        const stopsData = await stopsResponse.json();
        
        if (stopsData.data && stopsData.data.route_stops) {
          const routeStops = stopsData.data.route_stops.map(stop => ({
            id: stop.stop_id,
            name: stop.name_en || stop.name_tc || 'Unknown Stop'
          }));
          setStops(routeStops);
        } else {
          setStops([]);
        }
      } else {
        setStops([]);
      }
    } catch (err) {
      setError(`Failed to fetch stops for route ${selectedRoute}. Please check the route number and API endpoint. Error: ${err.message}`);
      console.error('Error fetching Minibus stops:', err);
      setStops([]);
    } finally {
      setLoadingStops(false);
    }
  };

  const fetchArrivalTimes = async (stopId, selectedRoute) => {
    setLoadingArrivals(true);
    setError(null);
    try {
      // First get route details to find route_id
      const routeResponse = await fetch(`${GMB_API_BASE_URL}/route/HKI/${selectedRoute}`);
      if (!routeResponse.ok) {
        throw new Error(`HTTP error! status: ${routeResponse.status}`);
      }
      const routeData = await routeResponse.json();
      
      if (routeData.data && routeData.data.length > 0) {
        const routeId = routeData.data[0].route_id;
        
        // Get ETAs for this stop
        const etaResponse = await fetch(`${GMB_API_BASE_URL}/eta/route-stop/${routeId}/${stopId}`);
        if (!etaResponse.ok) {
          throw new Error(`HTTP error! status: ${etaResponse.status}`);
        }
        const etaData = await etaResponse.json();
        
        if (etaData.data && etaData.data.enabled) {
          const etas = etaData.data.eta.map(eta => {
            if (eta.diff === 0) return 'Arriving';
            return `${eta.diff} mins` + (eta.remarks_en ? ` (${eta.remarks_en})` : '');
          });
          setArrivalTimes(prevTimes => ({
            ...prevTimes,
            [stopId]: etas.length > 0 ? etas : ['No ETA available']
          }));
        } else {
          setArrivalTimes(prevTimes => ({
            ...prevTimes,
            [stopId]: ['ETA service unavailable']
          }));
        }
      } else {
        setArrivalTimes(prevTimes => ({
          ...prevTimes,
          [stopId]: ['No route found']
        }));
      }
    } catch (err) {
      setError(`Failed to fetch arrival times for stop ${stopId}. Please check the route number and API endpoint. Error: ${err.message}`);
      console.error('Error fetching Minibus arrival times:', err);
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
      <h2>HK Green Minibus Information</h2>
      <div>
        <label htmlFor="minibusRoute">Enter Minibus Route:</label>
        <input
          type="text"
          id="minibusRoute"
          value={route}
          onChange={handleRouteChange}
          placeholder="e.g., 806A"
        />
      </div>

      {stops.length > 0 && (
        <div>
          <h3>Stops for Route {route}:</h3>
          <ul>
            {stops.map(stop => (
              <li key={stop.id}>
                {stop.name}
                <button onClick={() => fetchArrivalTimes(stop.id)}>
                  Get Arrival Times
                </button>
                {arrivalTimes[stop.id] && (
                  <p>Arrivals: {arrivalTimes[stop.id].join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stops.length === 0 && route && <p>No stops found for route {route}.</p>}
      {!route && <p>Please enter a minibus route to see stops and arrival times.</p>}
    </div>
  );
}

export default Minibus;