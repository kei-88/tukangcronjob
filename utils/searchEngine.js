const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserDataDirPlugin = require('puppeteer-extra-plugin-user-data-dir');
const ProxyManager = require('./proxyManager');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Add stealth plugin
puppeteer.use(StealthPlugin());

// Add user data dir plugin for better session management
puppeteer.use(UserDataDirPlugin());

class SearchEngine {
  constructor() {
    this.proxyManager = new ProxyManager();
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    this.geoLocations = ['ID'];
  }

  // Get random user agent
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Get random geo location
  getRandomGeoLocation() {
    return this.geoLocations[Math.floor(Math.random() * this.geoLocations.length)];
  }

  // Simulate human-like interactions on the target page (with timeouts)
  async simulateHumanInteractions(page) {
    const startTime = Date.now();
    const maxDuration = 30000; // 30 seconds max
    
    try {
      console.log(`🤖 Simulating human interactions on target page...`);
      
      // Wait for page to fully load (with timeout)
      await Promise.race([
        page.waitForTimeout(2000 + Math.random() * 3000),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]).catch(() => console.log(`⚠️ Page load timeout, continuing...`));
      
      // 1. Random mouse movements (simplified)
      const numMovements = Math.floor(Math.random() * 3) + 2; // 2-4 movements (reduced)
      for (let i = 0; i < numMovements && (Date.now() - startTime) < maxDuration; i++) {
        try {
          const x = Math.random() * 1000 + 100;
          const y = Math.random() * 600 + 100;
          const steps = Math.floor(Math.random() * 10) + 5; // 5-15 steps (reduced)
          await page.mouse.move(x, y, { steps });
          await page.waitForTimeout(Math.random() * 300 + 200); // Reduced delay
        } catch (error) {
          console.log(`⚠️ Mouse movement error: ${error.message}`);
          break;
        }
      }
      
      // 2. Simple scrolling behavior (with timeout)
      const scrollActions = Math.floor(Math.random() * 2) + 1; // 1-2 scroll actions (reduced)
      for (let i = 0; i < scrollActions && (Date.now() - startTime) < maxDuration; i++) {
        try {
          const scrollAmount = Math.floor(Math.random() * 400) + 200; // 200-600px (reduced)
          const scrollDirection = Math.random() > 0.5 ? 1 : -1;
          await page.evaluate((amount, direction) => {
            window.scrollBy(0, amount * direction);
          }, scrollAmount, scrollDirection);
          await page.waitForTimeout(Math.random() * 500 + 300); // Reduced delay
        } catch (error) {
          console.log(`⚠️ Scroll error: ${error.message}`);
          break;
        }
      }
      
      // 3. Safe reading pause (with timeout)
      try {
        await Promise.race([
          page.waitForTimeout(Math.random() * 2000 + 1000), // 1-3 seconds
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]).catch(() => console.log(`⚠️ Reading pause timeout, continuing...`));
      } catch (error) {
        console.log(`⚠️ Reading pause error: ${error.message}`);
      }
      
      // 4. Simple hover interaction (with timeout)
      if (Math.random() > 0.3 && (Date.now() - startTime) < maxDuration) {
        try {
          const x = Math.random() * 800 + 100;
          const y = Math.random() * 500 + 100;
          await page.mouse.move(x, y, { steps: 3 });
          await page.waitForTimeout(Math.random() * 500 + 300);
        } catch (error) {
          console.log(`⚠️ Hover error: ${error.message}`);
        }
      }
      
      // 5. Final short pause (with timeout)
      try {
        await Promise.race([
          page.waitForTimeout(Math.random() * 1500 + 1000), // 1-2.5 seconds (reduced)
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]).catch(() => console.log(`⚠️ Final pause timeout, continuing...`));
      } catch (error) {
        console.log(`⚠️ Final pause error: ${error.message}`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Human interactions completed successfully (${Math.round(duration/1000)}s)`);
      
    } catch (error) {
      console.log(`⚠️ Error during human interactions: ${error.message}`);
      // Don't fail the whole process if interactions fail
    }
  }

  // Check if Chrome profile is available
  async checkChromeProfileConnection() {
    try {
      // Get the correct WebSocket URL from Chrome
      const response = await fetch('http://localhost:9222/json/version');
      const data = await response.json();
      const browser = await puppeteer.connect({
        browserWSEndpoint: data.webSocketDebuggerUrl,
        defaultViewport: null
      });
      await browser.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Enhanced stealth mode using professional plugin
  async addEnhancedStealthMode(page) {
    // Set realistic viewport
    await page.setViewport({ 
      width: 1366 + Math.floor(Math.random() * 100), 
      height: 768 + Math.floor(Math.random() * 100) 
    });

    // Override timezone
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: function() {
          return { timeZone: 'America/New_York' };
        }
      });
    });

    // Override screen properties
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(screen, 'width', { get: () => 1920 });
      Object.defineProperty(screen, 'height', { get: () => 1080 });
      Object.defineProperty(screen, 'availWidth', { get: () => 1920 });
      Object.defineProperty(screen, 'availHeight', { get: () => 1040 });
    });
  }

  // Create browser with proxy and enhanced stealth
  async createBrowser(proxy) {
    console.log(`🚀 Launching new browser with proxy: ${proxy.username}@${proxy.host}:${proxy.port}`);
    
    // Use proxy without credentials in URL, authenticate separately
    console.log(`🔗 Using proxy server: ${proxy.host}:${proxy.port}`);
    
    // Always launch new browser with proxy (no local Chrome connection)
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          `--proxy-server=http://${proxy.host}:${proxy.port}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-ipc-flooding-protection',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--force-color-profile=srgb',
          'shared-memory',
          '--window-size=1366,768',
          '--start-maximized'
        ]
      });

      return browser;
  }

