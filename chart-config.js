// TradingView Chart Animation Configuration
// Modify these values to customize your chart animation

const chartConfig = {
  // Market Cap Settings
  initialMarketCap: 10000,        // Starting market cap (e.g., 10K)
  finalMarketCap: 20000,        // Target market cap (e.g., 1M)
  minMarketCap: 2000,                // Minimum market cap (can't go below this)
  
  // Animation Timing
  totalSeconds: 20,                // How many seconds the animation should run
  
  // Trading Range
  rangeMarketCap: 2000,             // Random trading stays within +/- this range
  
  // Final Action (Dump or Pump)
  finalAction: {
    type: 'dump',                  // 'pump' for green candle up, 'dump' for red candle down
    marketCap: 1000            // Target MC for the final action (e.g., 500K)
  },
  
  // Chart Styling
  chartStyle: {
    width: 900,
    height: 540,
    candleSpeed: 1000,             // Milliseconds between candles (1 second)
    finalCandlePause: 1000,        // Pause before final action (1 second)
    finalCandleDuration: 4000      // Duration of final candle animation (4 seconds)
  },
  
  // Marker Settings
  markers: {
    showFirstCandle: true,         // Show marker on first candle
    showFinalCandle: true,         // Show marker on final action candle
    firstCandleText: 'DB',         // Text for first candle marker
    finalCandleText: 'DS',         // Text for final action marker (DB for Dump Buy, DS for Dump Sell)
    
    // User markers - appear at specific times
    userMarkers: {
      showB: true,                 // Show B marker for user buy
      showS: true,                 // Show S marker for user sell
      bTime: 5,                   // Time in seconds where B marker appears
      sTime: 15,                  // Time in seconds where S marker appears
      bText: 'B',                 // Text for B marker
      sText: 'S'                  // Text for S marker
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chartConfig;
}
