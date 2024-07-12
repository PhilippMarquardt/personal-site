import React, { useState, useCallback, useMemo } from 'react';
import { Tree } from 'react-d3-tree';

const generateRandomDataset = () => {
  const numDatapoints = Math.floor(Math.random() * 11) + 20; // 20-30 datapoints
  return Array.from({ length: numDatapoints }, () => ({
    feature1: Math.random(),
    feature2: Math.random(),
    label: Math.random() > 0.5 ? 1 : 0,
  }));
};

const calculateGini = (data) => {
  const counts = data.reduce((acc, d) => {
    acc[d.label] = (acc[d.label] || 0) + 1;
    return acc;
  }, {});
  const total = data.length;
  return 1 - Object.values(counts).reduce((sum, count) => sum + (count / total) ** 2, 0);
};

const findBestSplit = (data, features) => {
  let bestGini = Infinity;
  let bestFeature = null;
  let bestThreshold = null;

  for (const feature of features) {
    const values = data.map(d => d[feature]).sort((a, b) => a - b);
    const thresholds = values.slice(0, -1).map((v, i) => (v + values[i + 1]) / 2);

    for (const threshold of thresholds) {
      const left = data.filter(d => d[feature] <= threshold);
      const right = data.filter(d => d[feature] > threshold);
      const gini = (left.length / data.length) * calculateGini(left) +
                   (right.length / data.length) * calculateGini(right);

      if (gini < bestGini) {
        bestGini = gini;
        bestFeature = feature;
        bestThreshold = threshold;
      }
    }
  }

  return { feature: bestFeature, threshold: bestThreshold, gini: bestGini };
};

const buildTree = (data, features, depth = 0, maxDepth = 3) => {
  const gini = calculateGini(data);
  if (depth === maxDepth || data.length <= 1 || gini === 0) {
    const classes = data.reduce((acc, d) => {
      acc[d.label] = (acc[d.label] || 0) + 1;
      return acc;
    }, {});
    const majorityClass = Object.entries(classes).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    return { 
      name: `Leaf (Gini: ${gini.toFixed(2)})`,
      gini,
      isLeaf: true,
      class: majorityClass,
      classDistribution: Object.entries(classes).map(([k, v]) => `${k}: ${v}`).join(', ')
    };
  }

  const { feature, threshold, gini: splitGini } = findBestSplit(data, features);
  const left = data.filter(d => d[feature] <= threshold);
  const right = data.filter(d => d[feature] > threshold);

  return {
    name: `${feature} <= ${threshold.toFixed(2)}`,
    gini,
    children: [
      buildTree(left, features, depth + 1, maxDepth),
      buildTree(right, features, depth + 1, maxDepth),
    ],
  };
};

const DecisionTreeVisualization = ({ isDarkMode }) => {
  const [dataset, setDataset] = useState(generateRandomDataset());
  const [currentStep, setCurrentStep] = useState(0);

  const regenerateDataset = useCallback(() => {
    setDataset(generateRandomDataset());
    setCurrentStep(0);
  }, []);

  const tree = useMemo(() => buildTree(dataset, ['feature1', 'feature2']), [dataset]);

  const stepTree = useCallback((node, step) => {
    if (step === 0) return { name: 'Root', gini: calculateGini(dataset) };
    if (!node.children) return node;

    return {
      ...node,
      children: node.children.map(child => 
        step > 1 ? stepTree(child, step - 1) : { name: '...', gini: child.gini }
      ),
    };
  }, [dataset]);

  const currentTree = useMemo(() => stepTree(tree, currentStep), [tree, currentStep]);

  const maxSteps = useMemo(() => {
    let max = 0;
    const countSteps = (node) => {
      if (!node.children) return 1;
      return 1 + Math.max(...node.children.map(countSteps));
    };
    return countSteps(tree);
  }, [tree]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="mb-4 flex justify-between items-center">
        <button 
          onClick={regenerateDataset}
          className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
        >
          Regenerate Dataset
        </button>
        <div>
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-2`}
          >
            Back
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
            disabled={currentStep === maxSteps}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Forward
          </button>
        </div>
      </div>
      <div className={`mb-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className="font-semibold mb-2">Dataset Info</h3>
        <p>Number of datapoints: {dataset.length}</p>
      </div>
      <div style={{ width: '100%', height: '60vh', minHeight: '400px' }}>
        <Tree 
          data={currentTree}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 400, y: 50 }}
          nodeSize={{ x: 300, y: 150 }}
          separation={{ siblings: 2, nonSiblings: 2 }}
          renderCustomNodeElement={(rd3tProps) => (
            <g>
              <circle r="30" fill={isDarkMode ? "#4B5563" : "#60A5FA"} />
              <text 
                dy="0.31em"
                fontSize={12}
                fontFamily="Arial"
                textAnchor="middle"
                style={{ fill: isDarkMode ? 'white' : 'black' }}
              >
                {rd3tProps.nodeDatum.name}
              </text>
              <text 
                dy="1.5em"
                fontSize={12}
                fontFamily="Arial"
                textAnchor="middle"
                style={{ fill: isDarkMode ? 'white' : 'black' }}
              >
                Gini: {rd3tProps.nodeDatum.gini.toFixed(2)}
              </text>
              {rd3tProps.nodeDatum.isLeaf && (
                <text 
                  dy="2.7em"
                  fontSize={10}
                  fontFamily="Arial"
                  textAnchor="middle"
                  style={{ fill: isDarkMode ? 'white' : 'black' }}
                >
                  Class: {rd3tProps.nodeDatum.class}
                </text>
              )}
            </g>
          )}
        />
      </div>
    </div>
  );
};

export default DecisionTreeVisualization;