
const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async openBrowser() {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    return this.page;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(CustomWorld);
