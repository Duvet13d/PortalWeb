import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetCurrencies = ["JPY", "USD", "CNY"];
  const baseCurrency = "HKD";

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using exchangerate-api.com - free tier available
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      setRates(response.data.rates);
    } catch (err) {
      setError("Failed to fetch exchange rates");
      console.error("Error fetching rates:", err);

      // Fallback to mock rates if API fails
      setRates({
        JPY: 17.5,
        USD: 0.128,
        CNY: 0.92,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
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
    if (!rates[targetCurrency]) return 0;
    return amount * rates[targetCurrency];
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
    <div className="w-full max-w-md mx-auto bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm">
      {/* <h2 className="font-heading text-xl mb-6 text-center">Currency Converter</h2> */}

      {error && (
        <div className="mb-4 p-3 bg-accent-1 bg-opacity-20 rounded-lg text-center">
          <p className="text-sm text-accent-1">{error}</p>
          <p className="text-xs text-gray-400 mt-1">Using fallback rates</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Amount (HKD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-3 bg-black bg-opacity-50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              placeholder="Enter amount"
              min="0"
              maxLength="11"
            />
          </div>
          <div className="flex flex-col justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={add100HKD}
              className="px-4 py-3 bg-accent-1 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              +100 HKD
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-lg">Converted Values:</h3>
          {targetCurrencies.map((currency) => (
            <motion.div
              key={currency}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center p-4 bg-black bg-opacity-30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-2 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">
                    {currency}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatCurrency(convertCurrency(currency), currency)}
                </div>
                <div className="text-xs text-gray-400">
                  Rate: {rates[currency]?.toFixed(4) || "N/A"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchExchangeRates}
          className="w-full mt-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-medium transition-colors duration-200"
        >
          Refresh Rates
        </motion.button>
      </div>
    </div>
  );
};

export default CurrencyConverter;
