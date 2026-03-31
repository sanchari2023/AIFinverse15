import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';

// Types
interface Transaction {
  id: string;
  action: 'Buy' | 'Sell';
  stockName: string;
  exchange: string;
  date: string;
  quantity: number;
  pricePerStock: number;
  market: 'india' | 'us';
}

interface BuyHolding {
  id: string;
  stockName: string;
  quantity: number;
  buyPrice: number;
  investmentCost: number;
  latestValue: number;
  unrealizedPnL: number;
  percentageChange: number;
}

interface SoldHolding {
  id: string;
  stockName: string;
  quantity: number;
  sellPrice: number;
  sellValue: number;
  realizedProfit: number;
}

// Market overview data with your company demo values
const indiaMarketData = [
  { name: "AIFinverse Tech", symbol: "AIFT", lastPrice: 1850.75, open: 1845.00, high: 1860.00, low: 1840.00, change: 5.75, changePercent: 0.31, volume: "1.2M" },
  { name: "Reliance Industries", symbol: "RELIANCE", lastPrice: 2856.45, open: 2840.00, high: 2870.00, low: 2835.50, change: 16.45, changePercent: 0.58, volume: "2.3M" },
  { name: "Tata Consultancy Services", symbol: "TCS", lastPrice: 3982.30, open: 3975.00, high: 3995.00, low: 3960.00, change: 7.30, changePercent: 0.18, volume: "1.1M" },
  { name: "HDFC Bank", symbol: "HDFCBANK", lastPrice: 1678.90, open: 1670.00, high: 1685.00, low: 1665.00, change: 8.90, changePercent: 0.53, volume: "3.5M" },
  { name: "Infosys", symbol: "INFY", lastPrice: 1852.30, open: 1845.00, high: 1860.00, low: 1840.00, change: 7.30, changePercent: 0.40, volume: "1.8M" },
  { name: "ICICI Bank", symbol: "ICICIBANK", lastPrice: 1245.60, open: 1240.00, high: 1252.00, low: 1235.00, change: 5.60, changePercent: 0.45, volume: "2.9M" },
];

const usMarketData = [
  { name: "AIFinverse Global", symbol: "AIFG", lastPrice: 42.85, open: 42.00, high: 43.20, low: 41.80, change: 0.85, changePercent: 2.02, volume: "5.5M" },
  { name: "Apple Inc.", symbol: "AAPL", lastPrice: 175.32, open: 174.50, high: 176.20, low: 174.10, change: 0.82, changePercent: 0.47, volume: "45.2M" },
  { name: "Microsoft Corp", symbol: "MSFT", lastPrice: 420.85, open: 419.00, high: 422.50, low: 418.30, change: 1.85, changePercent: 0.44, volume: "22.1M" },
  { name: "NVIDIA Corp", symbol: "NVDA", lastPrice: 895.60, open: 890.00, high: 902.00, low: 888.50, change: 5.60, changePercent: 0.63, volume: "38.7M" },
  { name: "Amazon.com", symbol: "AMZN", lastPrice: 178.45, open: 177.80, high: 179.20, low: 177.20, change: 0.65, changePercent: 0.37, volume: "31.4M" },
  { name: "Meta Platforms", symbol: "META", lastPrice: 485.20, open: 483.00, high: 487.50, low: 482.00, change: 2.20, changePercent: 0.46, volume: "15.8M" },
];

// Helper to get current price (mock)
const getCurrentPrice = (stockName: string, market: 'india' | 'us'): number => {
  const data = market === 'india' ? indiaMarketData : usMarketData;
  const stock = data.find(s => s.name === stockName || s.symbol === stockName);
  return stock?.lastPrice || (market === 'india' ? 1500 : 100);
};

const getCurrencySymbol = (market: 'india' | 'us') => market === 'india' ? '₹' : '$';

