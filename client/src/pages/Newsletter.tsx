import { useState, useEffect, useRef } from "react";
import { getStrapiArticles } from "@/services/strapi";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/PageWrapper";
import {
  Share2,
  Linkedin,
  Send,
  Copy,
  MessageCircle
} from "lucide-react";
import { api } from "@/services/api";


interface StrapiArticle {
  id: number;
  title: string;
  description: string;
  descriptionPlainText: string;
  descriptionPlainTextLength: number;
  date: string;
  author: string;
  category: string;
  image: string | null;
}


const ARTICLE_HIKING = "hiking-life";
const ARTICLE_AI = "ai-giveth";
const ARTICLE_INDIA = "india-markets";
const ARTICLE_GAS = "widowmaker";
const ARTICLE_YEAR = "year-review";
const ARTICLE_ALT = "altseason";

// THIS IS THE KEY PART - Handle sharing at the top level
// THIS IS THE KEY PART - Handle sharing at the top level
if (typeof window !== 'undefined') {
  // Check if this is the newsletter page with share parameter
  if (window.location.pathname === '/newsletter') {
    const searchParams = new URLSearchParams(window.location.search);
    const shareArticle = searchParams.get('share');
    
    if (shareArticle) {
      console.log("📤 Share parameter detected:", shareArticle);
      
      // Store the article
      sessionStorage.setItem('newsletter_article', shareArticle);
      localStorage.setItem('newsletter_article', shareArticle);
      document.cookie = `newsletter_article=${shareArticle}; path=/; max-age=60`;
      
      console.log("✅ Stored in sessionStorage:", sessionStorage.getItem('newsletter_article'));
      
      // IMPORTANT: Remove the share parameter from URL without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Don't redirect - we're already on the right page!
      // Just let the component render normally
    }
  }
}


export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState<string | null>(null);
  const [expandedArticle1, setExpandedArticle1] = useState(false);
  const [expandedArticle2, setExpandedArticle2] = useState(false);
  const [expandedArticle3, setExpandedArticle3] = useState(false);
  const [expandedArticle4, setExpandedArticle4] = useState(false);
  const [expandedArticle5, setExpandedArticle5] = useState(false); 
  const [expandedArticle6, setExpandedArticle6] = useState(false);  
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [, setLocation] = useLocation();

  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  // Add these with your other useState declarations
const [strapiArticles, setStrapiArticles] = useState<any[]>([]);
const [loadingStrapi, setLoadingStrapi] = useState(true);
const [expandedStrapiArticles, setExpandedStrapiArticles] = useState<{ [key: number]: boolean }>({});
const [hoveredStrapiImage, setHoveredStrapiImage] = useState<number | null>(null);
const [sharedArticleType, setSharedArticleType] = useState<'hardcoded' | 'strapi' | null>(null);
const [isStrapiShared, setIsStrapiShared] = useState(false);


// Read shared article from sessionStorage (set by top-level code)
useEffect(() => {
  const storedArticle = sessionStorage.getItem('newsletter_article');
  console.log("🔍 Reading from sessionStorage:", storedArticle);
  
  if (storedArticle && storedArticle.startsWith('strapi-')) {
    const strapiId = parseInt(storedArticle.replace('strapi-', ''));
    console.log("🎯 Shared Strapi article detected from storage:", strapiId);
    
    setIsSharedView(true);
    setExpandedStrapiArticles({ [strapiId]: true });
    
    // Collapse hardcoded articles
    setExpandedArticle1(false);
    setExpandedArticle2(false);
    setExpandedArticle3(false);
    setExpandedArticle4(false);
    setExpandedArticle5(false);
    setExpandedArticle6(false);
    
    // Clear the storage so it doesn't affect next time
    sessionStorage.removeItem('newsletter_article');
    localStorage.removeItem('newsletter_article');
    document.cookie = 'newsletter_article=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}, []);



//strapi fuction

// Toggle expand/collapse for Strapi articles
const toggleStrapiArticle = (articleId: number) => {
  setExpandedStrapiArticles(prev => ({
    ...prev,
    [articleId]: !prev[articleId]
  }));
};


// Handle share for Strapi articles
const handleStrapiShareClick = (articleId: number, e: React.MouseEvent) => {
  e.stopPropagation();
  setShowShare(showShare === `strapi-${articleId}` ? null : `strapi-${articleId}`);
};

// Get share links for Strapi articles
const getStrapiShareLinks = (articleId, articleTitle) => {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://aifinverse.com';
  
  const shareUrl = `${baseUrl}/newsletter?share=strapi-${articleId}`;
  const message = `Check out this article: ${articleTitle}\n\n${shareUrl}`;
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(articleTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    copy: shareUrl,
  };
};

//........................................strapi function end.....................................//


  const hasProcessed = useRef(false);

  const getShareLinks = (article: string) => {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://aifinverse.com';
  
  // Use newsletter page with share parameter
  const shareUrl = `${baseUrl}/newsletter?share=${encodeURIComponent(article)}`;
  const message = `Check out this market insight article 👇\n\n${shareUrl}`;
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out this market insight article")}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    copy: shareUrl,
  };
};


  // Close share panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking outside any share panel, close it
      if (showShare) {
        setShowShare(null);
      }
    };

    // Add event listener with a small delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showShare]);

 
useEffect(() => {
  // Log everything at the start
  console.log("📋 NEWSLETTER PAGE - Starting check");
  console.log("📋 Current URL:", window.location.href);
  console.log("📋 Search params:", window.location.search);
  
  // Try multiple sources
  const urlArticle = new URLSearchParams(window.location.search).get("article");
  const sessionArticle = sessionStorage.getItem('newsletter_article');
  const localArticle = localStorage.getItem('newsletter_article');
  
  // Get cookie
  const cookieMatch = document.cookie.match(/newsletter_article=([^;]+)/);
  const cookieArticle = cookieMatch ? cookieMatch[1] : null;

  console.log("📋 All sources:");
  console.log("  - URL param:", urlArticle);
  console.log("  - sessionStorage:", sessionArticle);
  console.log("  - localStorage:", localArticle);
  console.log("  - cookie:", cookieArticle);

  // Use the first available article
  const article = urlArticle || sessionArticle || localArticle || cookieArticle;
  console.log("✅ Using article:", article);

  // Clear storage after reading
  if (!urlArticle) {
    sessionStorage.removeItem('newsletter_article');
    localStorage.removeItem('newsletter_article');
    document.cookie = 'newsletter_article=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }

  if (article && !hasProcessed.current) {
    console.log("🎯 Expanding article:", article);
    hasProcessed.current = true;

    // Check if it's a Strapi article (starts with "strapi-")
  if (article.toString().startsWith('strapi-')) {
    // Don't do anything here - let the Strapi useEffect handle it
    console.log("Strapi article detected, skipping hardcoded expansion");
    return;
  }

    setIsSharedView(true);

    // Collapse all first
    setExpandedArticle1(false);
    setExpandedArticle2(false);
    setExpandedArticle3(false);
    setExpandedArticle4(false);
    setExpandedArticle5(false);
    setExpandedArticle6(false);
    
    // Expand the correct one
    if (article === "hiking-life") {
      console.log("Expanding Article 1");
      setExpandedArticle1(true);
    } else if (article === "ai-giveth") {
      console.log("Expanding Article 2");
      setExpandedArticle2(true);
    }
     else if (article === "india-markets") {
      console.log("Expanding Article 3");
      setExpandedArticle3(true);
    } else if (article === "widowmaker") {
      console.log("Expanding Article 4");
      setExpandedArticle4(true);
    } else if (article === "year-review") {
      console.log("Expanding Article 5");
      setExpandedArticle5(true);
    } else if (article === "altseason") {
      console.log("Expanding Article 6");
      setExpandedArticle6(true);
    } else {
      console.log("Unknown article, expanding Article 1");
      setExpandedArticle1(true);
    }
  } else {
    console.log("📋 No article to expand or already processed");
  }
}, []);
  
  
//......................STRAPI........................//

// ✅ CORRECTED: Fetch articles from Strapi on page load
useEffect(() => {
  async function loadStrapiArticles() {
    setLoadingStrapi(true);
    const articles = await getStrapiArticles();
    setStrapiArticles(articles);
    setLoadingStrapi(false);
  }
  loadStrapiArticles();
}, []);



// This must run FIRST - before the URL is cleared
useEffect(() => {
  // Get the share parameter directly from window.location
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  console.log("🔍 EARLY CHECK - shareParam:", shareParam);
  
  if (shareParam && shareParam.startsWith('strapi-')) {
    const strapiId = parseInt(shareParam.replace('strapi-', ''));
    console.log("🎯 Shared Strapi article detected EARLY:", strapiId);
    
    // Set all states immediately
    setIsSharedView(true);
    setExpandedStrapiArticles({ [strapiId]: true });
    
    // Collapse hardcoded articles
    setExpandedArticle1(false);
    setExpandedArticle2(false);
    setExpandedArticle3(false);
    setExpandedArticle4(false);
    setExpandedArticle5(false);
    setExpandedArticle6(false);
  }
}, []); 

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const shareParam = params.get('share');
  
  console.log("🔍 Strapi useEffect - shareParam:", shareParam);
  
  // Only run if not already handled by the early useEffect
  if (shareParam && shareParam.startsWith('strapi-') && Object.keys(expandedStrapiArticles).length === 0) {
    const strapiId = parseInt(shareParam.replace('strapi-', ''));
    console.log("🎯 Shared Strapi article detected (fallback):", strapiId);
    setIsSharedView(true);
    setExpandedStrapiArticles({ [strapiId]: true });
    setExpandedArticle1(false);
    setExpandedArticle2(false);
    setExpandedArticle3(false);
    setExpandedArticle4(false);
    setExpandedArticle5(false);
    setExpandedArticle6(false);
  }
}, []);

