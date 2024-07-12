import React, { useState, useCallback, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const generateRandomData = () => {
  return Array.from({ length: 50 }, () => {
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    return {
      x,
      y,
      category: y > x + 2 * (Math.random() * 2 - 1) ? 1 : -1 // Increased separation
    };
  });
};

const calculateSVM = (data) => {
  // Simplified SVM implementation
  let w = [0, 0];
  let b = 0;
  const learningRate = 0.01;
  const iterations = 2000;

  for (let iter = 0; iter < iterations; iter++) {
    for (const point of data) {
      const x = [point.x, point.y];
      const y = point.category;
      const decision = y * (w[0] * x[0] + w[1] * x[1] + b);

      if (decision < 1) {
        w[0] += learningRate * (y * x[0] - 2 * (1 / iterations) * w[0]);
        w[1] += learningRate * (y * x[1] - 2 * (1 / iterations) * w[1]);
        b += learningRate * y;
      } else {
        w[0] -= learningRate * 2 * (1 / iterations) * w[0];
        w[1] -= learningRate * 2 * (1 / iterations) * w[1];
      }
    }
  }

  return { w, b };
};

const SVMComponent = ({ isDarkMode }) => {
  const [data, setData] = useState(generateRandomData());
  const [showSVM, setShowSVM] = useState(false);
  const [svm, setSVM] = useState(null);

  const handleGenerateData = useCallback(() => {
    setData(generateRandomData());
    setShowSVM(false);
    setSVM(null);
  }, []);

  const handleCalculateSVM = useCallback(() => {
    const newSVM = calculateSVM(data);
    setSVM(newSVM);
    setShowSVM(true);
  }, [data]);

  const getIntersectionPoints = (slope, intercept, xMin, xMax, yMin, yMax) => {
    const points = [];

    const yAtXMin = slope * xMin + intercept;
    const yAtXMax = slope * xMax + intercept;
    const xAtYMin = (yMin - intercept) / slope;
    const xAtYMax = (yMax - intercept) / slope;

    if (yAtXMin >= yMin && yAtXMin <= yMax) {
      points.push({ x: xMin, y: yAtXMin });
    }
    if (yAtXMax >= yMin && yAtXMax <= yMax) {
      points.push({ x: xMax, y: yAtXMax });
    }
    if (xAtYMin >= xMin && xAtYMin <= xMax) {
      points.push({ x: xAtYMin, y: yMin });
    }
    if (xAtYMax >= xMin && xAtYMax <= xMax) {
      points.push({ x: xAtYMax, y: yMax });
    }

    // Return only the two boundary points
    return points.slice(0, 2);
  };

  const getClippedLine = (slope, intercept, marginOffset = 0) => {
    const xMin = 0;
    const xMax = 10;
    const yMin = 0;
    const yMax = 10;
    return getIntersectionPoints(slope, intercept + marginOffset, xMin, xMax, yMin, yMax);
  };

  const svmVisualization = useMemo(() => {
    if (!svm) return { decisionBoundary: [], margins: [], supportVectors: [] };

    const { w, b } = svm;
    const slope = -w[0] / w[1];
    const intercept = -b / w[1];
    const margin = 1 / Math.sqrt(w[0] ** 2 + w[1] ** 2);

    const decisionBoundary = getClippedLine(slope, intercept);
    const margin1 = getClippedLine(slope, intercept, margin);
    const margin2 = getClippedLine(slope, intercept, -margin);

    const supportVectors = data.filter(point => {
      const distance = Math.abs(w[0] * point.x + w[1] * point.y + b) / Math.sqrt(w[0] ** 2 + w[1] ** 2);
      return Math.abs(distance - margin) < 0.1;
    });

    return { decisionBoundary, margins: [margin1, margin2], supportVectors };
  }, [svm, data]);

  const yDomain = useMemo(() => {
    const yValues = data.map(d => d.y);
    const minY = Math.min(...yValues, ...svmVisualization.decisionBoundary.map(p => p.y));
    const maxY = Math.max(...yValues, ...svmVisualization.decisionBoundary.map(p => p.y));
    const padding = (maxY - minY) * 0.1;
    return [Math.max(0, minY - padding), Math.min(10, maxY + padding)];
  }, [data, svmVisualization]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <p className="mb-4">
        Support Vector Machines (SVM) find the hyperplane that best separates two classes with the maximum margin. 
        Click the buttons to generate new random data and calculate the SVM decision boundary.
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
          onClick={handleCalculateSVM}
          className={`px-4 py-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Calculate SVM
        </button>
      </div>
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="x" domain={[0, 10]} />
            <YAxis type="number" dataKey="y" name="y" domain={yDomain} />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Category -1" data={data.filter(d => d.category === -1)} fill="#8884d8" />
            <Scatter name="Category 1" data={data.filter(d => d.category === 1)} fill="#82ca9d" />
            {showSVM && (
              <>
                <ReferenceLine segment={svmVisualization.decisionBoundary} stroke="red" strokeWidth={2} />
                {svmVisualization.margins.map((margin, index) => (
                  <ReferenceLine key={index} segment={margin} stroke="gray" strokeDasharray="3 3" />
                ))}
                <Scatter 
                  name="Support Vectors" 
                  data={svmVisualization.supportVectors} 
                  fill="orange"
                  shape="star"
                  size={100}
                />
              </>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {showSVM && svm && (
        <div>
          <p className="font-semibold">SVM Decision Boundary:</p>
          <p className="mt-2">
            {svm.w[0].toFixed(2)}x + {svm.w[1].toFixed(2)}y + {svm.b.toFixed(2)} = 0
          </p>
          <p className="mt-2">
            The red line is the decision boundary (hyperplane). Gray dashed lines show the margins. Orange stars are support vectors.
          </p>
        </div>
      )}
    </div>
  );
};

export default SVMComponent;