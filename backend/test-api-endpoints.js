// Test script for Add/Remove Tests API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAddRemoveAPI() {
  console.log('🧪 Testing Add/Remove Tests API Endpoints');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Get all test suites
    console.log('\n1. 📋 Getting all test suites...');
    const suitesResponse = await axios.get(`${BASE_URL}/api/suites/suites`);
    console.log(`✅ Found ${suitesResponse.data.length} test suite(s)`);
    
    if (suitesResponse.data.length === 0) {
      console.log('⚠️ No test suites found. Please create a test suite first.');
      return;
    }

    const firstSuite = suitesResponse.data[0];
    console.log(`📋 Using suite: "${firstSuite.name}" (${firstSuite.id})`);

    // 2. Get suite test details
    console.log('\n2. 📝 Getting suite test details...');
    const suiteTestsResponse = await axios.get(`${BASE_URL}/api/suites/suites/${firstSuite.id}/tests`);
    console.log(`✅ Tests in suite: ${suiteTestsResponse.data.totalTestsInSuite}`);
    console.log(`✅ Available tests: ${suiteTestsResponse.data.totalAvailableTests}`);

    // 3. Test adding a test (if available)
    if (suiteTestsResponse.data.availableTests.length > 0) {
      const testToAdd = suiteTestsResponse.data.availableTests[0];
      console.log(`\n3. ➕ Adding test "${testToAdd.testName}" to suite...`);
      
      const addResponse = await axios.post(`${BASE_URL}/api/suites/suites/${firstSuite.id}/tests/${testToAdd.testId}`);
      console.log(`✅ ${addResponse.data.message}`);
      
      // 4. Test removing the same test
      console.log(`\n4. ➖ Removing test "${testToAdd.testName}" from suite...`);
      const removeResponse = await axios.delete(`${BASE_URL}/api/suites/suites/${firstSuite.id}/tests/${testToAdd.testId}`);
      console.log(`✅ ${removeResponse.data.message}`);
    } else {
      console.log('\n3. ⚠️ No available tests to add to suite');
    }

    // 5. Test error cases
    console.log('\n5. ❌ Testing error cases...');
    
    try {
      await axios.post(`${BASE_URL}/api/suites/suites/${firstSuite.id}/tests/invalid-test-id`);
    } catch (error) {
      console.log(`✅ Error handling works: ${error.response.data.error}`);
    }

    try {
      await axios.delete(`${BASE_URL}/api/suites/suites/invalid-suite-id/tests/any-test`);
    } catch (error) {
      console.log(`✅ Error handling works: ${error.response.data.error}`);
    }

    console.log('\n🎉 All API endpoints working correctly!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testAddRemoveAPI()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = testAddRemoveAPI; 