import React, { useState, useCallback, useMemo } from 'react';

const generateRandomData = (n = 100) => {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 10,
    y: Math.random() * 10,
    category: Math.random() > 0.5 ? 1 : 0
  }));
};

const calculateGiniImpurity = (data) => {
  const total = data.length;
  if (total === 0) return 0;
  const classCounts = data.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});
  return 1 - Object.values(classCounts).reduce((sum, count) => sum + Math.pow(count / total, 2), 0);
};

const findBestSplit = (data, features) => {
  let bestGini = Infinity;
  let bestFeature = null;
  let bestThreshold = null;

  features.forEach(feature => {
    const values = data.map(d => d[feature]).sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const left = data.filter(d => d[feature] <= threshold);
      const right = data.filter(d => d[feature] > threshold);
      const gini = (left.length / data.length) * calculateGiniImpurity(left) +
                   (right.length / data.length) * calculateGiniImpurity(right);
      if (gini < bestGini) {
        bestGini = gini;
        bestFeature = feature;
        bestThreshold = threshold;
      }
    }
  });

  return { feature: bestFeature, threshold: bestThreshold, gini: bestGini };
};

const buildTreeStep = (node, depth = 0) => {
  if (depth >= 3 || node.data.length <= 5 || calculateGiniImpurity(node.data) === 0) {
    node.leaf = true;
    node.prediction = node.data.reduce((sum, d) => sum + d.category, 0) / node.data.length > 0.5 ? 1 : 0;
    return;
  }

  const split = findBestSplit(node.data, ['x', 'y']);
  node.split = split;
  node.left = { data: node.data.filter(d => d[split.feature] <= split.threshold) };
  node.right = { data: node.data.filter(d => d[split.feature] > split.threshold) };
};

const DecisionTreeVisualization = ({ isDarkMode }) => {
  const [data] = useState(() => generateRandomData());
  const [currentStep, setCurrentStep] = useState(0);
  const [tree, setTree] = useState({ data });

  const buildTree = useCallback(() => {
    const newTree = { ...tree };
    let node = newTree;
    for (let i = 0; i < currentStep; i++) {
      if (node.left) node = node.left;
    }
    buildTreeStep(node);
    setTree(newTree);
  }, [currentStep, tree]);

  useMemo(() => {
    buildTree();
  }, [buildTree, currentStep]);

  const handleForward = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBackward = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const renderNode = (node, x, y, width, depth = 0) => {
    if (!node) return null;

    const nodeRadius = 30;
    const verticalSpacing = 80;

    return (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r={nodeRadius} fill={isDarkMode ? "#4B5563" : "#E5E7EB"} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={isDarkMode ? "white" : "black"}>
          {node.leaf ? `P: ${node.prediction.toFixed(2)}` : `G: ${node.split.gini.toFixed(2)}`}
        </text>
        {node.split && (
          <>
            <line x1={x} y1={y + nodeRadius} x2={x - width / 4} y2={y + verticalSpacing - nodeRadius} 
                  stroke={isDarkMode ? "white" : "black"} />
            <line x1={x} y1={y + nodeRadius} x2={x + width / 4} y2={y + verticalSpacing - nodeRadius} 
                  stroke={isDarkMode ? "white" : "black"} />
            <text x={x - width / 8} y={y + verticalSpacing / 2} textAnchor="middle" fill={isDarkMode ? "white" : "black"}>
              {`${node.split.feature} ≤ ${node.split.threshold.toFixed(2)}`}
            </text>
            <text x={x + width / 8} y={y + verticalSpacing / 2} textAnchor="middle" fill={isDarkMode ? "white" : "black"}>
              {`${node.split.feature} > ${node.split.threshold.toFixed(2)}`}
            </text>
            {depth < currentStep && (
              <>
                {renderNode(node.left, x - width / 4, y + verticalSpacing, width / 2, depth + 1)}
                {renderNode(node.right, x + width / 4, y + verticalSpacing, width / 2, depth + 1)}
              </>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4">Decision Tree Visualization</h2>
      <p className="mb-4">
        This visualization shows the step-by-step building of a decision tree. 
        Each node displays the Gini impurity (G) or the prediction probability (P) for leaf nodes.
      </p>
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={handleBackward}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous Step
        </button>
        <button
          onClick={handleForward}
          className={`px-4 py-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Next Step
        </button>
      </div>
      <div className="w-full h-96 overflow-auto">
        <svg width="800" height="400" viewBox="0 0 800 400">
          {renderNode(tree, 400, 50, 700)}
        </svg>
      </div>
    </div>
  );
};

export default DecisionTreeVisualization;