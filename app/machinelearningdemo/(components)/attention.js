import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SelfAttentionVisualization = ({ isDarkMode }) => {
  const [input, setInput] = useState("The cat sat");
  const [currentStep, setCurrentStep] = useState(0);
  const [calculationStep, setCalculationStep] = useState(0);
  const [pairIndex, setPairIndex] = useState([0, 0]);
  const tokens = useMemo(() => input.split(" "), [input]);

  const steps = [
    { name: "Tokenization", description: "Convert input text to tokens" },
    { name: "Embedding", description: "Convert tokens to embedding vectors" },
    { name: "Q/K/V Generation", description: "Generate Query, Key, and Value vectors" },
    { name: "Attention Calculation", description: "Calculate attention scores step by step" },
    { name: "Attention Matrix", description: "View full attention score matrix" },
    { name: "Softmax", description: "Apply softmax to get attention weights" },
    { name: "Weighted Sum", description: "Compute weighted sum of values" },
  ];

  const dummyVectors = useMemo(() => {
    return tokens.map(() => Array(4).fill(0).map(() => (Math.random() * 2 - 1).toFixed(2)));
  }, [tokens]);

  const dummyAttention = useMemo(() => {
    return tokens.map((_, i) => 
      tokens.map((_, j) => {
        const query = dummyVectors[i].map(v => parseFloat(v));
        const key = dummyVectors[j].map(v => parseFloat(v));
        return query.reduce((sum, q, idx) => sum + q * key[idx], 0) / Math.sqrt(query.length);
      })
    );
  }, [tokens, dummyVectors]);

  const dummyWeights = useMemo(() => {
    return dummyAttention.map(row => {
      const expScores = row.map(score => Math.exp(score));
      const sum = expScores.reduce((a, b) => a + b, 0);
      return expScores.map(score => score / sum);
    });
  }, [dummyAttention]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCurrentStep(0);
    setCalculationStep(0);
    setPairIndex([0, 0]);
  };

  const renderVector = (vector, color) => (
    <div className="flex">
      {vector.map((value, idx) => (
        <motion.div
          key={idx}
          className={`w-8 h-8 m-1 flex items-center justify-center ${color} text-xs`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
        >
          {value}
        </motion.div>
      ))}
    </div>
  );

  const renderAttentionCalculation = () => {
    const [i, j] = pairIndex;
    const query = dummyVectors[i];
    const key = dummyVectors[j];
    const dotProduct = query.reduce((sum, q, idx) => sum + parseFloat(q) * parseFloat(key[idx]), 0);
    const scale = Math.sqrt(query.length);
    const attentionScore = dotProduct / scale;

    const steps = [
      { name: "Select Vectors", render: () => (
        <div className="flex space-x-4">
          <div>
            <p>Query (Q) from "{tokens[i]}"</p>
            {renderVector(query, isDarkMode ? 'bg-red-500' : 'bg-red-300')}
          </div>
          <div>
            <p>Key (K) from "{tokens[j]}"</p>
            {renderVector(key, isDarkMode ? 'bg-green-500' : 'bg-green-300')}
          </div>
        </div>
      )},
      { name: "Element-wise Multiplication", render: () => (
        <div>
          <p className="mb-2">Q * K</p>
          {renderVector(query.map((q, idx) => (parseFloat(q) * parseFloat(key[idx])).toFixed(2)), isDarkMode ? 'bg-yellow-500' : 'bg-yellow-300')}
        </div>
      )},
      { name: "Sum", render: () => (
        <div>
          <p className="mb-2">Sum(Q * K)</p>
          <div className={`w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-purple-500' : 'bg-purple-300'} text-lg`}>
            {dotProduct.toFixed(2)}
          </div>
        </div>
      )},
      { name: "Scale", render: () => (
        <div>
          <p className="mb-2">Scale: √d_k = {scale.toFixed(2)}</p>
          <div className="flex items-center space-x-2">
            <div className={`w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-purple-500' : 'bg-purple-300'} text-lg`}>
              {dotProduct.toFixed(2)}
            </div>
            <span className="text-2xl">/</span>
            <div className={`w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-blue-500' : 'bg-blue-300'} text-lg`}>
              {scale.toFixed(2)}
            </div>
          </div>
        </div>
      )},
      { name: "Final Score", render: () => (
        <div>
          <p className="mb-2">Attention Score</p>
          <div className={`w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-green-500' : 'bg-green-300'} text-lg`}>
            {attentionScore.toFixed(2)}
          </div>
        </div>
      )}
    ];

    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h4 className="text-lg font-semibold mb-4">{steps[calculationStep].name}</h4>
        {steps[calculationStep].render()}
      </motion.div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tokens.map((token, idx) => (
              <motion.div
                key={idx}
                className={`m-2 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
              >
                {token}
              </motion.div>
            ))}
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tokens.map((token, idx) => (
              <motion.div
                key={idx}
                className={`m-2 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                initial={{ y: 0 }}
                animate={{ y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div>{token}</div>
                {renderVector(dummyVectors[idx], isDarkMode ? 'bg-blue-500' : 'bg-blue-300')}
              </motion.div>
            ))}
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tokens.map((token, idx) => (
              <motion.div
                key={idx}
                className={`m-2 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                initial={{ y: -30 }}
                animate={{ y: -60 }}
                transition={{ duration: 0.5 }}
              >
                <div>{token}</div>
                <motion.div className="flex justify-between mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {renderVector(dummyVectors[idx], isDarkMode ? 'bg-red-500' : 'bg-red-300')}
                  {renderVector(dummyVectors[idx], isDarkMode ? 'bg-green-500' : 'bg-green-300')}
                  {renderVector(dummyVectors[idx], isDarkMode ? 'bg-blue-500' : 'bg-blue-300')}
                </motion.div>
                <motion.div className="flex justify-between mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <span>Q</span>
                  <span>K</span>
                  <span>V</span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        );
      case 3:
        return (
          <div>
            {renderAttentionCalculation()}
            <div className="mt-4">
              <button
                onClick={() => setPairIndex([pairIndex[0], pairIndex[1] + 1])}
                disabled={pairIndex[1] >= tokens.length - 1}
                className={`px-4 py-2 mr-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                Next Pair
              </button>
              <button
                onClick={() => setPairIndex([pairIndex[0], pairIndex[1] - 1])}
                disabled={pairIndex[1] <= 0}
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                Previous Pair
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <motion.div 
            className="flex flex-col items-center justify-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.table 
              className={`border-collapse ${isDarkMode ? 'text-white' : 'text-black'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <tbody>
                {dummyAttention.map((row, i) => (
                  <tr key={i}>
                    {row.map((score, j) => (
                      <motion.td
                        key={j}
                        className="border p-2"
                        style={{ backgroundColor: `hsl(${(1 - score) * 240}, 100%, 50%)` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: (i * row.length + j) * 0.05 }}
                      >
                        {score.toFixed(2)}
                      </motion.td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            className="flex flex-col items-center justify-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.table 
              className={`border-collapse ${isDarkMode ? 'text-white' : 'text-black'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <tbody>
                {dummyWeights.map((row, i) => (
                  <tr key={i}>
                    {row.map((weight, j) => (
                      <motion.td
                        key={j}
                        className="border p-2"
                        style={{ backgroundColor: `hsl(${(1 - weight) * 240}, 100%, 50%)` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: (i * row.length + j) * 0.05 }}
                      >
                        {weight.toFixed(2)}
                      </motion.td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tokens.map((token, idx) => (
              <motion.div
                key={idx}
                className={`m-2 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
              >
                <div>{token}</div>
                {renderVector(dummyVectors[idx], isDarkMode ? 'bg-purple-500' : 'bg-purple-300')}
              </motion.div>
            ))}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      if (calculationStep < 4) {
        setCalculationStep(calculationStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
        setCalculationStep(0);
        setPairIndex([pairIndex[0] + 1, 0]);
      }
    } else {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3 && calculationStep > 0) {
      setCalculationStep(calculationStep - 1);
    } else {
      setCurrentStep(Math.max(0, currentStep - 1));
      if (currentStep === 4) {
        setCalculationStep(4);
      }
      if (pairIndex[0] > 0) {
        setPairIndex([pairIndex[0] - 1, tokens.length - 1]);
      } else {
        setPairIndex([0, 0]);
      }
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-4">Self-Attention Mechanism</h2>
      <div className="mb-4">
        <label htmlFor="input" className="block mb-2">Input Sentence:</label>
        <input
          type="text"
          id="input"
          value={input}
          onChange={handleInputChange}
          className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
        />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">
          Step {currentStep + 1}: {steps[currentStep].name}
        </h3>
        <p className="mb-4">{steps[currentStep].description}</p>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0 && calculationStep === 0 && pairIndex[0] === 0 && pairIndex[1] === 0}
          className={`px-4 py-2 rounded ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1 && calculationStep === 4 && pairIndex[0] >= tokens.length - 1 && pairIndex[1] >= tokens.length - 1}
          className={`px-4 py-2 rounded ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelfAttentionVisualization;
