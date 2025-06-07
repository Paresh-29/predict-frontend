import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

// Define the backend URL
const BACKEND_URL = "http://127.0.0.1:8000"; // Ensure this matches your FastAPI server address!

// Constant for LSTM time step
const LSTM_INPUT_WINDOW = 100; // The TIME_STEP our LSTM expects

// Stock list for the dropdown
const stocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
];

export default function LSTMPrediction() {
  const [selectedStock, setSelectedStock] = useState("");
  const [forecastTime, setForecastTime] = useState("5");
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);

  // Helper to generate future dates for the chart
  const getNextDate = (currentDateStr) => {
    const date = new Date(currentDateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10); //YYYY-MM-DD format
  };

  const handlePredict = async () => {
    // 1. Basic validation
    if (!selectedStock) {
      setError("Please select a stock.");
      return;
    }
    const daysToForecast = parseInt(forecastTime, 10);
    if (isNaN(daysToForecast) || daysToForecast <= 0) {
      setError(
        "Please enter a valid number of forecasting days (e.g., 1 to 365)."
      );
      return;
    }
    if (daysToForecast > 365) {
      // Enforce a reasonable limit to match backend
      setError("Please limit forecast time to a maximum of 365 days.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionData([]); // Clear previous chart data
    setLatestPrediction(null);

    try {
      // 2. Fetch Historical Data from backend
      // IMPORTANT: Backend currently returns a plain array of floats, not objects with 'date' and 'price'.
      const historicalResponse = await fetch(
        `${BACKEND_URL}/api/historical_prices?symbol=${selectedStock}&lookback_days=${LSTM_INPUT_WINDOW}`
      );
      if (!historicalResponse.ok) {
        const errData = await historicalResponse.json();
        throw new Error(
          errData.detail ||
            `Failed to fetch historical data for ${selectedStock}`
        );
      }
      const historicalDataAsFloats = await historicalResponse.json(); // Renamed for clarity

      // ***** DEBUGGING LINES (Keep these to verify) *****
      console.log(
        "RAW historicalDataAsFloats received from backend:",
        historicalDataAsFloats
      );
      if (historicalDataAsFloats.length > 0) {
        console.log(
          "First item in RAW historicalDataAsFloats:",
          historicalDataAsFloats[0]
        );
      }
      // *************************************************

      // Ensure we have exactly LSTM_INPUT_WINDOW data points
      if (historicalDataAsFloats.length !== LSTM_INPUT_WINDOW) {
        throw new Error(
          `Insufficient historical data for ${selectedStock}. Need ${LSTM_INPUT_WINDOW}, got ${historicalDataAsFloats.length}.`
        );
      }

      // *** CRUCIAL CHANGE: Directly use the array of floats for initial_prices ***
      const initialPrices = historicalDataAsFloats;

      // FOR DEBUGGING (These should now show numbers):
      console.log(
        "initialPrices before sending to backend (now should be numbers):",
        initialPrices
      );
      console.log(
        "Type of first item in initialPrices (now should be number):",
        typeof initialPrices[0]
      );

      // 3. Make Multi-Step Prediction Request
      const predictionResponse = await fetch(
        `${BACKEND_URL}/lstm/multi-predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initial_prices: initialPrices, // This will now be an array of floats
            forecast_days: daysToForecast,
          }),
        }
      );

      if (!predictionResponse.ok) {
        const errData = await predictionResponse.json();
        throw new Error(
          errData.detail ||
            `Failed to get multi-step prediction for ${selectedStock}`
        );
      }
      const predictionResult = await predictionResponse.json();
      const predictedPricesList = predictionResult.predicted_prices;

      // 4. Prepare Data for the Chart (Adjusted for historicalDataAsFloats)
      const chartPoints = [];
      const HISTORICAL_POINTS_FOR_CHART = 30; // Show last N historical points for context

      // Get the last actual price from the fetched historical data (if needed)
      const lastActualPrice = initialPrices[initialPrices.length - 1];

      let lastHistoricalChartDate = new Date(); // Start from today
      lastHistoricalChartDate.setDate(lastHistoricalChartDate.getDate() - 1); // This is 'yesterday'

      let historicalChartDates = [];
      for (let i = 0; i < HISTORICAL_POINTS_FOR_CHART; i++) {
        // Add dates working backwards for historical context
        historicalChartDates.unshift(
          new Date(
            lastHistoricalChartDate.getTime() -
              (HISTORICAL_POINTS_FOR_CHART - 1 - i) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10)
        );
      }

      // Add recent historical data to chart (actual prices)
      const recentHistoricalPrices = initialPrices.slice(
        -HISTORICAL_POINTS_FOR_CHART
      );
      recentHistoricalPrices.forEach((price, index) => {
        chartPoints.push({
          date: historicalChartDates[index], // Use generated historical dates
          actual: price,
          predicted: null,
        });
      });

      // Get the last date from the historical chart points to start future date generation
      let currentChartDate =
        chartPoints.length > 0
          ? chartPoints[chartPoints.length - 1].date
          : new Date().toISOString().slice(0, 10);

      // Add predicted data to chart
      predictedPricesList.forEach((price) => {
        currentChartDate = getNextDate(currentChartDate); // Increment date for each prediction
        chartPoints.push({
          date: currentChartDate,
          actual: null,
          predicted: price,
        });
      });

      setPredictionData(chartPoints);
      setLatestPrediction(predictedPricesList[predictedPricesList.length - 1]); // Store the very last predicted price
    } catch (err) {
      console.error("Error during prediction:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Stock</label>
              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Forecasting Time (days)
              </label>
              <Input
                type="number"
                value={forecastTime}
                onChange={(e) => setForecastTime(e.target.value)}
                placeholder="Enter days (e.g., 5, 30)"
                className="w-full"
                min="1"
                max="365" // Limit to 365 days
                step="1" // Ensure it's an integer input
              />
            </div>
          </div>
          <Button
            onClick={handlePredict}
            className="w-full mt-6"
            disabled={
              isLoading ||
              !selectedStock ||
              parseInt(forecastTime, 10) <= 0 ||
              isNaN(parseInt(forecastTime, 10))
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              "Predict Stock Movement"
            )}
          </Button>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          {latestPrediction !== null && !isLoading && !error && (
            <p className="text-green-600 mt-4 text-center text-lg font-bold">
              Predicted Price for last forecast day:{" "}
              {latestPrediction.toFixed(2)}
            </p>
          )}
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Stock Price Prediction Chart
            </h3>
            {predictionData.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 py-10">
                Select a stock and enter forecast days to see the prediction
                chart.
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">
                  Loading chart data...
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    name="Actual Price"
                    strokeWidth={2}
                    dot={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--secondary))"
                    name="Predicted Price"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
