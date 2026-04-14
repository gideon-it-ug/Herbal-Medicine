import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchPlants } from '../services/api';
import '../App.css';

function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    searchPlants(query).then(data => { setResults(data); setLoading(false); });
  }, [query]);

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>All Plants</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">Results for "{query}"</h2>
        {loading && <p>Searching...</p>}
        {!loading && results.length === 0 && <div className="card"><p>No plants found for "{query}". Try a different search term.</p></div>}
        {results.map(plant => (
          <div className="card" key={plant.id}>
            <h3>{plant.name}</h3>
            {plant.local_language && <span className="badge">{plant.local_language}</span>}
            {plant.geographic_distribution && <span className="badge">📍 {plant.geographic_distribution}</span>}
            <p style={{ marginTop: '10px' }}><strong>Disease:</strong> {plant.ailments_treated}</p>
            <br />
            <Link to={`/plants/${plant.id}`}>View Full Details →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;