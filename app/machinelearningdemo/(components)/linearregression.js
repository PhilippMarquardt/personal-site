import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateRandomData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    x: i + 1,
    y: Math.floor(Math.random() * 10) + 1
  }));
};

const calculateRegression = (data) => {
  const n = data.length;
  const sumX = data.reduce((acc, point) => acc + point.x, 0);
  const sumY = data.reduce((acc, point) => acc + point.y, 0);
  const sumXY = data.reduce((acc, point) => acc + point.x * point.y, 0);
  const sumXX = data.reduce((acc, point) => acc + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const regressionLine = data.map(point => ({
    x: point.x,
    y: slope * point.x + intercept
  }));

  return { slope, intercept, regressionLine };
};

const LinearRegressionComponent = ({ isDarkMode }) => {
  const [data, setData] = useState(generateRandomData());
  const [showRegression, setShowRegression] = useState(false);
  const [regression, setRegression] = useState(null);

  const handleGenerateData = useCallback(() => {
    setData(generateRandomData());
    setShowRegression(false);
    setRegression(null);
  }, []);

  const handleCalculateRegression = useCallback(() => {
    const newRegression = calculateRegression(data);
    setRegression(newRegression);
    setShowRegression(true);
  }, [data]);

  const yDomain = useMemo(() => {
    let minY = Math.min(...data.map(d => d.y));
    let maxY = Math.max(...data.map(d => d.y));
    
    if (showRegression) {
      const regressionYs = regression.regressionLine.map(d => d.y);
      minY = Math.min(minY, ...regressionYs);
      maxY = Math.max(maxY, ...regressionYs);
    }

    const padding = (maxY - minY) * 0.1; // Add 10% padding
    return [Math.floor(minY - padding), Math.ceil(maxY + padding)];
  }, [data, showRegression, regression]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <p className="mb-4">
        Linear regression finds the best-fitting straight line through a set of points. Click the button to generate 
        new random data, then calculate the regression line to see how it fits the data.
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[1, 10]} />
            <YAxis domain={yDomain} />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#8884d8" name="Data Points" />
            {showRegression && (
              <Line type="monotone" data={regression.regressionLine} dataKey="y" stroke="#82ca9d" strokeWidth={2} dot={false} name="Regression Line" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showRegression && (
        <div>
          <p className="font-semibold">Regression Line Equation:</p>
          <p className="mt-2">
            y = {regression.slope.toFixed(2)}x + {regression.intercept.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LinearRegressionComponent;