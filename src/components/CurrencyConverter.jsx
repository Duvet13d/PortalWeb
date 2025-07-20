import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { handleCurrencyAPI, globalAPIHandler, apiErrorNotifier } from '../utils/apiFailureHandler';
import { useOfflineStatus } from '../utils/offline.jsx';
import { ariaUtils } from '../utils/accessibility';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  const { isOnline } = useOfflineStatus();
  const targetCurrencies = ["JPY", "USD", "CNY"];
  const baseCurrency = "HKD";

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOfflineData(false);

      // Try multiple API endpoints for better reliability
      const apiEndpoints = [
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
        `https://api.fxratesapi.com/latest?base=${baseCurrency}&symbols=${targetCurrencies.join(',')}`,
        `https://open.er-api.com/v6/latest/${baseCurrency}`
      ];

      let response = null;
      let apiError = null;

      // Try each API endpoint
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying currency API: ${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          response = await fetch(endpoint, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PersonalPortal/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            break; // Success, exit loop
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          console.warn(`API endpoint failed: ${endpoint}`, err);
          apiError = err;
          response = null;
          continue; // Try next endpoint
        }
      }

      if (!response || !response.ok) {
        throw apiError || new Error('All currency API endpoints failed');
      }

      const data = await response.json();
      console.log('Currency API response:', data);

      // Handle different API response formats
      let exchangeRates = {};
      
      if (data.rates) {
        // Standard format (exchangerate-api.com, open.er-api.com)
        exchangeRates = data.rates;
      } else if (data.result === 'success' && data.conversion_rates) {
        // ExchangeRate-API v6 format
        exchangeRates = data.conversion_rates;
      } else if (data[baseCurrency]) {
        // Some APIs return rates directly
        exchangeRates = data[baseCurrency];
      } else {
        // Fallback: assume the data itself contains the rates
        exchangeRates = data;
      }

      // Validate that we have the required currencies
      const hasRequiredRates = targetCurrencies.every(currency => 
        exchangeRates[currency] && !isNaN(exchangeRates[currency])
      );

      if (!hasRequiredRates) {
        throw new Error('Invalid or incomplete exchange rate data');
      }

      setRates(exchangeRates);
      console.log('Exchange rates set:', exchangeRates);

    } catch (err) {
      console.error("Error fetching exchange rates:", err);
      setError("Using demo exchange rates");

      // Notify about the error
      apiErrorNotifier.notify('Currency API', 'network_error', 'Currency service is unavailable. Using demo rates.');

      // Use realistic demo rates for HKD base currency
      const demoRates = {
        JPY: 18.5,    // 1 HKD = ~18.5 JPY
        USD: 0.128,   // 1 HKD = ~0.128 USD  
        CNY: 0.92,    // 1 HKD = ~0.92 CNY
      };
      
      setRates(demoRates);
      setIsOfflineData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty input or valid numbers
    if (value === '' || (!isNaN(value) && !isNaN(parseFloat(value)))) {
      setAmount(value === '' ? 0 : parseFloat(value));
    }
  };

  const add100HKD = () => {
    setAmount((prevAmount) => prevAmount + 100);
  };

  const formatCurrency = (value, currency) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
      maximumFractionDigits: currency === "JPY" ? 0 : 4,
    });
    return formatter.format(value);
  };

  const convertCurrency = (targetCurrency) => {
    if (!rates[targetCurrency] || isNaN(rates[targetCurrency])) return 0;
    const result = amount * rates[targetCurrency];
    return isNaN(result) ? 0 : result;
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-accent-1 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-md mx-auto bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm"
      role="application"
      aria-label="Currency Converter"
    >
      {error && (
        <div 
          className="mb-4 p-3 bg-accent-1 bg-opacity-20 rounded-lg text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-white">{error}</p>
          <p className="text-xs text-gray-400 mt-1">Using fallback rates</p>
        </div>
      )}

      {isOfflineData && !error && (
        <div 
          className="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" aria-hidden="true" />
            <p className="text-white text-sm">
              {!isOnline ? 'Offline - Using cached rates' : 'Using cached exchange rates'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="currency-amount" className="block text-sm font-medium mb-2">
              Amount (HKD)
            </label>
            <input
              id="currency-amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-3 bg-black bg-opacity-50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              placeholder="Enter amount"
              min="0"
              maxLength="11"
              aria-describedby="currency-help"
            />
            <div id="currency-help" className="sr-only">
              Enter the amount in Hong Kong Dollars to convert to other currencies
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={add100HKD}
              className="px-4 py-3 bg-accent-1 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Add 100 Hong Kong Dollars to current amount"
            >
              +100 HKD
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-lg" id="converted-values-heading">Converted Values:</h3>
          <div role="region" aria-labelledby="converted-values-heading">
            {targetCurrencies.map((currency) => (
              <motion.div
                key={currency}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center p-4 bg-black bg-opacity-30 rounded-lg"
                role="group"
                aria-label={`${currency} conversion result`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 bg-accent-2 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-white font-bold text-base">
                      {currency}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-lg font-semibold"
                    aria-label={`${amount} HKD equals ${formatCurrency(convertCurrency(currency), currency)}`}
                  >
                    {formatCurrency(convertCurrency(currency), currency)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Rate: {rates[currency]?.toFixed(4) || "N/A"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchExchangeRates}
          className="w-full mt-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Refresh exchange rates"
        >
          Refresh Rates
        </motion.button>
      </div>
    </div>
  );
};

export default CurrencyConverter;
