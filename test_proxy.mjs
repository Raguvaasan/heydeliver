import axios from 'axios';

async function testDelete() {
  const testId = 'ORD_TEST_DELETE_123';
  const url = `http://localhost:3000/api/orders/${testId}`;
  
  console.log(`Testing DELETE ${url}...`);
  try {
    const response = await axios.delete(url, {
      validateStatus: () => true
    });
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    
    if (response.status === 404) {
      if (response.data && response.data.message === 'Not found') {
        console.error('FAILED: Proxy still returns local 404 "Not found"');
      } else {
        console.log('PASSED: Received 404 from backend (expected as ID is fake), but route exists in proxy!');
      }
    } else {
      console.log('RECEIVED status:', response.status, '(Route exists in proxy)');
    }
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testDelete();
