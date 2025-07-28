
module.exports = {
  default: {
    require: ['tests/step-definitions/**/*.js', 'tests/support/**/*.js'],
    format: ['progress', 'json:test-results/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    worldParameters: {
      foo: 'bar'
    }
  }
};