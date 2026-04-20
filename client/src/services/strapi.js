// src/services/strapi.js

// ============================================
// READ ALL ENVIRONMENT VARIABLES
// ============================================

// Strapi API URL (required)
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

// Feature flags
const ENABLE_LOGGING = import.meta.env.VITE_ENABLE_LOGGING === 'true';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
const SHOW_DEBUG_INFO = import.meta.env.VITE_SHOW_DEBUG_INFO === 'true';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// App info
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Newsletter';
const NODE_ENV = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE;

// ============================================
// VALIDATION & INITIALIZATION
// ============================================

// Check if STRAPI_URL is defined
if (!STRAPI_URL) {
  console.error("❌ VITE_STRAPI_URL is not defined! Please check your .env file");
  console.error("   Development: Create .env.development with VITE_STRAPI_URL=http://localhost:1337");
  console.error("   Production: Create .env.production with VITE_STRAPI_URL=http://your-backend-ip:1337");
}

// Log startup configuration (only if logging is enabled)
if (ENABLE_LOGGING) {
  console.log(`\n🚀 ${APP_NAME} - Starting up...`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🔧 Strapi API URL: ${STRAPI_URL}`);
  console.log(`⏱️  API Timeout: ${API_TIMEOUT}ms`);
  console.log(`📝 Logging: ${ENABLE_LOGGING ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🎭 Mock Data: ${ENABLE_MOCK_DATA ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🐛 Debug Info: ${SHOW_DEBUG_INFO ? '✅ Enabled' : '❌ Disabled'}\n`);
}

// Helper function for conditional logging
function log(...args) {
  if (ENABLE_LOGGING) {
    console.log(...args);
  }
}

function debug(...args) {
  if (SHOW_DEBUG_INFO) {
    console.debug(...args);
  }
}

function error(...args) {
  console.error(...args);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the Strapi URL
  return `${STRAPI_URL}${imagePath}`;
}

// Mock data for development/testing (only used if ENABLE_MOCK_DATA is true)
function getMockArticles() {
  log("📝 Using mock data (ENABLE_MOCK_DATA is true)");
  return [
    {
      id: 1,
      title: "Sample Article 1 (Mock Data)",
      description: "<p>This is a sample article for testing. Your Strapi backend might not be running.</p>",
      descriptionPlainText: "This is a sample article for testing.",
      descriptionPlainTextLength: 45,
      date: new Date().toISOString(),
      author: "System",
      category: "Development"
    },
    {
      id: 2,
      title: "Sample Article 2 (Mock Data)",
      description: "<p>Another sample article. Configure your .env file with the correct STRAPI_URL to see real articles.</p>",
      descriptionPlainText: "Another sample article for testing.",
      descriptionPlainTextLength: 38,
      date: new Date().toISOString(),
      author: "System",
      category: "Testing"
    }
  ];
}

// ============================================
// FORMAT ARTICLE FUNCTION (FIXED)
// ============================================

export function formatArticle(strapiArticle) {
  // Handle BOTH wrapped (attributes) and unwrapped formats
  const attributes = strapiArticle.attributes || strapiArticle;
  
  // Support both Capital and lowercase field names
  const title = attributes.Title || attributes.title || "Untitled";
  const content = attributes.Content || attributes.content;
  const category = attributes.Category || attributes.category || "General";
  const date = attributes.date || attributes.Date;
  const author = attributes.author || attributes.Author;
  const articleId = attributes.id || strapiArticle.id;
  
  let fullHtml = "";
  let plainText = "";
  
  log("Processing article:", title);
  
  if (content && Array.isArray(content)) {
    log("Content blocks count:", content.length);
    
    for (let i = 0; i < content.length; i++) {
      const block = content[i];
      debug(`Block ${i}:`, block.__component);
      
      // Handle TextBlock
      if (block.__component === "content.text-block") {
        if (Array.isArray(block.text)) {
          block.text.forEach((para) => {
            if (!para.children) return;

            // extract paragraph text
            const paraText = para.children
              .map(child => child.text || "")
              .join("")
              .trim();

            // skip empty
            if (!paraText) return;

            fullHtml += `<p style="
              margin-bottom: 1.5rem;
              line-height: 1.625;
              color: #d1d5db;
              font-size: 0.875rem;
            ">
              ${paraText}
            </p>`;

            plainText += paraText + " ";
          });
        }
        // Handle plain text (if not rich text)
        else if (typeof block.text === 'string') {
          const lines = block.text.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              fullHtml += `<p style="margin-bottom: 1.5rem; line-height: 1.625; color: #d1d5db; font-size: 0.875rem;">${line.trim()}</p>`;
              plainText += line.trim();
            }
          }
        }
      }
      
      // Handle ImageBlock
      else if (block.__component === "content.image-block") {
        debug("Found ImageBlock, images:", block.images);
        
        if (block.images && Array.isArray(block.images)) {
          for (const img of block.images) {
            if (img.url) {
              const imageUrl = getImageUrl(img.url);
              fullHtml += `<div style="margin: 2rem 0; display: flex; justify-content: center;">
                <img src="${imageUrl}" alt="${img.alternativeText || ''}" style="max-width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);" />
              </div>`;
              plainText += " [IMAGE] ";
              debug("Added image:", imageUrl);
            }
          }
        }
        else if (block.images && block.images.data && Array.isArray(block.images.data)) {
          for (const img of block.images.data) {
            if (img.attributes && img.attributes.url) {
              const imageUrl = getImageUrl(img.attributes.url);
              fullHtml += `<div style="margin: 2rem 0; display: flex; justify-content: center;">
                <img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);" />
              </div>`;
              plainText += " [IMAGE] ";
              debug("Added image:", imageUrl);
            }
          }
        }
      }
    }
  }
  
  log("Generated HTML length:", fullHtml.length);
  
  return {
    id: articleId,
    title: title,
    description: fullHtml || "<p>No description available</p>",
    descriptionPlainText: plainText,
    descriptionPlainTextLength: plainText.length,
    date: date,
    author: author,
    category: category
  };
}

// ============================================
// FETCH ARTICLES FUNCTION (FIXED)
// ============================================

export async function getStrapiArticles() {
  // Check if STRAPI_URL is defined
  if (!STRAPI_URL) {
    error("❌ Cannot fetch articles: VITE_STRAPI_URL is not defined");
    
    // Return mock data if enabled
    if (ENABLE_MOCK_DATA) {
      console.warn("⚠️ Using mock data because STRAPI_URL is not defined");
      return getMockArticles();
    }
    return [];
  }
  
  // Return mock data if enabled (for testing without backend)
  if (ENABLE_MOCK_DATA && NODE_ENV !== 'production') {
    log("📝 Using mock data (ENABLE_MOCK_DATA is true)");
    return getMockArticles();
  }
  
  try {
    // FIXED: Use populate=* to get all content including nested fields
    const apiUrl = `${STRAPI_URL}/api/articles?populate=*`;
    log(`📡 Fetching articles from: ${apiUrl}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    log("API Response received:", {
      status: response.status,
      articlesCount: data.data?.length || 0
    });
    
    if (data.data && data.data.length > 0) {
      // Format articles (no need to sort, API can handle or sort here)
      const formattedArticles = data.data.map(item => formatArticle(item));
      log(`✅ Successfully formatted ${formattedArticles.length} articles`);
      return formattedArticles;
    }
    
    log("📭 No articles found in response");
    return [];
  } catch (error) {
    if (error.name === 'AbortError') {
      error(`❌ Request timeout after ${API_TIMEOUT}ms`);
    } else {
      error("❌ Error fetching articles:", error.message);
      error("   Make sure your Strapi backend is running at:", STRAPI_URL);
    }
    
    // Return mock data if enabled (for development)
    if (ENABLE_MOCK_DATA && NODE_ENV !== 'production') {
      console.warn("⚠️ Using mock data due to API error");
      return getMockArticles();
    }
    
    return [];
  }
}

// ============================================
// EXPORT CONFIG (for debugging purposes)
// ============================================

export function getConfig() {
  return {
    strapiUrl: STRAPI_URL,
    environment: NODE_ENV,
    loggingEnabled: ENABLE_LOGGING,
    mockDataEnabled: ENABLE_MOCK_DATA,
    debugEnabled: SHOW_DEBUG_INFO,
    apiTimeout: API_TIMEOUT,
    appName: APP_NAME
  };
}