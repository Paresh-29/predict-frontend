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

const LSTM_INPUT_WINDOW = 100;

const stocks = [
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd." },
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd." },
  {
    symbol: "ADANIPORTS.NS",
    name: "Adani Ports and Special Economic Zone Ltd.",
  },
];

export default function LSTMPrediction() {
  const [selectedStock, setSelectedStock] = useState("");
  const [forecastTime, setForecastTime] = useState("5");
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);

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


  const customEndDates = {
    "BHARTIARTL.NS": "2025-06-09",
    "RELIANCE.NS": "2025-06-09",
    "ADANIPORTS.NS": "2025-01-01",
  }

  const prepareChartData = (
    historicalPrices,
    predictedPrices,
    forecastDays,
    lastDate,
    symbol,
  ) => {
    const chartPoints = [];


    // use custom date if available, else use lastDate
    const safeSymbol = symbol?.trim();
    const endDateStr = customEndDates[safeSymbol];
    const endDateForHistorical = new Date(endDateStr);


    console.log("Using endDate for:", safeSymbol, "=>", endDateStr);

    // Generate past dates for historical prices
    const historicalDates = generateHistoricalDates(
      endDateForHistorical,
      historicalPrices.length
    );

    // Add historical prices
    historicalPrices.slice(0, -1).forEach((price, index) => {
      chartPoints.push({
        date: historicalDates[index],
        actual: price,
        predicted: null,
      });
    });

    // Last historical point
    if (historicalPrices.length > 0) {
      const lastIndex = historicalPrices.length - 1;
      chartPoints.push({
        date: historicalDates[lastIndex],
        actual: historicalPrices[lastIndex],
        predicted: null,
      });
    }

    // prediction starts from the next day after the last historical date
    let currentDate = new Date(endDateForHistorical);
    currentDate.setDate(currentDate.getDate() + 1);

    if (predictedPrices.length > 0) {
      chartPoints.push({
        date: currentDate.toISOString().slice(0, 10),
        actual: null,
        predicted: predictedPrices[0],
      });

      // Connect predicted line to last historical price visually
      if (chartPoints.length >= 2) {
        const lastHistoricalPrice = chartPoints[chartPoints.length - 2].actual;
        chartPoints[chartPoints.length - 1].predicted = predictedPrices[0];
        chartPoints[chartPoints.length - 2].predicted = lastHistoricalPrice;
      }
    }

    // Add remaining predicted prices
    predictedPrices.slice(1).forEach((price) => {
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
    if (!selectedStock) {
      setError("Please select a stock.");
      return;
    }

    const daysToForecast = parseInt(forecastTime.trim(), 10);
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
      const historicalResponse = await fetch(
        `${BACKEND_URL}/api/historical_prices?symbol=${selectedStock}&lookback_days=${LSTM_INPUT_WINDOW}`
      );
      if (!historicalResponse.ok) {
        const errData = await historicalResponse.json();
        throw new Error(errData.detail || "Failed to fetch historical data.");
      }


      const historicalJson = await historicalResponse.json();
      console.log("Historical JSON:", historicalJson);

      const historicalDataAsFloats = historicalJson?.historical_prices;
      const lastDate = historicalJson?.last_date;
      console.log("adani last date:", lastDate);

      if (!historicalDataAsFloats || !Array.isArray(historicalDataAsFloats)) {
        throw new Error("Historical price data is missing or invalid.");
      }
      if (!lastDate) {
        throw new Error("Last date from historical data is missing.");
      }

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
        throw new Error(errData.detail || "Prediction request failed.");
      }

      const predictionResult = await predictionResponse.json();
      const predictedPricesList = predictionResult.predicted_prices;

      const chartPoints = prepareChartData(
        historicalDataAsFloats,
        predictedPricesList,
        daysToForecast,
        lastDate,
        selectedStock
      );

      setPredictionData(chartPoints);
      setLatestPrediction(predictedPricesList.at(-1));
    } catch (err) {
      console.error("Error during prediction:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded shadow-lg">
          <p className="font-medium text-foreground">{`Date: ${label}`}</p>
          {payload.map((entry, index) => {
            if (entry.value !== null) {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {`${entry.name}: ₹${entry.value.toFixed(2)}`}
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
                <SelectContent className="bg-white dark:bg-background border border-border text-foreground shadow-md">
                  {stocks.map((stock) => (
                    <SelectItem
                      key={stock.symbol}
                      value={stock.symbol}
                      className={`
                        px-3 py-2 cursor-pointer rounded-sm text-sm
                        data-[state=checked]:bg-primary data-[state=checked]:text-white
                        data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                        dark:data-[highlighted]:bg-primary dark:data-[highlighted]:text-white
                        dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-white
                        [&>svg]:hidden [&_svg]:hidden [&>*>svg]:hidden
                        [&::before]:hidden [&::after]:hidden
                      `}
                    >
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
              isLoading || !selectedStock || parseInt(forecastTime, 10) <= 0
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

          {error && (
            <motion.p
              className="text-red-500 mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          {latestPrediction !== null && !isLoading && !error && (
            <p className="text-green-600 mt-4 text-center text-lg font-bold">
              Predicted Price for last forecast day: ₹
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
                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
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
