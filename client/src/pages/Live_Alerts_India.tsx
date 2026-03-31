
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { api } from "@/services/api";
import { 
  Target, 
  Plus, 
  X, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Newspaper, 
  CheckCircle,
  BarChart,
  Search,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock
} from "lucide-react";


// Add this right after your imports
const preloadedData = (() => {
  try {
    const cached = sessionStorage.getItem('india_alerts_cache'); // or 'us_alerts_cache'
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && (Date.now() - parsed.timestamp < 120000)) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
})();

// Define interfaces
interface Company {
  company_name: string;
  base_symbol: string;
}

interface WatchlistItem {
  company_name: string;
  base_symbol: string;
}

export default function Live_Alerts_India() {
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>(preloadedData?.strategies || []);
  const [chatOpen, setChatOpen] = useState(false);
  const [showAddStrategies, setShowAddStrategies] = useState(false);
  const [selectedNewStrategies, setSelectedNewStrategies] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [expandedAlertIndex, setExpandedAlertIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(!preloadedData); // Only loading if no cache
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(preloadedData?.watchlist || []);
  const [searchAlertQuery, setSearchAlertQuery] = useState("");
  
  // User market and strategies from registration
  const [userMarket, setUserMarket] = useState<string | null>(null);
  const [marketMismatch, setMarketMismatch] = useState(false);
  const [showMarketRedirect, setShowMarketRedirect] = useState(false);
  
  // States for stock selection
  const [showStockList, setShowStockList] = useState(false);
  const [indiaStocks, setIndiaStocks] = useState<Company[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  
  const [, setLocation] = useLocation();

  // States for dynamic alerts
  const [alertsData, setAlertsData] = useState<any[]>(preloadedData?.centerAlerts || []);
  const [archivedAlerts, setArchivedAlerts] = useState<any[]>(preloadedData?.archivedGroups || []);
  const [expandedArchivedAlert, setExpandedArchivedAlert] = useState<number | null>(null);
  
  // NEW STATE to store ALL today's alerts
  const [allTodayAlerts, setAllTodayAlerts] = useState<any[]>(preloadedData?.allToday || []);
  
  // NEW STATES for archived alerts pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [showArchivedDetails, setShowArchivedDetails] = useState<boolean>(false);
  const [selectedArchivedAlert, setSelectedArchivedAlert] = useState<any>(null);
  
  // Add this state for archive search
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>("");
  
  // Add this state for filtered archive groups
  const [filteredArchiveGroups, setFilteredArchiveGroups] = useState<any[]>([]);

  // Add this at the very top of your component (after useState declarations)
const [cachedData, setCachedData] = useState(() => {
  const saved = sessionStorage.getItem('india_alerts_cache'); // or 'us_alerts_cache'
  if (saved) {
    try {
      return JSON.parse(saved); // Just return it, timestamp check happens in useEffect
    } catch (e) {}
  }
  return null;
});

// bot new 

  // AlertBot states
  const [chatInput, setChatInput] = useState("");
   const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
  const [alertBotData, setAlertBotData] = useState<any>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [lifoFilter, setLifoFilter] = useState('ALL');
  const [patFilter, setPatFilter] = useState('ALL');
  const [patSearch, setPatSearch] = useState('');
  const [activePanel, setActivePanel] = useState<string | null>(null);



  // Add this helper function to get the correct AlertBot URL
// Add this helper function to get the correct AlertBot URL
const getAlertBotUrl = () => {
  // In production, use relative path through Nginx proxy
  if (import.meta.env.PROD) {
    return '/alertbot';  // ✅ CORRECT - This will use HTTPS through your domain
  }
  // In development, use the proxy
  return '/alertbot';
};
   
    // Fetch AlertBot data
     
  const fetchAlertBotData = async () => {
  try {
    const alertBotUrl = getAlertBotUrl();
    const response = await fetch(`${alertBotUrl}/api/alerts`);
    if (response.ok) {
      const data = await response.json();
      setAlertBotData(data);
      return data;
    }
  } catch (error) {
    console.error("Failed to fetch alert data:", error);
  }
  return null;
};

 
  // Send initial greeting when chat opens
   useEffect(() => {
  if (chatOpen && chatMessages.length === 0) {
    const getInitialGreeting = async () => {
      setIsChatLoading(true);
      try {
        const alertBotUrl = getAlertBotUrl();
        const response = await fetch(`${alertBotUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: [{ role: "user", content: "Hello" }] 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const greeting = data.reply || "Hello! How can I help you?";
          setChatMessages([{ role: "assistant", content: greeting }]);
        } else {
          setChatMessages([{ 
            role: "assistant", 
            content: "👋 Hello! I'm AlertBot. Ask me about stocks, alerts, or market data." 
          }]);
        }
      } catch (error) {
        console.error("Failed to get greeting:", error);
        setChatMessages([{ 
          role: "assistant", 
          content: "👋 Hello! I'm AlertBot. Ask me about stocks, alerts, or market data." 
        }]);
      } finally {
        setIsChatLoading(false);
      }
    };
    
    getInitialGreeting();
  }
}, [chatOpen]);
  

    // Send message to backend
     const sendChatMessage = async () => {
  if (!chatInput.trim() || isChatLoading) return;
  
  const userMessage = { role: "user", content: chatInput };
  setChatMessages(prev => [...prev, userMessage]);
  setChatInput("");
  setIsChatLoading(true);
  
  try {
    const messagesToSend = [...chatMessages, userMessage];
    const alertBotUrl = getAlertBotUrl();
    const response = await fetch(`${alertBotUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messagesToSend })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get response");
    }
    
    const data = await response.json();
    const aiResponse = data.reply || "No response received.";
    
    setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    
    // Refresh data after chat
    await fetchAlertBotData();
    
  } catch (error) {
    console.error("Chat error:", error);
    setChatMessages(prev => [...prev, { 
      role: "assistant", 
      content: "⚠️ Network error. Please try again." 
    }]);
  } finally {
    setIsChatLoading(false);
  }
};

   const sendQuickQuestion = (question: string) => {
    setChatInput(question);
    setTimeout(() => sendChatMessage(), 100);
  };

  

  // END New bot










  // 🔒 Registration check (simple & safe)
  const isRegistered = !!localStorage.getItem("userProfile");

  useEffect(() => {
    if (!isRegistered) {
      alert("Please register first to access India Live Alerts");
      setLocation("/registration");
    }
  }, [isRegistered, setLocation]);

  // Update filtered stocks when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStocks(indiaStocks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = indiaStocks.filter(stock => 
        stock.company_name.toLowerCase().includes(query) ||
        stock.base_symbol.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered);
    }
  }, [searchQuery, indiaStocks]);

  // Load India stocks when modal opens
  useEffect(() => {
    const loadIndiaStocks = async () => {
      try {
        const response = await api.get("/companies/india");
        setIndiaStocks(response.data.companies);
        setFilteredStocks(response.data.companies);
      } catch (error) {
        console.error("Error loading India stocks:", error);
        // Fallback to sample data if API fails
        const sampleStocks: Company[] = [
          { company_name: "Reliance Industries Limited", base_symbol: "RELIANCE" },
          { company_name: "Tata Consultancy Services Limited", base_symbol: "TCS" },
          { company_name: "HDFC Bank Limited", base_symbol: "HDFCBANK" },
          { company_name: "Infosys Limited", base_symbol: "INFY" },
          { company_name: "ICICI Bank Limited", base_symbol: "ICICIBANK" },
          { company_name: "State Bank of India", base_symbol: "SBIN" },
          { company_name: "ITC Limited", base_symbol: "ITC" },
          { company_name: "Bharti Airtel Limited", base_symbol: "BHARTIARTL" },
          { company_name: "Larsen & Toubro Limited", base_symbol: "LT" },
          { company_name: "Kotak Mahindra Bank Limited", base_symbol: "KOTAKBANK" },
          { company_name: "Tata Steel Limited", base_symbol: "TATASTEEL" }
        ];
        setIndiaStocks(sampleStocks);
        setFilteredStocks(sampleStocks);
      }
    };
    
    if (showStockList) {
      loadIndiaStocks();
      // Clear previous selections when modal opens
      setSelectedStocks([]);
    }
  }, [showStockList]);

  // Open modal if user types a valid stock
  useEffect(() => {
    if (searchAlertQuery.trim().length >= 2) {
      const isStockMatch = indiaStocks.some(
        stock => stock.base_symbol.toLowerCase() === searchAlertQuery.toLowerCase() ||
                 stock.company_name.toLowerCase().includes(searchAlertQuery.toLowerCase())
      );
      
      if (isStockMatch && !showStockList) {
        setShowStockList(true);
        setSearchQuery(searchAlertQuery);
      }
    }
  }, [searchAlertQuery, indiaStocks, showStockList]);


  // Add this with your other useEffects (around line 80-90)
useEffect(() => {
  // Preload critical data as soon as component mounts
  const preloadData = async () => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) return;
      
      const profile = JSON.parse(userProfile);
      const userId = profile.userId;
      
      if (userId) {
        // Start loading data immediately (don't wait for result)
        Promise.all([
          api.get(`/users/${userId}`).catch(() => null),
          api.get("/alerts/live/india").catch(() => null),
          api.get("/alerts/history/india").catch(() => null)
        ]).then(([userData, liveAlerts, historyAlerts]) => {
          // Store in sessionStorage for quick access
          if (userData?.data) {
            sessionStorage.setItem('india_user_preload', JSON.stringify(userData.data));
          }
        });
      }
    } catch (error) {
      // Silently fail - this is just preloading
    }
  };
  
  preloadData();
}, []);



  // Toggle stock selection in modal
  const toggleStockSelection = (companyName: string) => {
    setSelectedStocks(prev =>
      prev.includes(companyName)
        ? prev.filter(name => name !== companyName)
        : [...prev, companyName]
    );
  };

  // ============================================