//.....................END STRAPI.......................................//


  const handleSubscribe = async () => {
    // Validation
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // Clear previous errors
    setError("");
    setIsSubscribing(true);

    try {
      // Call the subscribe API endpoint
      const response = await api.post("/subscribe", {
        email: email.trim().toLowerCase(),
        subscription_source: "newsletter_page",
        timestamp: new Date().toISOString()
      });

      console.log("Subscribe API response:", response);

      if (response.status === 200 || response.status === 201) {
        setSubscribed(true);
        setEmail("");
        
        localStorage.setItem("newsletterSubscribed", "true");
        localStorage.setItem("subscribedEmail", email.trim().toLowerCase());
        
        if (response.data.message) {
          console.log("Subscription success:", response.data.message);
        }
      } else {
        setError(response.data?.message || "Subscription failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Subscribe error:", err);
      
      if (err.response) {
        const errorData = err.response.data;
        
        if (err.response.status === 400) {
          setError("Invalid email format or missing information.");
        } else if (err.response.status === 409) {
          setError("This email is already subscribed to our newsletter.");
          setSubscribed(true);
          setEmail("");
        } else if (err.response.status === 422) {
          setError(errorData?.detail || "Please check your email address.");
        } else {
          setError(errorData?.message || "Subscription failed. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle share button click - stop propagation
  const handleShareClick = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShare(showShare === articleId ? null : articleId);
  };

  // Handle share option click - stop propagation
  const handleShareOptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-950/95 via-blue-950/80 to-slate-950/95 bg-[url('/images/login.png')] bg-cover bg-center bg-fixed bg-blend-darken">
        <Navbar />

        <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* HEADER */}
          {!isSharedView && (
            <>
              <div className="flex justify-between items-start mb-12 flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Market Insights
                  </h1>
                  <p className="text-gray-400">
                    In-depth market analysis, articles, and videos
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-5 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubscribing ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Subscribing...
                      </span>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              {subscribed && (
                <div className="mb-6 p-3 bg-green-900/30 border border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-green-400 text-xl">✓</div>
                    <p className="text-green-300 text-sm">
                      You have successfully subscribed to AIFinverse Newsletter!
                    </p>
                  </div>
                </div>
              )}
            </>  
          )}

          {/*------------------   ARTICLES ------------------  */}

                {isSharedView && (
  <div className="mb-6">
    <a
      href="/newsletter"
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200"
    >
      ← Back to All Articles
    </a>
  </div>
)}

  

{/*------------------   STRAPI ARTICLES (NEW - SHOW ON TOP) ------------------  */}

{/* Loading state */}
{loadingStrapi && (
  <div className="mb-8 p-4 bg-slate-800/40 rounded-lg text-center">
    <p className="text-cyan-400 text-sm">Loading new articles from CMS...</p>
  </div>
)}

{/* Display Strapi articles */}
{!loadingStrapi && strapiArticles.map((article: StrapiArticle) => {
const shouldShowArticle = !isSharedView || expandedStrapiArticles[article.id];
  const isExpanded = expandedStrapiArticles[article.id];
  const descriptionLength = article.descriptionPlainTextLength || article.descriptionPlainText?.length || 0;
  const shouldTruncate = descriptionLength > 200;

  console.log("Article ID:", article.id, "isSharedView:", isSharedView, "expandedStrapiArticles:", expandedStrapiArticles, "shouldShow:", !isSharedView || expandedStrapiArticles[article.id]);

  if (!shouldShowArticle) return null;
  
  // Share links for this article
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://aifinverse.com';

  const shareUrl = `${baseUrl}/newsletter`;
  const shareMessage = `Check out this article: ${article.title}\n\n${shareUrl}`;
  const encodedMessage = encodeURIComponent(shareMessage);
  
  return (
    <section key={`strapi-${article.id}`} className="mb-16">
      <div 
  className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm"
  style={{ paddingLeft: '3rem', paddingRight: '1.5rem' }}
>
        
        {/* Header with date, read time, author, and SHARE BUTTON */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
          <span className="flex items-center gap-1.5">
            <span className="text-lg">📅</span>
            <span>{article.date}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lg">⏱</span>
            <span>{Math.ceil(descriptionLength / 1000) || 1} min read</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lg">✍️</span>
            <span className="text-cyan-300">{article.author}</span>
          </span>
          <span className="ml-auto flex items-center gap-2">
            
            {/* Share Button */}
<div className="relative">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setShowShare(showShare === `strapi-${article.id}` ? null : `strapi-${article.id}`);
    }}
    className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
  >
    <Share2 size={12} />
    Share
  </button>
  
  {/* Share Options Panel */}
  {showShare === `strapi-${article.id}` && (
    <div className="absolute right-0 top-8 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
        <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
        <div className="space-y-1">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this article: ${article.title}\n\n${baseUrl}/newsletter?share=strapi-${article.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
          >
            <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
            WhatsApp
          </a>
          
          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(`${baseUrl}/newsletter?share=strapi-${article.id}`)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
          >
            <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
            Telegram
          </a>
          
          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/newsletter?share=strapi-${article.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
          >
            <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
            LinkedIn
          </a>
          
          {/* Copy Link */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${baseUrl}/newsletter?share=strapi-${article.id}`);
              setShowShare(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
          >
            <Copy size={12} />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )}
            </div>
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
    
    {/* Category Badge */}
    <div className="mb-6">
      <div className="inline-block px-3 py-1 bg-emerald-900/30 text-emerald-300 rounded-full text-xs font-medium mb-3 border border-emerald-800/50">
        {article.category}
      </div>
      <h3 className="text-2xl font-bold text-white leading-tight break-words">
        {article.title}
      </h3>
    </div>

    
    {/* Description */}

<div className="strapi-article-content w-full text-left">
  <div 
    dangerouslySetInnerHTML={{ 
      __html: isExpanded 
        ? article.description  // Show FULL when expanded
        : (article.descriptionPlainTextLength > 200 
            ? article.description.substring(0, 1000) + "..."  // Show preview when collapsed
            : article.description)  // Show full if short
    }} 
  />
</div>


{/* Read More/Less Button */}
{shouldTruncate && !isSharedView && (
  <button
    onClick={() => toggleStrapiArticle(article.id)}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {isExpanded ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
          </div>
        </div>
      </div>
    </section>
  );
})}




  {/*...............................Hardcode ARTICLEs........................................................................... */}    
    


                    {/* ARTICLE 1 - HIKING THE INVESTING LIFE */}
          {(!isSharedView || expandedArticle1) && (
          <section id="hiking-life" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>5 March 2026</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>6 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">Personal Journey</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("hiking-life", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "hiking-life" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("hiking-life").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("hiking-life").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("hiking-life").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("hiking-life").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-emerald-900/30 text-emerald-300 rounded-full text-xs font-medium mb-3 border border-emerald-800/50">
                      Life & Investing
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      Hiking the Investing Life
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                      I wrote this last year while the previous version of Iran - Israel war was on going, nothing has changed when it comes to investing lessons while we go thru a wider new version of the war.
                    </p>
                  </div>

                  {/* First paragraph - Always visible */}
                  <div className="text-gray-300 text-sm leading-relaxed mb-6">
                    <p className="leading-relaxed">
                      Having finished my first real hike, to the Big Almaty Lake last Saturday, I sat down to process the journey and what all I went through along the way. I sprained my ankle before the hike even started, went in the wrong direction twice, slipping and hurting my hip bone, my right shoulder and small bruises on the elbow. I also got blisters in my feet not too far along the hike and they were hurting throughout. It made me realize how similar a hike is to investing life. Sometimes it feels similar for an investor, you get on a wrong path multiple times, you make some wrong moves, lose money or make lower returns and there's pain along the way but there's always a way back as long as you believe in your end goal and are ready to restart the journey.
                    </p>
                  </div>

                  {/* First Image - Always visible */}
                  <div className="my-8 flex flex-col items-center">
                    <div 
                      className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                        hoveredImage === 'hike1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                      }`}
                      onMouseEnter={() => setHoveredImage('hike1')}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      <img
                        src="/images/m1.jpg"
                        alt="Hiking journey"
                        className="w-full rounded-lg"
                      />
                      {hoveredImage === 'hike1' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                      )}
                    </div>
                    {/* Shahrukh Khan quote added below first image */}
                        <p className="text-gray-300 mt-4 text-center italic text-sm">
                          Invoke your Shahrukh Khan, celebrate the peak!
                        </p>
                      
                  </div>

                  {/* Rest of content - Only visible when expanded */}
                  {expandedArticle1 && (
                    <div className="mt-8 text-gray-300 text-sm leading-relaxed space-y-8">
                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          At the beginning of the hike, I remembered a song by the singer Shaan from the movie Jab We Met which loosely translates to some journeys are more beautiful than the destination. "Hum jo chalne lage…" So true for the surroundings on the way.
                        </p>
                        
                        <p className="leading-relaxed font-semibold">
                          Here's what I think is common between Investing and Hiking -
                        </p>
                        
                        <div className="space-y-6 mt-4">
                          <div>
                            <p className="leading-relaxed font-bold text-white">DYOR - do your own research. Preparation is key.</p>
                            <p className="leading-relaxed">Markets are more rewarding to those who are better prepared. I went into the hike without knowing what to expect. No snacks, no bug spray, no hiking shoes. On the other hand, my companion on the hike was much better prepared. Thankfully!!</p>
                          </div>
                          
                          <div>
                            <p className="leading-relaxed font-bold text-white">Conditions keep changing. Nothing is constant.</p>
                            <p className="leading-relaxed">Conditions on the hike keep changing whether its the sun, the wind, the water or for that matter that pebbles along the way. If you look at the last 5 years what the market has endured, COVID, the wars, inflation, rate hikes, cuts, Trump tariffs and what not.</p>
                          </div>
                          
                          <div>
                            <p className="leading-relaxed font-bold text-white">When times are tough, you should have a friend, a coach, a mentor you can trust.</p>
                            <p className="leading-relaxed">A fall like the one we witnessed markets in April 2025 could rattle even the best of the investors but the right person understand your situation and would have told you it was a great opportunity to buy or at least not to panic sell. Similarly on the hike, after a slip few mins ago on the wrong path and then a few mins of anxiousness on a very steep hike, my friend kept me calm talking to me and keeping it honest, rather than telling me we were almost there.</p>
                          </div>
                          
                          <div>
                            <p className="leading-relaxed font-bold text-white">You can be afraid along the way, but need to have the dedication towards the end goal.</p>
                            <p className="leading-relaxed">That prevents you from panicking. There are setbacks during the investing journey as well as the hike. Covid scared the best of us, not just the disease, but the market fall as well. But the bigger picture saved many from panic selling. Infact, people with courage and extra resources went in and bought further. You/your portfolio can get battered along the way but at times like those you need the courage to stay the course.</p>
                          </div>
                          
                          <div>
                            <p className="leading-relaxed font-bold text-white">Sometimes its good to have only one option.</p>
                            <p className="leading-relaxed">Once I knew that I was hiking a very steep path, I was nervous to look behind. Feeling was should I stop and return, like sometimes an investor panics and feels when markets drop, should I sell. But I felt I had no option to return because it was too scary to look behind let alone turnaround and start going down. That's sometimes a good thing when there's only 1 option. Only one was to keep going on. Almost there, almost there, Worst is almost done I kept telling myself during the anxious moments.</p>
                          </div>
                          
                          <div>
                            <p className="leading-relaxed font-bold text-white">My friend told me you can't sell your 401k without penalty, so effectively there's only one option...</p>
                            <p className="leading-relaxed">keep the investing going / stay invested for long term is the market equivalent.</p>
                          </div>
                        </div>
                      </div>

                      {/* Second Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'hike2' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('hike2')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/m2.jpg"
                            alt="Hiking path"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'hike2' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="leading-relaxed font-bold text-white">There are no risk-free shortcuts, they often take more out of you than the normal route.</p>
                          <p className="leading-relaxed">We had a choice to take the road path up or a shortcut hiking up in the direction of a hydro electric pipe, which was pure hike, steep, rocks and straight up. The shortcut was more taxing on the body, I was using all 4 limbs for a few mins mid hike coinciding with the anxious moments. Similarly, if you try shortcuts to get rich quickly in markets (leverage), unless you're very very very lucky, it will be taxing on you. There's no shortcut to success or getting rich in the market (without disproportionate risk)</p>
                        </div>
                      </div>

                      {/* Third Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'hike3' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('hike3')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/m3.jpg"
                            alt="Nature and markets"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'hike3' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="leading-relaxed font-bold text-white">Nature and markets both have the potential to ground you.</p>
                          <p className="leading-relaxed">Be humble, respect them both. Have learnt and always learning from both.</p>
                        </div>
                      </div>

                      {/* Fourth Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'hike4' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('hike4')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/m4.png"
                            alt="Mountain view"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'hike4' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="leading-relaxed font-bold text-white">You've got to live through the pain.</p>
                          <p className="leading-relaxed">The early slip, the minutes of anxiety and enduring pain from blisters on my feet most of the hike and yet I completed the hike. If you lived through the pain of Market fall during Covid and April 2025, you did really well. Pat yourself on the back.</p>
                        </div>
                        
                        <div>
                          <p className="leading-relaxed font-bold text-white">Market bottoms and the most treacherous part of the hike have one thing in common — peak panic.</p>
                          <p className="leading-relaxed">You won't know the hardest part is done but that's where the highest panic is. If you get through that, gets better from there. I was much more comfortable once nervous few minutes were done and I was walking on 2 limbs again.</p>
                        </div>
                        
                        <div>
                          <p className="leading-relaxed font-bold text-white">Last but not the least, When you reach a goal, enjoy it, savour it and then get to the next.</p>
                          <p className="leading-relaxed">Enjoy the peaks, appreciate them, celebrate them and onto the next! All time highs are good but then there will be period of consolidation and correction along the way and then All time highs all over again.</p>
                        </div>
                      </div>

                      {/* Fifth Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'hike5' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('hike5')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/m5.jpg"
                            alt="Reaching the peak"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'hike5' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          Having finished the hike and back, that spanned about 9 hours give or take and 20+ kms including the wrong paths, I reached my hotel and realized I had done some damage to my right shoulder. But, the adrenaline kept me going unfazed during the hike. When I shared this with my friend Khaoula, she said and I quote her - "Hiking is a war against ourselves where our discipline pushes us to keep going and our desire to rest pushes back".
                        </p>
                        
                        <p className="leading-relaxed">
                          Thank you Khaoula Morchid for being a friend, coach and companion on the hike. Giving me pep talk and almonds along the way and also, for taking some pics during my vulnerable moment :)
                        </p>
                        
                        <p className="leading-relaxed">
                          Until next time…
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show Read More/Less button */}
                  {!isSharedView && (
                    <button
                      id="article-1-button"
                      onClick={() => {
                        console.log("🔵 Article 1 button clicked");
                        console.log("Current expandedArticle1:", expandedArticle1);
                        console.log("Setting to:", !expandedArticle1);
                        setExpandedArticle1(!expandedArticle1);
                      }}
                      className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
                    >
                      {expandedArticle1 ? (
                        <>
                          <span>Read Less</span>
                          <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
                        </>
                      ) : (
                        <>
                          <span>Read Full Article</span>
                          <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
          )}


          {/* ARTICLE 2 - AI GIVETH AND TAKETH */}
          {(!isSharedView || expandedArticle2) && (
  

          <section id="ai-giveth" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>4 February 2026</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>5 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">AI Market Analysis</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("ai-giveth", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "ai-giveth" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("ai-giveth").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("ai-giveth").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("ai-giveth").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("ai-giveth").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-violet-900/30 text-violet-300 rounded-full text-xs font-medium mb-3 border border-violet-800/50">
                      AI Revolution
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      AI Giveth and AI Taketh Away
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                      Started late in 2022 with the advent of ChatGPT, the AI bull run is looking fragile as Anthropic keeps progressing at Warp Speed. Is the end near?The bull run origin could be dated back to late 2022 when ChatGPT was launched. Few months later, when Nvidia gave a mind-blowing guidance for the first time, that AI-led bull run took off, where we have seen Nvidia go up more than 20x in a span of four years, and a lot of the ecosystem players which have done even better (look at WD, SanDisk for example).
                      But that has come at the cost of software makers.That's even more visible especially over the last week. As markets are becoming jittery, unable to make new highs, and AI keeps progressing, the software makers are taking it on their chin. Investors aren't even differentiating. It seems if you're a software maker of any kind, they are rushing out of the door.
                    </p>
                  </div>

                  {expandedArticle2 && (
                    <div className="mt-8 text-gray-300 text-sm leading-relaxed space-y-8">
                      

                      {/* Graph Images - First Row */}
                      <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Graph 1 */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                              hoveredImage === 'w4_chart1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                            }`}
                            onMouseEnter={() => setHoveredImage('w4_chart1')}
                            onMouseLeave={() => setHoveredImage(null)}
                          >
                            <img
                              src="/images/w4_chart1.png"
                              alt="AI software stocks chart 1"
                              className="w-full rounded-lg"
                            />
                            {hoveredImage === 'w4_chart1' && (
                              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                        </div>

                        {/* Graph 2 */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                              hoveredImage === 'w4_chart2' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                            }`}
                            onMouseEnter={() => setHoveredImage('w4_chart2')}
                            onMouseLeave={() => setHoveredImage(null)}
                          >
                            <img
                              src="/images/w4_chart2.png"
                              alt="AI software stocks chart 2"
                              className="w-full rounded-lg"
                            />
                            {hoveredImage === 'w4_chart2' && (
                              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          The updates that have been rolling out of Anthropic's Claude at warp speed seem to be going after eliminating a lot of the human work — whether it's involved in coding, creating apps, research, admin, or first-level reviews. Companies related to those kinds of services have headed down.
                        </p>
                        
                        <p className="leading-relaxed">
                          So whether you look at the price action of Gartner or Morningstar, or even for that matter Accenture last evening — the damage is visible.
                        </p>
                      </div>

                      {/* Graph Images - Second Row - Vertical Layout */}
<div className="my-8 space-y-6">
  {/* Graph 3 */}
  <div className="flex flex-col items-center">
    <div 
      className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
        hoveredImage === 'w4_chart3' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
      }`}
      onMouseEnter={() => setHoveredImage('w4_chart3')}
      onMouseLeave={() => setHoveredImage(null)}
    >
      <img
        src="/images/w4_chart3.png"
        alt="Gartner and Morningstar performance"
        className="w-full rounded-lg"
      />
      {hoveredImage === 'w4_chart3' && (
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
      )}
    </div>
    <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
  </div>

  {/* Graph 4 */}
  <div className="flex flex-col items-center">
    <div 
      className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
        hoveredImage === 'w4_chart4' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
      }`}
      onMouseEnter={() => setHoveredImage('w4_chart4')}
      onMouseLeave={() => setHoveredImage(null)}
    >
      <img
        src="/images/w4_chart4.png"
        alt="Accenture performance chart"
        className="w-full rounded-lg"
      />
      {hoveredImage === 'w4_chart4' && (
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
      )}
    </div>
    <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
  </div>
</div>
                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          Even Microsoft hasn't been spared, despite the AI story, stake in ChatGPT (loss-making), and Azure growth of 38% (vs 39% estimate) last quarter. It's down more than 25% from its peak that came in October 2025 and about to test crucial support around 400.
                        </p>
                      </div>

                      {/* Microsoft Chart */}
                      <div className="flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'w4_chart5' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('w4_chart5')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/w4_chart5.png"
                            alt="Microsoft stock performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'w4_chart5' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          Lastly, if you look today in the Indian market, the IT services sector is falling apart. TCS, Infosys, HCL — all of them down in the range of 5–7% in early trade. This is also indicative of the fact that as AI keeps growing, the services sector billable hours will keep coming down.
                        </p>
                      </div>

                      {/* Indian IT Chart */}
                      <div className="flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'w4_chart6' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('w4_chart6')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/w4_chart6.png"
                            alt="Indian IT sector performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'w4_chart6' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          Anthropic's progress is making everyone question the bazillion dollars ChatGPT is spending on people creating Ghibli's and its key partners are suffering. Nvidia, Oracle for example. They are far from their peaks and well, keep dipping.
                        </p>
                      </div>

                      {/* Nvidia and Oracle Chart */}
                      <div className="flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'w4_chart7' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('w4_chart7')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/w4_chart7.png"
                            alt="Nvidia and Oracle performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'w4_chart7' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      {/* Nvidia and Oracle Chart2 */}
                      <div className="flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-2xl ${
                            hoveredImage === 'w4_chart8' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('w4_chart8')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/w4_chart8.png"
                            alt="Nvidia and Oracle performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'w4_chart8' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>


                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          But eventually, after all that carnage, there would be somewhere these software / services stocks will bottom. Where do you see the bottom happening?
                        </p>
                        
                        <p className="leading-relaxed font-semibold">
                          But more importantly, has the AI bull run runs its course (atleast for now)?
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show Read More/Less button */}
                  {!isSharedView && (
  <button
    id="article-2-button"
    onClick={() => {
      console.log("🔵 Article 2 button clicked");
      console.log("Current expandedArticle2:", expandedArticle2);
      console.log("Setting to:", !expandedArticle2);
      setExpandedArticle2(!expandedArticle2);
    }}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {expandedArticle2 ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
                </div>
              </div>
            </div>
          </section>
          )}


          {/* ARTICLE 3 - INDIA MARKETS */}

          {(!isSharedView || expandedArticle3) && (
          
          <section id="india-markets" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>29 January 2026</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>5 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">Market Insights</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  
                {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("india-markets", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "india-markets" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("india-markets").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("india-markets").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("india-markets").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("india-markets").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium mb-3 border border-purple-800/50">
                      Market Insights
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      Will the US trade deal fix the Indian stock market?
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                      In my recent discussions with a lot of people, I have repeatedly said, the Indian stock market underperformance isn't about the MAGA US Trade deal. Here's why: 1. The last I checked, India exports $80B to the US, out of which $50B was under the 50% tariff. If India grows at 7.5% per year, we add $300B.
                      2. If it was about the US trade deal, then why are stocks from hotels, QSR, real estate, hospitals, defense down? Why's Eternal down from 305 to 250 in a matter of 3-4 days? Godrej Properties down from 2100 odd to below 1500 in a matter of couple weeks.
                        
                    </p>
                  </div>

                  {expandedArticle3 && (
                    <div className="mt-8 text-gray-300 text-sm leading-relaxed space-y-8">
                    
                      {/* Graph Images */}
                      <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Graph 1 */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                              hoveredImage === 'graph1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                            }`}
                            onMouseEnter={() => setHoveredImage('graph1')}
                            onMouseLeave={() => setHoveredImage(null)}
                          >
                            <img
                              src="/images/graph1.jpg"
                              alt="Indian market chart 1"
                              className="w-full rounded-lg"
                            />
                            {hoveredImage === 'graph1' && (
                              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                        </div>

                        {/* Graph 2 */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                              hoveredImage === 'graph2' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                            }`}
                            onMouseEnter={() => setHoveredImage('graph2')}
                            onMouseLeave={() => setHoveredImage(null)}
                          >
                           <img
                              src="/images/graph22.jpg"
                              alt="Indian market chart 2"
                              className="w-full rounded-lg"
                            />
                            {hoveredImage === 'graph2' && (
                              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          3. Tax cuts from the Indian Government- income tax, GST- have also failed to take India to sustainable levels above previous highs for Nifty and beyond.
                        </p>
                        
                        <p className="leading-relaxed">
                          4. Indian market underperformed the global markets post Sep 2024 due to an earnings / valuation issue. While earnings started getting better last quarter, valuations for most midcap smallcap stocks are still 50-100x and even more in some cases.
                        </p>
                        
                        <p className="leading-relaxed">
                          5. You'd think since we didnt rally with the world, we would fall less when the world falls, right? Last week when markets fell on Greenland + Japanese Bond Yield drama, we also participated and how. Global markets recovered on Tues/Wed while India kept breaking levels on the downside.
                        </p>
                      </div>

                      {/* Graph 3 */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'graph3' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('graph3')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/graph3.jpg"
                            alt="Indian market chart 3"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'graph3' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          6. EU just concluded "the mother of all deals" with India and yet, there's no positive reaction.
                        </p>
                        
                        <p className="leading-relaxed">
                          7. Absolutely no pre budget rally. Infact the dip keeps dipping. Last week was brutal, infact the worst I can remember for midcap smallcap in years.
                        </p>
                        
                        <p className="leading-relaxed">
                          The last time I remember midcap smallcap getting beaten like this is perhaps 2018 (covid aside). But the key difference is the DII or rather SIP participation which has grown multifolds since then.
                        </p>
                        
                        <p className="leading-relaxed">
                          I am not keeping any high hopes from the budget. There will be a big gap from the lack of capital gains tax & STT the FinMin would have budgeted for 2025-26.
                        </p>
                        
                        <p className="leading-relaxed">
                          Do you think US deal will fix what's ailing the markets?
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show Read More/Less button */}
                 {!isSharedView && (
  <button
    id="article-3-button"
    onClick={() => {
      console.log("🔵 Article 3 button clicked");
      console.log("Current expandedArticle3:", expandedArticle3);
      console.log("Setting to:", !expandedArticle3);
      setExpandedArticle3(!expandedArticle3);
    }}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {expandedArticle3 ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
                </div>
              </div>
            </div>
          </section>
          )}
      
          {/* ARTICLE 4 - NATURAL GAS */}
{(!isSharedView || expandedArticle4) && (
          <section id="widowmaker" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>24 January 2026</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>4 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">Trader Diaries</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  
               {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("widowmaker", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "widowmaker" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("widowmaker").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("widowmaker").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("widowmaker").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("widowmaker").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-xs font-medium mb-3 border border-red-800/50">
                      Trading Experience
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      Trading the Widowmaker - Natural Gas
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed ">
                      Trust me you won't know why that name unless you trade it / watch it closely, and so I did. In the below article you will find two names - NATURALGAS (capital.com) and UNG (NYSE ARCA ETP / ETF). UNG tracks NATURALGAS with some error, almost. But the experience I am about to tell you, it didn't.
                      First things first the price of NATURALGAS dances to the tunes of weather forecasts, projected heating days and reported inventory/ withdrawal so far. However, its importance in powering data centers is set to go up as they demand more and more power while nuclear power plants are far away from set up / production. The fundamentals are changing and soon, the price movement might start to reflect them.
                    </p>
                  </div>

                  {expandedArticle4 && (
                    <div className="mt-8 text-gray-300 text-sm leading-relaxed space-y-8">
                      <div className="space-y-4">
                        
                        <p className="leading-relaxed">
                          Now, back to the story. On Dec 30, 2025 (last year), I had some long position in UNG at $13.8 when NATURALGAS was $4.1. LONG story SHORT, it went down below 10 in a matter of roughly 2 weeks, with the underlying falling below $2.8. And I averages / DCA'd like no tomorrow, looking at every support and adding to my position, till I had cash available, bringing me to an average of almost $12 and a deficit of 20%. Then on Monday the 19th, things turned out with forecast of a artic wave emerging and taking NATURALGAS futures 16% higher while UNG wasn't trading on market holiday. The move continued upward on Tuesday but UNG has a gap of about 8% vs the underlying's 2 day performance largely attributed to the way the instrument is structured, they need live markets to make changes to their positioning. Look at below chart to tell the story.
                        </p>
                      </div>

                      {/* First Image with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'chart1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('chart1')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/chart-1.jpg"
                            alt="Natural Gas vs UNG performance chart"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'chart1' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic">Chart 1: Natural gas vs UNG Performance gap / tracking error</p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          Anyhow, I got my breakeven, which was looking a bit far off only a couple days ago, and I didn't want to overstay my welcome, so I didn't. Got out literally at breakeven, coz I didn't want my future wife to be in any danger. Weather forecasts kept worsening over the week and the move kept getting extended. Do I regret not holding more, absolutely not, knowing what I know about natural gas moves now. Do I regret the tracking error - yes, feels like I almost did everything right, but couldn't profit from it. UNG ended the week at $13.97 (almost 40% up).
                        </p>
                        
                        <p className="leading-relaxed">
                          Anyways, sometimes its important to live to fight another day, literally speaking. We have all been raving about silver hitting a $100 and moving 46% since the start of the year. In comparison, NATURALGAS moved up 60%+ in 3 days of the week and then I stopped looking. If you look at the chart, you'd know why its called the widow maker and how it can kill on both sides if you are on the wrong side.
                        </p>
                      </div>

                      {/* Second Image with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'chart2' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('chart2')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/chart-2.jpg"
                            alt="Widowmaker Natural Gas volatility chart"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'chart2' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic">Chart 2: The Widowmaker Natural Gas Volatility</p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          More from the actual markets soon.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show Read More/Less button */}
                 {!isSharedView && (
  <button
    id="article-4-button"
    onClick={() => {
      console.log("🔵 Article 4 button clicked");
      console.log("Current expandedArticle4:", expandedArticle4);
      console.log("Setting to:", !expandedArticle4);
      setExpandedArticle4(!expandedArticle4);
    }}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {expandedArticle4 ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
                </div>
              </div>
            </div>
          </section>
          )}

          {/* ARTICLE 5 - YEAR REVIEW */}
{(!isSharedView || expandedArticle5) && (
          <section id="year-review" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>31 Dec 2025</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>8 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">Year-End Analysis</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("year-review", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "year-review" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("year-review").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("year-review").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("year-review").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("year-review").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-amber-900/30 text-amber-300 rounded-full text-xs font-medium mb-3 border border-amber-800/50">
                      Year in Review
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      Year in Review - The Good, The Bad, The Ugly
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                      I started the year on a wheelchair and it took a while to get going again, 4.5 months to get back to cricket and ironically at the same ground where "tragedy" struck. The markets had their wheelchair moment in April when Trump threw them under the "tariff" bus.
                       As I keep growing, I realize markets are nothing but a reflection of us - our emotions, our fear, our greed and therefore, has very similar events to our life - jubilation (bull run), heart breaks (bear market), flash crash (accident) and then recovery (coz humans are built to do that!)
                        
                    </p>
                  </div>

                  {expandedArticle5 && (
                    <div className="mt-8 text-gray-300 text-base leading-relaxed space-y-8">
                      {/* FULL ARTICLE CONTENT */}
                      <div className="space-y-4">
                        
                        <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                          I bounced back a few weeks post my comeback on the cricket ground and so did the markets. Here's proof of a catch that brought me back from the bottom ;)
                        </p>
                      </div>

                      {/* Video with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-400 ml-2">The Comeback Catch</span>
                        </div>
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredVideo ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredVideo(true)}
                          onMouseLeave={() => setHoveredVideo(false)}
                        >
                          <video
                            controls
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full"
                            poster="/images/year-review-thumbnail.jpg"
                          >
                            <source src="/videos/year_in_review.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          {hoveredVideo && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          And then there was no looking back... well for most markets - US, China, Europe, South Korea, Japan, Taiwan and many others. India and crypto decided to sit out this year - India on rich valuations and lack of direct AI plays & relentless FII selling and crypto - oh boy, that could take long - but here's the TLDR - <strong>$Trump $Melanie Tariffs Oct 10</strong>
                        </p>
                      </div>

                      {/* First Image with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'year1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('year1')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/Picture1.png"
                            alt="Market analysis chart 1"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'year1' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      {/* Second Image with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'year2' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('year2')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/Picture2.png"
                            alt="Market analysis chart 2"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'year2' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-white font-semibold text-lg">Let's dive in deeper</h4>
                        <p className="leading-relaxed">
                          US markets and precious metals celebrated rate cuts, and prospects of rate cuts like no other. Every bad economic news has been celebrated and taken precious metals to new highs, while stocks have slowed down pace to see if indeed OpenAI is gonna crash land the AI story (I believe that's a real risk going into 2026), among others such as US / Venezuela & China / Taiwan.
                        </p>
                        
                        <p className="leading-relaxed">
                          This year has been one for the ages - Stocks and gold/silver rallying together and precious metals outperforming by miles. You could literally buy Silver, Palladium, Platinum or even Gold and laugh at your friends / colleagues trying to find the next multibagger stock or crypto. This also is a stark warning. If risk on risk off assets went up together, they might come down together too. At the time of writing, the precious metals are witnessing sharp reversal from 6 weeks of relentless gains, but still mind blowing returns for the year.
                        </p>
                      </div>

                      {/* Third Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'year3' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('year3')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/Picture3.png"
                            alt="AI stocks performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'year3' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          As Gemini kept making progress, GOOGL kept making new highs taking its ecosystem players with it- Broadcom in particular (till the recent post earnings correction) leading to a divergence in the OpenAI family - Nvidia, AMD, with Oracle and Coreweave being the worst hit.
                        </p>
                      </div>

                      {/* Fourth Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'year4' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('year4')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/Picture4.png"
                            alt="AI ecosystem performance"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'year4' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          But some AI infra stocks continued to break records - memory and storage players - Micron and WD for example.
                        </p>
                      </div>

                      {/* Fifth Image */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'year5' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('year5')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/Picture5.png"
                            alt="Memory and storage stocks"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'year5' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic"></p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          I would really love a big correction in GOOGL so I can get my hands on it again.
                        </p>
                        
                        <h4 className="text-white font-semibold text-lg">Risks and Opportunities for 2026</h4>
                        <p className="leading-relaxed">
                          US market cap to GDP 230%, $70T (don't have the exact figures at the moment). A 20% correction is enough to put the fear of God into anyone. Imagine $14T wipeout, for context, crypto or what's left of it is about $3T. Where would crypto go if that were to happen?
                        </p>
                        
                        <p className="leading-relaxed">
                          I am not seeing much O's at the moment but a lot of R's. But as a trader, those R's materializing would bring O's. So let's talk about some of the Risks:
                        </p>
                        
                        <p className="leading-relaxed">
                          What could make it happen though -
                        </p>
                        
                        <ol className="space-y-3 list-decimal list-inside text-gray-300">
                          <li>Technicals are not favoring further continuation move in SP500 / Nasdaq, without a correction or a consolidation.</li>
                          <li>Majority of US population is not doing well, with the cost of living not receding and job growth slowing down. Other than AI capex, big asset owners are the one driving the economy. A correction in markets could dampen their consumption as well.</li>
                          <li>China / Taiwan. The risk is always lurking. There's no lack of will on China's part. This could be black swan no. 1</li>
                          <li>The Bond Yields - JP10Y, US10Y, 30Y... While US Fed is cutting rates, Bond yields are going higher.</li>
                          <li>If I were to pick another possible black swan - I'd go with - OpenAI and the circular AI economy (Ask oracle going up 40% in a day and then coming down 50%). How will OpenAI pay the $1.5 trillion that it has committed in deals? Gemini's growth accentuates the risk.</li>
                        </ol>
                        
                        <p className="leading-relaxed">
                          We'll see how it goes. But be certain, any risks lead to opportunities. So look forward to it. Happy New Year. Happy Trading.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show Read More/Less button */}
                  {!isSharedView && (
  <button
    id="article-5-button"
    onClick={() => {
      console.log("🔵 Article 5 button clicked");
      console.log("Current expandedArticle5:", expandedArticle5);
      console.log("Setting to:", !expandedArticle5);
      setExpandedArticle5(!expandedArticle5);
    }}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {expandedArticle5 ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
                </div>
              </div>
            </div>
          </section>
          )}

         {/* ARTICLE 6 - ALTSEASON */}
{(!isSharedView || expandedArticle6) && (
          <section id="altseason" className="mb-16">
            <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap border-b border-slate-700/50 pb-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <span>18 Dec 2025</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱</span>
                  <span>5 min read</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="text-cyan-300">AIFinverse Research</span>
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleShareClick("altseason", e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-xs transition-all duration-200"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    
                    {/* Share Options Panel */}
                    {showShare === "altseason" && (
                      <div 
                        className="absolute right-0 top-8 z-50"
                        onClick={handleShareOptionClick}
                      >
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[140px]">
                          <h4 className="text-white font-semibold text-xs mb-2">Share Article</h4>
                          
                          <div className="space-y-1">
                            <a
                              href={getShareLinks("altseason").whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded text-emerald-300 text-xs hover:bg-emerald-900/30 transition-colors"
                            >
                              <img src="/images/whatsapp.png" alt="WhatsApp" className="w-3 h-3" />
                              WhatsApp
                            </a>

                            <a
                              href={getShareLinks("altseason").telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-sky-900/20 border border-sky-800/30 rounded text-sky-300 text-xs hover:bg-sky-900/30 transition-colors"
                            >
                              <img src="/images/telegram.png" alt="Telegram" className="w-3 h-3" />
                              Telegram
                            </a>

                            <a
                              href={getShareLinks("altseason").linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleShareOptionClick}
                              className="flex items-center gap-2 px-2 py-1.5 bg-blue-900/20 border border-blue-800/30 rounded text-blue-300 text-xs hover:bg-blue-900/30 transition-colors"
                            >
                              <img src="/images/linkedin.png" alt="LinkedIn" className="w-3 h-3" />
                              LinkedIn
                            </a>

                            <button
                              onClick={(e) => {
                                handleShareOptionClick(e);
                                navigator.clipboard.writeText(getShareLinks("altseason").copy);
                                setShowShare(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded text-gray-300 text-xs hover:bg-slate-700/40 transition-colors"
                            >
                              <Copy size={12} />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-xs font-medium mb-3 border border-cyan-800/50">
                      Featured Analysis
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      2025: Altseason Was Here — Just Not in Crypto
                    </h3>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                      My God, who would have thought that with US stock markets, precious metals ending the year virtually at a record high,crypto would be underperforming by a mile.After all, it was supposed to be Beta square or cube or octa. Calling it underperforming is being generous, when everything is deep deep red if you compare the prices to January eyes before $Trump and $Melania launched and kinda rugged alts and then added to the misery in April with the unleashing of tariff war and then literally nuked crypto on Oct 10, whoever is to be blamed for it. Most coins are down between 30-99.99%.
                    </p>
                  </div>

                  {expandedArticle6 && (
                    <div className="mt-8 text-gray-300 text-base leading-relaxed space-y-8">
                
                      {/* FULL ARTICLE CONTENT */}
                      <div className="space-y-4">
                        <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                          <strong className="text-gray-300"></strong> 
                        </p>
                      </div>

                      {/* Video with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-400 ml-2">Gold–Silver–Crypto Meme</span>
                        </div>
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredVideo ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredVideo(true)}
                          onMouseLeave={() => setHoveredVideo(false)}
                        >
                          <video
                            controls
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full"
                            poster="/images/video-thumbnail.jpg"
                          >
                            <source src="/videos/gold-silver-crypto-meme.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          {hoveredVideo && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>

                      {/* First Image with hover effect */}
                      <div className="my-8 flex flex-col items-center">
                        <div 
                          className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-2/3 ${
                            hoveredImage === 'image1' ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredImage('image1')}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src="/images/image_1.png"
                            alt="Chart showing crypto vs other assets"
                            className="w-full rounded-lg"
                          />
                          {hoveredImage === 'image1' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic">
                          Chart: Performance comparison
                        </p>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          <strong className="text-gray-300">Santa seemed to have bailed out on crypto too.</strong> If this feels like crypto winter, hang on. Imagine what happens when it becomes risk off ergo stock market actually corrects 10-15-20%, which I see happening in 2026, possibly because of OpenAI.
                        </p>

                        <div className="bg-slate-900/50 border-l-4 border-cyan-500 pl-4 py-3 rounded-r">
                          <p className="leading-relaxed italic">
                            I had written an article months ago, but, there was hope deep inside that if stocks rally, so would crypto,{" "}
                            <a
                              href="https://www.linkedin.com/pulse/dude-wheres-my-alt-season-mohneesh-suri-v7aof/?trackingId=c0IQeFd5RFizmg2dPnyN5g%3D%3D"
                              className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 decoration-2 hover:decoration-cyan-400 transition-all duration-200 font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              "Dude, where's my altseason?"
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          <strong className="text-gray-300">Anyways, credit where its due, the altseason that did happen - in stocks, in commodity.</strong> I am gonna try doing something different and call the asset leads adjacent to their crypto counterparts. Nvidia as Bitcoin, Alphabet as ETH and so on.. Gold as Bitcoin, Silver as ETH and so on and lets see how they performed this year, also adding a comparison from April lows to present.
                        </p>
                      </div>

                      {/* Performance Analysis Section */}
                      <div className="my-8">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <span className="text-green-400">📊</span>
                          Performance Analysis
                        </h4>
                        
                        {/* Paired Images Side by Side */}
                        <div className="space-y-8">
                          {/* Row 1: image11 (small, left) - image_2 (big, right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left - Small image */}
                            <div className="flex items-center justify-center lg:justify-start">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-md ${
                                  hoveredImage === 'image11' ? 'scale-[1.02] shadow-xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image11')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image11.png"
                                  alt="Performance table 11"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image11' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>

                            {/* Right - Big image */}
                            <div className="flex items-center justify-center lg:justify-end">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                                  hoveredImage === 'image_2' ? 'scale-[1.02] shadow-2xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image_2')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image_2.png"
                                  alt="Performance table 2"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image_2' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: image12 (small, left) - image_3 (big, right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left - Small image */}
                            <div className="flex items-center justify-center lg:justify-start">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-md ${
                                  hoveredImage === 'image12' ? 'scale-[1.02] shadow-xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image12')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image12.png"
                                  alt="Performance table 12"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image12' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>

                            {/* Right - Big image */}
                            <div className="flex items-center justify-center lg:justify-end">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                                  hoveredImage === 'image_3' ? 'scale-[1.02] shadow-2xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image_3')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image_3.png"
                                  alt="Performance table 3"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image_3' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 3: image13 (small, left) - image_4 (big, right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left - Small image */}
                            <div className="flex items-center justify-center lg:justify-start">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-md ${
                                  hoveredImage === 'image13' ? 'scale-[1.02] shadow-xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image13')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image13.png"
                                  alt="Performance table 13"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image13' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>

                            {/* Right - Big image */}
                            <div className="flex items-center justify-center lg:justify-end">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                                  hoveredImage === 'image_4' ? 'scale-[1.02] shadow-2xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image_4')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image_4.png"
                                  alt="Performance table 4"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image_4' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 4: image14 (small, left) - image15 (big, right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left - Small image */}
                            <div className="flex items-center justify-center lg:justify-start">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full max-w-md ${
                                  hoveredImage === 'image14' ? 'scale-[1.02] shadow-xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image14')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image14.png"
                                  alt="Performance table 14"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image14' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>

                            {/* Right - Big image */}
                            <div className="flex items-center justify-center lg:justify-end">
                              <div 
                                className={`relative overflow-hidden rounded-lg border border-slate-600 transition-all duration-300 ease-out w-full ${
                                  hoveredImage === 'image15' ? 'scale-[1.02] shadow-2xl shadow-cyan-500/20' : 'scale-100'
                                }`}
                                onMouseEnter={() => setHoveredImage('image15')}
                                onMouseLeave={() => setHoveredImage(null)}
                              >
                                <img
                                  src="/images/image15.png"
                                  alt="Performance table 15"
                                  className="w-full rounded-lg"
                                />
                                {hoveredImage === 'image15' && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="leading-relaxed">
                          <strong className="text-gray-300">While other assets had their moments and tumbles during the year, silver and co. never really looked back after the Apr 7 lows and the way they are closing is far from comforting.</strong> Silver @ $80? Up from $50 to $80 in 5 weeks? Friday, Dec 26 move in excess of 11%? Unbelievable short squeeze is on, and the shorters continue to have a Yaooza moment. If you go by the demand for physical silver, it could keep going but if you go by the technicals, there could be a rug pull waiting. Eventually, all alts correct!
                        </p>
                      </div>
                    </div>
                  )}


{!isSharedView && (
  <button
    id="article-6-button"
    onClick={() => {
      console.log("🔵 Article 6 button clicked");
      console.log("Current expandedArticle6:", expandedArticle6);
      console.log("Setting to:", !expandedArticle6);
      setExpandedArticle6(!expandedArticle6);
    }}
    className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-medium transition-all duration-200 flex items-center gap-2 group"
  >
    {expandedArticle6 ? (
      <>
        <span>Read Less</span>
        <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
      </>
    ) : (
      <>
        <span>Read Full Article</span>
        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
      </>
    )}
  </button>
)}
                </div>
              </div>
            </div>
          </section>
          )}

          {/* ================= FOOTER ================= */}
           {/* FOOTER */}
<footer className="mt-20 py-4 bg-slate-1000/50 text-center text-sm text-slate-500">
  <div className="max-w-7xl mx-auto px-4">
    <div className="mb-4">
      <p className="text-sm text-red-300 font-semibold">
        ⚠️ Disclaimer - Not Financial Advice, Do Your Own Research
      </p>
    </div>
    
    <div className="flex justify-center items-center space-x-6 mb-4">
      <button
        onClick={() => setLocation('/contact')}
        className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors flex items-center gap-2"
      >
        <i className="fas fa-envelope"></i>
        Contact Us
      </button>
      <span className="text-slate-600">|</span>
      <a
        href="/privacy-policy"
        className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors flex items-center gap-2"
      >
        <i className="fas fa-shield-alt"></i>
        Privacy Policy
      </a>
    </div>
    
    <p className="text-sm text-slate-400">
      © 2025 All rights reserved to AIFinverse.
    </p>
  </div>
</footer>
        </main>
      </div>
    </PageWrapper>
  );
}