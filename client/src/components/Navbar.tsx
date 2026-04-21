import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";

/**
 * Navbar Component
 * Shows user's first letter after login, shows person icon before login
 */

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userInitial, setUserInitial] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    const authToken = localStorage.getItem("authToken");
    
    setIsLoggedIn(!!authToken);
    
    // Only try to get user initial if logged in
    if (authToken) {
      let initial = null;
      
      // Try multiple sources in order:
      
      // 1. Check userName first (from Login)
      const userName = localStorage.getItem("userName");
      if (userName && userName.length > 0) {
        // Get first letter of first name
        const firstName = userName.split(' ')[0];
        if (firstName.length > 0) {
          initial = firstName.charAt(0).toUpperCase();
        }
      }
      
      // 2. Check userProfile (from Registration)
      if (!initial) {
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
          try {
            const parsed = JSON.parse(userProfile);
            if (parsed.firstName && parsed.firstName.length > 0) {
              initial = parsed.firstName.charAt(0).toUpperCase();
            } else if (parsed.email && parsed.email.length > 0) {
              initial = parsed.email.charAt(0).toUpperCase();
            }
          } catch (e) {
            console.error("Error parsing user profile", e);
          }
        }
      }
      
      // 3. Check userEmail as last resort
      if (!initial) {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail && userEmail.length > 0) {
          // Get first letter of email username (before @)
          const emailUsername = userEmail.split('@')[0];
          if (emailUsername.length > 0) {
            initial = emailUsername.charAt(0).toUpperCase();
          }
        }
      }
      
      // 4. If logged in but no name found, use first letter of email from auth
      if (!initial) {
        // Try to get email from localStorage
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
          initial = storedEmail.charAt(0).toUpperCase();
        }
      }
      
      setUserInitial(initial);
      
      console.log("🔄 Navbar user initial check:");
      console.log("  - isLoggedIn:", true);
      console.log("  - userName:", localStorage.getItem("userName"));
      console.log("  - userEmail:", localStorage.getItem("userEmail"));
      console.log("  - userProfile:", localStorage.getItem("userProfile"));
      console.log("  - initial set to:", initial);
    } else {
      // Not logged in, clear the initial
      setUserInitial(null);
      console.log("🔄 Navbar: User not logged in, showing person icon");
    }
    
  }, [location]); // Re-run when location changes

  const handleNavigation = (path: string, label: string) => {
    if (!isLoggedIn) {
      // If not logged in, redirect to login
      sessionStorage.setItem('redirectAfterLogin', path);
      setLocation("/login");
    } else {
      // If logged in, check if user has premium access
      
      
      // NEW CODE (check registration instead of premium):
if (["/live-alerts-india", "/live-alerts-us"].includes(path)) {
  // Check if registration is complete (both steps)
  const registrationComplete = localStorage.getItem("registrationComplete") === "true";
  const selectedMarket = localStorage.getItem("selectedMarket");
  
  console.log("🔒 Alert page access check:", {
    path,
    registrationComplete,
    selectedMarket,
    isLoggedIn
  });
  
  if (!isLoggedIn) {
    // Not logged in - go to login
    sessionStorage.setItem('redirectAfterLogin', path);
    setLocation("/login");
  } else if (!registrationComplete) {
    // Logged in but registration not complete - go to registration
    console.log("Registration not complete, redirecting to registration");
    setLocation("/register");
  } else if (path === "/live-alerts-india" && selectedMarket === "US") {
    // Wrong market - redirect to correct market
    console.log("User selected US market, redirecting to US alerts");
    setLocation("/live-alerts-us");
  } else if (path === "/live-alerts-us" && selectedMarket === "India") {
    // Wrong market - redirect to correct market
    console.log("User selected India market, redirecting to India alerts");
    setLocation("/live-alerts-india");
  } else {
    // All checks passed - allow access
    console.log("✅ User authorized for", path);
    setLocation(path);
  }
} else {
  // Non-alert route - allow access
  setLocation(path);
}
    }
  };

  const handleStandardNavigation = (path: string) => {
    setLocation(path);
  };

  const navItems = [
    { 
      label: "Home", 
      path: "/home", 
      isPremium: false 
    },
    { 
      label: "Live Alerts India", 
      path: "/live-alerts-india", 
      isPremium: true 
    },
    { 
      label: "Live Alerts US", 
      path: "/live-alerts-us", 
      isPremium: true 
    },
    { 
      label: "Portfolio", 
      path: "/portfolio", 
      isPremium: false,
      comingSoon: true  
    },
    { 
      label: "Market Insights", 
      path: "/newsletter", 
      isPremium: false 
    },
    { 
      label: "About us", 
      path: "/about", 
      isPremium: false 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userName");
    // DON'T remove userPlan on logout - keep premium access
    setIsLoggedIn(false);
    setUserInitial(null); // Clear the initial on logout
    setLocation("/");
  };

  // Helper function to render profile circle
  const renderProfileCircle = (size: 'small' | 'large' = 'large') => {
    const isSmall = size === 'small';
    
    if (isLoggedIn && userInitial) {
      // Show first letter after login
      return (
        <div className={`
          ${isSmall ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-lg'}
          rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 
          flex items-center justify-center text-white font-bold 
          shadow-lg hover:from-cyan-600 hover:to-blue-600 
          transition-all duration-200 hover:scale-105
        `}>
          {userInitial}
        </div>
      );
    } else {
      // Show person icon before login
      return (
        <div className={`
          ${isSmall ? 'w-8 h-8' : 'w-9 h-9'}
          rounded-full bg-gradient-to-r from-slate-600 to-slate-700 
          flex items-center justify-center text-white
          shadow-lg hover:from-slate-700 hover:to-slate-800 
          transition-all duration-200 hover:scale-105
        `}>
          <User className={isSmall ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      );
    }
  };

  // NEW: Check if we are currently on the login page
  const isLoginPage = location === "/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto pl-2 pr-4 sm:pl-4 sm:pr-6 lg:pl-6 lg:pr-8">
        <div className="flex items-center h-16">

          {/* LEFT: Logo + Beta */}
          <div className="flex items-center space-x-2">
            <img
              src="/images/icon.png"
              alt="Aifinverse Logo"
              className="h-40 w-40 object-contain cursor-pointer"
              onClick={() => setLocation("/home")}
            />

            {/* Beta Badge */}
            <div className="relative">
              <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md shadow-lg">
                BETA
              </span>
              <div className="absolute inset-0 bg-cyan-500/20 blur-sm rounded-md -z-10"></div>
            </div>
          </div>
          
          {/* CONDITIONAL RENDERING: Hide everything else if on Login Page */}
          {!isLoginPage && (
            <>
              {/* CENTER: Desktop Navigation */}
<div className="hidden md:flex flex-1 justify-center space-x-1">
  {navItems.map((item) => (
    <button
      key={item.path}
      onClick={() => {
        if (item.isPremium) {
          handleNavigation(item.path, item.label);
        } else {
          handleStandardNavigation(item.path);
        }
      }}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex flex-col items-center ${
        location === item.path
          ? "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500"
          : "text-gray-300 hover:text-white hover:bg-slate-800/50"
      }`}
    >
      <span>{item.label}</span>
      {item.comingSoon && (
        <span className="text-[9px] font-normal text-yellow-400/80 mt-0">
          coming soon
        </span>
      )}
    </button>
  ))}
</div>

              {/* RIGHT: Profile + Logout (Desktop) */}
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => isLoggedIn ? setLocation("/profile") : setLocation("/login")}
                  className="transition-transform hover:scale-105"
                >
                  {renderProfileCircle('large')}
                </button>

                {isLoggedIn ? (
                  <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg">
                    Logout
                  </Button>
                ) : (
                  <Button onClick={() => setLocation("/login")} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-3 py-2 rounded-lg">
                    Login / Sign up
                  </Button>
                )}
              </div>

              {/* MOBILE: Hamburger Section */}
              <div className="md:hidden ml-auto flex items-center space-x-4">
                <button onClick={() => isLoggedIn ? setLocation("/profile") : setLocation("/login")} className="transition-transform hover:scale-105">
                  {renderProfileCircle('small')}
                </button>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800/50"
                >
                  {mobileMenuOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU - Also wrap this so it can't open on login page */}
      {mobileMenuOpen && !isLoginPage && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-md z-50 border-b border-slate-700/50 shadow-xl">
          <div className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  if (item.isPremium) {
                    handleNavigation(item.path, item.label);
                  } else {
                    setLocation(item.path);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-md text-base font-medium text-left transition-all ${
                  location === item.path
                    ? "bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-500"
                    : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Profile Menu Item */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setLocation("/profile");
                } else {
                  setLocation("/login");
                }
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-3 rounded-md text-base font-medium text-left transition-all ${
                location === "/profile" || location === "/login"
                  ? "bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-500"
                  : "text-gray-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {isLoggedIn && userInitial ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                      {userInitial}
                    </div>
                  ) : (
                    <User className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <span>{isLoggedIn ? `Profile (${userInitial})` : "Login / Sign up"}</span>
              </div>
            </button>

            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setLocation("/register");
                  setMobileMenuOpen(false);
                }}
                className="mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg"
              >
                Register
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}