// FIXED: Use IST for date comparison to match India backend
// Center: MAX 10 alerts from TODAY only (newest first)
// Archive: All older alerts + excess today alerts beyond first 10
// ============================================
const splitAlertsIntoCenterAndArchive = (allAlerts: any[]) => {
  // Get current date in IST
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Get IST date string (YYYY-MM-DD)
  const todayIST = istTime.toISOString().split('T')[0];
  
  
  
  // Log ALL alerts with their dates
  
  allAlerts.forEach((alert, index) => {
    
  });
  
  // Check what dates we have
  const dates = allAlerts.map(a => a.date);
  const uniqueDates = [...new Set(dates)];
  
  
  // Separate by date (compare with IST date)
  const todayAlerts = allAlerts.filter(alert => alert.date === todayIST);
  const olderAlerts = allAlerts.filter(alert => alert.date !== todayIST);
  
  
  
  // Check for duplicates within todayAlerts
  const seen = new Set();
  const duplicates = [];
  todayAlerts.forEach(alert => {
    const key = `${alert.stock}-${alert.timestamp}`;
    if (seen.has(key)) {
      duplicates.push(alert);
    }
    seen.add(key);
  });
  
  
  if (duplicates.length > 0) {
    console.log("   Duplicate examples:", duplicates.slice(0, 3).map(d => ({
      stock: d.stock,
      timestamp: d.timestamp,
      time: d.time
    })));
  }
  
  // Sort and remove duplicates
  const sortedTodayAlerts = [...todayAlerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Manual duplicate removal
  const uniqueTodayAlerts = [];
  const seenKeys = new Set();
  
  for (const alert of sortedTodayAlerts) {
    const key = `${alert.stock}-${alert.timestamp}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueTodayAlerts.push(alert);
    } else {
      console.log(`   🗑️ Removing duplicate: ${alert.stock} at ${alert.time}`);
    }
  }
  
  
  
  const centerAlerts = uniqueTodayAlerts.slice(0, 10);
  const excessTodayAlerts = uniqueTodayAlerts.slice(10);
  
  
  
  return { 
    centerAlerts, 
    archiveAlerts: [...olderAlerts, ...excessTodayAlerts] 
  };
};

  // Add this helper function RIGHT AFTER the splitAlertsIntoCenterAndArchive function
  // Helper function to remove duplicates
  const removeDuplicates = (alerts: any[]) => {
    const seen = new Set();
    return alerts.filter(alert => {
      // Create a unique key using stock and timestamp (rounded to minute)
      const timestamp = new Date(alert.timestamp || 0);
      timestamp.setSeconds(0, 0); // Round to nearest minute
      const key = `${alert.stock}-${timestamp.getTime()}`;
      
      if (seen.has(key)) {
        
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Handle adding stocks
  const handleAddStocks = async () => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).userId : null;

      if (!userId) {
        alert("Please log in first");
        return;
      }

      if (selectedStocks.length === 0) {
        alert("Please select at least one stock");
        return;
      }

      // Check India market limit (from backend API - 20 per market)
      const indiaCount = watchlist.length;
      const totalAfterAdd = indiaCount + selectedStocks.length;
      
      if (totalAfterAdd > 20) {
        alert(`India watchlist limit exceeded. You can only add ${20 - indiaCount} more stocks.`);
        return;
      }

      // Filter out stocks that are already in watchlist
      const newStocksToAdd = selectedStocks.filter(companyName => 
        !watchlist.some(item => item.company_name === companyName)
      );

      if (newStocksToAdd.length === 0) {
        alert("Selected stocks are already in your watchlist");
        return;
      }

      // Call the /watchlist/update endpoint
      await api.post("/watchlist/update", {
        user_id: userId,
        companies: newStocksToAdd
      });

      // Update local state
      const addedStocks = newStocksToAdd.map(companyName => {
        const stock = indiaStocks.find(s => s.company_name === companyName);
        return stock || { company_name: companyName, base_symbol: companyName.split(' ')[0] };
      });
      
      const updatedWatchlist = [...watchlist, ...addedStocks];
      setWatchlist(updatedWatchlist);
      setSelectedStocks([]);
      setShowStockList(false);
      setSearchQuery("");
      setSearchAlertQuery("");
      
      alert(`Successfully added ${newStocksToAdd.length} stock(s) to India watchlist!`);
      
      // Refresh watchlist from backend to ensure sync
      await refreshWatchlistFromBackend();
      
      // AFTER adding stocks, refresh BOTH archive AND live alerts with the new watchlist
      const watchlistSymbols = updatedWatchlist.map(item => item.base_symbol);
      
      
      // Fetch ALL alerts in PARALLEL
const [momentumAlertsData, archivedAlertsData] = await Promise.all([
  fetchMomentumAlerts(),
  fetchArchivedAlerts()
]);
      
      // 2. Filter only watchlist stocks
      const watchlistLiveAlerts = momentumAlertsData.filter(alert => 
        watchlistSymbols.includes(alert.stock)
      );
      
      const watchlistArchived = archivedAlertsData.filter(alert => 
        watchlistSymbols.includes(alert.stock)
      );
      
      // 3. Combine all alerts
      const allAlerts = [...watchlistLiveAlerts, ...watchlistArchived];
      
      // 4. Split into center and archive (NOW WITH CORRECT LOGIC)
      const { centerAlerts, archiveAlerts } = splitAlertsIntoCenterAndArchive(allAlerts);
      
      // 5. Group archive alerts by date
      const groupedByDate = archiveAlerts.reduce((groups: any, alert) => {
        const date = alert.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(alert);
        return groups;
      }, {});
      
      // Convert to array and sort by date
      const groupedArray = Object.entries(groupedByDate)
        .map(([date, alerts]) => ({ 
          date, 
          alerts: (alerts as any[]).sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAlertsData(centerAlerts);
      setArchivedAlerts(groupedArray);
      setAllTodayAlerts(watchlistLiveAlerts); // Store all live alerts for future use
      
    } catch (error: any) {
      console.error("Add stocks error:", error);
      alert(error.response?.data?.detail || "Error adding stocks to watchlist");
    }
  };

  // Refresh watchlist from backend
  const refreshWatchlistFromBackend = async () => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).userId : null;
      
      if (userId) {
        const response = await api.get(`/users/${userId}`);
        const userData = response.data;
        
        if (userData.watchlist && userData.watchlist.India) {
          setWatchlist(userData.watchlist.India);
          
          
          // Also refresh archive alerts with new watchlist
          const watchlistSymbols = userData.watchlist.India.map((item: WatchlistItem) => item.base_symbol);
          
          // Fetch all alerts
          const momentumAlertsData = await fetchMomentumAlerts();
          const archivedAlertsData = await fetchArchivedAlerts();
          
          // Filter only watchlist stocks
          const watchlistLiveAlerts = momentumAlertsData.filter(alert => 
            watchlistSymbols.includes(alert.stock)
          );
          
          const watchlistArchived = archivedAlertsData.filter(alert => 
            watchlistSymbols.includes(alert.stock)
          );
          
          // Combine all alerts
          const allAlerts = [...watchlistLiveAlerts, ...watchlistArchived];
          
          // Split into center and archive (USING UPDATED FUNCTION)
          const { centerAlerts, archiveAlerts } = splitAlertsIntoCenterAndArchive(allAlerts);
          
          // Group archive alerts by date
          const groupedByDate = archiveAlerts.reduce((groups: any, alert) => {
            const date = alert.date;
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(alert);
            return groups;
          }, {});
          
          // Convert to array and sort by date
          const groupedArray = Object.entries(groupedByDate)
            .map(([date, alerts]) => ({ 
              date, 
              alerts: (alerts as any[]).sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setAlertsData(centerAlerts);
          setArchivedAlerts(groupedArray);
          setAllTodayAlerts(watchlistLiveAlerts); // Store all live alerts for future use
        }
      }
    } catch (error) {
      console.error("Error refreshing watchlist:", error);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (companyName: string, symbol: string) => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).userId : null;
      
      if (!userId) {
        alert("Please log in first");
        return;
      }
      
      // Use /watchlist/modify/india for removal
      await api.post("/watchlist/modify/india", {
        user_id: userId,
        companies: [companyName],
        action: "remove"
      });
      
      // Update local state
      setWatchlist(prev => prev.filter(item => item.company_name !== companyName));
      
      alert(`Removed ${symbol} from watchlist`);
      
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);
      alert(error.response?.data?.detail || "Error removing stock from watchlist");
    }
  };

  // Generate hardcoded alerts with dynamic timestamps
  const generateHardcodedAlerts = () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000);
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60000);
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60000);
    const twoHoursAgo = new Date(now.getTime() - 120 * 60000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60000);

    return [
      { 
        stock: "RELIANCE", 
        type: "Momentum Riders (52-week High/Low, All-Time High/Low)",
        price: "₹2,850.45",
        change: "+1.24%",
        rsi: "68.2",
        rsiStatus: "OVERBOUGHT",
        news: "https://economictimes.indiatimes.com/reliance-industries-ltd/stocks/companyid-13215.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ARELIANCE",
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Momentum Riders (52-week High/Low, All-Time High/Low)",
        date: now.toISOString().split('T')[0],
        description: "Reliance Industries showing strong momentum with breakout above ₹2,800 level.",
        volume: "15.2M",
        marketCap: "₹19.2T",
        timestamp: now.toISOString()
      },
      { 
        stock: "TCS", 
        type: "Cycle Count Reversal",
        price: "₹3,845.60",
        change: "-0.56%",
        rsi: "42.8",
        rsiStatus: "NEUTRAL",
        news: "https://economictimes.indiatimes.com/tata-consultancy-services-ltd/stocks/companyid-13440.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ATCS",
        time: fifteenMinAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Cycle Count Reversal",
        date: fifteenMinAgo.toISOString().split('T')[0],
        description: "TCS showing cycle reversal pattern after 5 days of decline.",
        volume: "8.7M",
        marketCap: "₹14.1T",
        timestamp: fifteenMinAgo.toISOString()
      },
      { 
        stock: "HDFCBANK", 
        type: "Swing Trade",
        price: "₹1,725.30",
        change: "-0.34%",
        rsi: "35.2",
        rsiStatus: "OVERSOLD",
        news: "https://economictimes.indiatimes.com/hdfc-bank-ltd/stocks/companyid-11624.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3AHDFCBANK",
        time: thirtyMinAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Swing Trade",
        date: thirtyMinAgo.toISOString().split('T')[0],
        description: "HDFC Bank oversold with RSI below 40. Support at ₹1,700 level.",
        volume: "22.5M",
        marketCap: "₹10.8T",
        timestamp: thirtyMinAgo.toISOString()
      },
      { 
        stock: "ITC", 
        type: "Topping Candle - Bottoming Candle (Contrabets)",
        price: "₹445.50",
        change: "-0.85%",
        rsi: "28.7",
        rsiStatus: "OVERSOLD",
        news: "https://economictimes.indiatimes.com/itc-ltd/stocks/companyid-11715.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3AITC",
        time: oneHourAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Topping Candle - Bottoming Candle (Contrabets)",
        date: oneHourAgo.toISOString().split('T')[0],
        description: "ITC showing bottoming candle pattern with long lower wick.",
        volume: "18.9M",
        marketCap: "₹5.2T",
        timestamp: oneHourAgo.toISOString()
      },
      { 
        stock: "INFY", 
        type: "Mean Reversion",
        price: "₹1,645.80",
        change: "+2.18%",
        rsi: "72.5",
        rsiStatus: "OVERBOUGHT",
        news: "https://economictimes.indiatimes.com/infosys-ltd/stocks/companyid-11706.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3AINFY",
        time: twoHoursAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Mean Reversion",
        date: twoHoursAgo.toISOString().split('T')[0],
        description: "Infosys overbought with RSI > 70. Mean reversion expected.",
        volume: "12.3M",
        marketCap: "₹6.8T",
        timestamp: twoHoursAgo.toISOString()
      },
      { 
        stock: "ICICIBANK", 
        type: "Pattern Formation",
        price: "₹1,045.75",
        change: "+1.82%",
        rsi: "58.6",
        rsiStatus: "NEUTRAL",
        news: "https://economictimes.indiatimes.com/icici-bank-ltd/stocks/companyid-11626.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3AICICIBANK",
        time: yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Pattern Formation",
        date: yesterday.toISOString().split('T')[0],
        description: "ICICI Bank forming bullish flag pattern.",
        volume: "25.1M",
        marketCap: "₹7.3T",
        timestamp: yesterday.toISOString()
      },
      { 
        stock: "SBIN", 
        type: "Fundamental Picks (Earnings Season focused)",
        price: "₹625.40",
        change: "+0.92%",
        rsi: "48.3",
        rsiStatus: "NEUTRAL",
        news: "https://economictimes.indiatimes.com/state-bank-of-india/stocks/companyid-11645.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ASBIN",
        time: yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Fundamental Picks (Earnings Season focused)",
        date: yesterday.toISOString().split('T')[0],
        description: "SBI ahead of earnings: NII expected to grow 15% YoY.",
        volume: "32.8M",
        marketCap: "₹5.6T",
        timestamp: yesterday.toISOString()
      },
      { 
        stock: "BHARTIARTL", 
        type: "Momentum Riders (52-week High/Low, All-Time High/Low)",
        price: "₹1,285.60",
        change: "+2.45%",
        rsi: "71.3",
        rsiStatus: "OVERBOUGHT",
        news: "https://economictimes.indiatimes.com/bharti-airtel-ltd/stocks/companyid-11671.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ABHARTIARTL",
        time: twoDaysAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Momentum Riders (52-week High/Low, All-Time High/Low)",
        date: twoDaysAgo.toISOString().split('T')[0],
        description: "Bharti Airtel at 52-week high on tariff hike expectations.",
        volume: "14.2M",
        marketCap: "₹7.1T",
        timestamp: twoDaysAgo.toISOString()
      },
      { 
        stock: "LT", 
        type: "Cycle Count Reversal",
        price: "₹3,485.20",
        change: "-1.23%",
        rsi: "44.5",
        rsiStatus: "NEUTRAL",
        news: "https://economictimes.indiatimes.com/larsen-toubro-ltd/stocks/companyid-12939.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ALT",
        time: twoDaysAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Cycle Count Reversal",
        date: twoDaysAgo.toISOString().split('T')[0],
        description: "L&T showing cycle reversal pattern with decreasing volume.",
        volume: "6.8M",
        marketCap: "₹4.9T",
        timestamp: twoDaysAgo.toISOString()
      },
      { 
        stock: "TATASTEEL", 
        type: "Mean Reversion",
        price: "₹145.80",
        change: "-2.34%",
        rsi: "29.8",
        rsiStatus: "OVERSOLD",
        news: "https://economictimes.indiatimes.com/tata-steel-ltd/stocks/companyid-11877.cms",
        chart: "https://in.tradingview.com/chart/?symbol=NSE%3ATATASTEEL",
        time: threeDaysAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST",
        strategy: "Mean Reversion",
        date: threeDaysAgo.toISOString().split('T')[0],
        description: "Tata Steel oversold with RSI below 30. Potential bounce back.",
        volume: "45.6M",
        marketCap: "₹1.8T",
        timestamp: threeDaysAgo.toISOString()
      },
    ];
  };

  const hardcodedAlerts = generateHardcodedAlerts();

  // Define available strategies for Add More Strategies
  const allStrategies = [
    "Momentum Riders (52-week High/Low, All-Time High/Low)",
    "Cycle Count Reversal",
    "Swing Trade",
    "Topping Candle - Bottoming Candle (Contrabets)",
    "Mean Reversion",
    "Pattern Formation",
    "Fundamental Picks (Earnings Season focused)"
  ];


  
    
    
  // Function to fetch momentum alerts from API
  const fetchMomentumAlerts = async () => {
    try {
      const momentumResponse = await api.get("/alerts/live/india");
      
      
      if (momentumResponse.data && Array.isArray(momentumResponse.data.alerts)) {
        return momentumResponse.data.alerts.map((alert: any) => {
          // Handle stock symbol with .NS suffix
          let stockSymbol = alert.symbol || alert.stock || 'N/A';
          // Remove .NS suffix if present for matching
          const cleanSymbol = stockSymbol.replace('.NS', '');
          
          return {
            stock: cleanSymbol, // Store without .NS for matching
            originalSymbol: stockSymbol,
            symbol: alert.symbol,
            type: "Momentum Riders (52-week High/Low, All-Time High/Low)",
            price: alert.price ? `₹${typeof alert.price === 'number' ? alert.price.toFixed(2) : alert.price}` : "N/A",
            change: alert.pct_change !== undefined 
              ? `${alert.pct_change > 0 ? '+' : ''}${typeof alert.pct_change === 'number' ? alert.pct_change.toFixed(2) : alert.pct_change}%` 
              : "0%",
            rsi: alert.rsi ? (typeof alert.rsi === 'number' ? alert.rsi.toFixed(2) : alert.rsi) : "50",
            rsiStatus: getRsiStatusFromValue(alert.rsi || 50),
            news: alert.news_link ? extractUrlFromMarkdown(alert.news_link) : '#',
            chart: alert.tradingview_link ? extractUrlFromMarkdown(alert.tradingview_link) : '#',
            time: alert.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            strategy: "Momentum Riders (52-week High/Low, All-Time High/Low)",
            date: alert.date || new Date().toISOString().split('T')[0],
            timestamp: alert.timestamp || new Date().toISOString(),
            description: alert.description || `${cleanSymbol} triggered a 52-week high momentum alert with RSI ${alert.rsi?.toFixed(2) || 'N/A'}.`,
            marketCap: alert.marketCap || "N/A",
            trigger: alert.trigger || "52WH"
          };
        });
      }
    } catch (error) {
      console.error("Error calling momentum API:", error);
    }
    return [];
  };

  // Function to fetch archived alerts from history API
  const fetchArchivedAlerts = async () => {
    try {
      const response = await api.get("/alerts/history/india");
      
      
      // Handle different possible response structures
      let alertsArray = [];
      
      if (response.data && Array.isArray(response.data)) {
        alertsArray = response.data;
      } else if (response.data && Array.isArray(response.data.alerts)) {
        alertsArray = response.data.alerts;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        alertsArray = response.data.data;
      }
      
      if (alertsArray.length > 0) {
        return alertsArray.map((alert: any) => {
          // Handle stock symbol with .NS suffix
          let stockSymbol = alert.symbol || alert.stock || 'N/A';
          // Remove .NS suffix if present for matching
          const cleanSymbol = stockSymbol.replace('.NS', '');
          
          return {
            stock: cleanSymbol, // Store without .NS for matching
            originalSymbol: stockSymbol, // Keep original if needed
            type: alert.type || alert.strategy || "Momentum Riders (52-week High/Low, All-Time High/Low)",
            price: alert.price ? `₹${typeof alert.price === 'number' ? alert.price.toFixed(2) : alert.price}` : "N/A",
            change: alert.pct_change !== undefined 
              ? `${alert.pct_change > 0 ? '+' : ''}${typeof alert.pct_change === 'number' ? alert.pct_change.toFixed(2) : alert.pct_change}%` 
              : "0%",
            rsi: alert.rsi ? (typeof alert.rsi === 'number' ? alert.rsi.toFixed(2) : alert.rsi) : "50",
            rsiStatus: getRsiStatusFromValue(alert.rsi || 50),
            news: alert.news_link ? extractUrlFromMarkdown(alert.news_link) : '#',
            chart: alert.tradingview_link ? extractUrlFromMarkdown(alert.tradingview_link) : '#',
            time: alert.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            strategy: alert.strategy || alert.type || "Momentum Riders (52-week High/Low, All-Time High/Low)",
            date: alert.date || new Date().toISOString().split('T')[0],
            timestamp: alert.timestamp || alert.created_at || new Date().toISOString(),
            description: alert.description || 
                        (alert.trigger 
                          ? `${cleanSymbol} triggered a ${alert.trigger} momentum alert${alert.rsi ? ` with RSI ${typeof alert.rsi === 'number' ? alert.rsi.toFixed(2) : alert.rsi}` : ''}.`
                          : `${cleanSymbol} triggered an alert.`),
            marketCap: alert.marketCap || "N/A",
            trigger: alert.trigger || "ALERT"
          };
        });
      }
    } catch (error) {
      console.error("Error calling archived alerts API:", error);
    }
    return [];
  };

  // Filter archive groups based on watchlist stocks AND search query
  useEffect(() => {
    const watchlistSymbols = watchlist.map(item => item.base_symbol);
    
    const watchlistArchivedAlerts = archivedAlerts
      .map(group => ({
        date: group.date,
        alerts: group.alerts.filter((alert: any) => 
          watchlistSymbols.includes(alert.stock) || 
          (alert.originalSymbol && watchlistSymbols.includes(alert.originalSymbol.replace('.NS', '')))
        )
      }))
      .filter(group => group.alerts.length > 0);
    
    if (!archiveSearchQuery.trim()) {
      setFilteredArchiveGroups(watchlistArchivedAlerts);
    } else {
      const query = archiveSearchQuery.toLowerCase();
      const filtered = watchlistArchivedAlerts
        .map(group => ({
          date: group.date,
          alerts: group.alerts.filter((alert: any) => 
            alert.stock.toLowerCase().includes(query) ||
            (alert.originalSymbol && alert.originalSymbol.toLowerCase().includes(query))
          )
        }))
        .filter(group => group.alerts.length > 0);
      
      setFilteredArchiveGroups(filtered);
    }
  }, [archiveSearchQuery, archivedAlerts, watchlist]);

  // ============================================
  // MAIN LOAD FUNCTION - Load watchlist and alerts
  // ============================================
  useEffect(() => {
  const loadUserPreferences = async () => {
    try {
      // 🔥 Check cache first
      if (cachedData) {
        
        setWatchlist(cachedData.watchlist || []);
        setAlertsData(cachedData.centerAlerts || []);
        setArchivedAlerts(cachedData.archivedGroups || []);
        setAllTodayAlerts(cachedData.allToday || []);
        setSelectedAlertTypes(cachedData.strategies || []);
        setIsLoading(false);
        return; // ⭐ SKIP all API calls!
      }
      
      
      
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        setIsLoading(false);
        return;
      }
      
      const profile = JSON.parse(userProfile);
      const userEmail = profile.email || localStorage.getItem("userEmail");
      
      if (!userEmail) {
        console.error("No user email found");
        setIsLoading(false);
        return;
      }
      
      const savedMarket = localStorage.getItem('selectedMarket') || profile.selectedMarket || "India";
      setUserMarket(savedMarket);
      
      const userId = profile.userId || profile.user_id || localStorage.getItem("userId");
      
      
      // Load ALL data in PARALLEL
let userWatchlist: WatchlistItem[] = [];
let momentumAlertsData: any[] = [];
let archivedAlertsData: any[] = [];
let userData: any = null;

if (userId) {
  try {
    // Run all API calls simultaneously
    const [userResponse, momentumResponse, archivedResponse] = await Promise.all([
      api.get(`/users/${userId}`).catch(() => ({ data: null })),
      fetchMomentumAlerts().catch(() => []),
      fetchArchivedAlerts().catch(() => [])
    ]);
    
    userData = userResponse.data;
    momentumAlertsData = momentumResponse;
    archivedAlertsData = archivedResponse;
    
    if (userData?.watchlist?.India) {
      userWatchlist = userData.watchlist.India;
      setWatchlist(userWatchlist);
      console.log("✅ India watchlist loaded:", userWatchlist.length, "items");
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
}
      
      let indiaStrategies: string[] = [];
      let centerAlerts: any[] = [];
      let groupedArray: any[] = [];
      let watchlistLiveAlerts: any[] = [];
      
      if (userId) {
        try {
          const hasIndiaAccess = userData?.market_preferences?.India?.is_active || 
                              userData?.india_alerts?.is_active || 
                              savedMarket === "India" || 
                              savedMarket === "Both";

          if (!hasIndiaAccess) {
            setMarketMismatch(true);
            setTimeout(() => {
              setShowMarketRedirect(true);
            }, 1000);
            setIsLoading(false);
            return;
          }
          
          if (userData.india_alerts && userData.india_alerts.strategies) {
            indiaStrategies = userData.india_alerts.strategies;
            
            if (Array.isArray(indiaStrategies)) {
              
              
              localStorage.setItem("alertPreferencesIndia", JSON.stringify(indiaStrategies));
              setSelectedAlertTypes(indiaStrategies);
              
              // Get watchlist symbols
              const watchlistSymbols = userWatchlist.map(item => item.base_symbol);
              
              // If no watchlist stocks, show empty
              if (watchlistSymbols.length === 0) {
                setAlertsData([]);
                setArchivedAlerts([]);
                setIsLoading(false);
                return;
              }
              
              // Fetch ALL alerts
              const momentumAlertsData = await fetchMomentumAlerts();
              const archivedAlertsData = await fetchArchivedAlerts();
              
              
              
              // Filter only watchlist stocks
              watchlistLiveAlerts = momentumAlertsData.filter(alert => 
                watchlistSymbols.includes(alert.stock)
              );
              
              const watchlistArchived = archivedAlertsData.filter(alert => 
                watchlistSymbols.includes(alert.stock)
              );
              
              
              
              // Combine all alerts
              const allAlerts = [...watchlistLiveAlerts, ...watchlistArchived];
              
              // Split into center and archive
              const { centerAlerts: center, archiveAlerts } = splitAlertsIntoCenterAndArchive(allAlerts);
              centerAlerts = center;
              
              // Group archive alerts by date
              const groupedByDate = archiveAlerts.reduce((groups: any, alert) => {
                const date = alert.date;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(alert);
                return groups;
              }, {});
              
              // Convert to array and sort by date
              groupedArray = Object.entries(groupedByDate)
                .map(([date, alerts]) => ({ 
                  date, 
                  alerts: (alerts as any[]).sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )
                }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              setAlertsData(centerAlerts);
              setArchivedAlerts(groupedArray);
              setAllTodayAlerts(watchlistLiveAlerts);
              
              // ✅ SAVE TO CACHE - AFTER all data is ready
              const dataToCache = {
                watchlist: userWatchlist,
                centerAlerts: centerAlerts,
                archivedGroups: groupedArray,
                allToday: watchlistLiveAlerts,
                strategies: indiaStrategies,
                timestamp: Date.now()
              };
              
              sessionStorage.setItem('india_alerts_cache', JSON.stringify(dataToCache));
              setCachedData(dataToCache);
              
              setIsLoading(false);
              return;
            }
          }
        } catch (backendError) {
          
        }
      }
      
      // Fallback to localStorage if backend fails
      const savedIndiaPrefs = localStorage.getItem("alertPreferencesIndia");
      
      if (savedIndiaPrefs) {
        try {
          const parsed = JSON.parse(savedIndiaPrefs);
          if (Array.isArray(parsed)) {
            indiaStrategies = parsed;
            setSelectedAlertTypes(parsed);
            
            const watchlistSymbols = userWatchlist.map(item => item.base_symbol);
            
            if (watchlistSymbols.length === 0) {
              setAlertsData([]);
              setArchivedAlerts([]);
              setIsLoading(false);
              return;
            }
            
            // Use hardcoded alerts as fallback
            const filteredAlerts = hardcodedAlerts.filter(alert => 
              parsed.includes(alert.type)
            );
            
            const watchlistOnlyAlerts = filteredAlerts.filter(alert => 
              watchlistSymbols.includes(alert.stock)
            );
            
            // Split into center and archive
            const { centerAlerts: center, archiveAlerts } = splitAlertsIntoCenterAndArchive(watchlistOnlyAlerts);
            centerAlerts = center;
            
            // Group archive alerts by date
            const groupedByDate = archiveAlerts.reduce((groups: any, alert) => {
              const date = alert.date;
              if (!groups[date]) {
                groups[date] = [];
              }
              groups[date].push(alert);
              return groups;
            }, {});
            
            groupedArray = Object.entries(groupedByDate)
              .map(([date, alerts]) => ({ date, alerts }))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setAlertsData(centerAlerts);
            setArchivedAlerts(groupedArray);
            
            // ✅ SAVE TO CACHE
            const dataToCache = {
              watchlist: userWatchlist,
              centerAlerts: centerAlerts,
              archivedGroups: groupedArray,
              allToday: watchlistOnlyAlerts,
              strategies: indiaStrategies,
              timestamp: Date.now()
            };
            
            sessionStorage.setItem('india_alerts_cache', JSON.stringify(dataToCache));
            setCachedData(dataToCache);
            
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing localStorage:", error);
        }
      }
      
      // Default fallback
      const watchlistSymbols = userWatchlist.map(item => item.base_symbol);
      
      if (watchlistSymbols.length === 0) {
        setAlertsData([]);
        setArchivedAlerts([]);
        setIsLoading(false);
        return;
      }
      
      const watchlistOnlyAlerts = hardcodedAlerts.filter(alert => 
        watchlistSymbols.includes(alert.stock)
      );
      
      // Split into center and archive
      const { centerAlerts: center, archiveAlerts } = splitAlertsIntoCenterAndArchive(watchlistOnlyAlerts);
      centerAlerts = center;
      
      // Group archive alerts by date
      const groupedByDate = archiveAlerts.reduce((groups: any, alert) => {
        const date = alert.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(alert);
        return groups;
      }, {});
      
      groupedArray = Object.entries(groupedByDate)
        .map(([date, alerts]) => ({ date, alerts }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAlertsData(centerAlerts);
      setArchivedAlerts(groupedArray);
      
      // ✅ SAVE TO CACHE
      const dataToCache = {
        watchlist: userWatchlist,
        centerAlerts: centerAlerts,
        archivedGroups: groupedArray,
        allToday: watchlistOnlyAlerts,
        strategies: indiaStrategies,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('india_alerts_cache', JSON.stringify(dataToCache));
      setCachedData(dataToCache);
      
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error loading preferences:", error);
      setAlertsData([]);
      setArchivedAlerts([]);
      setIsLoading(false);
    }
  };
  
  loadUserPreferences();
}, []); // Add cachedData to dependency array




  // Handle market redirect
  const handleMarketRedirect = () => {
    if (userMarket === 'US') {
      setLocation('/live-alerts-us');
    } else {
      setLocation('/registration');
    }
  };

  // Handle adding new strategies
  const handleAddStrategies = async () => {
    if (selectedNewStrategies.length === 0) {
      alert("Please select at least one strategy to add");
      return;
    }

    try {
      const userProfile = localStorage.getItem("userProfile");
      const userEmail = userProfile ? JSON.parse(userProfile).email : null;
      
      if (!userEmail) {
        alert("Please log in first");
        return;
      }

      let currentStrategies: string[] = [];
      const savedIndiaPrefs = localStorage.getItem("alertPreferencesIndia");
      
      if (savedIndiaPrefs) {
        try {
          const parsed = JSON.parse(savedIndiaPrefs);
          if (Array.isArray(parsed)) {
            currentStrategies = parsed;
          }
        } catch (error) {
          console.error("Error parsing alertPreferencesIndia:", error);
        }
      }
      
      const mergedStrategies = [...new Set([...currentStrategies, ...selectedNewStrategies])];

      const isMomentumSelected = mergedStrategies.includes("Momentum Riders (52-week High/Low, All-Time High/Low)");
      
      let momentumAlertsData = [];
      
      if (isMomentumSelected) {
        momentumAlertsData = await fetchMomentumAlerts();
      }
      
      setSelectedAlertTypes(mergedStrategies);
      localStorage.setItem("alertPreferencesIndia", JSON.stringify(mergedStrategies));
      
      for (const strategy of selectedNewStrategies) {
        try {
          await api.put("/update/preferences", {
            email: userEmail.toLowerCase(),
            market: "India",
            strategy: strategy,
            action: "add"
          });
          
        } catch (error: any) {
          console.error(`❌ Failed to add strategy "${strategy}":`, error.response?.data || error.message);
        }
      }

      // Refresh data
      await refreshWatchlistFromBackend();
      
      alert(`${selectedNewStrategies.length} strategy(ies) added successfully!`);
      setSelectedNewStrategies([]);
      setShowAddStrategies(false);
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Error adding strategies. Please try again.");
    }
  };

  // Handle remove strategy
  const handleRemoveStrategy = async (strategyToRemove: string) => {
    
    
    if (!confirm(`Are you sure you want to remove "${strategyToRemove}" alerts?`)) {
      return;
    }
    
    setIsRemoving(strategyToRemove);
    
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userEmail = userProfile ? JSON.parse(userProfile).email : null;
      
      if (!userEmail) {
        alert("Please log in first");
        setIsRemoving(null);
        return;
      }
      
      await api.put("/update/preferences", {
        email: userEmail.toLowerCase(),
        market: "India",
        strategy: strategyToRemove,
        action: "remove"
      });
      
      const updatedStrategies = selectedAlertTypes.filter(strategy => strategy !== strategyToRemove);
      setSelectedAlertTypes(updatedStrategies);
      localStorage.setItem("alertPreferencesIndia", JSON.stringify(updatedStrategies));
      
      // Refresh data
      await refreshWatchlistFromBackend();
      
      window.dispatchEvent(new Event('storage'));
      alert(`✓ "${strategyToRemove}" alerts have been removed!`);
      setIsRemoving(null);
      
    } catch (error: any) {
      console.error("Error in handleRemoveStrategy:", error);
      alert(`❌ Failed to remove strategy: ${error.response?.data?.detail || error.message}`);
      setIsRemoving(null);
    }
  };

  const toggleNewStrategy = (strategy: string) => {
    setSelectedNewStrategies(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const availableStrategies = allStrategies.filter(
    strategy => !selectedAlertTypes.includes(strategy)
  );

  // ✅ Show ONLY alerts for watchlist stocks - already filtered
  const filteredAlerts = alertsData;

  // Clear archive search
  const clearArchiveSearch = () => {
    setArchiveSearchQuery("");
  };

  // Format date for archive display (Thu 12/2/2026)
  const formatArchiveDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00+05:30'); // Parse as IST
  return date.toLocaleDateString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    weekday: 'short', 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

  // Handle clicking on archive date
  const handleArchiveDateClick = (date: string, alerts: any[]) => {
    setSelectedArchivedAlert({
      type: 'date',
      date: date,
      alerts: alerts
    });
    setShowArchivedDetails(true);
  };

  // Refresh function
  const handleRefresh = async () => {
    try {
      await refreshWatchlistFromBackend();
      alert(`Refreshed! Found ${archivedAlerts.reduce((total, group) => total + group.alerts.length, 0)} archived alerts for your watchlist`);
    } catch (error) {
      console.error("Error refreshing:", error);
      alert("Error refreshing preferences");
    }
  };

  // Handle archived alert click
  const handleArchivedAlertClick = (dateIndex: number, alertIndex: number) => {
    const alertKey = `${dateIndex}-${alertIndex}`;
    setExpandedArchivedAlert(expandedArchivedAlert === alertKey ? null : alertKey);
  };

  
  // Handle view all archived alerts
// Handle view all archived alerts
const handleViewAllArchived = () => {
  const allArchivedAlerts = filteredArchiveGroups.flatMap(group => 
    group.alerts.map((alert: any) => ({
      stock: alert.stock || 'N/A',
      type: alert.type || 'N/A',
      price: alert.price || '₹0.00',
      change: alert.change || '0%',
      rsi: alert.rsi || '50',
      news: alert.news || '#',
      chart: alert.chart || '#',
      time: alert.time || 'N/A',
      strategy: alert.strategy || 'N/A',
      date: alert.date || group.date || new Date().toISOString().split('T')[0],
      description: alert.description || `${alert.stock || 'Stock'} triggered ${alert.trigger === 'ATH' || alert.trigger === 'ATL' ? 'an' : 'a'} ${formatTriggerText(alert.trigger)} alert with RSI ${alert.rsi || 'N/A'}.`,
      marketCap: alert.marketCap || 'N/A',
      timestamp: alert.timestamp || new Date().toISOString(),
      trigger: alert.trigger || 'ALERT'
    }))
  );
  
  setSelectedArchivedAlert({
    type: 'all',
    alerts: allArchivedAlerts
  });
  setShowArchivedDetails(true);
};


  // Close archived details
  const handleCloseArchivedDetails = () => {
    setShowArchivedDetails(false);
    setSelectedArchivedAlert(null);
  };

  // Get RSI status color
  const getRsiColor = (status: string) => {
    switch(status) {
      case "OVERBOUGHT": return "text-red-400";
      case "OVERSOLD": return "text-green-400";
      case "NEUTRAL": return "text-yellow-400";
      default: return "text-slate-400";
    }
  };

  // Get RSI background color
  const getRsiBgColor = (status: string) => {
    switch(status) {
      case "OVERBOUGHT": return "bg-red-500/20";
      case "OVERSOLD": return "bg-green-500/20";
      case "NEUTRAL": return "bg-yellow-500/20";
      default: return "bg-slate-500/20";
    }
  };

  // Helper function to get RSI status from value
const getRsiStatusFromValue = (rsiValue: number) => {
  if (rsiValue >= 70) return "OVERBOUGHT";
  if (rsiValue <= 30) return "OVERSOLD";
  return "NEUTRAL";
};

// Helper function to format trigger for display - ADD THIS NEW FUNCTION
const formatTriggerText = (trigger: string) => {
  if (!trigger) return 'momentum';
  
  const triggerMap: { [key: string]: string } = {
    '52WH': '52-Week High',
    '52WL': '52-Week Low',
    'ATH': 'All-Time High',
    'ATL': 'All-Time Low',
    'MOM': 'Momentum',
    'RSI_OB': 'RSI Overbought',
    'RSI_OS': 'RSI Oversold',
    'VOL_SPIKE': 'Volume Spike',
    'BREAKOUT': 'Breakout',
    'PULLBACK': 'Pullback'
  };
  
  return triggerMap[trigger] || trigger;
};

// Helper function to extract URL from markdown format
const extractUrlFromMarkdown = (markdown: string) => {
  if (!markdown) return '#';
  
  // Check if it's in [title](url) format
  const match = markdown.match(/\[.*?\]\((.*?)\)/);
  if (match && match[1]) {
    return match[1]; // Return the URL part
  }
  
  // If it's already a plain URL, return as is
  return markdown;
};

  // India Telegram subscribe function
  const handleTelegramSubscribe = () => {
    alert("Telegram will open. Please click START in the bot to subscribe for India alerts.");
    window.open("https://t.me/AIFinverseIndBot?start=subscribe_india", "_blank");
  };

  if (!isRegistered) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading India Alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950/95 via-blue-950/80 to-slate-950/95 bg-[url('/images/login.png')] bg-cover bg-center bg-fixed bg-blend-darken">
      <Navbar />

      {/* MARKET MISMATCH ALERT */}
      {marketMismatch && showMarketRedirect && (
        <div className="fixed top-20 left-0 right-0 z-50 px-4">
          <div className="max-w-7xl mx-auto bg-gradient-to-r from-amber-900/90 to-yellow-900/80 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-amber-300">Market Access Required!</h3>
                  <p className="text-sm text-amber-200">
                    You selected <span className="font-bold">{userMarket}</span> market, 
                    but you're trying to access <span className="font-bold">India</span> alerts.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleMarketRedirect}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600"
                >
                  {userMarket === 'US' ? 'Go to US Alerts' : 'Select Market'}
                </Button>
                <Button
                  onClick={() => setShowMarketRedirect(false)}
                  variant="outline"
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-900/30"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 px-4 max-w-7xl mx-auto">
        {/* HEADING SECTION */}
        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
              <img src="/images/india.png" alt="India Flag" className="w-10 h-10" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold">India Live Alerts</h1>
              <p className="text-slate-400">Real-time alerts for Indian market stocks</p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="col-span-12 md:col-span-3 space-y-6">
            {/* ALERT TYPES SECTION */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Active Alert Types</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    {selectedAlertTypes.length} active
                  </span>
                  <button
                    onClick={handleRefresh}
                    className="text-xs text-slate-400 hover:text-white transition"
                    title="Refresh data"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {selectedAlertTypes.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No alert types selected</p>
                  <p className="text-xs text-slate-500 mt-1">Add strategies below to get India alerts</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedAlertTypes.map((type) => (
                      <div 
                        key={type} 
                        className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group min-h-[60px]"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-[13px] text-cyan-300 font-medium leading-tight">
                            {type}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStrategy(type)}
                          disabled={isRemoving === type}
                          className={`opacity-70 hover:opacity-100 text-xs px-2 py-1 rounded transition-all ${
                            isRemoving === type 
                              ? "bg-slate-600 text-slate-400 cursor-not-allowed" 
                              : "bg-red-500/30 text-red-300 hover:bg-red-500/40"
                          }`}
                          title={`Remove ${type} alerts`}
                        >
                          {isRemoving === type ? "..." : <X className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400">
                      Click <X className="w-3 h-3 inline ml-1" /> to remove any alert type
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ADD STRATEGIES SECTION */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-5 space-y-4">
              {!showAddStrategies ? (
                <>
                  <Button
                    onClick={() => setShowAddStrategies(true)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold hover:from-cyan-600 hover:to-green-600 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Strategies
                  </Button>
                  
                  {selectedAlertTypes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 text-center">
                        These strategies apply to India market only
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Add New Strategies</h3>
                    <button
                      onClick={() => setShowAddStrategies(false)}
                      className="text-sm text-slate-400 hover:text-white transition"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  {availableStrategies.length > 0 ? (
                    <>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableStrategies.map((strategy) => (
                          <div
                            key={strategy}
                            onClick={() => toggleNewStrategy(strategy)}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              selectedNewStrategies.includes(strategy)
                                ? "bg-cyan-500/20 border border-cyan-500/40"
                                : "bg-slate-700/50 hover:bg-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                selectedNewStrategies.includes(strategy)
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-slate-500"
                              }`}>
                                {selectedNewStrategies.includes(strategy) && (
                                  <div className="w-2 h-2 bg-white rounded-sm" />
                                )}
                              </div>
                              <span className="text-sm font-medium">{strategy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAddStrategies}
                          disabled={selectedNewStrategies.length === 0}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm hover:from-green-600 hover:to-emerald-600"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add {selectedNewStrategies.length > 0 ? `(${selectedNewStrategies.length})` : ''}
                        </Button>
                        <Button
                          onClick={() => setShowAddStrategies(false)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 text-sm hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-cyan-400" />
                      </div>
                      <p className="text-cyan-300 text-sm font-medium">All strategies selected!</p>
                      <p className="text-slate-400 text-xs mt-1">You're receiving alerts for all strategies</p>
                      <Button
                        onClick={() => setShowAddStrategies(false)}
                        variant="outline"
                        className="w-full mt-4 border-slate-600 text-slate-300 text-sm hover:bg-slate-700"
                      >
                        Back to Alerts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ARCHIVED ALERTS - WITH SEARCH */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-5">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Archived Alerts</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      {filteredArchiveGroups.reduce((total, group) => total + group.alerts.length, 0)} alerts
                    </span>
                    {filteredArchiveGroups.length > 0 && (
                      <Button
                        onClick={handleViewAllArchived}
                        className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-1 rounded-full"
                      >
                        View All
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Archive Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Company / Symbol..."
                      value={archiveSearchQuery}
                      onChange={(e) => setArchiveSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-8 py-2 focus:border-cyan-500 focus:outline-none text-sm"
                    />
                    {archiveSearchQuery && (
                      <button
                        onClick={clearArchiveSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {archiveSearchQuery && (
                    <p className="text-xs text-cyan-400 mt-2">
                      Showing alerts for "{archiveSearchQuery}" in your watchlist
                    </p>
                  )}
                </div>
                
                {/* Archive Groups - Show dates with alert counts */}
                {filteredArchiveGroups.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-400">
                      {watchlist.length === 0 
                        ? 'Add stocks to your watchlist to see archived alerts'
                        : archiveSearchQuery 
                          ? 'No alerts found for this symbol in your watchlist'
                          : 'No archived alerts for your watchlist stocks'}
                    </p>
                    {archiveSearchQuery && watchlist.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">Try a different symbol</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {filteredArchiveGroups.map((group, dateIndex) => {
                        const today = new Date().toISOString().split('T')[0];
                        const isToday = group.date === today;
                        
                        return (
                          <div key={dateIndex} className="space-y-2">
                            <button
                              onClick={() => handleArchiveDateClick(group.date, group.alerts)}
                              className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="text-sm font-medium text-cyan-400">
                                {formatArchiveDate(group.date)}
                                {isToday && <span className="ml-2 text-xs text-yellow-400"></span>}
                              </span>
                              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                {group.alerts.length}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* CENTER ALERTS - SHOW ONLY TODAY'S ALERTS (MAX 10) */}
          <section className="col-span-12 md:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {watchlist.length > 0 
                      ? 'Your Watchlist Alerts'
                      : 'Your Watchlist Alerts'}
                  </h2>
                  {watchlist.length > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
  {new Date().toLocaleDateString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  })}
</div>
</div>

              {watchlist.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-2">No alerts for your watchlist</p>
                  <p className="text-sm text-slate-500">
                    Create watchlist to get personalised alerts
                  </p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-2">No alerts for your watchlist</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                    >
                      <div 
                        className="p-5 flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedAlertIndex(expandedAlertIndex === index ? null : index)}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-xl">{alert.stock}</span>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded">NSE/BSE</span>
                          </div>
                          <p className="text-xs text-slate-400">🇮🇳 Indian Market • {alert.time}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-medium text-lg">{alert.type}</span>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-slate-400">Live Alert</p>
                            <div className="ml-2">
                              {expandedAlertIndex === index ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {expandedAlertIndex === index && (
  <div className="px-5 pb-5 border-t border-slate-700 pt-4 animate-fadeIn">
    <div className="mb-4">
      <h4 className="font-bold text-lg mb-3">
        ALERT STRATEGY: {alert.strategy}
        {/* Add trigger badge */}
        {alert.trigger && (
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {alert.trigger}
          </span>
        )}
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Stock: {alert.stock} (India)</p>
          <p className="text-xl font-bold">{alert.price}</p>
          <p className={`text-sm ${alert.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {alert.change}
          </p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">RSI</p>
          <p className="text-xl font-bold">{alert.rsi}</p>
          <p className="text-xs text-slate-400 mt-1">Relative Strength Index</p>
        </div>
      </div>
    </div>

    <div className="mb-4">
  <p className="font-medium mb-2">Analysis:</p>
  <p className="text-sm text-slate-300 bg-slate-800/30 p-3 rounded">
    {alert.stock} triggered {alert.trigger === 'ATH' || alert.trigger === 'ATL' ? 'an' : 'a'} {formatTriggerText(alert.trigger)} alert with RSI {alert.rsi}.
  </p>
</div>

    <div className="space-y-3">
      <a
        href={alert.chart}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <BarChart className="w-4 h-4" />
        <span className="text-sm font-medium">TradingView Chart</span>
        <ExternalLink className="w-3 h-3 ml-auto" />
      </a>
      
      <a
        href={alert.news}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Newspaper className="w-4 h-4" />
        <span className="text-sm font-medium">Latest News & Analysis</span>
        <ExternalLink className="w-3 h-3 ml-auto" />
      </a>
    </div>
  </div>
)}
                     
                    </div>
                  ))}
                  
                  {/* Show message if there are more today's alerts in archive */}
                  {allTodayAlerts.length > 10 && (
                    <div className="text-center text-xs text-cyan-400/70 py-2">
                      + {allTodayAlerts.length - 10} more today's alerts in archive
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="col-span-12 md:col-span-3 space-y-6">
            
            {/* WATCHLIST SECTION */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your Watchlist</h3>
                <span className="text-xs text-slate-500">{watchlist.length}/20</span>
              </div>
              
              {/* Search Bar for Watchlist - Now opens modal when clicked */}
              <div className="mb-4">
                <div className="relative cursor-pointer" onClick={() => setShowStockList(true)}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Company / Symbol..."
                    value={searchAlertQuery}
                    onChange={(e) => {
                      setSearchAlertQuery(e.target.value);
                      // If user types at least 2 characters, open the modal with search
                      if (e.target.value.length >= 2) {
                        setShowStockList(true);
                        setSearchQuery(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 focus:border-cyan-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Single Add Stocks Button */}
              <Button 
                onClick={() => setShowStockList(true)}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-black font-semibold mb-6"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Stocks
              </Button>

              {/* Watchlist Items */}
              <div 
                className="space-y-2 overflow-y-auto pr-1" 
                style={{ 
                  maxHeight: watchlist.length > 6 ? '400px' : 'auto',
                  transition: 'max-height 0.3s ease'
                }}
              >
                {watchlist.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <Star className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No stocks in watchlist</p>
                    <p className="text-xs text-slate-500 mt-1">Add up to 20 India stocks</p>
                  </div>
                ) : (
                  watchlist.map((stock) => (
                    <div 
                      key={stock.base_symbol} 
                      
                    >
                    </div>
                  ))
                )}
              </div>
              
              {watchlist.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400 text-center">
                    {watchlist.length} of 20 stocks added
                  </p>
                </div>
              )}
            </div>

            {/* TELEGRAM & SUBSCRIBE SECTION */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl p-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                  <img 
                    src="/images/telegram.png" 
                    alt="Telegram" 
                    className="w-10 h-10"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">Subscribe to Alerts</h3>
                <p className="text-sm text-slate-400">Get instant notifications via Telegram</p>
              </div>
          
              {/* Two Buttons Stacked */}
              <div className="space-y-3">
                <Button
                  onClick={handleTelegramSubscribe}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-m text-black font-bold flex items-center justify-center"
                >
                  <div className="flex items-center gap-2">
                    Market Alerts (700+ Stocks)
                  </div>
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      // First open Telegram bot
                      window.open("https://t.me/AIFinverseWatchlistBot?start=start", "_blank");
                      
                      // Get user ID from localStorage
                      const userProfile = localStorage.getItem("userProfile");
                      const userId = userProfile ? JSON.parse(userProfile).userId : null;
                      
                      if (!userId) {
                        console.error("No user ID found");
                        return;
                      }

                      // Call the webhook API with the user ID in the request body
                      const response = await fetch('https://api.aifinverse.com/telegram/webhook/watchlist', {
                        method: 'POST',
                        headers: {
                          'accept': 'application/json',
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: userId })
                      });

                      if (response.ok) {
                        
                      } else {
                        console.error("Failed to register watchlist subscription");
                      }
                    } catch (error) {
                      console.error("Error calling watchlist webhook:", error);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 text-m text-black font-bold flex items-center justify-center"
                >
                  <div className="flex items-center gap-2">
                    Watchlist Alerts (20)
                  </div>
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Activation is completed inside Telegram
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ARCHIVED ALERT DETAILS MODAL - EXACT SAME STYLE AS CENTER ALERT EXPANDED VIEW */}
      {showArchivedDetails && selectedArchivedAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="font-bold text-xl text-cyan-400">
                  {selectedArchivedAlert.type === 'date' 
                    ? formatArchiveDate(selectedArchivedAlert.date)
                    : `Watchlist Archive ${archiveSearchQuery ? `- "${archiveSearchQuery}"` : ''}`}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedArchivedAlert.alerts.length} alert{selectedArchivedAlert.alerts.length !== 1 ? 's' : ''} from your watchlist
                </p>
              </div>
              <button 
                onClick={handleCloseArchivedDetails}
                className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedArchivedAlert.alerts.map((alert: any, index: number) => (
  <div 
    key={index}
    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300 group overflow-hidden"
  >
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-xl text-cyan-400">{alert.stock}</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">NSE/BSE</span>
            {/* Add trigger badge */}
            {alert.trigger && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                {alert.trigger}
              </span>
            )}
          </div>
          <h4 className="font-bold text-lg mb-3">
            ALERT STRATEGY: {alert.strategy}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-cyan-400 font-medium">{alert.type}</span>
          <p className="text-xs text-slate-400 mt-1">{alert.date} • {alert.time}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Stock: {alert.stock} (India)</p>
          <p className="text-xl font-bold">{alert.price}</p>
          <p className={`text-sm ${alert.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {alert.change}
          </p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">RSI</p>
          <p className="text-xl font-bold">{alert.rsi}</p>
          <p className="text-xs text-slate-400 mt-1">Relative Strength Index</p>
        </div>
      </div>

      <div className="mb-4">
  <p className="font-medium mb-2">Analysis:</p>
  <p className="text-sm text-slate-300 bg-slate-800/30 p-3 rounded">
    {alert.stock} triggered {alert.trigger === 'ATH' || alert.trigger === 'ATL' ? 'an' : 'a'} {formatTriggerText(alert.trigger)} alert with RSI {alert.rsi}.
  </p>
</div>

      <div className="space-y-3">
        <a
          href={alert.chart}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <BarChart className="w-4 h-4" />
          <span className="text-sm font-medium">TradingView Chart</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </a>
        
        <a
          href={alert.news}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Newspaper className="w-4 h-4" />
          <span className="text-sm font-medium">Latest News & Analysis</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </a>
      </div>
    </div>
  </div>
))}
                 
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-700 flex justify-end bg-slate-900 sticky bottom-0">
              <Button
                onClick={handleCloseArchivedDetails}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:from-cyan-600 hover:to-blue-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STOCK SELECTION MODAL */}
      {showStockList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Add Stocks</h3>
              </div>
              <button 
                onClick={() => {
                  setShowStockList(false);
                  setSearchQuery("");
                  setSelectedStocks([]);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 border-b border-slate-700">
              <input 
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mb-2 focus:border-cyan-500 focus:outline-none"
                placeholder="Search Company / Symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {filteredStocks.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No stocks found</p>
                  <p className="text-sm text-slate-500">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStocks.map(stock => {
                    const inWatchlist = watchlist.some(item => item.company_name === stock.company_name);
                    const isSelected = selectedStocks.includes(stock.company_name);
                    
                    return (
                      <div 
                        key={stock.base_symbol}
                        onClick={() => !inWatchlist && toggleStockSelection(stock.company_name)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          inWatchlist 
                            ? "bg-slate-900/50 opacity-50 cursor-not-allowed border-slate-700" 
                            : isSelected
                            ? "bg-cyan-500/20 border-cyan-500/40"
                            : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-cyan-400 truncate">{stock.base_symbol}</p>
                            <p className="text-xs text-slate-400 truncate">{stock.company_name}</p>
                          </div>
                          <div className="ml-2">
                            {inWatchlist ? (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                Added
                              </span>
                            ) : isSelected ? (
                              <div className="w-5 h-5 bg-cyan-500 rounded flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 border border-slate-500 rounded"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm">
                    Selected: <span className="font-bold text-cyan-400">{selectedStocks.length}</span> stocks
                  </p>
                  <p className="text-xs text-slate-500">
                    Total after add: {watchlist.length + selectedStocks.length}/20
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedStocks([]);
                      setSearchQuery("");
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleAddStocks}
                    disabled={selectedStocks.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                  >
                    Add {selectedStocks.length} Stock(s)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI BOT */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <img
          src="/images/bot2.png"
          alt="AI Assistant"
          className="w-30 h-30 object-contain drop-shadow-lg"
        />
      </button>

            {/* CHAT BOX */}
            {/* CHAT BOX */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl z-50 border border-cyan-500/20 flex flex-col overflow-hidden" style={{ height: '500px' }}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white">AryaBot</h3>
                <p className="text-xs text-cyan-400">AIFinverse</p>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)} 
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Area - FIXED RENDERING */}
          <div 
            ref={chatMessagesRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ height: 'calc(100% - 120px)' }}
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
  <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  </div>
)}
                <div
                  className={`rounded-xl px-3 py-2 max-w-[85%] text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-700/50 text-slate-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div 
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>')
                          .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1 rounded text-xs">$1</code>')
                          .replace(/\n/g, '<br/>')
                          .replace(/•/g, '<span class="text-cyan-400 mr-1">•</span>')
                      }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                {msg.role === 'user' && (
  <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
)}
              </div>
            ))}
                       {isChatLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-slate-700/50 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/30">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => sendQuickQuestion("Show latest LIFO alerts")}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition"
              >
                ⚡ LIFO
              </button>
              <button
                onClick={() => sendQuickQuestion("Performance summary")}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition"
              >
                📊 Performance
              </button>
              <button
                onClick={() => sendQuickQuestion("Show top fractal support levels")}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition"
              >
                🔷 Fractal S/R
              </button>
              <button
                onClick={() => sendQuickQuestion("Where can I check earnings and TTM PE?")}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition"
              >
                💰 Earnings
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isChatLoading && chatInput.trim()) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Ask about stocks, levels, alerts..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
                            <button
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
              >
                {isChatLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}





      
      {/* FOOTER */}
      <footer className="mt-20 py-4 bg-slate-1000/50 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-2 py-1 text-center">
          <div className="mb-4">
            <p className="text-sm text-red-300 font-semibold">
              ⚠️ Disclaimer - Not Financial Advice, Do Your Own Research
            </p>
          </div>
          
          <p className="text-sm text-slate-400">
            © 2025 All rights reserved to AIFinverse.{" | "}
            <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 hover:underline ml-1">
              Privacy Policy
            </a>
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
