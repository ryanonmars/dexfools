// TradingView Chart Animation Configuration
// Modify these values to customize your chart animation

const chartConfig = {
  // Market Cap Settings
  initialMarketCap: 10000,        // Starting market cap (e.g., 10K)
  finalMarketCap: 50000,        // Target market cap (e.g., 50K)
  minMarketCap: 5000,                // Minimum market cap (can't go below this)
  
  // Animation Timing
  totalSeconds: 10,                // How many seconds the animation should run
  speedMultiplier: 1,              // Animation speed: 1 = real-time, 0.5 = half speed, 2 = double speed
  
  // Randomness Control
  seed: 1,                     // Seed for reproducible animations (change this for different patterns)
  
  // Pre-Animation History
  enableHistoricalData: false,      // Enable/disable historical data before animation
  preAnimationTime: '1h',          // Historical data before animation starts (e.g., '60s', '2h', '10m', '1d')
  
  // Trading Range
  rangeMarketCap: 2000,             // Random trading stays within +/- this range
  
  // Final Action (Dump or Pump)
  finalAction: {
    type: 'dump',                  // 'pump' for green candle up, 'dump' for red candle down
    marketCap: 5000            // Target MC for the final action (e.g., 5K)
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
    firstCandleTime: 1,            // Time in seconds where first candle marker appears
    finalCandleTime: 10,           // Time in seconds where final candle marker appears
    
    // User markers - appear at specific times
    userMarkers: {
      showB: false,                 // Show B marker for user buy
      showS: false,                 // Show S marker for user sell
      bTime: 5,                   // Time in seconds where B marker appears
      sTime: 8,                  // Time in seconds where S marker appears
      bText: 'B',                 // Text for B marker
      sText: 'S'                  // Text for S marker
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chartConfig;
}
