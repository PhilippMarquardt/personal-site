import React, { useState, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

const generateRandomData = (n = 100) => {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 10,
    y: Math.random() * 10 + Math.random() * 5, // Add some noise
  }));
};

const standardize = (data) => {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);
  return data.map(val => (val - mean) / std);
};

const LassoRidgeRegression = ({ isDarkMode }) => {
  const [data, setData] = useState(generateRandomData());
  const [regressionType, setRegressionType] = useState('lasso');
  const [alpha, setAlpha] = useState(0.1);
  const [regressionLine, setRegressionLine] = useState([]);
  const [regressionDetails, setRegressionDetails] = useState(null);

  const regenerateData = useCallback(() => {
    setData(generateRandomData());
    setRegressionLine([]);
    setRegressionDetails(null);
  }, []);

  const performRegression = useCallback(() => {
    const X = standardize(data.map(d => d.x));
    const y = standardize(data.map(d => d.y));

    let beta = 0;
    let intercept = 0;
    const learningRate = 0.01;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const predictions = X.map(x => beta * x + intercept);
      const errors = predictions.map((pred, i) => pred - y[i]);

      const gradientBeta = (1 / X.length) * X.reduce((sum, x, i) => sum + x * errors[i], 0);
      const gradientIntercept = (1 / X.length) * errors.reduce((sum, error) => sum + error, 0);

      if (regressionType === 'lasso') {
        beta -= learningRate * (gradientBeta + alpha * Math.sign(beta));
      } else { // ridge
        beta -= learningRate * (gradientBeta + alpha * beta);
      }
      intercept -= learningRate * gradientIntercept;
    }

    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const yMin = beta * xMin + intercept;
    const yMax = beta * xMax + intercept;

    setRegressionLine([
      { x: xMin, y: yMin },
      { x: xMax, y: yMax },
    ]);

    setRegressionDetails({ beta, intercept });
  }, [data, regressionType, alpha]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={regenerateData}
          className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
        >
          Regenerate Data
        </button>
        <div>
          <button
            onClick={() => setRegressionType('lasso')}
            className={`px-4 py-2 rounded mr-2 ${
              regressionType === 'lasso'
                ? (isDarkMode ? 'bg-green-600' : 'bg-green-500')
                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            } ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors`}
          >
            Lasso
          </button>
          <button
            onClick={() => setRegressionType('ridge')}
            className={`px-4 py-2 rounded mr-2 ${
              regressionType === 'ridge'
                ? (isDarkMode ? 'bg-green-600' : 'bg-green-500')
                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            } ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors`}
          >
            Ridge
          </button>
          <button
            onClick={performRegression}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white transition-colors`}
          >
            Calculate
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="alpha" className="block mb-2">Alpha: {alpha}</label>
        <input
          type="range"
          id="alpha"
          min="0"
          max="1"
          step="0.01"
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X" />
            <YAxis type="number" dataKey="y" name="Y" />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data" data={data} fill="#8884d8" />
            {regressionLine.length > 0 && (
              <Line
                type="linear"
                dataKey="y"
                data={regressionLine}
                stroke="#ff7300"
                strokeWidth={2}
                dot={false}
                legendType="none"
                name="Regression Line"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {regressionDetails && (
        <div className="mt-4">
          <h3 className="font-semibold">Regression Details:</h3>
          <p>Type: {regressionType === 'lasso' ? 'Lasso' : 'Ridge'}</p>
          <p>Coefficient: {regressionDetails.beta.toFixed(4)}</p>
          <p>Intercept: {regressionDetails.intercept.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
};

export default LassoRidgeRegression;