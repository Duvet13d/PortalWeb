import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Landing Search Widget - Minimal search widget optimized for the landing page hero section
 */
const LandingSearchWidget = ({ className = "" }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const [currentEngine, setCurrentEngine] = useState("google");

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Search engines configuration
  const searchEngines = {
    google: {
      name: "Google",
      url: "https://www.google.com/search?q=",
      icon: "🔍",
      color: "text-blue-400",
    },
    duckduckgo: {
      name: "DuckDuckGo",
      url: "https://duckduckgo.com/?q=",
      icon: "🦆",
      color: "text-orange-400",
    },
    bing: {
      name: "Bing",
      url: "https://www.bing.com/search?q=",
      icon: "🔎",
      color: "text-green-400",
    },
  };

  // Search shortcuts configuration
  const searchShortcuts = {
    "g`": { engine: "google", name: "Google" },
    "dd`": { engine: "duckduckgo", name: "DuckDuckGo" },
    "b`": { engine: "bing", name: "Bing" },
    "w`": {
      engine: "custom",
      url: "https://en.wikipedia.org/wiki/Special:Search?search=",
      name: "Wikipedia",
    },
    "gh`": {
      engine: "custom",
      url: "https://github.com/search?q=",
      name: "GitHub",
    },
    "yt`": {
      engine: "custom",
      url: "https://www.youtube.com/results?search_query=",
      name: "YouTube",
    },
    "tw`": {
      engine: "custom",
      url: "https://twitter.com/search?q=",
      name: "Twitter",
    },
    "r`": {
      engine: "custom",
      url: "https://www.reddit.com/search/?q=",
      name: "Reddit",
    },
  };

  // Generate suggestions for shortcut queries
  const getShortcutSuggestions = (shortcut, query) => {
    const lowerQuery = query.toLowerCase();

    switch (shortcut) {
      case "w:": // Wikipedia
        if (
          lowerQuery.includes("javascript") ||
          lowerQuery.includes("programming")
        ) {
          return [
            `${query} programming language`,
            `${query} tutorial`,
            `${query} history`,
          ];
        }
        if (lowerQuery.includes("react") || lowerQuery.includes("vue")) {
          return [
            `${query} framework`,
            `${query} documentation`,
            `${query} comparison`,
          ];
        }
        return [`${query} definition`, `${query} history`, `${query} examples`];

      case "gh:": // GitHub
        if (
          lowerQuery.includes("react") ||
          lowerQuery.includes("vue") ||
          lowerQuery.includes("angular")
        ) {
          return [
            `${query} components`,
            `${query} examples`,
            `${query} boilerplate`,
          ];
        }
        if (
          lowerQuery.includes("javascript") ||
          lowerQuery.includes("typescript")
        ) {
          return [`${query} library`, `${query} framework`, `${query} tools`];
        }
        return [`${query} repository`, `${query} examples`, `${query} awesome`];

      case "yt:": // YouTube
        if (lowerQuery.includes("tutorial") || lowerQuery.includes("learn")) {
          return [
            `${query} 2024`,
            `${query} for beginners`,
            `${query} complete course`,
          ];
        }
        if (
          lowerQuery.includes("javascript") ||
          lowerQuery.includes("programming")
        ) {
          return [
            `${query} tutorial`,
            `${query} crash course`,
            `${query} full course`,
          ];
        }
        return [`${query} tutorial`, `${query} guide`, `${query} how to`];

      case "r:": // Reddit
        if (
          lowerQuery.includes("programming") ||
          lowerQuery.includes("coding")
        ) {
          return [`${query} tips`, `${query} career`, `${query} resources`];
        }
        if (lowerQuery.includes("javascript") || lowerQuery.includes("react")) {
          return [
            `${query} discussion`,
            `${query} help`,
            `${query} best practices`,
          ];
        }
        return [`${query} discussion`, `${query} advice`, `${query} community`];

      case "tw:": // Twitter
        return [`${query} news`, `${query} updates`, `${query} trends`];

      default:
        return [`${query} tutorial`, `${query} guide`, `${query} examples`];
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      // Check for shortcuts
      const shortcutMatch = Object.keys(searchShortcuts).find((shortcut) =>
        searchQuery.toLowerCase().startsWith(shortcut)
      );

      if (shortcutMatch) {
        const shortcutQuery = searchQuery.slice(shortcutMatch.length).trim();
        if (shortcutQuery) {
          // Generate suggestions for the shortcut query using Google suggestions
          const suggestions = [];

          // Add the main shortcut suggestion
          suggestions.push({
            text: `${searchShortcuts[shortcutMatch].name}: ${shortcutQuery}`,
            query: searchQuery,
            isShortcut: true,
            shortcut: shortcutMatch,
          });

          // Get real Google suggestions for the shortcut query
          try {
            const realSuggestions = await fetchRealSuggestions(shortcutQuery);
            suggestions.push(
              ...realSuggestions.slice(0, 3).map((suggestion) => ({
                text: `${searchShortcuts[shortcutMatch].name}: ${suggestion}`,
                query: `${shortcutMatch}${suggestion}`,
                isShortcut: true,
                shortcut: shortcutMatch,
              }))
            );
          } catch (error) {
            console.warn(
              "Failed to fetch Google suggestions for shortcut, using fallback:",
              error
            );
            // Fallback to contextual suggestions
            const platformSuggestions = getShortcutSuggestions(
              shortcutMatch,
              shortcutQuery
            );
            suggestions.push(
              ...platformSuggestions.slice(0, 3).map((suggestion) => ({
                text: `${searchShortcuts[shortcutMatch].name}: ${suggestion}`,
                query: `${shortcutMatch}${suggestion}`,
                isShortcut: true,
                shortcut: shortcutMatch,
              }))
            );
          }

          setSuggestions(suggestions);
        } else {
          setSuggestions([]);
        }
        return;
      }

      try {
        // Generate suggestions (now with real Google suggestions)
        const suggestions = await generateMockSuggestions(searchQuery);
        setSuggestions(suggestions);
      } catch (error) {
        console.warn("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    },
    [searchShortcuts]
  );

  // Real-time currency exchange rates
  const [exchangeRates, setExchangeRates] = useState({
    // Default rates as fallback
    HKD: 1,
    USD: 0.128,
    EUR: 0.118,
    JPY: 18.8,
    CNY: 0.93,
    GBP: 0.101,
    CAD: 0.174,
    AUD: 0.193,
    KRW: 171,
    SGD: 0.172,
  });

  // Fetch real exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const targetCurrencies = [
          "USD",
          "EUR",
          "JPY",
          "CNY",
          "GBP",
          "CAD",
          "AUD",
          "KRW",
          "SGD",
        ];
        const response = await fetch(
          `https://api.exchangerate.host/latest?base=HKD&symbols=${targetCurrencies.join(
            ","
          )}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(8000),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.rates) {
            const hasAllRates = targetCurrencies.every(
              (currency) => data.rates[currency] && !isNaN(data.rates[currency])
            );

            if (hasAllRates) {
              setExchangeRates({ HKD: 1, ...data.rates });
              console.log("Search widget exchange rates updated:", data.rates);
            }
          }
        }
      } catch (error) {
        console.warn(
          "Failed to fetch exchange rates for search widget, using defaults:",
          error
        );
      }
    };

    fetchExchangeRates();
  }, []);

  // Currency aliases
  const currencyAliases = {
    dollar: "USD",
    dollars: "USD",
    usd: "USD",
    $: "USD",
    euro: "EUR",
    euros: "EUR",
    eur: "EUR",
    "€": "EUR",
    yen: "JPY",
    yuan: "CNY",
    rmb: "CNY",
    cny: "CNY",
    jpY: "JPY",
    pound: "GBP",
    pounds: "GBP",
    gbp: "GBP",
    "£": "GBP",
    hkd: "HKD",
    hk$: "HKD",
    hongkong: "HKD",
    cad: "CAD",
    canadian: "CAD",
    aud: "AUD",
    australian: "AUD",
    krw: "KRW",
    won: "KRW",
    sgd: "SGD",
    singapore: "SGD",
  };

  // Check if query is a math expression
  const isMathExpression = (query) => {
    return /^[\d\s+\-*/().]+$/.test(query) && /[+\-*/]/.test(query);
  };

  // Evaluate math expression safely
  const evaluateMath = (expression) => {
    try {
      // Remove spaces and validate
      const cleaned = expression.replace(/\s/g, "");

      // Only allow numbers, operators, and parentheses
      if (!/^[\d+\-*/().]+$/.test(cleaned)) {
        return null;
      }

      // Use Function constructor for safe evaluation (better than eval)
      const result = new Function("return " + cleaned)();

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Check if query is a currency conversion
  const parseCurrencyConversion = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // Enhanced patterns for currency conversion
    const patterns = [
      /^(\d+(?:\.\d+)?)\s*([a-z$€£¥₩]+)\s+to\s+([a-z$€£¥₩]+)$/i,
      /^(\d+(?:\.\d+)?)\s*([a-z$€£¥₩]+)\s+in\s+([a-z$€£¥₩]+)$/i,
      /^convert\s+(\d+(?:\.\d+)?)\s*([a-z$€£¥₩]+)\s+to\s+([a-z$€£¥₩]+)$/i,
      /^(\d+(?:\.\d+)?)\s+([a-z]+)\s*=\s*([a-z]+)$/i,
      /^how\s+much\s+is\s+(\d+(?:\.\d+)?)\s*([a-z$€£¥₩]+)\s+in\s+([a-z$€£¥₩]+)$/i,
    ];

    for (const pattern of patterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        const [, amount, fromCurrency, toCurrency] = match;

        // Resolve currency aliases
        const from =
          currencyAliases[fromCurrency.toLowerCase()] ||
          fromCurrency.toUpperCase();
        const to =
          currencyAliases[toCurrency.toLowerCase()] || toCurrency.toUpperCase();

        if (exchangeRates[from] && exchangeRates[to]) {
          return {
            amount: parseFloat(amount),
            from,
            to,
            fromRate: exchangeRates[from],
            toRate: exchangeRates[to],
          };
        }
      }
    }

    return null;
  };

  // Convert currency
  const convertCurrency = (amount, fromRate, toRate) => {
    // Convert to HKD first, then to target currency
    const hkdAmount = amount / fromRate;
    const result = hkdAmount * toRate;
    return result;
  };

  // Format currency display using Intl.NumberFormat for better formatting
  const formatCurrency = (amount, currency) => {
    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 4,
      });
      return formatter.format(amount);
    } catch (err) {
      // Fallback formatting if Intl.NumberFormat fails
      const symbols = {
        USD: "$",
        EUR: "€",
        JPY: "¥",
        CNY: "¥",
        GBP: "£",
        HKD: "HK$",
        CAD: "C$",
        AUD: "A$",
        KRW: "₩",
        SGD: "S$",
      };

      const symbol = symbols[currency] || currency;
      const decimals = currency === "JPY" || currency === "KRW" ? 0 : 2;
      return `${symbol}${amount.toFixed(decimals)}`;
    }
  };

  // Generate smart suggestions based on query
  // Fetch real search suggestions from Google using JSONP
  const fetchRealSuggestions = async (query) => {
    return new Promise((resolve) => {
      try {
        // Create a unique callback name
        const callbackName = `googleSuggestCallback_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create the callback function
        window[callbackName] = (data) => {
          // Clean up
          delete window[callbackName];
          document.head.removeChild(script);

          // Process the data
          if (data && data[1] && Array.isArray(data[1]) && data[1].length > 0) {
            resolve(data[1].slice(0, 4));
          } else {
            resolve(getSmartSuggestions(query));
          }
        };

        // Create script element for JSONP
        const script = document.createElement("script");
        script.src = `https://suggestqueries.google.com/complete/search?client=firefox&jsonp=${callbackName}&q=${encodeURIComponent(
          query
        )}`;

        // Handle errors
        script.onerror = () => {
          delete window[callbackName];
          document.head.removeChild(script);
          console.warn("Google suggestions JSONP failed, using fallback");
          resolve(getSmartSuggestions(query));
        };

        // Set timeout
        setTimeout(() => {
          if (window[callbackName]) {
            delete window[callbackName];
            if (script.parentNode) {
              document.head.removeChild(script);
            }
            console.warn("Google suggestions timeout, using fallback");
            resolve(getSmartSuggestions(query));
          }
        }, 3000);

        // Add script to head
        document.head.appendChild(script);
      } catch (error) {
        console.warn("Error setting up Google suggestions:", error);
        resolve(getSmartSuggestions(query));
      }
    });
  };

  // Generate smart suggestions based on query patterns
  const getSmartSuggestions = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // Don't show suggestions for very short queries
    if (query.length < 2) {
      return [];
    }

    // Programming languages and frameworks
    if (lowerQuery.includes("javascript") || lowerQuery.includes("js")) {
      return [
        `${query} tutorial`,
        `${query} array methods`,
        `${query} promises`,
        `${query} async await`,
      ];
    }

    if (lowerQuery.includes("react")) {
      return [
        `${query} hooks`,
        `${query} components`,
        `${query} tutorial`,
        `${query} vs vue`,
      ];
    }

    if (lowerQuery.includes("python")) {
      return [
        `${query} tutorial`,
        `${query} for beginners`,
        `${query} data science`,
        `${query} web scraping`,
      ];
    }

    if (lowerQuery.includes("css")) {
      return [
        `${query} grid`,
        `${query} flexbox`,
        `${query} animations`,
        `${query} tricks`,
      ];
    }

    // Question patterns
    if (lowerQuery.startsWith("how to")) {
      return [
        `${query} step by step`,
        `${query} tutorial`,
        `${query} 2024`,
        `${query} for beginners`,
      ];
    }

    if (lowerQuery.startsWith("what is")) {
      return [
        `${query} definition`,
        `${query} explained`,
        `${query} examples`,
        `${query} vs`,
      ];
    }

    if (lowerQuery.startsWith("why")) {
      return [
        `${query} explained`,
        `${query} reasons`,
        `${query} 2024`,
        `${query} important`,
      ];
    }

    if (lowerQuery.startsWith("where")) {
      return [
        `${query} location`,
        `${query} near me`,
        `${query} map`,
        `${query} directions`,
      ];
    }

    if (lowerQuery.startsWith("when")) {
      return [
        `${query} 2024`,
        `${query} date`,
        `${query} time`,
        `${query} schedule`,
      ];
    }

    // Popular topics
    if (
      lowerQuery.includes("ai") ||
      lowerQuery.includes("artificial intelligence")
    ) {
      return [
        `${query} 2024`,
        `${query} tools`,
        `${query} tutorial`,
        `${query} applications`,
      ];
    }

    if (lowerQuery.includes("crypto") || lowerQuery.includes("bitcoin")) {
      return [
        `${query} price`,
        `${query} news`,
        `${query} 2024`,
        `${query} investment`,
      ];
    }

    // Common search patterns
    const commonPatterns = [
      {
        pattern: /learn/i,
        suggestions: ["tutorial", "course", "guide", "for beginners"],
      },
      {
        pattern: /best/i,
        suggestions: ["2024", "top 10", "reviews", "comparison"],
      },
      {
        pattern: /free/i,
        suggestions: ["download", "online", "tools", "resources"],
      },
      {
        pattern: /install/i,
        suggestions: ["guide", "windows", "mac", "linux"],
      },
      {
        pattern: /error/i,
        suggestions: ["fix", "solution", "troubleshoot", "resolved"],
      },
    ];

    for (const { pattern, suggestions } of commonPatterns) {
      if (pattern.test(lowerQuery)) {
        return suggestions.map((suffix) => `${query} ${suffix}`);
      }
    }

    // Default suggestions for any query
    return [
      `${query} 2024`,
      `${query} tutorial`,
      `${query} examples`,
      `${query} guide`,
    ];
  };

  const generateMockSuggestions = async (query) => {
    const suggestions = [];

    // Check for math expression
    if (isMathExpression(query)) {
      const result = evaluateMath(query);
      if (result !== null) {
        suggestions.push({
          text: `${query} = ${result}`,
          query: result.toString(),
          isCalculation: true,
          icon: "🧮",
        });
        return suggestions; // Return early for calculations
      }
    }

    // Check for currency conversion
    const currencyConversion = parseCurrencyConversion(query);
    if (currencyConversion) {
      const { amount, from, to, fromRate, toRate } = currencyConversion;
      const result = convertCurrency(amount, fromRate, toRate);
      const rate = convertCurrency(1, fromRate, toRate);

      suggestions.push({
        text: `${formatCurrency(amount, from)} = ${formatCurrency(result, to)}`,
        query: `${amount} ${from} to ${to}`,
        isCurrency: true,
        icon: "💱",
        details: `Exchange rate: 1 ${from} = ${formatCurrency(rate, to)}`,
        conversionData: {
          amount,
          from,
          to,
          result,
          rate,
        },
      });

      // Add reverse conversion suggestion
      const reverseResult = convertCurrency(amount, toRate, fromRate);
      suggestions.push({
        text: `${formatCurrency(amount, to)} = ${formatCurrency(
          reverseResult,
          from
        )}`,
        query: `${amount} ${to} to ${from}`,
        isCurrency: true,
        icon: "🔄",
        details: `Reverse: 1 ${to} = ${formatCurrency(
          convertCurrency(1, toRate, fromRate),
          from
        )}`,
        conversionData: {
          amount,
          from: to,
          to: from,
          result: reverseResult,
          rate: convertCurrency(1, toRate, fromRate),
        },
      });

      return suggestions; // Return early for currency conversions
    }

    // For regular queries, try to get real Google suggestions
    const realSuggestions = await fetchRealSuggestions(query);
    suggestions.push(
      ...realSuggestions.slice(0, 4).map((suggestion) => ({
        text: suggestion,
        query: suggestion,
        isShortcut: false,
      }))
    );

    return suggestions;
  };

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Handle search execution
  const executeSearch = (searchQuery, forceEngine = null) => {
    if (!searchQuery.trim()) return;

    // Check for math expression
    if (isMathExpression(searchQuery)) {
      const result = evaluateMath(searchQuery);
      if (result !== null) {
        // Copy result to clipboard
        navigator.clipboard
          ?.writeText(result.toString())
          .then(() => {
            console.log("Calculation result copied to clipboard:", result);
          })
          .catch(() => {
            console.log("Calculation result:", result);
          });
        return;
      }
    }

    // Check for currency conversion
    const currencyConversion = parseCurrencyConversion(searchQuery);
    if (currencyConversion) {
      const { amount, from, to, fromRate, toRate } = currencyConversion;
      const result = convertCurrency(amount, fromRate, toRate);
      const formattedResult = formatCurrency(result, to);
      const conversionText = `${formatCurrency(
        amount,
        from
      )} = ${formattedResult}`;

      // Copy result to clipboard with better formatting
      navigator.clipboard
        ?.writeText(conversionText)
        .then(() => {
          console.log(
            "Currency conversion copied to clipboard:",
            conversionText
          );
          // Show a brief success indicator (you could add a toast notification here)
        })
        .catch(() => {
          console.log("Currency conversion result:", conversionText);
        });
      return;
    }

    // Check for shortcuts
    const shortcutMatch = Object.keys(searchShortcuts).find((shortcut) =>
      searchQuery.toLowerCase().startsWith(shortcut)
    );

    if (shortcutMatch) {
      const shortcutConfig = searchShortcuts[shortcutMatch];
      const actualQuery = searchQuery.slice(shortcutMatch.length).trim();

      if (shortcutConfig.engine === "custom") {
        window.open(
          shortcutConfig.url + encodeURIComponent(actualQuery),
          "_blank"
        );
      } else {
        const engine = searchEngines[shortcutConfig.engine];
        window.open(engine.url + encodeURIComponent(actualQuery), "_blank");
      }
      return;
    }

    // Check if it's a URL
    if (isUrl(searchQuery)) {
      const url = searchQuery.startsWith("http")
        ? searchQuery
        : `https://${searchQuery}`;
      window.open(url, "_blank");
      return;
    }

    // Use specified engine or current
    const engine = searchEngines[forceEngine || currentEngine];
    window.open(engine.url + encodeURIComponent(searchQuery), "_blank");
  };

  // URL detection helper
  const isUrl = (text) => {
    return (
      text.includes(".") &&
      !text.includes(" ") &&
      (text.includes(".com") ||
        text.includes(".org") ||
        text.includes(".net") ||
        text.includes(".edu") ||
        text.includes(".gov") ||
        text.includes(".io"))
    );
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestion(-1);
    setShowSuggestions(value.trim().length > 0);
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch(query);
        setQuery("");
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        const suggestion = suggestions[selectedSuggestion];
        executeSearch(suggestion.query);
        setQuery("");
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        inputRef.current?.blur();
      } else {
        executeSearch(query);
        setQuery("");
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        inputRef.current?.blur();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) => {
        const nextIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) => {
        const prevIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
        return prev === -1 ? suggestions.length - 1 : prevIndex;
      });
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    executeSearch(suggestion.query);
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle engine change
  const handleEngineChange = (engineKey) => {
    setCurrentEngine(engineKey);
    setShowEngineSelector(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
      if (showEngineSelector && !event.target.closest(".engine-selector")) {
        setShowEngineSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEngineSelector]);

  const engine = searchEngines[currentEngine];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`w-full max-w-2xl relative ${className}`}
    >
      {/* Main Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search, calculate, or convert currency..."
          className="w-full px-6 py-4 pr-20 text-lg bg-transparent border border-border-primary rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all duration-300 backdrop-blur-sm"
          data-search-input
          aria-label="Search the web or enter a URL"
        />

        {/* Engine Selector and Search Icon */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Engine Selector */}
          <div className="relative engine-selector">
            <button
              onClick={() => setShowEngineSelector(!showEngineSelector)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors ${engine.color}`}
              title={`Search with ${engine.name}`}
              aria-label={`Select search engine, currently ${engine.name}`}
              aria-expanded={showEngineSelector}
              aria-haspopup="listbox"
            >
              <span className="text-sm" aria-hidden="true">
                {engine.icon}
              </span>
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <AnimatePresence>
              {showEngineSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 bg-gray-900/95 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[120px] backdrop-blur-sm"
                  role="listbox"
                  aria-label="Search engine options"
                >
                  {Object.entries(searchEngines).map(([key, searchEngine]) => (
                    <button
                      key={key}
                      onClick={() => handleEngineChange(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        key === currentEngine ? "bg-gray-700/50" : ""
                      }`}
                      role="option"
                      aria-selected={key === currentEngine}
                      aria-label={`Select ${searchEngine.name} as search engine`}
                    >
                      <span className="text-sm" aria-hidden="true">
                        {searchEngine.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${searchEngine.color}`}
                      >
                        {searchEngine.name}
                      </span>
                      {key === currentEngine && (
                        <svg
                          className="w-3 h-3 text-accent-1 ml-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Icon */}
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-secondary/95 border border-border-primary rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto backdrop-blur-sm"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedSuggestion === index
                    ? "bg-accent-1/20 border-l-2 border-accent-1"
                    : "hover:bg-primary/30"
                }`}
                role="option"
                aria-selected={selectedSuggestion === index}
                aria-label={`${
                  suggestion.isCalculation
                    ? "Calculation result"
                    : suggestion.isCurrency
                    ? "Currency conversion"
                    : "Search for"
                } ${suggestion.text}`}
              >
                {suggestion.isCalculation ? (
                  <>
                    <div className="w-5 h-5 text-green-400 flex items-center justify-center text-sm">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`font-medium ${
                          selectedSuggestion === index
                            ? "text-accent-1"
                            : "text-text-primary"
                        }`}
                      >
                        {suggestion.text}
                      </span>
                      <div
                        className={`text-xs ${
                          selectedSuggestion === index
                            ? "text-accent-1/70"
                            : "text-text-secondary"
                        }`}
                      >
                        Calculator
                      </div>
                    </div>
                  </>
                ) : suggestion.isCurrency ? (
                  <>
                    <div className="w-5 h-5 text-blue-400 flex items-center justify-center text-sm">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`font-medium ${
                          selectedSuggestion === index
                            ? "text-accent-1"
                            : "text-text-primary"
                        }`}
                      >
                        {suggestion.text}
                      </span>
                      <div
                        className={`text-xs ${
                          selectedSuggestion === index
                            ? "text-accent-1/70"
                            : "text-text-secondary"
                        }`}
                      >
                        {suggestion.details}
                      </div>
                    </div>
                  </>
                ) : suggestion.isShortcut ? (
                  <>
                    <div className="w-5 h-5 text-accent-2">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span
                      className={
                        selectedSuggestion === index
                          ? "text-accent-1"
                          : "text-text-primary"
                      }
                    >
                      {suggestion.text}
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className={`w-5 h-5 ${
                        selectedSuggestion === index
                          ? "text-accent-1"
                          : "text-text-secondary"
                      }`}
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <span
                      className={
                        selectedSuggestion === index
                          ? "text-accent-1"
                          : "text-text-primary"
                      }
                    >
                      {suggestion.text}
                    </span>
                  </>
                )}
              </button>
            ))}

            {/* Search Features Hint */}
            <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/30">
              <p className="text-xs text-gray-400 mb-2">
                <span className="text-green-400">🧮</span> Math:{" "}
                <code className="bg-gray-700 px-1 rounded text-accent-1">
                  5 + 4
                </code>
                <span className="text-blue-400 ml-3">💱</span> Currency:{" "}
                <code className="bg-gray-700 px-1 rounded text-accent-1">
                  1000 yen to hkd
                </code>
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  <span className="text-gray-300">Search Engines:</span>
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    g`
                  </code>{" "}
                  Google,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    dd`
                  </code>{" "}
                  DuckDuckGo,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    b`
                  </code>{" "}
                  Bing
                </p>
                <p>
                  <span className="text-gray-300">Websites:</span>
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    w`
                  </code>{" "}
                  Wikipedia,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    gh`
                  </code>{" "}
                  GitHub,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    yt`
                  </code>{" "}
                  YouTube,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    tw`
                  </code>{" "}
                  Twitter,
                  <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">
                    r`
                  </code>{" "}
                  Reddit
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LandingSearchWidget;
