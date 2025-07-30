// Simple test script for MedFayda authentication
const https = require('http');

// Test 1: Test route
console.log('🧪 Testing MedFayda Authentication API...\n');

const testEndpoint = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/auth${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function runTests() {
  try {
    // Test 1: Test route
    console.log('1️⃣  Testing /test route...');
    const testResult = await testEndpoint('GET', '/test');
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Response:`, testResult.data);
    console.log('');

    // Test 2: Fayda login
    console.log('2️⃣  Testing /fayda/login route...');
    const faydaResult = await testEndpoint('GET', '/fayda/login');
    console.log(`   Status: ${faydaResult.status}`);
    console.log(`   Response:`, faydaResult.data);
    console.log('');

    // Test 2b: Fayda callback
    if (faydaResult.data.state) {
      console.log('2️⃣b Testing /fayda/callback route...');
      const callbackResult = await testEndpoint('POST', '/fayda/callback', {
        code: 'mock-code',
        state: faydaResult.data.state
      });
      console.log(`   Status: ${callbackResult.status}`);
      console.log(`   Response:`, callbackResult.data);
      console.log('');
    }

    // Test 3: SMS send OTP
    console.log('3️⃣  Testing /sms/send-otp route...');
    const smsResult = await testEndpoint('POST', '/sms/send-otp', {
      phoneNumber: '+251911234567'
    });
    console.log(`   Status: ${smsResult.status}`);
    console.log(`   Response:`, smsResult.data);
    console.log('');

    if (smsResult.data.sessionId) {
      // Test 4: SMS verify OTP
      console.log('4️⃣  Testing /sms/verify-otp route...');
      const otpToUse = smsResult.data.otp || '123456'; // Use actual OTP if available
      const verifyResult = await testEndpoint('POST', '/sms/verify-otp', {
        sessionId: smsResult.data.sessionId,
        otp: otpToUse
      });
      console.log(`   Status: ${verifyResult.status}`);
      console.log(`   Response:`, verifyResult.data);
      console.log('');
    }

    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
