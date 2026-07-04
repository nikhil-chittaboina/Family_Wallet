import { useEffect, useState } from 'react';
import axios from 'axios';
import Expenses from './components/Expenses';

function App() {
  const [health, setHealth] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then((res) => setHealth(res.data.message))
      .catch(() => setHealth('Backend not reachable'));
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: '980px', margin: '0 auto' }}>
      <header>
        <h1>Family Finance Manager</h1>
        <p>Welcome! This MVP tracks income, expenses, categories, and monthly summaries.</p>
      </header>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
        <strong>Backend status:</strong> {health}
      </div>
      <Expenses />
    </div>
  );
}

export default App;
