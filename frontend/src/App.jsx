import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    Units_Sold: 100,
    Units_Ordered: 120,
    Discount: 0.1,
    Category: 'Electronics',
    Region: 'East',
    Inventory_Level: 'Medium',
    Weather_Condition: 'Sunny',
    Seasonality: 'Summer'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: isNaN(value) || value === '' ? value : parseFloat(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    // Automatically targets local server port in dev, or relative root in production
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : '';

    try {
      const response = await fetch(`${baseUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction from server');
      }

      const data = await response.json();
      setPrediction(data.predicted_value);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '25px' }}>📈 Demand Forecasting Dashboard</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Units Sold</label>
              <input type="number" name="Units_Sold" value={formData.Units_Sold} onChange={handleInputChange} style={inputStyle} required />
            </div>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Units Ordered</label>
              <input type="number" name="Units_Ordered" value={formData.Units_Ordered} onChange={handleInputChange} style={inputStyle} required />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Discount Rate (e.g. 0.15 for 15%)</label>
            <input type="number" step="0.01" name="Discount" value={formData.Discount} onChange={handleInputChange} style={inputStyle} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
              <select name="Category" value={formData.Category} onChange={handleInputChange} style={inputStyle}>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Region</label>
              <select name="Region" value={formData.Region} onChange={handleInputChange} style={inputStyle}>
                <option value="East">East</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Inventory Level</label>
              <select name="Inventory_Level" value={formData.Inventory_Level} onChange={handleInputChange} style={inputStyle}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Weather Condition</label>
              <select name="Weather_Condition" value={formData.Weather_Condition} onChange={handleInputChange} style={inputStyle}>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Snowy">Snowy</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ block: 'true', marginBottom: '5px', fontWeight: 'bold' }}>Seasonality</label>
            <select name="Seasonality" value={formData.Seasonality} onChange={handleInputChange} style={inputStyle}>
              <option value="Summer">Summer</option>
              <option value="Spring">Spring</option>
              <option value="Autumn">Autumn</option>
              <option value="Winter">Winter</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Running AI Engine...' : 'Calculate Demand Forecast'}
          </button>
        </form>

        {error && <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

        {prediction !== null && (
          <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#d4edda', borderLeft: '5px solid #28a745', borderRadius: '4px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#155724' }}>Predicted Customer Demand</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#155724' }}>{prediction.toFixed(2)} units</p>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
  marginTop: '5px'
};

export default App;
