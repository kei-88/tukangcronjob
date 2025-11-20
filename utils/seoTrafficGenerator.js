const fetch = require('node-fetch');
const KeywordEngine = require('./keywordEngine');
const SearchEngine = require('./searchEngine');

class SEOTrafficGenerator {
  constructor() {
    this.keywordEngine = new KeywordEngine();
    this.searchEngine = new SearchEngine();
    this.stats = {
      totalSearches: 0,
      successfulClicks: 0,
      failedSearches: 0,
      startTime: new Date(),
      keywords: [],
      results: []
    };
  }

  // Analyze landing page and generate keywords
  async analyzeLandingPage(url) {
    try {
      console.log(`📄 Analyzing landing page: ${url}`);
      
      // Fetch page content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract keywords from HTML
      const keywords = this.keywordEngine.extractKeywordsFromHtml(html);
      
      // Extract keywords from URL
      const urlKeywords = this.keywordEngine.extractKeywordsFromUrl(url);
      
      // Generate related keywords
      const relatedKeywords = this.keywordEngine.generateRelatedKeywords([
        ...keywords.slice(0, 10),
        ...urlKeywords
      ]);
      
      // Combine all keywords
      const allKeywords = [...new Set([...keywords, ...urlKeywords, ...relatedKeywords])];
      
      console.log(`✅ Found ${allKeywords.length} keywords for landing page`);
      
      return {
        success: true,
        keywords: allKeywords,
        urlKeywords,
        htmlKeywords: keywords,
        relatedKeywords
      };
      
    } catch (error) {
      console.error('❌ Error analyzing landing page:', error.message);
      return {
        success: false,
        error: error.message,
        keywords: []
      };
    }
  }

