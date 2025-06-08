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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [forecastTime, setForecastTime] = useState("5"); // Default to 5 days forecast
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Error message
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
      setError("Please limit forecast time to a maximum of 365 days.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionData([]); // Clear previous chart data
    setLatestPrediction(null);

    try {
      // 2. Fetch Historical Data from backend
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
      const historicalDataAsFloats = await historicalResponse.json();

      // Ensure we have exactly LSTM_INPUT_WINDOW data points
      if (historicalDataAsFloats.length !== LSTM_INPUT_WINDOW) {
        throw new Error(
          `Insufficient historical data for ${selectedStock}. Need ${LSTM_INPUT_WINDOW}, got ${historicalDataAsFloats.length}.`
        );
      }

      const initialPrices = historicalDataAsFloats;

      // 3. Make Multi-Step Prediction Request
      const predictionResponse = await fetch(
        `${BACKEND_URL}/lstm/multi-predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initial_prices: initialPrices,
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

      // 4. Prepare Data for the Chart (Adjusted to connect lines and improve X-axis dates)
      const chartPoints = [];
      const HISTORICAL_POINTS_FOR_CHART = LSTM_INPUT_WINDOW; // Show all 100 historical points for context

      let endDateForHistorical = new Date();
      endDateForHistorical.setDate(endDateForHistorical.getDate() - 1); // Adjust to 'yesterday' for last historical point

      let historicalChartDates = [];
      let startDateForHistorical = new Date(endDateForHistorical.getTime());
      startDateForHistorical.setDate(
        startDateForHistorical.getDate() - (HISTORICAL_POINTS_FOR_CHART - 1)
      );

      for (let i = 0; i < HISTORICAL_POINTS_FOR_CHART; i++) {
        const currentDateForHistorical = new Date(
          startDateForHistorical.getTime() + i * 24 * 60 * 60 * 1000
        );
        historicalChartDates.push(
          currentDateForHistorical.toISOString().slice(0, 10)
        );
      }

      // Add recent historical data to chart (actual prices)
      const recentHistoricalPrices = initialPrices.slice(
        -HISTORICAL_POINTS_FOR_CHART
      );
      recentHistoricalPrices.forEach((price, index) => {
        chartPoints.push({
          date: historicalChartDates[index],
          actual: price,
          predicted: null,
        });
      });

      // Connect the historical and predicted lines:
      if (chartPoints.length > 0 && predictedPricesList.length > 0) {
        const lastHistoricalPointIndex = chartPoints.length - 1;
        chartPoints[lastHistoricalPointIndex].predicted =
          predictedPricesList[0];
      }

      // Now add the rest of the predicted data (starting from the second prediction)
      let currentChartDate =
        chartPoints.length > 0
          ? chartPoints[chartPoints.length - 1].date
          : new Date().toISOString().slice(0, 10);

      for (let i = 1; i < predictedPricesList.length; i++) {
        currentChartDate = getNextDate(currentChartDate);
        chartPoints.push({
          date: currentChartDate,
          actual: null,
          predicted: predictedPricesList[i],
        });
      }

      setPredictionData(chartPoints);
      setLatestPrediction(predictedPricesList[predictedPricesList.length - 1]);
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
                max="365"
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
                <LineChart
                  data={predictionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  {" "}
                  {/* Increased bottom margin */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e0e0"
                    className="opacity-50"
                  />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    tickFormatter={(tick) => {
                      // Format date to MM-DD
                      const date = new Date(tick);
                      return `${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}-${date
                        .getDate()
                        .toString()
                        .padStart(2, "0")}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend
                    layout="verticle"
                    wrapperStyle={{
                      top: "center",
                      right: 0,
                      transform: "translateY(-50%)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#007bff"
                    fill="none"
                    name="Actual Price"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    // stroke="hsl(var(--secondary))"
                    stroke="#FFC107"
                    name="Predicted Price"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
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
