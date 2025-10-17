const express = require('express');
const router = express.Router();
const linkManager = require('../utils/linkManager');

// Middleware to require authentication (reuse from app.js)
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// GET /shortener - Show create link form
router.get('/shortener', requireAuth, (req, res) => {
  res.render('shortener/create', { 
    user: req.session.user,
    error: null,
    success: null,
    shortLink: null
  });
});

// POST /shortener/create - Create new short link
router.post('/shortener/create', requireAuth, async (req, res) => {
  try {
    const { destinationUrl } = req.body;
    
    if (!destinationUrl) {
      return res.render('shortener/create', {
        user: req.session.user,
        error: 'URL is required',
        success: null,
        shortLink: null
      });
    }

    // Validate URL format
    try {
      new URL(destinationUrl);
    } catch (error) {
      return res.render('shortener/create', {
        user: req.session.user,
        error: 'Invalid URL format',
        success: null,
        shortLink: null
      });
    }

    const newLink = await linkManager.createLink(destinationUrl);
    const shortLink = `${req.protocol}://${req.get('host')}/s/${newLink.shortCode}`;
    
    res.render('shortener/create', {
      user: req.session.user,
      error: null,
      success: 'Short link created successfully!',
      shortLink: shortLink,
      linkData: newLink
    });
    
  } catch (error) {
    console.error('Error creating short link:', error);
    res.render('shortener/create', {
      user: req.session.user,
      error: error.message || 'Failed to create short link',
      success: null,
      shortLink: null
    });
  }
});

// GET /s/:shortCode - Redirect to destination URL
router.get('/s/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await linkManager.findLinkByShortCode(shortCode);
    
    if (!link) {
      return res.status(404).render('shortener/notfound', {
        shortCode: shortCode,
        error: 'Short link not found or inactive'
      });
    }

    // Increment click count
    await linkManager.incrementClickCount(shortCode);
    
    // Redirect to destination
    res.redirect(link.destinationUrl);
    
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).render('shortener/notfound', {
      shortCode: req.params.shortCode,
      error: 'Internal server error'
    });
  }
});

// GET /shortener/admin - Admin dashboard
router.get('/shortener/admin', requireAuth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const links = await linkManager.getLinksByStatus(status);
    
    // Get stats
    const allLinks = await linkManager.getAllActiveLinks();
    const stats = {
      total: allLinks.length,
      safe: allLinks.filter(link => link.checkStatus === 'safe').length,
      blocked: allLinks.filter(link => link.checkStatus === 'blocked').length,
      totalClicks: allLinks.reduce((sum, link) => sum + link.clickCount, 0)
    };
    
    res.render('shortener/admin', {
      user: req.session.user,
      links: links,
      stats: stats,
      currentFilter: status,
      error: null,
      success: null
    });
    
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.render('shortener/admin', {
      user: req.session.user,
      links: [],
      stats: { total: 0, safe: 0, blocked: 0, totalClicks: 0 },
      currentFilter: 'all',
      error: 'Failed to load links',
      success: null
    });
  }
});

// POST /shortener/check/:id - Manually trigger Nawala check
router.post('/shortener/check/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLink = await linkManager.recheckLink(id);
    
    if (!updatedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({
      success: true,
      link: updatedLink,
      message: `Link rechecked. Status: ${updatedLink.checkStatus}`
    });
    
  } catch (error) {
    console.error('Error rechecking link:', error);
    res.status(500).json({ error: 'Failed to recheck link' });
  }
});

// PUT /shortener/update/:id - Update destination URL
router.put('/shortener/update/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationUrl } = req.body;
    
    if (!destinationUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(destinationUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const updatedLink = await linkManager.updateLink(id, { destinationUrl });
    
    if (!updatedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({
      success: true,
      link: updatedLink,
      message: 'Link updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// DELETE /shortener/delete/:id - Delete link
router.delete('/shortener/delete/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await linkManager.deleteLink(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({
      success: true,
      message: 'Link deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// POST /shortener/recheck-all - Recheck all links
router.post('/shortener/recheck-all', requireAuth, async (req, res) => {
  try {
    const updatedLinks = await linkManager.recheckAllLinks();
    
    res.json({
      success: true,
      message: `Rechecked ${updatedLinks.length} links`,
      links: updatedLinks
    });
    
  } catch (error) {
    console.error('Error rechecking all links:', error);
    res.status(500).json({ error: 'Failed to recheck links' });
  }
});

module.exports = router;
