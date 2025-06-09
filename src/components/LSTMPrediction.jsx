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
// const BACKEND_URL = "http://localhost:8000";

// Constant for LSTM time step
const LSTM_INPUT_WINDOW = 100; // The TIME_STEP our LSTM expects

// Stock list for the dropdown
const stocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },

  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd." },
  { symbol: "RELI", name: "Reliance Industries Ltd." },
];

export default function LSTMPrediction() {
  const [selectedStock, setSelectedStock] = useState("");
  const [forecastTime, setForecastTime] = useState("5");
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);

  // // Helper to generate future dates for the chart
  // const getNextDate = (currentDateStr) => {
  //   const date = new Date(currentDateStr);
  //   date.setDate(date.getDate() + 1);
  //   return date.toISOString().slice(0, 10); //YYYY-MM-DD format
  // };

  // Helper to generate historical dates
  const generateHistoricalDates = (endDate, numDays) => {
    const dates = [];
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (numDays - 1));

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate.toISOString().slice(0, 10));
    }
    return dates;
  };

  const prepareChartData = (
    historicalPrices,
    predictedPrices,
    forecastDays
  ) => {
    const chartPoints = [];

    // Generate historical dates (ending yesterday)
    const endDateForHistorical = new Date();
    endDateForHistorical.setDate(endDateForHistorical.getDate() - 1);

    const historicalDates = generateHistoricalDates(
      endDateForHistorical,
      LSTM_INPUT_WINDOW
    );

    // Add historical data points (excluding the last one for special handling)
    historicalPrices.slice(0, -1).forEach((price, index) => {
      chartPoints.push({
        date: historicalDates[index],
        actual: price,
        predicted: null,
      });
    });

    // Add the last historical point with only actual value (no predicted)
    if (historicalPrices.length > 0) {
      const lastHistoricalIndex = historicalPrices.length - 1;
      chartPoints.push({
        date: historicalDates[lastHistoricalIndex],
        actual: historicalPrices[lastHistoricalIndex],
        predicted: null,
      });
    }

    // Create connection point - this will be yellow because it's part of predicted line
    let currentDate = new Date(endDateForHistorical);
    currentDate.setDate(currentDate.getDate() + 1); // Start from today

    if (predictedPrices.length > 0) {
      // Connection point: last historical price connects to first predicted price via yellow line
      chartPoints.push({
        date: currentDate.toISOString().slice(0, 10),
        actual: null,
        predicted: predictedPrices[0], // Only yellow line connects here
      });

      // Add a bridge point to ensure smooth connection
      if (chartPoints.length >= 2) {
        const lastHistoricalPrice = chartPoints[chartPoints.length - 2].actual;
        chartPoints[chartPoints.length - 1].predicted = predictedPrices[0];
        // Add the last historical point to predicted line for connection
        chartPoints[chartPoints.length - 2].predicted = lastHistoricalPrice;
      }
    }

    // Add remaining predicted data points
    predictedPrices.slice(1).forEach((price, index) => {
      currentDate.setDate(currentDate.getDate() + 1);
      chartPoints.push({
        date: currentDate.toISOString().slice(0, 10),
        actual: null,
        predicted: price,
      });
    });

    return chartPoints;
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
    setPredictionData([]);
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

      // 3. Make Multi-Step Prediction Request
      const predictionResponse = await fetch(
        `${BACKEND_URL}/lstm/multi-predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initial_prices: historicalDataAsFloats,
            forecast_days: daysToForecast,
            symbol: selectedStock,
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

      // 4. Prepare chart data with improved connection logic
      const chartPoints = prepareChartData(
        historicalDataAsFloats,
        predictedPricesList,
        daysToForecast
      );

      setPredictionData(chartPoints);
      setLatestPrediction(predictedPricesList[predictedPricesList.length - 1]);
    } catch (err) {
      console.error("Error during prediction:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip to show both values when available
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry, index) => {
            if (entry.value !== null) {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {`${entry.name}: $${entry.value.toFixed(2)}`}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
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
              Predicted Price for last forecast day: Rs{" "}
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
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickFormatter={(value) => `Rs${value.toFixed(0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
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
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#FFC107"
                    name="Predicted Price"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
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
