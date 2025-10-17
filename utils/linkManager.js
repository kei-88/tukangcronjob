const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');
const { checkNawalaStatus } = require('./nawalaChecker');

const DATA_FILE = path.join(__dirname, '..', 'data', 'links.json');

/**
 * Load links from JSON file
 * @returns {Promise<Array>} Array of links
 */
async function loadLinks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.links || [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Save links to JSON file
 * @param {Array} linksArray - Array of links to save
 * @returns {Promise<void>}
 */
async function saveLinks(linksArray) {
  try {
    const data = { links: linksArray };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to save links: ${error.message}`);
  }
}

/**
 * Generate a unique short code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} Unique short code
 */
function generateShortCode(length = 6) {
  return nanoid(length);
}

/**
 * Find link by short code
 * @param {string} shortCode - The short code to search for
 * @returns {Promise<Object|null>} Link object or null if not found
 */
async function findLinkByShortCode(shortCode) {
  const links = await loadLinks();
  return links.find(link => link.shortCode === shortCode && link.isActive) || null;
}

/**
 * Find link by ID
 * @param {string} id - The link ID to search for
 * @returns {Promise<Object|null>} Link object or null if not found
 */
async function findLinkById(id) {
  const links = await loadLinks();
  return links.find(link => link.id === id) || null;
}

/**
 * Create a new short link
 * @param {string} destinationUrl - The destination URL
 * @returns {Promise<Object>} Created link object
 */
async function createLink(destinationUrl) {
  // Validate URL
  try {
    new URL(destinationUrl);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  const links = await loadLinks();
  
  // Generate unique short code
  let shortCode;
  let attempts = 0;
  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts > 10) {
      throw new Error('Failed to generate unique short code');
    }
  } while (links.some(link => link.shortCode === shortCode));

  // Check Nawala status
  const nawalaResult = await checkNawalaStatus(destinationUrl);
  
  const newLink = {
    id: nanoid(),
    shortCode,
    destinationUrl,
    isNawalaBlocked: nawalaResult.blocked,
    blockCategory: nawalaResult.blocked ? nawalaResult.category : null,
    checkStatus: nawalaResult.blocked ? 'blocked' : 'safe',
    lastCheckedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    clickCount: 0,
    isActive: true
  };

  links.push(newLink);
  await saveLinks(links);
  
  return newLink;
}

/**
 * Update a link
 * @param {string} id - Link ID to update
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object|null>} Updated link or null if not found
 */
async function updateLink(id, updates) {
  const links = await loadLinks();
  const linkIndex = links.findIndex(link => link.id === id);
  
  if (linkIndex === -1) {
    return null;
  }

  // If destination URL is being updated, recheck Nawala status
  if (updates.destinationUrl) {
    try {
      new URL(updates.destinationUrl);
    } catch (error) {
      throw new Error('Invalid URL format');
    }
    
    const nawalaResult = await checkNawalaStatus(updates.destinationUrl);
    updates.isNawalaBlocked = nawalaResult.blocked;
    updates.blockCategory = nawalaResult.blocked ? nawalaResult.category : null;
    updates.checkStatus = nawalaResult.blocked ? 'blocked' : 'safe';
    updates.lastCheckedAt = new Date().toISOString();
  }

  // Apply updates
  links[linkIndex] = { ...links[linkIndex], ...updates };
  await saveLinks(links);
  
  return links[linkIndex];
}

/**
 * Delete a link (soft delete by setting isActive to false)
 * @param {string} id - Link ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteLink(id) {
  const links = await loadLinks();
  const linkIndex = links.findIndex(link => link.id === id);
  
  if (linkIndex === -1) {
    return false;
  }

  links[linkIndex].isActive = false;
  await saveLinks(links);
  
  return true;
}

/**
 * Increment click count for a link
 * @param {string} shortCode - Short code of the link
 * @returns {Promise<Object|null>} Updated link or null if not found
 */
async function incrementClickCount(shortCode) {
  const links = await loadLinks();
  const linkIndex = links.findIndex(link => link.shortCode === shortCode && link.isActive);
  
  if (linkIndex === -1) {
    return null;
  }

  links[linkIndex].clickCount++;
  await saveLinks(links);
  
  return links[linkIndex];
}

/**
 * Get all active links
 * @returns {Promise<Array>} Array of active links
 */
async function getAllActiveLinks() {
  const links = await loadLinks();
  return links.filter(link => link.isActive);
}

/**
 * Get links by status
 * @param {string} status - Status to filter by ('safe', 'blocked', 'all')
 * @returns {Promise<Array>} Array of filtered links
 */
async function getLinksByStatus(status) {
  const links = await loadLinks();
  const activeLinks = links.filter(link => link.isActive);
  
  if (status === 'all') {
    return activeLinks;
  }
  
  return activeLinks.filter(link => link.checkStatus === status);
}

/**
 * Recheck Nawala status for a specific link
 * @param {string} id - Link ID to recheck
 * @returns {Promise<Object|null>} Updated link or null if not found
 */
async function recheckLink(id) {
  const link = await findLinkById(id);
  if (!link) {
    return null;
  }

  const nawalaResult = await checkNawalaStatus(link.destinationUrl);
  
  return await updateLink(id, {
    isNawalaBlocked: nawalaResult.blocked,
    blockCategory: nawalaResult.blocked ? nawalaResult.category : null,
    checkStatus: nawalaResult.blocked ? 'blocked' : 'safe',
    lastCheckedAt: new Date().toISOString()
  });
}

/**
 * Recheck all links
 * @returns {Promise<Array>} Array of updated links
 */
async function recheckAllLinks() {
  const links = await loadLinks();
  const activeLinks = links.filter(link => link.isActive);
  const updatedLinks = [];

  for (const link of activeLinks) {
    try {
      const updatedLink = await recheckLink(link.id);
      if (updatedLink) {
        updatedLinks.push(updatedLink);
      }
    } catch (error) {
      console.error(`Failed to recheck link ${link.id}:`, error.message);
    }
  }

  return updatedLinks;
}

module.exports = {
  loadLinks,
  saveLinks,
  generateShortCode,
  findLinkByShortCode,
  findLinkById,
  createLink,
  updateLink,
  deleteLink,
  incrementClickCount,
  getAllActiveLinks,
  getLinksByStatus,
  recheckLink,
  recheckAllLinks
};
