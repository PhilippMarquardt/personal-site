import React, { useState, useCallback, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const generateRandomData = () => {
  return Array.from({ length: 50 }, () => {
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    return {
      x,
      y,
      category: y > x ? 1 : 0
    };
  });
};

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

const calculateLogisticRegression = (data) => {
  let theta0 = 0, theta1 = 0;
  const learningRate = 0.1;
  const iterations = 10000; // Increased number of iterations

  for (let i = 0; i < iterations; i++) {
    let gradient0 = 0, gradient1 = 0;
    for (const point of data) {
      const h = sigmoid(theta0 + theta1 * point.x);
      gradient0 += h - point.category;
      gradient1 += (h - point.category) * point.x;
    }
    theta0 -= learningRate * gradient0 / data.length;
    theta1 -= learningRate * gradient1 / data.length;
  }

  console.log("Calculated theta0:", theta0, "theta1:", theta1);
  return { theta0, theta1 };
};

const LogisticRegressionComponent = ({ isDarkMode }) => {
  const [data, setData] = useState(generateRandomData());
  const [showRegression, setShowRegression] = useState(false);
  const [regression, setRegression] = useState(null);

  const handleGenerateData = useCallback(() => {
    setData(generateRandomData());
    setShowRegression(false);
    setRegression(null);
  }, []);

  const handleCalculateRegression = useCallback(() => {
    const newRegression = calculateLogisticRegression(data);
    setRegression(newRegression);
    setShowRegression(true);
    console.log("Regression calculated:", newRegression);
  }, [data]);

  const decisionBoundary = useMemo(() => {
    if (!regression) return null;
    const { theta0, theta1 } = regression;
    if (theta1 === 0) {
      console.error("theta1 is zero, invalid decision boundary");
      return null;
    }
    const slope = -theta1;
    const intercept = -theta0 / theta1;
    console.log("Decision Boundary: slope =", slope, "intercept =", intercept);

    const xMin = 0;
    const xMax = 10;
    const yMin = intercept;
    const yMax = intercept + slope * xMax;

    const clippedYMin = Math.max(0, Math.min(10, yMin));
    const clippedYMax = Math.max(0, Math.min(10, yMax));

    const clippedXMin = yMin < 0 ? (0 - intercept) / slope : xMin;
    const clippedXMax = yMax > 10 ? (10 - intercept) / slope : xMax;

    return {
      x1: clippedXMin,
      y1: clippedYMin,
      x2: clippedXMax,
      y2: clippedYMax
    };
  }, [regression]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <p className="mb-4">
        Logistic regression is used for binary classification problems. It finds a decision boundary that separates two classes. 
        Click the buttons to generate new random data and calculate the logistic regression boundary.
      </p>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleGenerateData}
          className={`px-4 py-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Generate New Data
        </button>
        <button
          onClick={handleCalculateRegression}
          className={`px-4 py-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Calculate Regression
        </button>
      </div>
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="x" domain={[0, 10]} />
            <YAxis type="number" dataKey="y" name="y" domain={[0, 10]} />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Category 0" data={data.filter(d => d.category === 0)} fill="#8884d8" />
            <Scatter name="Category 1" data={data.filter(d => d.category === 1)} fill="#82ca9d" />
            {showRegression && decisionBoundary && (
              <ReferenceLine
                segment={[
                  { x: decisionBoundary.x1, y: decisionBoundary.y1 },
                  { x: decisionBoundary.x2, y: decisionBoundary.y2 }
                ]}
                stroke="red"
                strokeWidth={2}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {showRegression && regression && (
        <div>
          <p className="font-semibold">Logistic Regression Equation:</p>
          <p className="mt-2">
            p(y=1) = sigmoid({regression.theta1.toFixed(2)}x + {regression.theta0.toFixed(2)})
          </p>
          <p className="mt-2">
            The red line represents the decision boundary where p(y=1) = 0.5.
          </p>
        </div>
      )}
    </div>
  );
};

export default LogisticRegressionComponent;
