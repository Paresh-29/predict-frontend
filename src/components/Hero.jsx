// import React from 'react';
// import { motion } from "framer-motion";
//
// export function Hero() {
//   return (
//     <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
//       <div className="container mx-auto px-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center"
//         >
//           <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
//             Predict the Future of Stocks
//           </h1>
//           <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
//             Harness the power of LSTM and Agentic AI to make data-driven investment decisions.
//             Get accurate predictions and insights for your stock market analysis.
//           </p>
//         </motion.div>
//
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="mt-8 flex justify-center gap-4"
//         >
//           <div className="relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
//             <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
//               <h3 className="font-semibold">LSTM Prediction</h3>
//               <p className="text-sm text-muted-foreground">Advanced time-series forecasting</p>
//             </div>
//           </div>
//           <div className="relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
//             <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
//               <h3 className="font-semibold">Agentic AI</h3>
//               <p className="text-sm text-muted-foreground">Intelligent market analysis</p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
//
// export function Hero() {
//   const [isVisible, setIsVisible] = useState(true);
//
//   useEffect(() => {
//     setIsVisible(true);
//     return () => setIsVisible(false);
//   }, []);
//
//   return (
//     <div
//       className={`relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 transition-all duration-300 ease-in-out ${isVisible ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"
//         }`}
//     >
//       {/* Rest of the Hero component remains unchanged */}
//
//       <div className="container mx-auto px-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center"
//         >
//           <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
//             Predict the Future of Stocks
//           </h1>
//           <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
//             Harness the power of LSTM and Agentic AI to make data-driven
//             investment decisions. Get accurate predictions and insights for your
//             stock market analysis.
//           </p>
//         </motion.div>
//
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="mt-8 flex justify-center gap-4"
//         >
//           <div className="relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
//             <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
//               <h3 className="font-semibold">LSTM Prediction</h3>
//               <p className="text-sm text-muted-foreground">
//                 Advanced time-series forecasting
//               </p>
//             </div>
//           </div>
//           <div className="relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
//             <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
//               <h3 className="font-semibold">Agentic AI</h3>
//               <p className="text-sm text-muted-foreground">
//                 Intelligent market analysis
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
            <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">LSTM Prediction</h3>
              <p className="text-sm text-muted-foreground">
                Advanced time-series forecasting
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
            <div className="relative bg-background text-center p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Agentic AI</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent market analysis
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
