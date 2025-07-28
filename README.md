# AutoTest LLM - AI-Powered Playwright Test Automation

An intelligent test automation solution that generates Playwright tests from natural language prompts using Large Language Models (LLMs). Create comprehensive UI and API tests in BDD format with Allure reporting, all powered by AI.

## 🚀 Features

- **AI-Powered Test Generation**: Generate Playwright tests from natural language prompts
- **Multiple LLM Support**: OpenAI GPT-4, Anthropic Claude, or local LLMs (Ollama)
- **BDD Format**: Tests generated in Gherkin format with corresponding step definitions
- **UI & API Testing**: Support for both web UI and REST API testing
- **Allure Reporting**: Beautiful test reports with detailed execution results
- **React Dashboard**: Modern web interface for managing prompts and tests
- **Intelligent Clarification**: AI asks for clarification when prompts are ambiguous
- **Test Management**: CRUD operations for prompts and generated tests
- **Multiple Browsers**: Support for Chromium, Firefox, Safari, and mobile testing

## 🛠️ Tech Stack

**Backend:**

- Node.js with Express
- Playwright for test execution
- OpenAI/Anthropic SDK for LLM integration
- Cucumber.js for BDD support
- Allure for reporting

**Frontend:**

- React 18
- Material-UI for components
- React Router for navigation
- Axios for API calls

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/auto-test.git
cd auto-test
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all

# Or install individually
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Choose your LLM provider
LLM_PROVIDER=openai  # or 'claude' or 'local'

# API Keys (add the one you're using)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
LOCAL_LLM_URL=http://localhost:11434

# Application Configuration
PORT=8000
FRONTEND_URL=http://localhost:4001
BASE_URL=http://localhost:4001
API_BASE_URL=http://localhost:8000/api

# Test Configuration
TEST_TIMEOUT=30000
MAX_RETRIES=3
PARALLEL_WORKERS=4
```

### 5. Start the Application

**Development Mode:**

```bash
npm run dev
```

This starts both backend (port 8000) and frontend (port 4001) concurrently.

**Production Mode:**

```bash
# Build frontend
npm run build

# Start backend
npm start
```

## 🎯 Quick Start

### 1. Configure LLM Provider

1. Open the application at `http://localhost:4001`
2. Go to Settings page
3. Select your LLM provider and enter API key
4. Click "Validate Configuration"

### 2. Create Your First Prompt

1. Navigate to the "Prompts" page
2. Click "Create Prompt"
3. Fill in the details:
   - **Title**: "Login Test"
   - **Description**: "Test user login functionality"
   - **Content**: "Test that a user can log in with valid credentials and see the dashboard"
   - **Type**: "UI"
   - **Tags**: "smoke, login"
4. Click "Create"

### 3. Generate Test

1. Find your prompt in the list
2. Click "Generate Test"
3. If the AI needs clarification, answer the questions
4. View the generated test files

### 4. Run Tests

1. Go to the "Tests" page
2. Click "Run Test" on a specific test, or "Run All Tests"
3. View results in the "Results" page

## 📝 Example Prompts

### UI Test Examples

**Login Functionality:**

```
Test the login functionality with valid and invalid credentials.
Verify that successful login redirects to dashboard and
failed login shows appropriate error messages.
```

**E-commerce Checkout:**

```
Test the complete checkout process for an e-commerce site.
Add items to cart, proceed to checkout, enter shipping and
payment information, and complete the purchase.
```

**Responsive Design:**

```
Test that the navigation menu works correctly on both
desktop and mobile devices. Verify hamburger menu
functionality on mobile.
```

### API Test Examples

**User CRUD Operations:**

```
Test CRUD operations for user management API.
Create a new user, read user details, update user information,
and delete the user. Verify appropriate status codes and responses.
```

**Authentication API:**

```
Test the authentication endpoints including login, logout,
token refresh, and protected route access. Verify JWT token
handling and expiration.
```

## 🏗️ Project Structure

```
auto-test/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── llmService.js        # LLM integration
│   │   │   ├── testGenerator.js     # Test file generation
│   │   │   └── promptManager.js     # Prompt CRUD operations
│   │   ├── routes/
│   │   │   ├── prompts.js          # Prompt API routes
│   │   │   ├── tests.js            # Test execution routes
│   │   │   └── generation.js       # Test generation routes
│   │   └── server.js               # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                 # Page components
│   │   └── App.js
│   └── package.json
├── tests/
│   ├── features/                  # Generated feature files
│   ├── step-definitions/          # Generated step definitions
│   ├── api/                      # Generated API tests
│   └── support/                  # Test support files
├── prompts/                      # Stored prompts
├── allure-results/              # Test results
├── playwright.config.js         # Playwright configuration
└── package.json
```

## 🎮 Usage Guide

### Creating Effective Prompts

**Be Specific:**

- Include specific user flows and expected outcomes
- Mention the type of application (e.g., e-commerce, CRM, blog)
- Specify data to test with

**Include Context:**

- Mention authentication requirements
- Specify which pages/endpoints to test
- Include any special conditions or edge cases

**Example Good Prompt:**

```
Test the user registration process for a fitness tracking app.
User should be able to create an account with email, password,
and basic profile information (age, weight, fitness goals).
Verify email validation, password strength requirements,
and successful account creation with profile setup.
```

### Working with Generated Tests

**UI Tests:**

