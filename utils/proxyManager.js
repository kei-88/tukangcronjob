const fs = require('fs');
const path = require('path');

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.usedProxies = new Set();
    this.currentIndex = 0;
    this.loadProxies();
  }

  // Load proxies from Webshare file
  loadProxies() {
    try {
      const proxyFile = path.join(__dirname, '../Webshare residential proxies (1).txt');
      const data = fs.readFileSync(proxyFile, 'utf8');
      
      this.proxies = data.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [host, port, username, password] = line.split(':');
          return {
            host,
            port: parseInt(port),
            username,
            password,
            full: line
          };
        });

      console.log(`✅ Loaded ${this.proxies.length} Webshare residential proxies`);
    } catch (error) {
      console.error('❌ Error loading proxies:', error.message);
      this.proxies = [];
    }
  }

  // Get next unused proxy
  getNextProxy() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available');
    }

    // Find unused proxy
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      if (!this.usedProxies.has(proxy.full)) {
        this.usedProxies.add(proxy.full);
        return proxy;
      }
      attempts++;
    }

    // If all proxies used, reset and start over
    this.usedProxies.clear();
    const proxy = this.proxies[0];
    this.usedProxies.add(proxy.full);
    return proxy;
  }

  // Get proxy URL for Puppeteer
  getProxyUrl(proxy) {
    return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
  }

  // Get proxy stats
  getStats() {
    return {
      total: this.proxies.length,
      used: this.usedProxies.size,
      available: this.proxies.length - this.usedProxies.size,
      usagePercent: Math.round((this.usedProxies.size / this.proxies.length) * 100)
    };
  }

  // Reset used proxies (for daily reset)
  resetUsedProxies() {
    this.usedProxies.clear();
    console.log('🔄 Reset used proxies - all proxies available again');
  }

  // Get random proxy (alternative method)
  getRandomProxy() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available');
    }

    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomIndex];
  }
}

module.exports = ProxyManager;
