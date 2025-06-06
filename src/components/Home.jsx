// import React from "react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Link } from "react-router-dom";
//
// const Home = () => {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-bold mb-8 text-center">
//         Welcome to Stock Prediction App
//       </h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>LSTM Prediction</CardTitle>
//             <CardDescription>
//               Use machine learning to predict stock prices
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="mb-4">
//               Leverage the power of Long Short-Term Memory networks to forecast
//               stock prices based on historical data.
//             </p>
//             <Button asChild>
//               <Link to="/lstm">Go to LSTM Prediction</Link>
//             </Button>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Agentic AI</CardTitle>
//             <CardDescription>Get AI-powered insights on stocks</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="mb-4">
//               Interact with an AI agent to get personalized stock market
//               insights and recommendations.
//             </p>
//             <Button asChild>
//               <Link to="/agentic-ai">Go to Agentic AI</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };
//
// export default Home;

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Choose Your Prediction Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>LSTM Prediction</CardTitle>
            <CardDescription>
              Use machine learning to predict stock prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Leverage the power of Long Short-Term Memory networks to forecast
              stock prices based on historical data.
            </p>
            <Button asChild>
              <Link to="/lstm">Go to LSTM Prediction</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agentic AI</CardTitle>
            <CardDescription>Get AI-powered insights on stocks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Interact with an AI agent to get personalized stock market
              insights and recommendations.
            </p>
            <Button asChild>
              <Link to="/agentic-ai">Go to Agentic AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
