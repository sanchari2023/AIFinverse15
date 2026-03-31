import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePremiumInterceptor } from "@/hooks/usePremiumInterceptor";

import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

//ADMIN ARTICLES
import AdminLogin from "./pages/admin/AdminLogin";
import AdminEditor from "./pages/admin/AdminEditor";
import ProtectedRoute from "./pages/admin/ProtectedRoute";

// This will automatically inject a web font that 
// contains the flags for Windows users
polyfillCountryFlagEmojis();

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import About from "./pages/about";
import Signals from "./pages/Signals";
import Newsletter from "./pages/Newsletter";
import Learning from "./pages/Learning";
import RiskProfiling from "./pages/RiskProfiling";
import Affiliates from "./pages/Affiliates";
import Contact from "./pages/Contact";
import Profile from "./pages/profile";
import Telegram from "./pages/telegram";
import Alerts from "./pages/Alerts";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Portfolio from "./pages/Portfolio";

// Wrappers
import LiveAlertsWrapper_US from "./pages/LiveAlertsWrapper_US";
import LiveAlertsWrapper_India from "./pages/LiveAlertsWrapper_India";

import PrivacyPolicy from "@/pages/PrivacyPolicy";

import PostDetail from "./pages/PostDetail";

function Router() {
  usePremiumInterceptor();

  return (
    <Switch>
      {/* PUBLIC */}
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Registration} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* ✅ RESET PASSWORD (QUERY PARAM SUPPORT) */}
      <Route path="/reset-password" component={ResetPassword} />

      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/learning" component={Learning} />
      <Route path="/risk-profiling" component={RiskProfiling} />
      <Route path="/affiliates" component={Affiliates} />
      <Route path="/signals" component={Signals} />
      <Route path="/newsletter" component={Newsletter} />

      {/* PROTECTED */}
      <Route path="/profile" component={Profile} />
      <Route path="/telegram" component={Telegram} />
      <Route path="/alerts" component={Alerts} />

      {/* LIVE ALERTS */}
      <Route path="/live-alerts-india" component={LiveAlertsWrapper_India} />
      <Route path="/live-alerts-us" component={LiveAlertsWrapper_US} />

      <Route path="/privacy-policy" component={PrivacyPolicy} />

      <Route path="/post/:id" component={PostDetail} />


      {/* ADMIN ARTICLES */}

      <Route path="/admin/login" component={AdminLogin} />

<Route
  path="/admin/create-post"
  component={() => (
    <ProtectedRoute component={AdminEditor} />
  )}
/>
<Route path="/portfolio/:marketType?" component={Portfolio} />





      {/* FALLBACK */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