- Generated as Gherkin feature files
- Step definitions use Playwright
- Include proper waits and assertions
- Support multiple browsers

**API Tests:**

- Direct Playwright API testing format
- Include request/response validation
- Test various HTTP status codes
- Validate response schemas

### Test Execution Options

**Browser Selection:**

- Chromium (default)
- Firefox
- WebKit (Safari)
- Mobile Chrome/Safari

**Execution Modes:**

- Headed (with browser UI)
- Headless (background)
- Debug mode with --ui flag

## 📊 Reporting

### Allure Reports

Generate beautiful test reports:

```bash
# Generate report
npm run allure:generate

# Serve report
npm run allure:serve

# Open existing report
npm run allure:open
```

### Built-in Results

View test results in the web interface:

- Success rate overview
- Individual test status
- Execution duration
- Error details

## 🔧 Configuration

### LLM Providers

**OpenAI:**

- Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Supports GPT-4, GPT-4 Turbo, GPT-3.5 Turbo

**Anthropic Claude:**

- Get API key from [Anthropic Console](https://console.anthropic.com/)
- Supports Claude 3 Sonnet, Claude 3 Haiku

**Local LLM (Ollama):**

- Install [Ollama](https://ollama.ai/)
- Pull models: `ollama pull llama2`
- Set LOCAL_LLM_URL in environment

### Playwright Configuration

Edit `playwright.config.js` to customize:

- Test directories
- Browser projects
- Timeouts and retries
- Reporter settings

## 🚨 Troubleshooting

### Common Issues

**LLM API Errors:**

- Verify API key is correct
- Check account quota/billing
- Ensure provider is properly selected

**Test Generation Fails:**

- Make prompts more specific
- Provide additional context
- Check LLM provider status

**Tests Won't Run:**

- Verify Playwright browsers are installed
- Check test file syntax
- Ensure proper imports in generated files

**Frontend Won't Start:**

- Check if backend is running on port 7000
- Verify Node.js version compatibility
- Clear node_modules and reinstall

### Debug Mode

Run tests in debug mode:

```bash
npx playwright test --debug
npx playwright test --ui
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) for the testing framework
- [OpenAI](https://openai.com/) and [Anthropic](https://anthropic.com/) for LLM APIs
- [Material-UI](https://mui.com/) for React components
- [Allure](https://allurereport.org/) for test reporting

## 📞 Support

For questions and support:

- Create an issue on GitHub
- Check the [documentation](docs/)
- Join our [Discord community](https://discord.gg/autotest)

---

**Happy Testing with AI! 🤖✨**

## 🎯 **Found the Problem!**

**Your backend has plenty of data:**

- ✅ **7 tests** available
- ✅ **API endpoints** working perfectly
- ✅ **Test results** ready to display

**The issue is in your frontend Results tab** - it's not calling the right APIs. Here's how to fix it:

## 🔧 **Fix Your Frontend Results Tab:**

### **1. Update your Results component to call the correct APIs:**

```javascript
// In your Results component
import React, { useState, useEffect } from "react";

const ResultsTab = () => {
  const [summary, setSummary] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultsData();
  }, []);

  const fetchResultsData = async () => {
    try {
      // Fetch results summary
      const summaryResponse = await fetch("/api/tests/results/summary");
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      // Fetch all tests
      const testsResponse = await fetch("/api/tests");
      const testsData = await testsResponse.json();
      setTests(testsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching results:", error);
      setLoading(false);
    }
  };

  const openPlaywrightReport = () => {
    window.open("/api/tests/reports/playwright", "_blank");
  };

  const openAllureReport = () => {
    // Generate and open Allure report
    window.open("http://127.0.0.1:57989", "_blank");
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div>
      <h2>📊 Test Results</h2>

      {/* Summary Section */}
      <div className="summary-section">
        <h3>📈 Summary</h3>
        <p>
          <strong>Total Tests:</strong> {summary?.totalTests || 0}
        </p>

        {/* Report Buttons */}
        <div className="reports-section">
          <h4>📋 Available Reports:</h4>
          {summary?.reports?.playwright?.available && (
            <button onClick={openPlaywrightReport}>
              📊 View Playwright Report
            </button>
          )}
          <button onClick={openAllureReport}>📈 View Allure Dashboard</button>
        </div>
      </div>

      {/* Tests List */}
      <div className="tests-section">
        <h3>🧪 Recent Tests</h3>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Type</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.testId}>
                <td>{test.testName}</td>
                <td>{test.testType}</td>
                <td>{new Date(test.timestamp).toLocaleString()}</td>
                <td>
                  <button onClick={() => runTest(test.testId)}>▶️ Run</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const runTest = async (testId) => {
  try {
    const response = await fetch(`/api/tests/${testId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ browser: "chromium", headed: false }),
    });
    const result = await response.json();
    alert(result.success ? "Test completed!" : "Test failed!");
  } catch (error) {
    alert("Error running test: " + error.message);
  }
};
```

### **2. Quick Test - Open these URLs directly in your browser:**

```
✅ Results Summary: http://localhost:8000/api/tests/results/summary
✅ All Tests: http://localhost:8000/api/tests
✅ Playwright Report: http://localhost:8000/api/tests/reports/playwright
```

### **3. If you want to see results immediately, run this in your browser console:**

```javascript
<code_block_to_apply_changes_from>
```

**Your data is ready - you just need to connect your frontend to these working APIs!** 🚀
