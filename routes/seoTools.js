const express = require('express');
const router = express.Router();
const SEOTrafficGenerator = require('../utils/seoTrafficGenerator');

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// In-memory storage for SEO campaigns
let seoCampaigns = [];
let seoStats = {
  totalCampaigns: 0,
  totalClicks: 0,
  totalSearches: 0,
  startTime: new Date()
};

// GET /seo-tools - SEO Tools Dashboard
router.get('/seo-tools', requireAuth, (req, res) => {
  const successRate = seoStats.totalSearches > 0 
    ? Math.round((seoStats.totalClicks / seoStats.totalSearches) * 100) 
    : 0;
    
  res.render('seo-tools/dashboard', {
    user: req.session.user,
    campaigns: seoCampaigns,
    stats: {
      ...seoStats,
      successRate
    },
    error: null,
    success: null
  });
});

// POST /seo-tools/analyze - Analyze landing page
router.post('/seo-tools/analyze', requireAuth, async (req, res) => {
  try {
    const { targetUrl } = req.body;
    
    if (!targetUrl) {
      return res.json({
        success: false,
        error: 'Target URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const seoGenerator = new SEOTrafficGenerator();
    const analysis = await seoGenerator.analyzeLandingPage(targetUrl);
    
    if (!analysis.success) {
      return res.json({
        success: false,
        error: analysis.error
      });
    }

    res.json({
      success: true,
      analysis: {
        totalKeywords: analysis.keywords.length,
        keywords: analysis.keywords.slice(0, 20), // Show first 20 keywords
        urlKeywords: analysis.urlKeywords,
        htmlKeywords: analysis.htmlKeywords.slice(0, 10),
        relatedKeywords: analysis.relatedKeywords.slice(0, 10)
      }
    });
    
  } catch (error) {
    console.error('Error analyzing landing page:', error);
    res.json({
      success: false,
      error: 'Failed to analyze landing page'
    });
  }
});

// POST /seo-tools/generate - Generate traffic with manual keywords
router.post('/seo-tools/generate', requireAuth, async (req, res) => {
  try {
  const { 
    targetUrl, 
    keywords = [],
    maxSearches = 100, 
    delayBetweenSearches = 2000,
    campaignName = 'Untitled Campaign',
    clicksPerKeyword = 1
  } = req.body;
    
    if (!targetUrl) {
      return res.json({
        success: false,
        error: 'Target URL is required'
      });
    }

    if (!keywords || keywords.length === 0) {
      return res.json({
        success: false,
        error: 'At least one keyword is required'
      });
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Create new campaign
    const campaignId = Date.now().toString();
    const campaign = {
      id: campaignId,
      name: campaignName,
      targetUrl,
      keywords: keywords,
      status: 'running',
      startTime: new Date(),
     options: {
       maxSearches: parseInt(maxSearches),
       delayBetweenSearches: parseInt(delayBetweenSearches),
       clicksPerKeyword: parseInt(clicksPerKeyword)
     },
      stats: {
        totalSearches: 0,
        successfulClicks: 0,
        failedSearches: 0
      }
    };

    seoCampaigns.push(campaign);
    seoStats.totalCampaigns++;

    // Start traffic generation in background
    generateTrafficAsync(campaignId);

    res.json({
      success: true,
      campaign: {
        id: campaignId,
        name: campaignName,
        targetUrl,
        keywords: keywords,
        status: 'running'
      },
      message: 'Traffic generation started'
    });
    
  } catch (error) {
    console.error('Error starting traffic generation:', error);
    res.json({
      success: false,
      error: 'Failed to start traffic generation'
    });
  }
});

// GET /seo-tools/campaign/:id - Get campaign details
router.get('/seo-tools/campaign/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const campaign = seoCampaigns.find(c => c.id === id);
    
    if (!campaign) {
      return res.json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      campaign
    });
    
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.json({
      success: false,
      error: 'Failed to get campaign details'
    });
  }
});

// POST /seo-tools/stop/:id - Stop campaign
router.post('/seo-tools/stop/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const campaign = seoCampaigns.find(c => c.id === id);
    
    if (!campaign) {
      return res.json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    campaign.status = 'stopped';
    campaign.endTime = new Date();
    
    res.json({
      success: true,
      message: 'Campaign stopped successfully'
    });
    
  } catch (error) {
    console.error('Error stopping campaign:', error);
    res.json({
      success: false,
      error: 'Failed to stop campaign'
    });
  }
});

