import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navbar from "@/components/Navbar";

// Types
interface Transaction {
  id: string;
  action: 'Buy' | 'Sell';
  stockName: string;
  symbol: string;
  exchange: string;
  date: string;
  quantity: number;
  pricePerStock: number;
  charges: number;
  market: 'india';
}

interface Holding {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  investedValue: number;
  currentPrice: number;
  currentValue: number;
  totalPL: number;
  totalPLPercent: number;
  buyDate?: string;
  previousPrice?: number;
}

interface HoldingDetail {
  id: string;
  date: string;
  quantity: number;
  avgPrice: number;
  investedValue: number;
  currentValue: number;
  totalPL: number;
  totalPLPercent: number;
}

interface OpenPosition {
  ticker: string;
  stockName: string;
  date: string;
  fy: string;
  cy: string;
  sector: string;
  qty: number;
  buyRate: number;
  brokerage: number;
  total: number;
  todaysClosePrice: number;
  marketValue: number;
  dailyPL: number;
  dailyPLPercent: number;
  netPL: number;
  netPLPercent: number;
}

interface ClosedPosition {
  ticker: string;
  stockName: string;
  sellDate: string;
  fy: string;
  cy: string;
  sellQty: number;
  sellPrice: number;
  brokerage: number;
  total: number;
  buyDate: string;
  holdingPeriod: number;
  ltSt: string;
  netPL: number;
  netReturnPercent: number;
}