  // Generate traffic for a single keyword with multiple clicks
  async generateTrafficForKeyword(keyword, targetUrl, clicksPerKeyword = 1) {
    try {
      let totalClicks = 0;
      let totalSearches = 0;
      let totalFailed = 0;
      
      console.log(`🔄 Generating ${clicksPerKeyword} clicks for keyword: "${keyword}"`);
      
      for (let i = 1; i <= clicksPerKeyword; i++) {
        try {
          this.stats.totalSearches++;
          totalSearches++;
          
          console.log(`🎯 Click ${i}/${clicksPerKeyword} for "${keyword}"`);
          
          const result = await this.searchEngine.searchAndClick(keyword, targetUrl);
          
          if (result.success && result.clicked) {
            this.stats.successfulClicks++;
            totalClicks++;
            console.log(`✅ SUCCESS: Generated click ${i}/${clicksPerKeyword} for "${keyword}"`);
          } else if (result.success && !result.clicked) {
            console.log(`⚠️  WARNING: Click ${i}/${clicksPerKeyword} - "${keyword}" found but target not in results`);
          } else {
            this.stats.failedSearches++;
            totalFailed++;
            console.log(`❌ FAILED: Click ${i}/${clicksPerKeyword} - Search failed for "${keyword}"`);
          }
          
          // Add delay between clicks to avoid detection
          if (i < clicksPerKeyword) {
            const delay = Math.random() * 5000 + 3000; // 3-8 seconds between clicks
            console.log(`⏰ Waiting ${Math.round(delay/1000)}s before next click...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          console.error(`❌ Error in click ${i}/${clicksPerKeyword} for "${keyword}":`, error.message);
          totalFailed++;
          this.stats.failedSearches++;
        }
      }
      
      console.log(`📊 Keyword "${keyword}" completed: ${totalClicks} clicks from ${totalSearches} attempts`);
      
      // Store result
      const finalResult = {
        success: totalClicks > 0,
        clicked: totalClicks > 0,
        totalClicks: totalClicks,
        totalSearches: totalSearches,
        totalFailed: totalFailed
      };
      
      this.stats.results.push({
        keyword,
        timestamp: new Date(),
        success: finalResult.success,
        clicked: finalResult.clicked,
        clicks: totalClicks,
        searches: totalSearches,
        failed: totalFailed
      });
      
      return finalResult;
      
    } catch (error) {
      console.error(`❌ Error generating traffic for "${keyword}":`, error.message);
      this.stats.failedSearches++;
      
      this.stats.results.push({
        keyword,
        timestamp: new Date(),
        success: false,
        clicked: false,
        error: error.message
      });
      
      return { success: false, error: error.message };
    }
  }

  // Generate traffic for multiple keywords
  async generateTraffic(keywords, targetUrl, options = {}) {
    const {
      maxSearches = 1000,
      delayBetweenSearches = 1000,
      concurrentSearches = 1
    } = options;
    
    console.log(`🚀 Starting traffic generation for ${keywords.length} keywords`);
    console.log(`🎯 Target URL: ${targetUrl}`);
    console.log(`📊 Max searches: ${maxSearches}`);
    console.log(`⏱️  Delay between searches: ${delayBetweenSearches}ms`);
    
    const startTime = Date.now();
    let processedCount = 0;
    
    for (let i = 0; i < Math.min(keywords.length, maxSearches); i++) {
      const keyword = keywords[i];
      
      try {
        // Generate traffic for this keyword
        await this.generateTrafficForKeyword(keyword, targetUrl);
        processedCount++;
        
        // Add delay between searches
        if (i < keywords.length - 1) {
          const randomDelay = delayBetweenSearches + Math.random() * 1000;
          await this.sleep(randomDelay);
        }
        
        // Log progress every 10 searches
        if (processedCount % 10 === 0) {
          this.logProgress();
        }
        
      } catch (error) {
        console.error(`❌ Error processing keyword "${keyword}":`, error.message);
        continue;
      }
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n🎉 Traffic generation completed!`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Total searches: ${this.stats.totalSearches}`);
    console.log(`✅ Successful clicks: ${this.stats.successfulClicks}`);
    console.log(`❌ Failed searches: ${this.stats.failedSearches}`);
    console.log(`📈 Success rate: ${this.getSuccessRate()}%`);
    
    return this.getStats();
  }

  // Generate traffic from landing page URL
  async generateTrafficFromUrl(targetUrl, options = {}) {
    console.log(`🎯 Starting traffic generation for URL: ${targetUrl}`);
    
    // Analyze landing page
    const analysis = await this.analyzeLandingPage(targetUrl);
    
    if (!analysis.success) {
      console.error('❌ Failed to analyze landing page:', analysis.error);
      return { success: false, error: analysis.error };
    }
    
    console.log(`📋 Generated ${analysis.keywords.length} keywords from landing page`);
    
    // Generate traffic
    const results = await this.generateTraffic(analysis.keywords, targetUrl, options);
    
    return {
      success: true,
      analysis,
      results
    };
  }

  // Log current progress
  logProgress() {
    const successRate = this.getSuccessRate();
    const proxyStats = this.searchEngine.getProxyStats();
    
    console.log(`\n📊 Progress Update:`);
    console.log(`   Searches: ${this.stats.totalSearches}`);
    console.log(`   Clicks: ${this.stats.successfulClicks}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Proxies Used: ${proxyStats.used}/${proxyStats.total} (${proxyStats.usagePercent}%)`);
  }

  // Get success rate percentage
  getSuccessRate() {
    if (this.stats.totalSearches === 0) return 0;
    return Math.round((this.stats.successfulClicks / this.stats.totalSearches) * 100);
  }

  // Get current stats
  getStats() {
    const proxyStats = this.searchEngine.getProxyStats();
    const runtime = Date.now() - this.stats.startTime.getTime();
    
    return {
      ...this.stats,
      successRate: this.getSuccessRate(),
      runtime: Math.round(runtime / 1000),
      proxyStats,
      avgClicksPerHour: this.getAvgClicksPerHour()
    };
  }

  // Get average clicks per hour
  getAvgClicksPerHour() {
    const runtime = Date.now() - this.stats.startTime.getTime();
    const hours = runtime / (1000 * 60 * 60);
    
    if (hours === 0) return 0;
    return Math.round(this.stats.successfulClicks / hours);
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset stats
  resetStats() {
    this.stats = {
      totalSearches: 0,
      successfulClicks: 0,
      failedSearches: 0,
      startTime: new Date(),
      keywords: [],
      results: []
    };
  }

  // Get recent results
  getRecentResults(limit = 50) {
    return this.stats.results.slice(-limit);
  }

  // Get keyword performance
  getKeywordPerformance() {
    const keywordStats = {};
    
    this.stats.results.forEach(result => {
      if (!keywordStats[result.keyword]) {
        keywordStats[result.keyword] = {
          keyword: result.keyword,
          searches: 0,
          clicks: 0,
          successRate: 0
        };
      }
      
      keywordStats[result.keyword].searches++;
      if (result.clicked) {
        keywordStats[result.keyword].clicks++;
      }
    });
    
    // Calculate success rates
    Object.values(keywordStats).forEach(stat => {
      stat.successRate = Math.round((stat.clicks / stat.searches) * 100);
    });
    
    return Object.values(keywordStats).sort((a, b) => b.clicks - a.clicks);
  }
}

module.exports = SEOTrafficGenerator;
