import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { TrendingUp, BrainCircuit } from "lucide-react";

export function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16"
    >
      <div className="container mx-auto px-4">
        {/* Heading and description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Predict the Future of Stocks
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Harness the power of LSTM and Agentic AI to make data-driven
            investment decisions. Get accurate predictions and insights for your
            stock market analysis.
          </p>
        </motion.div>

        {/* Prediction Options (Cards) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col md:flex-row justify-center gap-6"
        >
          {/* Short-Term Card */}
          <Link to="/lstm" className="relative group w-full md:w-1/3">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition" />
            <div className="relative bg-background text-center p-6 rounded-lg space-y-3 shadow-md border border-border">
              <TrendingUp className="mx-auto h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg text-foreground">
                Short-Term (LSTM)
              </h3>
              <p className="text-sm text-muted-foreground">
                Predict short-term price trends using deep learning.
              </p>
            </div>
          </Link>

          {/* Mid/Long-Term Card */}
          <Link to="/agentic-ai" className="relative group w-full md:w-1/3">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition" />
            <div className="relative bg-background text-center p-6 rounded-lg space-y-3 shadow-md border border-border">
              <BrainCircuit className="mx-auto h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg text-foreground">
                Mid/Long-Term (Agentic AI)
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered insights for strategic investment decisions.
              </p>
            </div>
          </Link>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button asChild>
            <Link to="/lstm">Start Short-Term Prediction</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/agentic-ai">Explore Long-Term Insights</Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
