async function testCallback() {
  try {
    console.log('🧪 Testing Fayda callback endpoint...\n');

    // Step 1: Get login state
    console.log('1️⃣ Getting login state...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/fayda/login');
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    const state = loginData.state;
    console.log('State:', state);

    // Step 2: Test callback with valid state
    console.log('\n2️⃣ Testing callback with valid state...');
    const callbackResponse = await fetch('http://localhost:5000/api/auth/fayda/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'mock-code',
        state: state
      })
    });

    const callbackData = await callbackResponse.json();

    if (callbackResponse.ok) {
      console.log('✅ Callback successful!');
      console.log('Response:', callbackData);
    } else {
      console.log('❌ Callback failed with status:', callbackResponse.status);
      console.log('Response:', callbackData);
    }

  } catch (error) {
    console.error('❌ Callback failed:');
    console.error('Error:', error.message);
  }
}

testCallback();
