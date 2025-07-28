
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');

BeforeAll(async function () {
  console.log('🚀 Starting test suite...');
});

Before(async function () {
  await this.openBrowser();
});

After(async function () {
  await this.closeBrowser();
});

AfterAll(async function () {
  console.log('✅ Test suite completed');
});
