import React from "react";
import { Hero } from "../components/Hero";
import { Footer } from "./Footer";

const Home = () => {
  return (
    <div className="bg-background text-foreground container mx-auto px-4 py-8">
      <Hero />
      <Footer />
    </div>
  );
};

export default Home;
