// TradingView Custom Datafeed Service
class CustomDatafeed {
  constructor() {
    this.symbolInfo = {
      ticker: 'CUSTOM',
      name: 'Custom Token',
      description: 'Custom animated token',
      type: 'crypto',
      session: '24x7',
      timezone: 'UTC',
      exchange: 'Custom',
      minmov: 1,
      pricescale: 100,
      pointvalue: 1,
      has_intraday: true,
      has_weekly_and_monthly: false,
      has_seconds: true,
      has_daily: true,
      supported_resolutions: ['1S', '5S', '10S', '15S', '30S', '1', '5', '15', '30', '60', '240', '1D'],
      volume_precision: 0,
      data_status: 'streaming',
      visible_plots_set: 'ohlcv',
      intraday_multipliers: ['1S', '5S', '10S', '15S', '30S', '1', '5', '15', '30', '60', '240'],
      seconds_multipliers: ['1S', '5S', '10S', '15S', '30S'],
      format: 'price',
      // Add required fields to prevent schema warnings
      listed_exchange: 'Custom',
      currency_code: 'USD'
    };
    this.currentData = [];
    this.realtimeCallback = null;
    this.getBarsCache = new Map(); // Cache for getBars responses
    this.lastGetBarsTime = 0;
    this.getBarsDebounceMs = 100; // Debounce getBars calls
    
    // Add some initial data to prevent "no data" message
    this.addInitialData();
    
    // Log all method calls for debugging
    this.logMethodCalls();
  }

  logMethodCalls() {
    const methods = ['onReady', 'searchSymbols', 'resolveSymbol', 'subscribeBars', 'unsubscribeBars', 'getTimescaleMarks', 'getServerTime', 'updateData', 'calculateHistoryDepth', 'getMarks'];
    methods.forEach(method => {
      const original = this[method];
      this[method] = (...args) => {
        console.log(`🎯 Method called: ${method}`, args);
        return original.apply(this, args);
      };
    });
    
    // Special handling for getBars to reduce logging noise
    const originalGetBars = this.getBars;
    this.getBars = (...args) => {
      console.log(`🔥 getBars called with resolution: ${args[1]} periodParams:`, args[2], 'data length:', this.currentData.length);
      return originalGetBars.apply(this, args);
    };
  }

  onReady(callback) {
    console.log('🚀 Datafeed onReady called');
    setTimeout(() => {
      const config = {
        supported_resolutions: ['1S', '5S', '10S', '15S', '30S', '1', '5', '15', '30', '60', '240', '1D'],
        supports_marks: true,
        supports_timescale_marks: true,
        supports_time: true,
        exchanges: [],
        symbols_types: [],
        supports_search: false,
        supports_group_request: false
      };
      console.log('📤 Sending config to TradingView:', config);
      callback(config);
    }, 0);
  }

