import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Hero } from "./components/Hero";
import LSTMPrediction from "./components/LSTMPrediction";
import AgenticAI from "./components/AgenticAI";
import Home from "./components/Home";

const AppContent = () => {
  const location = useLocation();
  const showBanner = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex justify-end p-4 border-b">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
          </div>
          {showBanner && <Hero />}
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lstm" element={<LSTMPrediction />} />
              <Route path="/agentic-ai" element={<AgenticAI />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
