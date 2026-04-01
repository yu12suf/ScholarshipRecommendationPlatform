import axios from 'axios';

const test = async () => {
  try {
    const res = await axios.get('http://localhost:5000/health');
    console.log('Health check (/health):', res.data);
    
    try {
      const res2 = await axios.get('http://localhost:5000/api/counselors/ping');
      console.log('Counselor ping (/api/counselors/ping):', res2.data);
    } catch (err) {
      console.log('Counselor ping failed:', err.response?.status || err.message);
    }
  } catch (err) {
    console.error('Network Error during script:', err.message);
  }
};

test();