// Available stocks for dropdown
const availableStocks = [
  { symbol: "RELI", name: "Reliance Industries", sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
  { symbol: "INFY", name: "Infosys", sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking" },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking" },
  { symbol: "AIFT", name: "AIFinverse Tech", sector: "Finance" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom" },
];

// Current prices (Today's Close Price)
const currentPrices: { [key: string]: number } = {
  "RELI": 1343.90,
  "TCS": 2358.90,
  "INFY": 1852.30,
  "HDFCBANK": 1678.90,
  "ICICIBANK": 1245.60,
  "AIFT": 1850.75,
  "BHARTIARTL": 1234.50,
};

// Previous day prices (for daily P&L calculation)
const previousDayPrices: { [key: string]: number } = {
  "RELI": 1330.50,
  "TCS": 2340.00,
  "INFY": 1840.00,
  "HDFCBANK": 1665.00,
  "ICICIBANK": 1235.00,
  "AIFT": 1840.00,
  "BHARTIARTL": 1225.00,
};

// RSI values for stocks
const rsiValues: { [key: string]: number } = {
  "RELI": 56.05,
  "TCS": 62.30,
  "INFY": 48.75,
  "HDFCBANK": 52.40,
  "ICICIBANK": 58.20,
  "AIFT": 50.00,
  "BHARTIARTL": 45.60,
};

// ==================== HELPER FUNCTIONS (FRONTEND CALCULATIONS) ====================

// Get Indian Financial Year (Apr - Mar)
const getIndianFinancialYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

// Get Calendar Year
const getCalendarYear = (date: Date): string => {
  return date.getFullYear().toString();
};

// Get Sector from symbol
const getSector = (symbol: string): string => {
  const stock = availableStocks.find(s => s.symbol === symbol);
  return stock?.sector || "Other";
};

// Calculate holding period in days
const getHoldingPeriod = (buyDate: Date, sellDate: Date): number => {
  const diffTime = Math.abs(sellDate.getTime() - buyDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Determine LT (Long Term) or ST (Short Term) - India: >365 days = LT
const getLTST = (holdingPeriod: number): string => {
  return holdingPeriod > 365 ? "LT" : "ST";
};

// Format date to DD-MM-YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

// Get RSI color based on value
const getRSIColor = (rsi: number): string => {
  if (rsi >= 70) return "text-red-600";
  if (rsi <= 30) return "text-green-600";
  return "text-yellow-600";
};

// Get RSI background color
const getRSIBgColor = (rsi: number): string => {
  if (rsi >= 70) return "bg-red-100";
  if (rsi <= 30) return "bg-green-100";
  return "bg-yellow-100";
};

// Get TradingView chart link
const getChartLink = (symbol: string, exchange: string = 'NSE'): string => {
  return `https://www.tradingview.com/chart/?symbol=${exchange}:${symbol}`;
};

// ==================== DEMO DATA ====================

// Demo Holdings Data with previous prices
const demoHoldings: Holding[] = [
  {
    id: "1",
    name: "Reliance Industries",
    symbol: "RELI",
    quantity: 150,
    avgPrice: 1335.00,
    investedValue: 200250,
    currentPrice: 1343.90,
    currentValue: 201585,
    totalPL: 1335,
    totalPLPercent: 0.67,
    buyDate: "2024-01-15",
    previousPrice: 1330.50,
  },
  {
    id: "2",
    name: "AIFinverse Tech",
    symbol: "AIFT",
    quantity: 100,
    avgPrice: 1850.75,
    investedValue: 185075,
    currentPrice: 1850.75,
    currentValue: 185075,
    totalPL: 0,
    totalPLPercent: 0,
    buyDate: "2024-03-15",
    previousPrice: 1840.00,
  },
  {
    id: "3",
    name: "Tata Consultancy Services",
    symbol: "TCS",
    quantity: 25,
    avgPrice: 2358.90,
    investedValue: 58972.5,
    currentPrice: 2358.90,
    currentValue: 58972.5,
    totalPL: 0,
    totalPLPercent: 0,
    buyDate: "2024-03-20",
    previousPrice: 2340.00,
  },
];

// Demo Holding Details
const demoHoldingDetails: { [key: string]: HoldingDetail[] } = {
  "RELI": [
    {
      id: "1",
      date: "2024-01-15",
      quantity: 100,
      avgPrice: 1325.00,
      investedValue: 132500,
      currentValue: 134390,
      totalPL: 1890,
      totalPLPercent: 1.43,
    },
    {
      id: "2",
      date: "2024-02-10",
      quantity: 50,
      avgPrice: 1355.00,
      investedValue: 67750,
      currentValue: 67195,
      totalPL: -555,
      totalPLPercent: -0.82,
    },
  ],
  "AIFT": [
    {
      id: "3",
      date: "2024-03-15",
      quantity: 100,
      avgPrice: 1850.75,
      investedValue: 185075,
      currentValue: 185075,
      totalPL: 0,
      totalPLPercent: 0,
    },
  ],
  "TCS": [
    {
      id: "4",
      date: "2024-03-20",
      quantity: 25,
      avgPrice: 2358.90,
      investedValue: 58972.5,
      currentValue: 58972.5,
      totalPL: 0,
      totalPLPercent: 0,
    },
  ],
};

// Demo Closed Positions
const demoClosedPositions: ClosedPosition[] = [
  {
    ticker: "INFY",
    stockName: "Infosys",
    sellDate: "15-02-2024",
    fy: "2023-24",
    cy: "2024",
    sellQty: 50,
    sellPrice: 1850.00,
    brokerage: 25.00,
    total: 92500,
    buyDate: "10-08-2023",
    holdingPeriod: 189,
    ltSt: "ST",
    netPL: 2500,
    netReturnPercent: 2.78,
  },
  {
    ticker: "HDFCBANK",
    stockName: "HDFC Bank",
    sellDate: "30-01-2024",
    fy: "2023-24",
    cy: "2024",
    sellQty: 30,
    sellPrice: 1680.00,
    brokerage: 15.00,
    total: 50400,
    buyDate: "15-05-2022",
    holdingPeriod: 625,
    ltSt: "LT",
    netPL: 1200,
    netReturnPercent: 2.44,
  },
];

// ==================== COMPONENTS ====================

// Holdings Table Component with RSI and Chart Link
const HoldingsTable: React.FC<{ 
  holdings: Holding[]; 
  holdingDetails: { [key: string]: HoldingDetail[] };
}> = ({ holdings, holdingDetails }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (symbol: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedRows(newExpanded);
  };

  if (holdings.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center text-gray-500 border border-gray-100">
        <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
        <p>No holdings yet. Add a buy transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
      <table className="min-w-full">
        <thead className="bg-gray-50/90 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Price (₹)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Invested Value (₹)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Value (₹)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Daily P&L (₹)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Daily P&L %</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total P&L (₹)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total P&L %</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">RSI</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Chart</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {holdings.map((holding) => {
            const details = holdingDetails[holding.symbol] || [];
            const isExpanded = expandedRows.has(holding.symbol);
            const isProfit = holding.totalPL >= 0;
            
            const previousPrice = holding.previousPrice || previousDayPrices[holding.symbol] || holding.currentPrice * 0.98;
            const dailyPL = (holding.currentPrice - previousPrice) * holding.quantity;
            const dailyPLPercent = ((holding.currentPrice - previousPrice) / previousPrice) * 100;
            const isDailyProfit = dailyPL >= 0;
            
            // Get RSI value
            const rsi = rsiValues[holding.symbol] || 50;
            const rsiColor = getRSIColor(rsi);
            const rsiBgColor = getRSIBgColor(rsi);
            
            // Get chart link
            const chartLink = getChartLink(holding.symbol, 'NSE');
            
            return (
              <React.Fragment key={holding.id}>
                <tr 
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => toggleRow(holding.symbol)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{holding.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">{holding.symbol}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">{holding.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{holding.avgPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{holding.investedValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">₹{holding.currentValue.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {dailyPL >= 0 ? '+' : ''}₹{Math.abs(dailyPL).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {dailyPLPercent >= 0 ? '+' : ''}{dailyPLPercent.toFixed(2)}%
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.totalPL >= 0 ? '+' : ''}₹{Math.abs(holding.totalPL).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.totalPLPercent >= 0 ? '+' : ''}{holding.totalPLPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${rsiColor} ${rsiBgColor}`}>
                      {rsi.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <a
                      href={chartLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title={`View ${holding.symbol} on TradingView`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="text-xs font-semibold">{holding.symbol}</span>
                    </a>
                  </td>
                </tr>
                
                {isExpanded && details.length > 0 && (
                  <tr className="bg-gray-50/80">
                    <td colSpan={12} className="px-4 py-0">
                      <div className="m-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Quantity</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Avg Price (₹)</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Invested Value (₹)</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Current Value (₹)</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Total P&L (₹)</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">P&L %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {details.map((detail) => {
                              const isDetailProfit = detail.totalPL >= 0;
                              return (
                                <tr key={detail.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{detail.date}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700 text-right whitespace-nowrap">{detail.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700 text-right whitespace-nowrap">₹{detail.avgPrice.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700 text-right whitespace-nowrap">₹{detail.investedValue.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700 text-right whitespace-nowrap">₹{detail.currentValue.toLocaleString()}</td>
                                  <td className={`px-4 py-2 text-sm font-medium text-right whitespace-nowrap ${isDetailProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {detail.totalPL >= 0 ? '+' : ''}₹{Math.abs(detail.totalPL).toLocaleString()}
                                  </td>
                                  <td className={`px-4 py-2 text-sm font-medium text-right whitespace-nowrap ${isDetailProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {detail.totalPLPercent >= 0 ? '+' : ''}{detail.totalPLPercent.toFixed(2)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                
                {isExpanded && details.length === 0 && (
                  <tr className="bg-gray-50/80">
                    <td colSpan={12} className="px-4 py-6 text-center text-gray-500">
                      <i className="fas fa-info-circle mr-2"></i>
                      No transaction details available for this stock.
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Open Positions Table
const OpenPositionsTable: React.FC<{ positions: OpenPosition[] }> = ({ positions }) => {
  if (positions.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center text-gray-500 border border-gray-100">
        <i className="fas fa-chart-line text-4xl mb-3 text-gray-300"></i>
        <p>No open positions.</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
      <table className="min-w-full">
        <thead className="bg-gray-50/90 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticker</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Name</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FY</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CY</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Buy Rate (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Brokerage (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Today's Close Price (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Market Value (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Daily P&L (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Daily P&L %</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Net P&L (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Net P&L %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {positions.map((pos, idx) => {
            const isProfit = pos.netPL >= 0;
            const isDailyProfit = pos.dailyPL >= 0;
            return (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{pos.ticker}</td>
                <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{pos.stockName}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.date}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.fy}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.cy}</td>
                <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{pos.sector}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">{pos.qty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.buyRate)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.brokerage)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.total)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.todaysClosePrice)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.marketValue)}</td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.dailyPL >= 0 ? '+' : ''}₹{formatNumber(Math.abs(pos.dailyPL))}
                </td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isDailyProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.dailyPLPercent >= 0 ? '+' : ''}{formatNumber(Math.abs(pos.dailyPLPercent))}%
                </td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.netPL >= 0 ? '+' : ''}₹{formatNumber(Math.abs(pos.netPL))}
                </td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.netPLPercent >= 0 ? '+' : ''}{formatNumber(Math.abs(pos.netPLPercent))}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Closed Positions Table
const ClosedPositionsTable: React.FC<{ positions: ClosedPosition[] }> = ({ positions }) => {
  if (positions.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center text-gray-500 border border-gray-100">
        <i className="fas fa-history text-4xl mb-3 text-gray-300"></i>
        <p>No closed positions.</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
      <table className="min-w-full">
        <thead className="bg-gray-50/90 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticker</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Name</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sell Date</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FY</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CY</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sell Qty</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sell Price (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Brokerage (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total (₹)</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buy Date</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Holding Period</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">LT/ST</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Net P&L (₹)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Return %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {positions.map((pos, idx) => {
            const isProfit = pos.netPL >= 0;
            return (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{pos.ticker}</td>
                <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{pos.stockName}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.sellDate}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.fy}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.cy}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">{pos.sellQty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.sellPrice)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.brokerage)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">₹{formatNumber(pos.total)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{pos.buyDate}</td>
                <td className="px-3 py-3 text-sm text-gray-900 text-right whitespace-nowrap">{pos.holdingPeriod} days</td>
                <td className={`px-3 py-3 text-sm font-medium whitespace-nowrap ${pos.ltSt === 'LT' ? 'text-blue-600' : 'text-orange-600'}`}>
                  {pos.ltSt}
                </td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.netPL >= 0 ? '+' : ''}₹{formatNumber(Math.abs(pos.netPL))}
                </td>
                <td className={`px-3 py-3 text-sm font-medium text-right whitespace-nowrap ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.netReturnPercent >= 0 ? '+' : ''}{formatNumber(Math.abs(pos.netReturnPercent))}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Add Transaction Modal Content Component - NO EXCHANGE COLUMN (Fixed to NSE)
const AddTransactionModalContent: React.FC<{
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}> = ({ onAdd }) => {
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy');
  const [selectedStock, setSelectedStock] = useState(availableStocks[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerStock, setPricePerStock] = useState<string>('');
  const [transactionCostPercent, setTransactionCostPercent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Parse values
  const parsedPrice = parseFloat(pricePerStock);
  const parsedQuantity = quantity || 0;
  const parsedCostPercent = parseFloat(transactionCostPercent) || 0;
  
  // Calculate charges
  const calculatedCharges = (parsedQuantity * parsedPrice) * (parsedCostPercent / 100);
  const totalValue = parsedQuantity * parsedPrice;
  const netValue = totalValue + calculatedCharges;
  
  const filteredStocks = availableStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleStockSelect = (stock: typeof availableStocks[0]) => {
    setSelectedStock(stock);
    setSearchTerm(stock.name);
    setShowDropdown(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || parsedQuantity <= 0 || parsedPrice <= 0 || isNaN(parsedPrice)) return;
    
    onAdd({
      action,
      stockName: selectedStock.name,
      symbol: selectedStock.symbol,
      exchange: 'NSE',
      date,
      quantity: parsedQuantity,
      pricePerStock: parsedPrice,
      charges: calculatedCharges,
      market: 'india',
    });
    
    // Reset form
    setAction('Buy');
    setQuantity(1);
    setPricePerStock('');
    setTransactionCostPercent('');
    setSearchTerm('');
    setSelectedStock(availableStocks[0]);
  };
  
  const formatNumber = (num: number) => {
    if (isNaN(num)) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPricePerStock(value);
    }
  };
  
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTransactionCostPercent(value);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (e.target.value === '') {
      setQuantity(0);
    } else if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ticker *</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by symbol or name..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          style={{ color: '#111827' }}
        />
        {showDropdown && filteredStocks.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => handleStockSelect(stock)}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors text-gray-900"
              >
                <span className="font-semibold">{stock.symbol}</span> - {stock.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Exchange is fixed to NSE - No dropdown, just informational text */}
      <div className="text-xs text-gray-500 -mt-2 mb-2">
       
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setAction('Buy')}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
              action === 'Buy'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setAction('Sell')}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
              action === 'Sell'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sell
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          style={{ color: '#111827' }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
          step="1"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          style={{ color: '#111827' }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price per share (₹) *</label>
        <input
          type="text"
          value={pricePerStock}
          onChange={handlePriceChange}
          placeholder="Enter price (e.g., 1234.50 or 0.5)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          style={{ color: '#111827' }}
        />
        <p className="text-xs text-gray-500 mt-1">Enter any number: 1, 2, 3, 1.2, 0.2, etc.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Cost (%)</label>
        <input
          type="text"
          value={transactionCostPercent}
          onChange={handleCostChange}
          placeholder="Enter percentage (e.g., 0.5 for 0.5%)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          style={{ color: '#111827' }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter transaction cost percentage (brokerage + taxes). Example: 0.5 = 0.5%, 1 = 1%, 0.25 = 0.25%
        </p>
      </div>
      
      {/* Summary Section */}
      {(parsedQuantity > 0 && parsedPrice > 0 && !isNaN(parsedPrice)) && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-semibold">₹{formatNumber(totalValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction Cost ({parsedCostPercent}%):</span>
            <span className="font-semibold">₹{formatNumber(calculatedCharges)}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2 mt-2">
            <span className="text-gray-700 font-medium">Net Debit/Credit:</span>
            <span className="font-bold text-blue-600">₹{formatNumber(netValue)}</span>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={!selectedStock || parsedQuantity <= 0 || parsedPrice <= 0 || isNaN(parsedPrice)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Transaction
      </button>
    </form>
  );
};

// ==================== MAIN INDIA MARKET COMPONENT ====================

const IndiaMarket: React.FC = () => {
  const [, setLocation] = useLocation();
  const [useDemoData, setUseDemoData] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'add' | 'history'>('holdings');
  const [historySubTab, setHistorySubTab] = useState<'open' | 'closed'>('open');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (useDemoData) return [];
    const saved = localStorage.getItem('transactions_india');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    if (!useDemoData) {
      localStorage.setItem('transactions_india', JSON.stringify(transactions));
    }
  }, [transactions, useDemoData]);
  
  // Calculate holdings from transactions (for non-demo mode)
  const calculatedHoldings: Holding[] = React.useMemo(() => {
    if (useDemoData) return [];
    
    const buys = transactions.filter(t => t.action === 'Buy');
    const sells = transactions.filter(t => t.action === 'Sell');
    
    const buyMap = new Map<string, { quantity: number; totalCost: number; name: string; buyDate: string }>();
    buys.forEach(buy => {
      const existing = buyMap.get(buy.symbol);
      if (existing) {
        existing.quantity += buy.quantity;
        existing.totalCost += buy.quantity * buy.pricePerStock;
      } else {
        buyMap.set(buy.symbol, {
          quantity: buy.quantity,
          totalCost: buy.quantity * buy.pricePerStock,
          name: buy.stockName,
          buyDate: buy.date,
        });
      }
    });
    
    sells.forEach(sell => {
      const buyData = buyMap.get(sell.symbol);
      if (buyData) {
        buyData.quantity -= sell.quantity;
        if (buyData.quantity <= 0) {
          buyMap.delete(sell.symbol);
        }
      }
    });
    
    const holdingsList: Holding[] = [];
    buyMap.forEach((data, symbol) => {
      const avgPrice = data.totalCost / data.quantity;
      const currentPrice = currentPrices[symbol] || avgPrice;
      const currentValue = data.quantity * currentPrice;
      const totalPL = currentValue - data.totalCost;
      const totalPLPercent = data.totalCost > 0 ? (totalPL / data.totalCost) * 100 : 0;
      
      holdingsList.push({
        id: symbol,
        name: data.name,
        symbol,
        quantity: data.quantity,
        avgPrice,
        investedValue: data.totalCost,
        currentPrice,
        currentValue,
        totalPL,
        totalPLPercent,
        buyDate: data.buyDate,
        previousPrice: previousDayPrices[symbol] || currentPrice * 0.98,
      });
    });
    
    return holdingsList;
  }, [transactions, useDemoData]);
  
  // Calculate holding details for non-demo mode
  const calculatedHoldingDetails: { [key: string]: HoldingDetail[] } = React.useMemo(() => {
    if (useDemoData) return {};
    
    const details: { [key: string]: HoldingDetail[] } = {};
    
    transactions.forEach(t => {
      if (!details[t.symbol]) {
        details[t.symbol] = [];
      }
      
      const currentPrice = currentPrices[t.symbol] || t.pricePerStock;
      const currentValue = t.quantity * currentPrice;
      const totalPL = currentValue - (t.quantity * t.pricePerStock);
      const totalPLPercent = (t.quantity * t.pricePerStock) > 0 ? (totalPL / (t.quantity * t.pricePerStock)) * 100 : 0;
      
      details[t.symbol].push({
        id: t.id,
        date: t.date,
        quantity: t.quantity,
        avgPrice: t.pricePerStock,
        investedValue: t.quantity * t.pricePerStock,
        currentValue,
        totalPL,
        totalPLPercent,
      });
    });
    
    return details;
  }, [transactions, useDemoData]);
  
  // Use demo data or calculated data
  const displayHoldings = useDemoData ? demoHoldings : calculatedHoldings;
  const displayHoldingDetails = useDemoData ? demoHoldingDetails : calculatedHoldingDetails;
  
  // Generate Open Positions from holdings
  const openPositions: OpenPosition[] = React.useMemo(() => {
    if (useDemoData) {
      return displayHoldings.map(holding => {
        const buyDate = new Date(holding.buyDate || new Date());
        const previousPrice = holding.previousPrice || previousDayPrices[holding.symbol] || holding.currentPrice * 0.98;
        const dailyPL = (holding.currentPrice - previousPrice) * holding.quantity;
        const dailyPLPercent = ((holding.currentPrice - previousPrice) / previousPrice) * 100;
        
        return {
          ticker: holding.symbol,
          stockName: holding.name,
          date: formatDate(holding.buyDate || new Date().toISOString()),
          fy: getIndianFinancialYear(buyDate),
          cy: getCalendarYear(buyDate),
          sector: getSector(holding.symbol),
          qty: holding.quantity,
          buyRate: holding.avgPrice,
          brokerage: 0,
          total: holding.investedValue,
          todaysClosePrice: holding.currentPrice,
          marketValue: holding.currentValue,
          dailyPL: dailyPL,
          dailyPLPercent: dailyPLPercent,
          netPL: holding.totalPL,
          netPLPercent: holding.totalPLPercent,
        };
      });
    }
    
    return displayHoldings.map(holding => {
      const buyDate = new Date(holding.buyDate || new Date());
      const previousPrice = holding.previousPrice || previousDayPrices[holding.symbol] || holding.currentPrice * 0.98;
      const dailyPL = (holding.currentPrice - previousPrice) * holding.quantity;
      const dailyPLPercent = ((holding.currentPrice - previousPrice) / previousPrice) * 100;
      
      return {
        ticker: holding.symbol,
        stockName: holding.name,
        date: formatDate(holding.buyDate || new Date().toISOString()),
        fy: getIndianFinancialYear(buyDate),
        cy: getCalendarYear(buyDate),
        sector: getSector(holding.symbol),
        qty: holding.quantity,
        buyRate: holding.avgPrice,
        brokerage: 0,
        total: holding.investedValue,
        todaysClosePrice: holding.currentPrice,
        marketValue: holding.currentValue,
        dailyPL: dailyPL,
        dailyPLPercent: dailyPLPercent,
        netPL: holding.totalPL,
        netPLPercent: holding.totalPLPercent,
      };
    });
  }, [useDemoData, displayHoldings]);
  
  // Generate Closed Positions from sold transactions
  const closedPositions: ClosedPosition[] = React.useMemo(() => {
    if (useDemoData) return demoClosedPositions;
    
    const sells = transactions.filter(t => t.action === 'Sell');
    const buys = transactions.filter(t => t.action === 'Buy');
    
    const closedPositionsList: ClosedPosition[] = [];
    
    sells.forEach(sell => {
      const buyTransaction = buys.find(b => b.symbol === sell.symbol && new Date(b.date) < new Date(sell.date));
      
      if (buyTransaction) {
        const buyDate = new Date(buyTransaction.date);
        const sellDate = new Date(sell.date);
        const holdingPeriod = getHoldingPeriod(buyDate, sellDate);
        
        closedPositionsList.push({
          ticker: sell.symbol,
          stockName: sell.stockName,
          sellDate: formatDate(sell.date),
          fy: getIndianFinancialYear(sellDate),
          cy: getCalendarYear(sellDate),
          sellQty: sell.quantity,
          sellPrice: sell.pricePerStock,
          brokerage: sell.charges || 0,
          total: (sell.quantity * sell.pricePerStock) + (sell.charges || 0),
          buyDate: formatDate(buyTransaction.date),
          holdingPeriod: holdingPeriod,
          ltSt: getLTST(holdingPeriod),
          netPL: (sell.quantity * sell.pricePerStock) - (sell.quantity * buyTransaction.pricePerStock),
          netReturnPercent: ((sell.pricePerStock - buyTransaction.pricePerStock) / buyTransaction.pricePerStock) * 100,
        });
      }
    });
    
    return closedPositionsList;
  }, [useDemoData, transactions]);
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (useDemoData) {
      setUseDemoData(false);
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}_${Math.random()}`,
    };
    setTransactions(prev => [...prev, newTransaction]);
    alert(`${transaction.action} transaction added for ${transaction.stockName} on NSE`);
    setActiveTab('holdings');
  };
  
  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen pt-16"
        style={{
          backgroundImage: 'url("/images/login.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="fixed inset-0 bg-black/50 pointer-events-none" style={{ zIndex: 0 }}></div>
        
        <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
         <div className="mb-8">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
      <span className="text-3xl">🇮🇳</span> India Market - Portfolio Management
    </h1>
    <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full">
      Coming Soon
    </span>
  </div>
  <p className="text-sm text-white/80 drop-shadow mt-1">NSE | Currency: Indian Rupee (₹) | Financial Year: Apr - Mar</p>
</div>
          
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('holdings')}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  activeTab === 'holdings'
                    ? 'bg-white/20 text-white border-b-2 border-green-500'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Holdings
              </button>
              
              <button
                onClick={() => setActiveTab('add')}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-white/20 text-white border-b-2 border-green-500'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Transaction
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white border-b-2 border-green-500'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className="fas fa-history mr-2"></i>
                Transaction History
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div>
            {activeTab === 'holdings' && (
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow mb-3 flex items-center gap-2">
                  <i className="fas fa-chart-line text-green-400"></i> Holdings
                </h2>
                <HoldingsTable 
                  holdings={displayHoldings} 
                  holdingDetails={displayHoldingDetails}
                />
              </div>
            )}
            
            {activeTab === 'add' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-plus-circle text-green-600"></i>
                  Add New Transaction
                </h2>
                <AddTransactionModalContent onAdd={handleAddTransaction} />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow mb-3 flex items-center gap-2">
                  <i className="fas fa-history text-gray-300"></i> Transaction History
                </h2>
                
                {/* History Sub Tabs */}
                <div className="mb-4 border-b border-gray-300 bg-white/90 rounded-t-lg">
                  <div className="flex space-x-4 px-4">
                    <button
                      onClick={() => setHistorySubTab('open')}
                      className={`px-4 py-2 font-semibold transition-all ${
                        historySubTab === 'open'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Open Positions
                    </button>
                    <button
                      onClick={() => setHistorySubTab('closed')}
                      className={`px-4 py-2 font-semibold transition-all ${
                        historySubTab === 'closed'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Closed Positions
                    </button>
                  </div>
                </div>
                
                {/* Open Positions Table */}
                {historySubTab === 'open' && (
                  <OpenPositionsTable positions={openPositions} />
                )}
                
                {/* Closed Positions Table */}
                {historySubTab === 'closed' && (
                  <ClosedPositionsTable positions={closedPositions} />
                )}
              </div>
            )}
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
    </>
  );
};

export default IndiaMarket;