// DELETE /seo-tools/delete/:id - Delete campaign
router.delete('/seo-tools/delete/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const index = seoCampaigns.findIndex(c => c.id === id);
    
    if (index === -1) {
      return res.json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    seoCampaigns.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.json({
      success: false,
      error: 'Failed to delete campaign'
    });
  }
});

// GET /seo-tools/stats - Get overall stats
router.get('/seo-tools/stats', requireAuth, (req, res) => {
  try {
    const activeCampaigns = seoCampaigns.filter(c => c.status === 'running').length;
    const completedCampaigns = seoCampaigns.filter(c => c.status === 'completed').length;
    const stoppedCampaigns = seoCampaigns.filter(c => c.status === 'stopped').length;
    
    const totalClicks = seoCampaigns.reduce((sum, c) => sum + c.stats.successfulClicks, 0);
    const totalSearches = seoCampaigns.reduce((sum, c) => sum + c.stats.totalSearches, 0);
    const successRate = totalSearches > 0 ? Math.round((totalClicks / totalSearches) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        ...seoStats,
        activeCampaigns,
        completedCampaigns,
        stoppedCampaigns,
        totalClicks,
        totalSearches,
        successRate
      }
    });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    res.json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

// Background function to generate traffic with manual keywords
async function generateTrafficAsync(campaignId) {
  try {
    const campaign = seoCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    console.log(`🚀 Starting traffic generation for campaign: ${campaign.name}`);
    console.log(`🎯 Target URL: ${campaign.targetUrl}`);
    console.log(`🔍 Keywords: ${campaign.keywords.join(', ')}`);
    
    const seoGenerator = new SEOTrafficGenerator();
    
    // Generate traffic for each manual keyword
    let totalSearches = 0;
    let totalClicks = 0;
    let totalFailed = 0;
    
    for (const keyword of campaign.keywords) {
      if (campaign.status === 'stopped') {
        console.log(`⏹️ Campaign stopped, exiting keyword processing`);
        break;
      }
      
      console.log(`🔍 Processing keyword: "${keyword}"`);
      
      const result = await seoGenerator.generateTrafficForKeyword(keyword, campaign.targetUrl, campaign.options.clicksPerKeyword);
      
      totalSearches += result.totalSearches || 1;
      totalClicks += result.totalClicks || 0;
      totalFailed += result.totalFailed || 0;
      
      if (result.success && result.clicked) {
        console.log(`✅ SUCCESS: Generated ${result.totalClicks} clicks for "${keyword}"`);
      } else {
        console.log(`❌ FAILED: "${keyword}" - ${result.error || 'Unknown error'}`);
      }
      
      // Update campaign stats in real-time
      campaign.stats = {
        totalSearches,
        successfulClicks: totalClicks,
        failedSearches: totalFailed
      };
      
      // Add delay between keywords
      if (campaign.keywords.indexOf(keyword) < campaign.keywords.length - 1) {
        const delay = campaign.options.delayBetweenSearches + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Final campaign stats
    campaign.stats = {
      totalSearches,
      successfulClicks: totalClicks,
      failedSearches: totalFailed
    };
    
    campaign.status = 'completed';
    campaign.endTime = new Date();
    
    // Update global stats
    seoStats.totalClicks += totalClicks;
    seoStats.totalSearches += totalSearches;
    
    console.log(`✅ Campaign completed: ${campaign.name}`);
    console.log(`📊 Final Stats: ${totalClicks} clicks from ${totalSearches} searches`);
    
  } catch (error) {
    console.error(`❌ Error in campaign ${campaignId}:`, error);
    
    const campaign = seoCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = 'error';
      campaign.error = error.message;
      campaign.endTime = new Date();
    }
  }
}

module.exports = router;
