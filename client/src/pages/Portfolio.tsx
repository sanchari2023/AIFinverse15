import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navbar from "@/components/Navbar";

// Market overview data with daily changes
const marketData = [
  { region: "🇮🇳", name: "Reliance Industries", symbol: "RELI", investedValue: 1335000, currentValue: 1343900, totalPL: 8900, plPercent: 0.67, dailyPL: 445, dailyPLPercent: 0.03 },
  { region: "🇺🇸", name: "FactSet Research", symbol: "FDS", investedValue: 199690, currentValue: 217220, totalPL: 17530, plPercent: 8.78, dailyPL: 8765, dailyPLPercent: 4.21 },
  { region: "🇮🇳", name: "Tata Consultancy Services", symbol: "TCS", investedValue: 2375100, currentValue: 2358900, totalPL: -16200, plPercent: -0.68, dailyPL: -405, dailyPLPercent: -0.02 },
  { region: "🇺🇸", name: "Apple Inc.", symbol: "AAPL", investedValue: 174500, currentValue: 175320, totalPL: 820, plPercent: 0.47, dailyPL: 410, dailyPLPercent: 0.23 },
  { region: "🇮🇳", name: "Infosys", symbol: "INFY", investedValue: 1845000, currentValue: 1852300, totalPL: 7300, plPercent: 0.40, dailyPL: 365, dailyPLPercent: 0.02 },
  { region: "🇺🇸", name: "Microsoft Corp", symbol: "MSFT", investedValue: 419000, currentValue: 420850, totalPL: 1850, plPercent: 0.44, dailyPL: 925, dailyPLPercent: 0.22 },
  { region: "🇮🇳", name: "HDFC Bank", symbol: "HDFCBANK", investedValue: 1670000, currentValue: 1678900, totalPL: 8900, plPercent: 0.53, dailyPL: 445, dailyPLPercent: 0.03 },
  { region: "🇺🇸", name: "NVIDIA Corp", symbol: "NVDA", investedValue: 890000, currentValue: 895600, totalPL: 5600, plPercent: 0.63, dailyPL: 2800, dailyPLPercent: 0.31 },
];

// Calculate portfolio data for India and US with daily metrics
const calculatePortfolioData = () => {
  const indiaStocks = marketData.filter(stock => stock.region === "🇮🇳");
  const usStocks = marketData.filter(stock => stock.region === "🇺🇸");
  
  // India calculations
  const indiaTotalInvested = indiaStocks.reduce((sum, stock) => sum + stock.investedValue, 0);
  const indiaCurrentValue = indiaStocks.reduce((sum, stock) => sum + stock.currentValue, 0);
  const indiaTotalPL = indiaCurrentValue - indiaTotalInvested;
  const indiaPLPercent = indiaTotalInvested > 0 ? (indiaTotalPL / indiaTotalInvested) * 100 : 0;
  const indiaDailyPL = indiaStocks.reduce((sum, stock) => sum + stock.dailyPL, 0);
  const indiaDailyPLPercent = indiaCurrentValue > 0 ? (indiaDailyPL / indiaCurrentValue) * 100 : 0;
  
  // US calculations
  const usTotalInvested = usStocks.reduce((sum, stock) => sum + stock.investedValue, 0);
  const usCurrentValue = usStocks.reduce((sum, stock) => sum + stock.currentValue, 0);
  const usTotalPL = usCurrentValue - usTotalInvested;
  const usPLPercent = usTotalInvested > 0 ? (usTotalPL / usTotalInvested) * 100 : 0;
  const usDailyPL = usStocks.reduce((sum, stock) => sum + stock.dailyPL, 0);
  const usDailyPLPercent = usCurrentValue > 0 ? (usDailyPL / usCurrentValue) * 100 : 0;
  
  return {
    india: {
      totalValue: indiaCurrentValue,
      totalInvested: indiaTotalInvested,
      totalPL: indiaTotalPL,
      totalPLPercent: indiaPLPercent,
      dailyPL: indiaDailyPL,
      dailyPLPercent: indiaDailyPLPercent,
      holdings: indiaStocks.length,
    },
    us: {
      totalValue: usCurrentValue,
      totalInvested: usTotalInvested,
      totalPL: usTotalPL,
      totalPLPercent: usPLPercent,
      dailyPL: usDailyPL,
      dailyPLPercent: usDailyPLPercent,
      holdings: usStocks.length,
    }
  };
};

