const dns = require('dns').promises;
const { URL } = require('url');

/**
 * Check if a URL is blocked by Nawala DNS
 * @param {string} url - The URL to check
 * @returns {Promise<Object>} - { blocked: boolean, category: string, method: string }
 */
async function checkNawalaStatus(url) {
  try {
    // Validate and parse URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Nawala DNS servers
    const nawalaServers = ['180.131.144.144', '180.131.145.145'];
    
    // Check each Nawala server
    for (const server of nawalaServers) {
      try {
        // Set custom DNS server
        const resolver = new dns.Resolver();
        resolver.setServers([server]);
        
        // Try to resolve the domain
        const addresses = await resolver.resolve4(domain, { timeout: 5000 });
        
        // Check if resolved to known block IPs
        const blockIPs = [
          '127.0.0.1',     // Localhost (common block)
          '0.0.0.0',       // Null route
          '180.131.144.144', // Nawala block IP
          '180.131.145.145'  // Nawala block IP
        ];
        
        const isBlocked = addresses.some(addr => blockIPs.includes(addr));
        
        if (isBlocked) {
          return {
            blocked: true,
            category: 'nawala_blocked',
            method: 'dns_resolution',
            server: server,
            resolvedIPs: addresses
          };
        }
        
        // If we get here, domain resolved normally
        return {
          blocked: false,
          category: 'safe',
          method: 'dns_resolution',
          server: server,
          resolvedIPs: addresses
        };
        
      } catch (error) {
        // If DNS resolution fails, it might be blocked
        if (error.code === 'ENOTFOUND' || error.code === 'ETIMEOUT') {
          return {
            blocked: true,
            category: 'dns_not_found',
            method: 'dns_resolution',
            server: server,
            error: error.message
          };
        }
        
        // Other DNS errors - continue to next server
        console.warn(`Nawala check failed for ${domain} on ${server}:`, error.message);
        continue;
      }
    }
    
    // If all servers failed with non-blocking errors, assume safe
    return {
      blocked: false,
      category: 'safe',
      method: 'dns_resolution',
      server: 'multiple',
      error: 'All servers failed with non-blocking errors'
    };
    
  } catch (error) {
    // URL parsing or other errors
    return {
      blocked: false,
      category: 'error',
      method: 'url_parsing',
      error: error.message
    };
  }
}

/**
 * Check multiple URLs in batch
 * @param {Array<string>} urls - Array of URLs to check
 * @returns {Promise<Array<Object>>} - Array of check results
 */
async function checkMultipleUrls(urls) {
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await checkNawalaStatus(url);
      results.push({
        url,
        ...result,
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        url,
        blocked: false,
        category: 'error',
        method: 'batch_check',
        error: error.message,
        checkedAt: new Date().toISOString()
      });
    }
  }
  
  return results;
}

module.exports = {
  checkNawalaStatus,
  checkMultipleUrls
};