// Market Table Component
const MarketTable: React.FC<{ data: any[]; market: 'india' | 'us' }> = ({ data, market }) => {
  const symbol = getCurrencySymbol(market);
  
  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {['Name', 'Symbol', 'Last Price', 'Open', 'High', 'Low', 'Change', 'Change %', 'Volume'].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((stock, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{stock.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{stock.symbol}</td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">{symbol}{stock.lastPrice.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{stock.open.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{stock.high.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{stock.low.toLocaleString()}</td>
              <td className={`px-4 py-3 text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change}
              </td>
              <td className={`px-4 py-3 text-sm font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{stock.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Buy Holdings Table
const BuyHoldingsTable: React.FC<{ holdings: BuyHolding[]; market: 'india' | 'us'; onDelete?: (id: string) => void }> = 
({ holdings, market, onDelete }) => {
  const symbol = getCurrencySymbol(market);
  
  if (holdings.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center text-gray-500">
        <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
        <p>No active holdings. Add a buy transaction to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
          <tr>
            {['Stock Name', 'Quantity', 'Buy Price', 'Investment Cost', 'Latest Value', 'Unrealized G/L', 'Percentage Change', 'Action'].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {holdings.map((holding) => (
            <tr key={holding.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{holding.stockName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{holding.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{holding.buyPrice.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{holding.investmentCost.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{symbol}{holding.latestValue.toLocaleString()}</td>
              <td className={`px-4 py-3 text-sm font-medium ${holding.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {symbol}{holding.unrealizedPnL >= 0 ? '+' : ''}{holding.unrealizedPnL.toLocaleString()}
              </td>
              <td className={`px-4 py-3 text-sm font-medium ${holding.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.percentageChange >= 0 ? '+' : ''}{holding.percentageChange.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-sm">
                {onDelete && (
                  <button
                    onClick={() => onDelete(holding.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Transaction"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sold Holdings Table
const SoldHoldingsTable: React.FC<{ holdings: SoldHolding[]; market: 'india' | 'us' }> = ({ holdings, market }) => {
  const symbol = getCurrencySymbol(market);
  
  if (holdings.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center text-gray-500">
        <i className="fas fa-history text-4xl mb-3 text-gray-300"></i>
        <p>No sold holdings yet.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {['Stock Name', 'Quantity', 'Sell Price', 'Sell Value', 'Realized Profit/Loss'].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {holdings.map((holding) => (
            <tr key={holding.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{holding.stockName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{holding.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{holding.sellPrice.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{symbol}{holding.sellValue.toLocaleString()}</td>
              <td className={`px-4 py-3 text-sm font-medium ${holding.realizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {symbol}{holding.realizedProfit >= 0 ? '+' : ''}{holding.realizedProfit.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Add Transaction Modal
const AddTransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  market: 'india' | 'us';
}> = ({ isOpen, onClose, onAdd, market }) => {
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy');
  const [stockName, setStockName] = useState('');
  const [exchange, setExchange] = useState(market === 'india' ? 'NSE' : 'NYSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerStock, setPricePerStock] = useState<number>(0);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'file'>('manual');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const exchanges = market === 'india' ? ['NSE', 'BSE'] : ['NYSE', 'NASDAQ'];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!stockName.trim()) newErrors.stockName = 'Stock name is required';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (pricePerStock <= 0) newErrors.pricePerStock = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 6) {
            const newTransaction = {
              action: values[0].trim() as 'Buy' | 'Sell',
              stockName: values[1].trim(),
              exchange: values[2].trim(),
              date: values[3].trim(),
              quantity: parseFloat(values[4]),
              pricePerStock: parseFloat(values[5]),
              market,
            };
            onAdd(newTransaction);
          }
        }
        alert('File uploaded successfully!');
        onClose();
      } catch (error) {
        alert('Error parsing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    onAdd({
      action,
      stockName: stockName.trim(),
      exchange,
      date,
      quantity,
      pricePerStock,
      market,
    });
    
    // Reset form
    setAction('Buy');
    setStockName('');
    setExchange(market === 'india' ? 'NSE' : 'NYSE');
    setDate(new Date().toISOString().split('T')[0]);
    setQuantity(1);
    setPricePerStock(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUploadMethod('manual')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                uploadMethod === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                uploadMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              File Upload
            </button>
          </div>

          {uploadMethod === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action *</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as 'Buy' | 'Sell')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Name *</label>
                <input
                  type="text"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  placeholder="e.g., AIFinverse Tech"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.stockName && <p className="text-red-500 text-xs mt-1">{errors.stockName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange *</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {exchanges.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Stock ({getCurrencySymbol(market)}) *</label>
                <input
                  type="number"
                  value={pricePerStock}
                  onChange={(e) => setPricePerStock(Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.pricePerStock && <p className="text-red-500 text-xs mt-1">{errors.pricePerStock}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Add Transaction
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600 mb-2">Upload CSV file with transactions</p>
                <p className="text-sm text-gray-500 mb-4">Format: Action,Stock Name,Exchange,Date,Quantity,Price</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Sample CSV format:</p>
                <code className="text-xs text-gray-600">
                  Buy,AIFinverse Tech,NSE,2024-01-15,10,1850.75<br/>
                  Sell,AIFinverse Global,NASDAQ,2024-01-20,5,42.85
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component
const Portfolio: React.FC = () => {
  const [match, params] = useRoute('/portfolio/:marketType');
  const marketType = params?.marketType;
  const [, setLocation] = useLocation();
  
  const market = (marketType === 'us' ? 'us' : marketType === 'india' ? 'india' : null) as 'india' | 'us' | null;
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (market) {
      const saved = localStorage.getItem(`transactions_${market}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (market) {
      localStorage.setItem(`transactions_${market}`, JSON.stringify(transactions));
    }
  }, [transactions, market]);
  
  // Calculate Buy Holdings
  const buyHoldings: BuyHolding[] = React.useMemo(() => {
    if (!market) return [];
    
    const buys = transactions.filter(t => t.action === 'Buy');
    const sells = transactions.filter(t => t.action === 'Sell');
    
    const buyMap = new Map<string, { quantity: number; totalCost: number; transactions: Transaction[] }>();
    buys.forEach(buy => {
      const existing = buyMap.get(buy.stockName);
      if (existing) {
        existing.quantity += buy.quantity;
        existing.totalCost += buy.quantity * buy.pricePerStock;
        existing.transactions.push(buy);
      } else {
        buyMap.set(buy.stockName, {
          quantity: buy.quantity,
          totalCost: buy.quantity * buy.pricePerStock,
          transactions: [buy]
        });
      }
    });
    
    sells.forEach(sell => {
      const buyData = buyMap.get(sell.stockName);
      if (buyData) {
        buyData.quantity -= sell.quantity;
        if (buyData.quantity <= 0) {
          buyMap.delete(sell.stockName);
        }
      }
    });
    
    const holdings: BuyHolding[] = [];
    buyMap.forEach((data, stockName) => {
      const totalBoughtQuantity = data.transactions.reduce((sum, t) => sum + t.quantity, 0);
      const avgBuyPrice = data.totalCost / totalBoughtQuantity;
      const currentPrice = getCurrentPrice(stockName, market);
      const latestValue = data.quantity * currentPrice;
      const investmentCost = data.quantity * avgBuyPrice;
      const unrealizedPnL = latestValue - investmentCost;
      const percentageChange = investmentCost > 0 ? (unrealizedPnL / investmentCost) * 100 : 0;
      
      holdings.push({
        id: `${stockName}_${Date.now()}`,
        stockName,
        quantity: data.quantity,
        buyPrice: avgBuyPrice,
        investmentCost,
        latestValue,
        unrealizedPnL,
        percentageChange,
      });
    });
    
    return holdings;
  }, [transactions, market]);
  
  // Calculate Sold Holdings
  const soldHoldings: SoldHolding[] = React.useMemo(() => {
    if (!market) return [];
    
    const sells = transactions.filter(t => t.action === 'Sell');
    const sellsByStock = new Map<string, { totalQuantity: number; totalSellValue: number; avgSellPrice: number }>();
    
    sells.forEach(sell => {
      const existing = sellsByStock.get(sell.stockName);
      const sellValue = sell.quantity * sell.pricePerStock;
      if (existing) {
        existing.totalQuantity += sell.quantity;
        existing.totalSellValue += sellValue;
        existing.avgSellPrice = existing.totalSellValue / existing.totalQuantity;
      } else {
        sellsByStock.set(sell.stockName, {
          totalQuantity: sell.quantity,
          totalSellValue: sellValue,
          avgSellPrice: sell.pricePerStock,
        });
      }
    });
    
    const buys = transactions.filter(t => t.action === 'Buy');
    const buyMap = new Map<string, { totalCost: number; totalQuantity: number }>();
    buys.forEach(buy => {
      const existing = buyMap.get(buy.stockName);
      if (existing) {
        existing.totalCost += buy.quantity * buy.pricePerStock;
        existing.totalQuantity += buy.quantity;
      } else {
        buyMap.set(buy.stockName, {
          totalCost: buy.quantity * buy.pricePerStock,
          totalQuantity: buy.quantity,
        });
      }
    });
    
    const sold: SoldHolding[] = [];
    sellsByStock.forEach((data, stockName) => {
      const buyData = buyMap.get(stockName);
      const avgBuyPrice = buyData ? buyData.totalCost / buyData.totalQuantity : 0;
      const realizedProfit = data.totalSellValue - (data.totalQuantity * avgBuyPrice);
      
      sold.push({
        id: `${stockName}_sold_${Date.now()}`,
        stockName,
        quantity: data.totalQuantity,
        sellPrice: data.avgSellPrice,
        sellValue: data.totalSellValue,
        realizedProfit: isNaN(realizedProfit) ? 0 : realizedProfit,
      });
    });
    
    return sold;
  }, [transactions, market]);
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}_${Math.random()}`,
    };
    setTransactions(prev => [...prev, newTransaction]);
    alert(`${transaction.action} transaction added for ${transaction.stockName}`);
  };
  
  const handleDeleteBuyHolding = (holdingId: string) => {
    const holding = buyHoldings.find(h => h.id === holdingId);
    if (holding) {
      const updatedTransactions = transactions.filter(t => 
        !(t.action === 'Buy' && t.stockName === holding.stockName)
      );
      setTransactions(updatedTransactions);
      alert(`Removed ${holding.stockName} from holdings`);
    }
  };
  
  const handleMarketSelect = (selectedMarket: 'india' | 'us') => {
    setLocation(`/portfolio/${selectedMarket}`);
  };
  
  // Default to showing India market data when no market is selected
  const displayMarket = market || 'india';
  const marketData = displayMarket === 'india' ? indiaMarketData : usMarketData;
  const exchangeNote = displayMarket === 'india' ? 'NSE / BSE' : 'NYSE / NASDAQ';
  
  return (
    <div 
      className="min-h-screen pt-20"
      style={{
        backgroundImage: 'url("/images/login.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none"></div>
      
      {/* Market Navigation Buttons */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-md sticky top-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleMarketSelect('india')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                market === 'india'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="text-xl">🇮🇳</span> India Market
            </button>
            <button
              onClick={() => handleMarketSelect('us')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                market === 'us'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="text-xl">🇺🇸</span> US Market
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Overview Table - ALWAYS SHOWS */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {displayMarket === 'india' ? '🇮🇳 India Market Overview' : '🇺🇸 US Market Overview'}
            </h1>
            <span className="text-sm text-white drop-shadow">{exchangeNote}</span>
          </div>
          <MarketTable data={marketData} market={displayMarket as 'india' | 'us'} />
        </div>
        
        {/* Portfolio Section - Only Shows When Market is Selected (Button Clicked) */}
        {market && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Your Portfolio</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Transaction
              </button>
            </div>
            
            {/* Active Holdings Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 drop-shadow">
                <i className="fas fa-chart-line text-green-400"></i> Active Holdings
              </h3>
              <BuyHoldingsTable holdings={buyHoldings} market={market} onDelete={handleDeleteBuyHolding} />
            </div>
            
            {/* Sold Holdings Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 drop-shadow">
                <i className="fas fa-history text-gray-300"></i> Sold Holdings
              </h3>
              <SoldHoldingsTable holdings={soldHoldings} market={market} />
            </div>
          </>
        )}
      </div>
      
      {/* Add Transaction Modal */}
      {market && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTransaction}
          market={market}
        />
      )}
    </div>
  );
};

export default Portfolio;