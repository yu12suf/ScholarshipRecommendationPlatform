import axios from 'axios';

const test = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/health');
    console.log('Health check:', res.data);
    
    // Test a counselor route (should fail with 401 but not Network Error)
    try {
      await axios.get('http://localhost:5000/api/counselors/students');
    } catch (err) {
      console.log('Counselor students (unauth):', err.response?.status || err.message);
    }
  } catch (err) {
    console.error('Network Error during script:', err.message);
  }
};

test();
