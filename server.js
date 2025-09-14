const express = require('express');
const bodyParser = require('body-parser');
const { chromium } = require('playwright');

const app = express();
app.use(bodyParser.json());

let browser;

app.post('/start-browser', async (req, res) => {
  try {
    if (!browser) {
      browser = await chromium.launch({ headless: true });
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    res.json({ message: 'Browser started', pageId: page.guid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/navigate', async (req, res) => {
  const { url } = req.body;
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    res.json({ message: `Navigated to ${url}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/action', async (req, res) => {
  const { url, selector, action, value } = req.body;

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);

    if (action === 'click') {
      await page.click(selector);
    } else if (action === 'fill') {
      await page.fill(selector, value);
    } else if (action === 'getText') {
      const text = await page.textContent(selector);
      return res.json({ text });
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    res.json({ message: `${action} performed on ${selector}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Playwright API running on port 3000');
});
