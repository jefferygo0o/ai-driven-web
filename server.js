const express = require('express');
const bodyParser = require('body-parser');
const { chromium } = require('playwright');

const app = express();
app.use(bodyParser.json());

let browser;
let context;
let page;

// Helper: ensure browser and page are initialized
async function ensurePage() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  if (!context) {
    context = await browser.newContext();
  }
  if (!page) {
    page = await context.newPage();
  }
  return page;
}

// Start browser manually (optional)
app.post('/start-browser', async (req, res) => {
  try {
    await ensurePage();
    res.json({ message: 'Browser started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Navigate to a URL
app.post('/navigate', async (req, res) => {
  const { url } = req.body;
  try {
    const page = await ensurePage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    res.json({ message: `Navigated to ${url}`, dom: html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Perform actions on the page
app.post('/action', async (req, res) => {
  const { selector, action, value } = req.body;

  try {
    const page = await ensurePage();

    if (!selector) {
      return res.status(400).json({ error: 'Selector is required' });
    }

    await page.waitForSelector(selector, { state: 'visible', timeout: 30000 });

    if (action === 'click') {
      await page.click(selector);
    } else if (action === 'fill') {
      await page.fill(selector, value);

      // Special case: Google search box
      if (selector === "input[name='q']") {
        await page.keyboard.press('Enter');
        await page.waitForLoadState('domcontentloaded');
      }
    } else if (action === 'getText') {
      const text = await page.textContent(selector);
      return res.json({ text });
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const html = await page.content();
    res.json({ message: `${action} performed on ${selector}`, dom: html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close browser (optional)
app.post('/close-browser', async (req, res) => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      context = null;
      page = null;
    }
    res.json({ message: 'Browser closed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Playwright API running on port 3000');
});