// Portfolio Card Component with all metrics
const PortfolioCard: React.FC<{
  flag: string;
  title: string;
  totalValue: number;
  totalInvested: number;
  totalPL: number;
  totalPLPercent: number;
  dailyPL: number;
  dailyPLPercent: number;
  holdings: number;
  currency: string;
  onClick: () => void;
  comingSoon?: boolean;
}> = ({ flag, title, totalValue, totalInvested, totalPL, totalPLPercent, dailyPL, dailyPLPercent, holdings, currency, onClick, comingSoon }) => {
  const isTotalProfit = totalPL >= 0;
  const isDailyProfit = dailyPL >= 0;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{flag}</span>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {comingSoon && (
      <span className="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
        Coming Soon
      </span>
    )}
        </div>
        <i className="fas fa-arrow-right text-gray-400 text-xl"></i>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Current Value */}
        <div>
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="text-2xl font-bold text-gray-900">{currency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        {/* Total Investment */}
        <div>
          <p className="text-sm text-gray-500">Total Investment</p>
          <p className="text-2xl font-bold text-gray-900">{currency}{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        {/* Total Gain/Loss */}
        <div>
          <p className="text-sm text-gray-500">Total Gain/Loss</p>
          <p className={`text-xl font-semibold ${isTotalProfit ? 'text-green-600' : 'text-red-600'}`}>
            {currency}{totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Total Gain/Loss % */}
        <div>
          <p className="text-sm text-gray-500">Total Gain/Loss %</p>
          <p className={`text-xl font-semibold ${isTotalProfit ? 'text-green-600' : 'text-red-600'}`}>
            {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
          </p>
        </div>
        
        {/* Today's Gain/Loss */}
        <div>
          <p className="text-sm text-gray-500">Today's Gain/Loss</p>
          <p className={`text-xl font-semibold ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
            {currency}{dailyPL >= 0 ? '+' : ''}{dailyPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Today's Gain/Loss % */}
        <div>
          <p className="text-sm text-gray-500">Today's Gain/Loss %</p>
          <p className={`text-xl font-semibold ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
            {dailyPLPercent >= 0 ? '+' : ''}{dailyPLPercent.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* Holdings count at bottom - Made clickable */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Total Holdings</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to the respective market page
            const marketPath = title === 'India Portfolio' ? '/india' : '/us';
            window.location.href = marketPath;
          }}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all"
        >
          {holdings} stocks
        </button>
      </div>
    </div>
  );
};

// Market Table Component
const MarketTable: React.FC = () => {
  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/90">
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Region</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Invested Value</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Value</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total P&L</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">P&L %</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Today's P&L</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Today's %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {marketData.map((stock, idx) => {
            const isIndia = stock.region === "🇮🇳";
            const currency = isIndia ? '₹' : '$';
            
            return (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-sm text-center text-2xl">{stock.region}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{stock.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{stock.symbol}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {currency}{stock.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  {currency}{stock.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${stock.totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currency}{stock.totalPL >= 0 ? '+' : ''}{stock.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${stock.plPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.plPercent >= 0 ? '+' : ''}{stock.plPercent.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${stock.dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currency}{stock.dailyPL >= 0 ? '+' : ''}{stock.dailyPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${stock.dailyPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.dailyPLPercent >= 0 ? '+' : ''}{stock.dailyPLPercent.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const [, setLocation] = useLocation();
  const [portfolioData, setPortfolioData] = useState(calculatePortfolioData());

  useEffect(() => {
    setPortfolioData(calculatePortfolioData());
  }, []);

  const { india, us } = portfolioData;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 pt-16">
        {/* Background with fixed overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundImage: 'url("/images/login.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        ></div>
        <div className="fixed inset-0 bg-black/50" style={{ zIndex: 1 }}></div>
        
        {/* Content wrapper with higher z-index */}
        <div className="relative" style={{ zIndex: 2 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Section Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg text-center">Portfolio Dashboard</h1>
              <p className="text-center text-white/80 mt-2">Select a market to view and manage your portfolio</p>
            </div>

            {/* Portfolio Selection Cards - Only 2 buttons */}
            <div className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PortfolioCard
                  flag="🇮🇳"
                  title="India Portfolio"
                  totalValue={india.totalValue}
                  totalInvested={india.totalInvested}
                  totalPL={india.totalPL}
                  totalPLPercent={india.totalPLPercent}
                  dailyPL={india.dailyPL}
                  dailyPLPercent={india.dailyPLPercent}
                  holdings={india.holdings}
                  currency="₹"
                  onClick={() => setLocation('/india')}
                  comingSoon={true}
                />
                <PortfolioCard
                  flag="🇺🇸"
                  title="US Portfolio"
                  totalValue={us.totalValue}
                  totalInvested={us.totalInvested}
                  totalPL={us.totalPL}
                  totalPLPercent={us.totalPLPercent}
                  dailyPL={us.dailyPL}
                  dailyPLPercent={us.dailyPLPercent}
                  holdings={us.holdings}
                  currency="$"
                  onClick={() => setLocation('/us')}
                  comingSoon={true}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
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
        </div>
      </div>
    </>
  );
};

export default Portfolio;