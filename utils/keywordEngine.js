const cheerio = require('cheerio');
const natural = require('natural');

class KeywordEngine {
  constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
  }

  // Extract keywords from HTML content
  extractKeywordsFromHtml(html) {
    const $ = cheerio.load(html);
    const text = this.extractTextContent($);
    return this.generateKeywords(text);
  }

  // Extract text content from HTML
  extractTextContent($) {
    let text = '';

    // Get title
    const title = $('title').text().trim();
    text += title + ' ';

    // Get meta description
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    text += metaDesc + ' ';

    // Get h1, h2, h3 tags
    $('h1, h2, h3').each((i, el) => {
      text += $(el).text().trim() + ' ';
    });

    // Get paragraph content
    $('p').each((i, el) => {
      text += $(el).text().trim() + ' ';
    });

    // Get alt text from images
    $('img[alt]').each((i, el) => {
      text += $(el).attr('alt') + ' ';
    });

    return text;
  }

  // Generate keywords from text
  generateKeywords(text) {
    // Clean and tokenize text
    const words = this.tokenizeText(text);
    
    // Filter out stop words and short words
    const filteredWords = words.filter(word => 
      word.length > 2 && 
      !this.stopWords.has(word.toLowerCase()) &&
      !/^\d+$/.test(word) // Remove pure numbers
    );

    // Count word frequency
    const wordFreq = {};
    filteredWords.forEach(word => {
      const lowerWord = word.toLowerCase();
      wordFreq[lowerWord] = (wordFreq[lowerWord] || 0) + 1;
    });

    // Sort by frequency
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50) // Top 50 words
      .map(([word]) => word);

    return this.generateSearchQueries(sortedWords);
  }

  // Tokenize text into words
  tokenizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  // Generate search queries from keywords
  generateSearchQueries(keywords) {
    const queries = [];

    // Single keywords
    keywords.slice(0, 20).forEach(keyword => {
      queries.push(keyword);
    });

    // Two-word combinations
    for (let i = 0; i < Math.min(10, keywords.length - 1); i++) {
      for (let j = i + 1; j < Math.min(i + 3, keywords.length); j++) {
        queries.push(`${keywords[i]} ${keywords[j]}`);
      }
    }

    // Three-word combinations (most relevant)
    for (let i = 0; i < Math.min(5, keywords.length - 2); i++) {
      queries.push(`${keywords[i]} ${keywords[i + 1]} ${keywords[i + 2]}`);
    }

    // Add common modifiers
    const modifiers = ['best', 'top', 'review', 'buy', 'price', 'how to', 'guide'];
    keywords.slice(0, 10).forEach(keyword => {
      modifiers.forEach(modifier => {
        queries.push(`${modifier} ${keyword}`);
        queries.push(`${keyword} ${modifier}`);
      });
    });

    // Remove duplicates and limit
    const uniqueQueries = [...new Set(queries)].slice(0, 100);

    return uniqueQueries;
  }

  // Extract keywords from URL
  extractKeywordsFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
      
      const keywords = pathSegments.map(segment => 
        segment.replace(/[-_]/g, ' ').trim()
      ).filter(keyword => keyword.length > 0);

      return keywords;
    } catch (error) {
      console.error('Error extracting keywords from URL:', error);
      return [];
    }
  }

  // Generate related keywords
  generateRelatedKeywords(baseKeywords) {
    const related = [];

    baseKeywords.forEach(keyword => {
      // Add variations
      related.push(`${keyword} 2024`);
      related.push(`${keyword} guide`);
      related.push(`${keyword} tips`);
      related.push(`${keyword} tutorial`);
      related.push(`how to ${keyword}`);
      related.push(`best ${keyword}`);
      related.push(`${keyword} review`);
      related.push(`${keyword} price`);
      related.push(`buy ${keyword}`);
      related.push(`${keyword} online`);
    });

    return [...new Set(related)].slice(0, 50);
  }

  // Get keyword difficulty estimate (simple)
  getKeywordDifficulty(keyword) {
    const words = keyword.split(' ');
    
    // Single word = high difficulty
    if (words.length === 1) return 'high';
    
    // Two words = medium difficulty
    if (words.length === 2) return 'medium';
    
    // Three+ words = low difficulty
    return 'low';
  }
}

module.exports = KeywordEngine;