  addInitialData() {
    // Add some initial data to prevent "no data" message
    const now = Math.floor(Date.now() / 1000);
    const initialPrice = 10000;
    
    for (let i = 0; i < 10; i++) {
      this.currentData.push({
        time: now - (10 - i),
        open: initialPrice + i * 10,
        high: initialPrice + i * 10 + 50,
        low: initialPrice + i * 10 - 50,
        close: initialPrice + (i + 1) * 10,
        volume: 1000 + i * 100
      });
    }
    console.log('Added initial data:', this.currentData.length, 'bars');
    console.log('Sample data:', this.currentData[0]);
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log('searchSymbols called with:', userInput, exchange, symbolType);
    onResultReadyCallback([]);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    console.log('🔍 Datafeed resolveSymbol called for:', symbolName);
    setTimeout(() => {
      // Return a copy of the symbolInfo to avoid reference issues
      const symbolInfo = { ...this.symbolInfo };
      console.log('📋 Resolving symbol with info:', symbolInfo);
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  }

  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    // Validate inputs
    if (!onHistoryCallback || typeof onHistoryCallback !== 'function') {
      console.error('❌ Invalid onHistoryCallback provided to getBars');
      return;
    }
    
    if (!resolution) {
      console.error('❌ No resolution provided to getBars');
      if (onErrorCallback) {
        onErrorCallback(new Error('No resolution provided'));
      }
      return;
    }
    
    // Check if resolution is supported
    if (!this.symbolInfo.supported_resolutions.includes(resolution)) {
      console.error('❌ Unsupported resolution requested:', resolution);
      console.error('Available resolutions:', this.symbolInfo.supported_resolutions);
      if (onErrorCallback) {
        onErrorCallback(new Error(`Unsupported resolution: ${resolution}`));
      }
      return;
    }
    
    // Create cache key
    const cacheKey = `${resolution}_${JSON.stringify(periodParams || {})}`;
    const now = Date.now();
    
    // Debounce rapid calls
    if (now - this.lastGetBarsTime < this.getBarsDebounceMs) {
      return;
    }
    this.lastGetBarsTime = now;
    
    // Check cache first
    if (this.getBarsCache.has(cacheKey)) {
      const cachedData = this.getBarsCache.get(cacheKey);
      console.log('📋 Using cached data for', resolution);
      onHistoryCallback(cachedData.data, cachedData.meta);
      return;
    }
    
    // Always provide data, even if empty
    setTimeout(() => {
      try {
        if (this.currentData && this.currentData.length > 0) {
          let tvData;
          
          // Handle daily resolution by aggregating minute data
          if (resolution === '1D') {
            console.log('📅 Processing daily resolution - aggregating minute data');
            tvData = this.aggregateToDaily(this.currentData);
          } else {
            // Convert our data format to TradingView format for other resolutions
            tvData = this.currentData.map(bar => {
              if (!bar || typeof bar.time !== 'number') {
                console.warn('Invalid bar data:', bar);
                return null;
              }
              return {
                time: bar.time * 1000, // TradingView expects milliseconds
                open: bar.open || 0,
                high: bar.high || 0,
                low: bar.low || 0,
                close: bar.close || 0,
                volume: bar.volume || 0
              };
            }).filter(bar => bar !== null); // Remove invalid bars
          }
          
          const meta = { noData: false };
          
          // Cache the response
          this.getBarsCache.set(cacheKey, { data: tvData, meta: meta });
          
          // Clear old cache entries (keep only last 10)
          if (this.getBarsCache.size > 10) {
            const firstKey = this.getBarsCache.keys().next().value;
            this.getBarsCache.delete(firstKey);
          }
          
          console.log('✅ Sending', tvData.length, 'bars to TradingView for resolution', resolution);
          onHistoryCallback(tvData, meta);
        } else {
          console.log('📊 No data available, sending empty response');
          const emptyMeta = { noData: true };
          this.getBarsCache.set(cacheKey, { data: [], meta: emptyMeta });
          onHistoryCallback([], emptyMeta);
        }
      } catch (error) {
        console.error('❌ Error in getBars:', error);
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      }
    }, 0);
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
    console.log('📡 subscribeBars called with resolution:', resolution);
    
    this.realtimeCallback = onRealtimeCallback;
    
    try {
      // If we have data, send it immediately
      if (this.currentData.length > 0) {
        console.log('📤 Sending initial data on subscribe');
        const tvData = this.currentData.map(bar => ({
          time: bar.time * 1000,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume
        }));
        onRealtimeCallback(tvData[tvData.length - 1]);
      }
    } catch (error) {
      console.error('❌ Error in subscribeBars:', error);
    }
  }

  unsubscribeBars(subscribeUID) {
    this.realtimeCallback = null;
  }

  getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
    // Return empty array for now - can be implemented later for custom marks
    onDataCallback([]);
  }

  getServerTime(callback) {
    console.log('🕐 getServerTime called');
    // Return current server time
    callback(Math.floor(Date.now() / 1000));
  }

  // Add additional required methods
  calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
    console.log('📊 calculateHistoryDepth called:', resolution, resolutionBack, intervalBack);
    return undefined; // Use default
  }

  getMarks(symbolInfo, from, to, onDataCallback, resolution) {
    console.log('📍 getMarks called:', symbolInfo, from, to, resolution);
    onDataCallback([]);
  }

  // Aggregate minute data to daily bars
  aggregateToDaily(minuteData) {
    if (!minuteData || minuteData.length === 0) {
      return [];
    }
    
    // Group bars by day
    const dailyBars = new Map();
    
    minuteData.forEach(bar => {
      if (!bar || typeof bar.time !== 'number') return;
      
      // Get the start of the day (midnight UTC)
      const dayStart = new Date(bar.time * 1000);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayKey = dayStart.getTime() / 1000; // Convert back to seconds
      
      if (!dailyBars.has(dayKey)) {
        dailyBars.set(dayKey, {
          time: dayKey,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume
        });
      } else {
        const existingBar = dailyBars.get(dayKey);
        existingBar.high = Math.max(existingBar.high, bar.high);
        existingBar.low = Math.min(existingBar.low, bar.low);
        existingBar.close = bar.close; // Last close of the day
        existingBar.volume += bar.volume;
      }
    });
    
    // Convert to array and sort by time
    const result = Array.from(dailyBars.values())
      .map(bar => ({
        time: bar.time * 1000, // Convert to milliseconds for TradingView
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }))
      .sort((a, b) => a.time - b.time);
    
    console.log(`📅 Aggregated ${minuteData.length} minute bars into ${result.length} daily bars`);
    return result;
  }

  updateData(newData) {
    console.log('updateData called with', newData.length, 'bars');
    this.currentData = newData;
    
    // Clear cache when new data is added
    this.getBarsCache.clear();
    
    if (this.realtimeCallback && newData.length > 0) {
      try {
        const latestBar = newData[newData.length - 1];
        // Convert to TradingView format
        const tvBar = {
          time: latestBar.time * 1000, // Convert to milliseconds
          open: latestBar.open,
          high: latestBar.high,
          low: latestBar.low,
          close: latestBar.close,
          volume: latestBar.volume
        };
        console.log('📡 Sending real-time update to chart:', tvBar);
        this.realtimeCallback(tvBar);
      } catch (error) {
        console.error('Error in updateData:', error);
      }
    } else {
      console.log('⚠️ No realtimeCallback available for updateData');
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomDatafeed;
} else {
  // Make available globally
  window.CustomDatafeed = CustomDatafeed;
}
