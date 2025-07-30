// Simple test script to verify the auth flow
const fetch = require('node-fetch');

async function testAuthFlow() {
  try {
    console.log('🧪 Testing MedFayda Auth Flow...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Get auth URL
    console.log('\n2. Testing auth initiation...');
    const authResponse = await fetch('http://localhost:5000/api/auth/fayda-auth', {
      method: 'GET',
      headers: {
        'Cookie': 'connect.sid=test-session'
      }
    });
    const authData = await authResponse.json();
    console.log('✅ Auth URL generated:', authData.state);

    // Test 3: Test callback with the generated state
    console.log('\n3. Testing callback...');
    const callbackResponse = await fetch('http://localhost:5000/api/auth/fayda-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session'
      },
      body: JSON.stringify({
        code: 'test-code',
        state: authData.state
      })
    });
    const callbackData = await callbackResponse.json();
    
    if (callbackResponse.ok) {
      console.log('✅ Callback successful:', callbackData.message);
      console.log('✅ User created:', callbackData.user.firstName, callbackData.user.lastName);
    } else {
      console.log('❌ Callback failed:', callbackData.message);
    }

    console.log('\n🎉 Auth flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running: node server.js');
  }
}

testAuthFlow();