  // Handle proxy authentication using page.authenticate()
  async handleProxyAuth(page, proxy) {
    console.log(`🔐 Setting up proxy authentication for: ${proxy.username}@${proxy.host}`);
    
    try {
      // Use page.authenticate() for proxy authentication
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
      
      console.log(`✅ Proxy authentication configured successfully`);
      return true;
    } catch (error) {
      console.log(`❌ Proxy authentication failed: ${error.message}`);
      return false;
    }
  }


  // Direct navigation approach - bypass search engines entirely
  async directNavigationApproach(keyword, targetUrl) {
    let browser;
    let page;
    
    try {
      // Get fresh proxy
      const proxy = this.proxyManager.getNextProxy();
      console.log(`🎯 Direct navigation to "${targetUrl}" with proxy: ${proxy.username}@${proxy.host}:${proxy.port}`);
      
      // Create browser with proxy
      browser = await this.createBrowser(proxy);
      page = await browser.newPage();
      
      // Handle proxy authentication dialog automatically
      await this.handleProxyAuth(page, proxy);
      
      // Add enhanced stealth mode to avoid detection
      await this.addEnhancedStealthMode(page);
      
      // Set user agent
      await page.setUserAgent(this.getRandomUserAgent());
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate directly to target URL
      console.log(`🌐 Navigating directly to: ${targetUrl}`);
      await page.goto(targetUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit to simulate human behavior
      await page.waitForTimeout(Math.random() * 5000 + 3000); // 3-8 seconds
      
      // Simulate human interaction
      await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100);
      await page.waitForTimeout(1000);
      
      // Scroll down to simulate reading
      await page.evaluate(() => {
        window.scrollBy(0, Math.random() * 500 + 200);
      });
      await page.waitForTimeout(2000);
      
      // Capture H1 heading from the target URL to prove we actually visited it
      let pageH1 = 'No H1 found';
      let pageTitle = 'No title found';
      try {
        pageTitle = await page.title();
        const h1Element = await page.$('h1');
        if (h1Element) {
          pageH1 = await page.evaluate(el => el.textContent.trim(), h1Element);
        }
      } catch (error) {
        console.log(`⚠️ Could not extract H1: ${error.message}`);
      }
      
      console.log(`✅ Successfully navigated to target URL: ${targetUrl}`);
      console.log(`📄 Page Title: ${pageTitle}`);
      console.log(`📋 Main H1 Heading: "${pageH1}"`);
      console.log(`🎯 PROOF: Bot successfully visited and read content from target URL!`);
      
      return { 
        success: true, 
        clicked: true, 
        proxy: proxy.username, 
        method: 'direct-navigation',
        engine: 'Direct',
        pageTitle: pageTitle,
        h1Heading: pageH1
      };
      
    } catch (error) {
      console.error(`❌ Error in direct navigation to "${targetUrl}":`, error.message);
      return { success: false, error: error.message };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Search with multiple engines (Google.co.id, DuckDuckGo, etc.)
  async searchWithMultipleEngines(keyword, targetUrl, geoLocation = 'ID') {
    // Always use proxy browsers to avoid location tracking
    console.log(`🚀 Using proxy browsers - trying Google.com search for "${keyword}"`);
    
    // Focus only on Google.com for maximum SEO impact
    const searchEngines = [
      { 
        name: 'Google.com', 
        url: 'https://www.google.com',
        inputSelector: 'input[name="q"], textarea[name="q"]',
        baseUrl: 'https://www.google.com'
      }
    ];

    // Use proxy browsers for searches with random geo locations
    for (const engine of searchEngines) {
      try {
        const randomGeo = this.getRandomGeoLocation();
        console.log(`🔍 Trying ${engine.name} for "${keyword}" with proxy from ${randomGeo}`);
        const result = await this.searchWithEngine(engine, keyword, targetUrl, randomGeo);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log(`❌ ${engine.name} failed: ${error.message}`);
        continue;
      }
    }
    
    // NO DIRECT NAVIGATION - SEO impact comes from search results only!
    console.log(`❌ Google.com search failed - NO direct navigation for SEO impact`);
    return { success: false, error: 'Google.com search failed - no SEO impact without search results' };
  }

  // Search with Chrome profile using new tabs (keeps browser alive)
  async searchWithEngineChrome(chromeBrowser, engine, keyword, targetUrl) {
    let page;
    
    try {
      console.log(`🎯 Search & Click "${keyword}" with ${engine.name} using Chrome profile`);
      
      // Create new tab in existing Chrome browser
      page = await chromeBrowser.newPage();
      
      // Add enhanced stealth mode to avoid detection
      await this.addEnhancedStealthMode(page);
      
      // Set user agent
      await page.setUserAgent(this.getRandomUserAgent());
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to search engine
      console.log(`🌐 Navigating to ${engine.url}`);
      await page.goto(engine.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to load
      await page.waitForTimeout(2000 + Math.random() * 2000);
      
      console.log(`📄 Current page URL: ${page.url()}`);
      console.log(`📄 Page title: ${await page.title()}`);
      
      // Find search input field
      let searchInput = null;
      for (const selector of engine.inputSelector.split(', ')) {
        try {
          searchInput = await page.$(selector);
          if (searchInput) {
            console.log(`✅ Found search input field with selector: ${selector}`);
            break;
          } else {
            console.log(`ℹ️ Selector ${selector} not found, trying next...`);
          }
        } catch (error) {
          console.log(`ℹ️ Selector ${selector} not found, trying next...`);
          continue;
        }
      }
      
      if (!searchInput) {
        throw new Error(`No element found for selector: ${engine.inputSelector}`);
      }
      
      // Clear and type keyword with human-like behavior
      await searchInput.click();
      await page.waitForTimeout(500 + Math.random() * 500);
      
      await searchInput.evaluate(input => input.value = '');
      await page.waitForTimeout(200 + Math.random() * 300);
      
      // Type with human-like delays
      const keywordChars = keyword.split('');
      for (let i = 0; i < keywordChars.length; i++) {
        await searchInput.type(keywordChars[i], { delay: Math.random() * 100 + 50 });
        
        // Random backspace and retype (30% chance)
        if (Math.random() < 0.3 && i > 0) {
          await page.waitForTimeout(Math.random() * 200 + 100);
          await searchInput.press('Backspace');
          await page.waitForTimeout(Math.random() * 200 + 100);
          await searchInput.type(keywordChars[i], { delay: Math.random() * 100 + 50 });
        }
      }
      
      // Wait before submitting
      await page.waitForTimeout(1000 + Math.random() * 2000);
      
      // Submit search
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(3000 + Math.random() * 2000);
      
      // Check if we got blocked
      const currentUrl = page.url();
      if (currentUrl.includes('sorry') || currentUrl.includes('blocked')) {
        throw new Error(`${engine.name} blocked the search. URL: ${currentUrl}`);
      }
      
      // Extract search results
      const searchResults = await this.extractSearchResults(page, engine);
      console.log(`🔍 Found ${searchResults.length} search results:`, JSON.stringify(searchResults.slice(0, 5), null, 2));
      
      // Try to click target URL
      const clickResult = await this.clickTargetUrl(page, searchResults, targetUrl, keyword, engine.name, 1, 5);
      
      // Close the tab but keep the browser alive
      await page.close();
      
      return clickResult;
      
    } catch (error) {
      console.error(`❌ Error in search with ${engine.name} "${keyword}":`, error.message);
      
      // Close tab if it exists
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  // Search with specific engine
  async searchWithEngine(engine, keyword, targetUrl, geoLocation = 'US') {
    let browser;
    let page;
    
    try {
      // Get fresh proxy
      const proxy = this.proxyManager.getNextProxy();
      console.log(`🎯 Search & Click "${keyword}" with ${engine.name} using proxy: ${proxy.username}@${proxy.host}:${proxy.port}`);
      
      // Create browser with proxy
      browser = await this.createBrowser(proxy);
      page = await browser.newPage();
      
      // Add enhanced stealth mode to avoid detection
      await this.addEnhancedStealthMode(page);
      
      // Set user agent
      await page.setUserAgent(this.getRandomUserAgent());
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Set up proxy authentication handler BEFORE navigation
      const authResult = await this.handleProxyAuth(page, proxy);
      
      if (!authResult) {
        throw new Error('Failed to configure proxy authentication');
      }
      
      // Navigate to search engine with geo-targeting
      const geoUrl = `${engine.url}?gl=${geoLocation}&hl=id&gws_rd=cr`;
      
      console.log(`🌐 Navigating to: ${geoUrl}`);
      await page.goto(geoUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit to simulate human behavior
      await page.waitForTimeout(Math.random() * 3000 + 2000); // 2-5 seconds
      
      console.log(`📄 Current page URL: ${page.url()}`);
      console.log(`📄 Page title: ${await page.title()}`);
      
      // Wait for search input with multiple selectors for Google
      let searchInput = null;
      const selectors = engine.inputSelector.split(', ');
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector.trim(), { timeout: 3000 });
          searchInput = selector.trim();
          console.log(`✅ Found search input field with selector: ${searchInput}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!searchInput) {
        throw new Error('Search input field not found with any selector');
      }
      
      // Search for keyword with advanced human-like behavior
      const typingDelay = Math.random() * 100 + 50; // 50-150ms per character
      await page.type(searchInput, keyword, { delay: typingDelay });
      
      // Random pause before submitting (human hesitation)
      await page.waitForTimeout(Math.random() * 2000 + 1000);
      
      // Simulate realistic mouse movement
      const mouseX = Math.random() * 800 + 100;
      const mouseY = Math.random() * 600 + 100;
      await page.mouse.move(mouseX, mouseY, { steps: 10 });
      await page.waitForTimeout(Math.random() * 500 + 200);
      
      // Sometimes humans backspace and retype
      if (Math.random() < 0.3) {
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(200);
        await page.type(searchInput, keyword.slice(-1), { delay: typingDelay });
        await page.waitForTimeout(500);
      }
      
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if we got blocked
      const currentUrl = page.url();
      if (currentUrl.includes('/sorry/') || currentUrl.includes('/blocked/')) {
        throw new Error(`${engine.name} blocked the search. URL: ${currentUrl}`);
      }
      
      // Wait for search results
      await page.waitForTimeout(3000);
      
      // Debug: Log all search results found
      const debugResults = await page.evaluate(() => {
        const results = [];
        const selectors = ['.result', '.search-result', '.web-result', '.organic-result', '.g', '.search-item', '.result-item', '.serp-item', '[data-testid="result"]'];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el, index) => {
              const link = el.querySelector('a[href]');
              if (link) {
                results.push({
                  selector: selector,
                  position: index + 1,
                  title: link.textContent.trim().substring(0, 100),
                  url: link.href
                });
              }
            });
          }
        }
        return results;
      });
      
      console.log(`🔍 Found ${debugResults.length} search results:`, debugResults.slice(0, 5));
      
      // Look for target URL in results
      const result = await this.findAndClickTarget(page, targetUrl, engine.name);
      
      if (result.found) {
        console.log(`✅ Successfully found and clicked target URL for "${keyword}" on ${engine.name}`);
        return { success: true, clicked: true, proxy: proxy.username, engine: engine.name };
      } else {
        console.log(`❌ Target URL not found in ${engine.name} results for "${keyword}"`);
        
        // Try alternative search strategies
        console.log(`🔍 Trying alternative search strategies...`);
        
        // Strategy 1: Try searching for domain name directly
        const domainName = new URL(targetUrl).hostname.replace('www.', '');
        console.log(`🔍 Trying domain search: "${domainName}"`);
        
        try {
          await page.goto(engine.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await page.waitForTimeout(2000);
          
          const domainSearchInput = await page.$(searchInput);
          if (domainSearchInput) {
            await page.type(searchInput, domainName, { delay: 100 });
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForTimeout(3000);
            
            const domainResult = await this.findAndClickTarget(page, targetUrl, engine.name);
            if (domainResult.found) {
              console.log(`✅ Found target URL using domain search!`);
              return { success: true, clicked: true, proxy: proxy.username, engine: engine.name, method: 'domain-search' };
            }
          }
        } catch (e) {
          console.log(`❌ Domain search failed: ${e.message}`);
        }
        
        return { success: true, clicked: false, proxy: proxy.username, engine: engine.name };
      }
      
    } catch (error) {
      console.error(`❌ Error in search with ${engine.name} "${keyword}":`, error.message);
      return { success: false, error: error.message };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Find and click target URL in search results
  async findAndClickTarget(page, targetUrl, engineName) {
    try {
      const targetDomain = new URL(targetUrl).hostname;
      
      // Try different result selectors for different engines
      const resultSelectors = [
        '.result', '.search-result', '.web-result', '.organic-result',
        '.g', '.search-item', '.result-item', '.serp-item'
      ];
      
      for (const selector of resultSelectors) {
        try {
          const results = await page.$$(selector);
          if (results.length > 0) {
            console.log(`✅ Found ${results.length} results with selector: ${selector}`);
            
            // Look for target URL in results
            for (let i = 0; i < results.length; i++) {
              const result = results[i];
              const link = await result.$('a[href]');
              if (link) {
                const href = await page.evaluate(el => el.href, link);
                try {
                  const linkDomain = new URL(href).hostname;
                  if (linkDomain === targetDomain) {
                    // Click the target URL
                    await link.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
                    console.log(`🎯 Clicked on target URL: ${targetUrl}`);
                    return { found: true };
                  }
                } catch (e) {
                  continue;
                }
              }
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      return { found: false };
      
    } catch (error) {
      console.error(`Error finding target URL "${targetUrl}":`, error.message);
      return { found: false };
    }
  }

  // Legacy Google search method (keeping for fallback)
  async searchGoogle(keyword, targetUrl) {
    let browser;
    let page;
    
    try {
      // Get fresh proxy
      const proxy = this.proxyManager.getNextProxy();
      console.log(`🔍 Searching "${keyword}" with proxy: ${proxy.username}@${proxy.host}:${proxy.port}`);
      
      // Create browser with proxy
      browser = await this.createBrowser(proxy);
      page = await browser.newPage();
      
      // Add enhanced stealth mode to avoid detection
      await this.addEnhancedStealthMode(page);
      
      // Set proxy authentication
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
      
      // Set user agent
      await page.setUserAgent(this.getRandomUserAgent());
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to Google with human-like behavior
      await page.goto('https://www.google.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit to simulate human behavior
      await page.waitForTimeout(Math.random() * 3000 + 2000); // 2-5 seconds
      
      console.log(`📄 Current page URL: ${page.url()}`);
      console.log(`📄 Page title: ${await page.title()}`);
      
      // Accept cookies if present
      try {
        await page.click('button[id="L2AGLb"]', { timeout: 3000 });
        console.log(`✅ Accepted cookies`);
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(`ℹ️ No cookie button found, continuing...`);
      }
      
      // Wait for search input to be available with multiple selectors
      let searchInput = null;
      const selectors = [
        'input[name="q"]',
        'input[aria-label="Search"]',
        'input[type="search"]',
        'textarea[name="q"]',
        'input[placeholder*="Search"]',
        'input[title="Search"]'
      ];
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          searchInput = selector;
          console.log(`✅ Found search input field with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!searchInput) {
        console.log(`❌ No search input found. Available elements:`);
        const inputs = await page.$$eval('input, textarea', elements => elements.map(el => ({
          tag: el.tagName,
          name: el.name,
          id: el.id,
          type: el.type,
          placeholder: el.placeholder,
          ariaLabel: el.getAttribute('aria-label'),
          className: el.className
        })));
        console.log(inputs);
        throw new Error('Search input field not found with any selector');
      }
      
      // Search for keyword with human-like behavior
      await page.type(searchInput, keyword, { delay: 150 }); // Type slowly
      await page.waitForTimeout(2000); // Wait before pressing Enter
      
      // Simulate mouse movement
      await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100);
      await page.waitForTimeout(500);
      
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if we got redirected to Google's "sorry" page
      const currentUrl = page.url();
      if (currentUrl.includes('/sorry/')) {
        console.log(`⚠️ Google showed "sorry" page. Current URL: ${currentUrl}`);
        console.log(`🔍 Trying alternative search approach...`);
        
        // Try going back to Google homepage and search again with more delay
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(5000); // Wait longer
        
        // Try to find search input again
        let retrySearchInput = null;
        const retrySelectors = [
          'input[name="q"]',
          'input[aria-label="Search"]',
          'input[type="search"]',
          'textarea[name="q"]',
          'input[placeholder*="Search"]',
          'input[title="Search"]'
        ];
        
        for (const selector of retrySelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            retrySearchInput = selector;
            console.log(`✅ Found retry search input with selector: ${selector}`);
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (retrySearchInput) {
          await page.type(retrySearchInput, keyword, { delay: 200 });
          await page.waitForTimeout(3000);
          
          // Simulate mouse movement
          await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100);
          await page.waitForTimeout(1000);
          
          await page.keyboard.press('Enter');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
          
          // Check again if we got the sorry page
          const retryUrl = page.url();
          if (retryUrl.includes('/sorry/')) {
            throw new Error(`Google blocked the search after retry. URL: ${retryUrl}`);
          }
        } else {
          throw new Error('Could not find search input for retry');
        }
      }
      
      // Wait for search results
      // Wait for search results with multiple selectors
      let resultsSelector = null;
      const resultSelectors = ['#search', '#center_col', '.main', '#main', '[role="main"]'];
      
      for (const selector of resultSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          resultsSelector = selector;
          console.log(`✅ Found search results with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Results selector ${selector} not found, trying next...`);
        }
      }
      
      if (!resultsSelector) {
        console.log(`❌ No search results found. Current URL: ${page.url()}`);
        throw new Error('Search results container not found');
      }
      
      // Check if target URL is in results
      const results = await this.extractSearchResults(page, resultsSelector);
      const targetFound = this.findTargetInResults(results, targetUrl);
      
      if (targetFound) {
        console.log(`✅ Found target URL in search results for "${keyword}"`);
        return { success: true, found: true, results, proxy: proxy.username };
      } else {
        console.log(`❌ Target URL not found in search results for "${keyword}"`);
        return { success: true, found: false, results, proxy: proxy.username };
      }
      
    } catch (error) {
      console.error(`❌ Error searching "${keyword}":`, error.message);
      return { success: false, error: error.message };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Extract search results from page
  async extractSearchResults(page, engine) {
    try {
      const results = await page.evaluate((engineData) => {
        const searchResults = [];
        
        // Focus on Google.com search results only
        const selectors = [
          '.g',  // Standard Google result
          '.tF2Cxc',  // Google result container
          '.yuRUbf',  // Google result container
          '.LC20lb'  // Google result title
        ];
        
        let resultElements = [];
        for (const selector of selectors) {
          resultElements = document.querySelectorAll(selector);
          if (resultElements.length > 0) {
            console.log(`Found ${resultElements.length} results with selector: ${selector}`);
            break;
          }
        }
        
        resultElements.forEach((element, index) => {
          // Google-specific selectors
          const titleElement = element.querySelector('h3') || element.querySelector('.LC20lb') || element.querySelector('h2');
          const linkElement = element.querySelector('a[href]') || element.querySelector('.yuRUbf a[href]');
          const snippetElement = element.querySelector('.VwiC3b') || element.querySelector('.s') || element.querySelector('.st');
          
          if (titleElement && linkElement && linkElement.href && !linkElement.href.includes('google.com/search')) {
            searchResults.push({
              selector: element.tagName.toLowerCase(),
              position: index + 1,
              title: titleElement.textContent.trim(),
              url: linkElement.href,
              snippet: snippetElement ? snippetElement.textContent.trim() : ''
            });
          }
        });
        
        return searchResults;
      }, engine);
      
      return results;
    } catch (error) {
      console.error('Error extracting search results:', error);
      return [];
    }
  }

  // Find target URL in search results
  findTargetInResults(results, targetUrl) {
    const targetDomain = new URL(targetUrl).hostname;
    
    return results.find(result => {
      try {
        const resultDomain = new URL(result.url).hostname;
        return resultDomain === targetDomain;
      } catch (e) {
        return false;
      }
    });
  }

  // Click on target URL in search results with page scrolling
  async clickTargetUrl(page, searchResults, targetUrl, keyword, engineName, currentPage = 1, maxPages = 5) {
    try {
      const targetDomain = new URL(targetUrl).hostname;
      
      console.log(`🔍 Checking page ${currentPage} for target URL: ${targetUrl}`);
      console.log(`📊 Found ${searchResults.length} results on page ${currentPage}`);
      
      // First, check if target URL is in current search results
      const foundResult = searchResults.find(result => {
        try {
          const resultDomain = new URL(result.url).hostname;
          console.log(`🔍 Comparing: ${resultDomain} vs ${targetDomain}`);
          return resultDomain === targetDomain;
        } catch (e) {
          return false;
        }
      });
      
      if (foundResult) {
        console.log(`✅ Target URL found in position ${foundResult.position} on page ${currentPage}!`);
        
        // Click on the target URL using the actual URL from search results
        const clicked = await page.evaluate((targetUrl) => {
          // Try multiple selectors to find the link
          const selectors = [
            `a[href="${targetUrl}"]`,
            `a[href*="${targetUrl.replace('https://', '').replace('http://', '')}"]`,
            `a[href*="inspectormobil.id"]`
          ];
          
          for (const selector of selectors) {
            const link = document.querySelector(selector);
            if (link) {
              console.log(`🎯 About to click link: ${link.href}`);
              link.click();
              return true;
            }
          }
          
          // Fallback: find by position
          const resultElements = document.querySelectorAll('.g');
          for (let i = 0; i < resultElements.length; i++) {
            const link = resultElements[i].querySelector('a[href]');
            if (link && link.href === targetUrl) {
              console.log(`🎯 About to click link by position: ${link.href}`);
              link.click();
              return true;
            }
          }
          
          console.log(`❌ Could not find link for URL: ${targetUrl}`);
          return false;
        }, foundResult.url);
        
        console.log(`🎯 Click result: ${clicked}`);
        
        if (clicked) {
          console.log(`🎯 Clicking on target URL from ${engineName} search results...`);
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
          await page.waitForTimeout(3000 + Math.random() * 2000);
          
          // Simulate human-like interactions on the target page
          await this.simulateHumanInteractions(page);
          
          // Capture H1 heading from the target URL
          let pageH1 = 'No H1 found';
          let pageTitle = 'No title found';
          try {
            pageTitle = await page.title();
            const h1Element = await page.$('h1');
            if (h1Element) {
              pageH1 = await page.evaluate(el => el.textContent.trim(), h1Element);
            }
          } catch (error) {
            console.log(`⚠️ Could not extract H1: ${error.message}`);
          }
          
          console.log(`✅ Successfully clicked target URL: ${targetUrl}`);
          console.log(`📄 Page Title: ${pageTitle}`);
          console.log(`📋 Main H1 Heading: "${pageH1}"`);
          console.log(`🎯 PROOF: Bot successfully clicked from ${engineName} search results on page ${currentPage}!`);
          
          return { 
            success: true, 
            clicked: true, 
            engine: engineName,
            position: foundResult.position,
            pageNumber: currentPage,
            pageTitle: pageTitle,
            h1Heading: pageH1
          };
        } else {
          console.log(`❌ Failed to click target URL, continuing to next page...`);
        }
      }
      
      // Check if we've reached the maximum page limit
      if (currentPage >= maxPages) {
        console.log(`❌ Reached maximum page limit (${maxPages}), target URL not found`);
        return { success: false, clicked: false, error: `Target URL not found in first ${maxPages} pages` };
      }
      
      // If not found on current page, scroll to next page
      console.log(`🔍 Target URL not found on page ${currentPage}, trying next page...`);
      
      // Try to find "Next" button and click it
      const nextPageClicked = await page.evaluate(() => {
        const nextButton = document.querySelector('a[aria-label="Next"]') || 
                          document.querySelector('a[id="pnnext"]') ||
                          document.querySelector('a[aria-label="Next page"]') ||
                          document.querySelector('table[role="presentation"] a[href*="start="]');
        
        if (nextButton) {
          nextButton.click();
          return true;
        }
        return false;
      });
      
      if (nextPageClicked) {
        console.log(`📄 Scrolling to page ${currentPage + 1}...`);
        await page.waitForTimeout(3000 + Math.random() * 2000);
        
        // Extract new search results from next page
        const newResults = await this.extractSearchResults(page, { name: engineName });
        console.log(`🔍 Found ${newResults.length} results on page ${currentPage + 1}`);
        
        // Recursively search on next page
        return await this.clickTargetUrl(page, newResults, targetUrl, keyword, engineName, currentPage + 1, maxPages);
      } else {
        console.log(`❌ No more pages available, target URL not found`);
        return { success: false, clicked: false, error: 'Target URL not found in search results' };
      }
      
    } catch (error) {
      console.error('Error clicking target URL:', error);
      return { success: false, error: error.message };
    }
  }

  // Search and click target URL using multiple engines
  async searchAndClick(keyword, targetUrl) {
    try {
      console.log(`🔍 Starting search for "${keyword}" with multiple engines`);
      
      // Try multiple search engines
      const result = await this.searchWithMultipleEngines(keyword, targetUrl);
      
      if (result.success && result.clicked) {
        console.log(`✅ Successfully found and clicked target URL for "${keyword}" on ${result.engine}`);
        return { success: true, clicked: true, proxy: result.proxy, engine: result.engine };
      } else if (result.success && !result.clicked) {
        console.log(`❌ Target URL not found in search results for "${keyword}" on ${result.engine}`);
        return { success: true, clicked: false, proxy: result.proxy, engine: result.engine };
      } else {
        console.log(`❌ All search engines failed for "${keyword}"`);
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      console.error(`❌ Error in search and click "${keyword}":`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Legacy Google search method (keeping for fallback)
  async searchGoogleLegacy(keyword, targetUrl) {
    let browser;
    let page;
    
    try {
      // Get fresh proxy
      const proxy = this.proxyManager.getNextProxy();
      console.log(`🎯 Search & Click "${keyword}" with proxy: ${proxy.username}@${proxy.host}:${proxy.port}`);
      
      // Create browser with proxy
      browser = await this.createBrowser(proxy);
      page = await browser.newPage();
      
      // Add enhanced stealth mode to avoid detection
      await this.addEnhancedStealthMode(page);
      
      // Set proxy authentication
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
      
      // Set user agent
      await page.setUserAgent(this.getRandomUserAgent());
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to Google with human-like behavior
      await page.goto('https://www.google.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit to simulate human behavior
      await page.waitForTimeout(Math.random() * 3000 + 2000); // 2-5 seconds
      
      console.log(`📄 Current page URL: ${page.url()}`);
      console.log(`📄 Page title: ${await page.title()}`);
      
      // Accept cookies if present
      try {
        await page.click('button[id="L2AGLb"]', { timeout: 3000 });
        console.log(`✅ Accepted cookies`);
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(`ℹ️ No cookie button found, continuing...`);
      }
      
      // Wait for search input to be available with multiple selectors
      let searchInput = null;
      const selectors = [
        'input[name="q"]',
        'input[aria-label="Search"]',
        'input[type="search"]',
        'textarea[name="q"]',
        'input[placeholder*="Search"]',
        'input[title="Search"]'
      ];
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          searchInput = selector;
          console.log(`✅ Found search input field with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!searchInput) {
        console.log(`❌ No search input found. Available elements:`);
        const inputs = await page.$$eval('input, textarea', elements => elements.map(el => ({
          tag: el.tagName,
          name: el.name,
          id: el.id,
          type: el.type,
          placeholder: el.placeholder,
          ariaLabel: el.getAttribute('aria-label'),
          className: el.className
        })));
        console.log(inputs);
        throw new Error('Search input field not found with any selector');
      }
      
      // Search for keyword with human-like behavior
      await page.type(searchInput, keyword, { delay: 150 }); // Type slowly
      await page.waitForTimeout(2000); // Wait before pressing Enter
      
      // Simulate mouse movement
      await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100);
      await page.waitForTimeout(500);
      
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if we got redirected to Google's "sorry" page
      const currentUrl = page.url();
      if (currentUrl.includes('/sorry/')) {
        console.log(`⚠️ Google showed "sorry" page. Current URL: ${currentUrl}`);
        console.log(`🔍 Trying alternative search approach...`);
        
        // Try going back to Google homepage and search again with more delay
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(5000); // Wait longer
        
        // Try to find search input again
        let retrySearchInput = null;
        const retrySelectors = [
          'input[name="q"]',
          'input[aria-label="Search"]',
          'input[type="search"]',
          'textarea[name="q"]',
          'input[placeholder*="Search"]',
          'input[title="Search"]'
        ];
        
        for (const selector of retrySelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            retrySearchInput = selector;
            console.log(`✅ Found retry search input with selector: ${selector}`);
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (retrySearchInput) {
          await page.type(retrySearchInput, keyword, { delay: 200 });
          await page.waitForTimeout(3000);
          
          // Simulate mouse movement
          await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100);
          await page.waitForTimeout(1000);
          
          await page.keyboard.press('Enter');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
          
          // Check again if we got the sorry page
          const retryUrl = page.url();
          if (retryUrl.includes('/sorry/')) {
            throw new Error(`Google blocked the search after retry. URL: ${retryUrl}`);
          }
        } else {
          throw new Error('Could not find search input for retry');
        }
      }
      
      // Wait for search results
      // Wait for search results with multiple selectors
      let resultsSelector = null;
      const resultSelectors = ['#search', '#center_col', '.main', '#main', '[role="main"]'];
      
      for (const selector of resultSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          resultsSelector = selector;
          console.log(`✅ Found search results with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Results selector ${selector} not found, trying next...`);
        }
      }
      
      if (!resultsSelector) {
        console.log(`❌ No search results found. Current URL: ${page.url()}`);
        throw new Error('Search results container not found');
      }
      
      // Crawl through all pages to find target URL
      const result = await this.crawlAllPages(page, keyword, targetUrl);
      
      if (result.found) {
        console.log(`✅ Successfully found and clicked target URL for "${keyword}" on page ${result.pageNumber}`);
        return { success: true, clicked: true, proxy: proxy.username, pageNumber: result.pageNumber };
      } else {
        console.log(`❌ Target URL not found in any search results for "${keyword}"`);
        return { success: true, clicked: false, proxy: proxy.username, pagesSearched: result.pagesSearched };
      }
      
    } catch (error) {
      console.error(`❌ Error in search and click "${keyword}":`, error.message);
      return { success: false, error: error.message };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Crawl through all pages of search results
  async crawlAllPages(page, keyword, targetUrl, maxPages = 10) {
    let currentPage = 1;
    let pagesSearched = 0;
    
    while (currentPage <= maxPages) {
      console.log(`🔍 Searching page ${currentPage} for "${keyword}"`);
      
      try {
        // Wait for search results to load
        // Wait for search results with multiple selectors
      let resultsSelector = null;
      const resultSelectors = ['#search', '#center_col', '.main', '#main', '[role="main"]'];
      
      for (const selector of resultSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          resultsSelector = selector;
          console.log(`✅ Found search results with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`ℹ️ Results selector ${selector} not found, trying next...`);
        }
      }
      
      if (!resultsSelector) {
        console.log(`❌ No search results found. Current URL: ${page.url()}`);
        throw new Error('Search results container not found');
      }
        
        // Extract results from current page
        const results = await this.extractSearchResults(page, resultsSelector);
        
        // Check if target URL is in current page results
        const targetFound = this.findTargetInResults(results, targetUrl);
        
        if (targetFound) {
          // Click the target URL
          const clicked = await this.clickTargetUrl(page, results, targetUrl, 'search', 'Google', currentPage, 5);
          
          if (clicked) {
            return { found: true, pageNumber: currentPage, pagesSearched: pagesSearched + 1 };
          }
        }
        
        pagesSearched++;
        
        // Try to go to next page
        const nextPageResult = await this.goToNextPage(page, currentPage);
        
        if (!nextPageResult) {
          console.log(`📄 Reached last page (${currentPage}) for "${keyword}"`);
          break;
        }
        
        currentPage++;
        
        // Wait between pages to avoid detection
        await page.waitForTimeout(Math.random() * 2000 + 1000); // 1-3 seconds
        
      } catch (error) {
        console.error(`❌ Error crawling page ${currentPage}:`, error.message);
        break;
      }
    }
    
    return { found: false, pagesSearched, lastPage: currentPage };
  }

  // Go to next page of search results
  async goToNextPage(page, currentPage) {
    try {
      // Look for "Next" button
      const nextButton = await page.$('a#pnnext, a[aria-label="Next page"], a[aria-label="Next"]');
      
      if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        return true;
      }
      
      // Alternative: Try to click page number
      const nextPageNumber = currentPage + 1;
      const pageLink = await page.$(`a[aria-label="Page ${nextPageNumber}"]`);
      
      if (pageLink) {
        await pageLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error going to next page:', error.message);
      return false;
    }
  }

  // Get proxy stats
  getProxyStats() {
    return this.proxyManager.getStats();
  }

  // Reset proxy usage
  resetProxies() {
    this.proxyManager.resetUsedProxies();
  }
}

module.exports = SearchEngine;
