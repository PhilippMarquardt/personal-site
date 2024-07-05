"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const StepByStepDecisionTreeVisualization = () => {
  const [data, setData] = useState([
    { id: 1, feature1: 2, feature2: 8, class: 'A' },
    { id: 2, feature1: 5, feature2: 4, class: 'B' },
    { id: 3, feature1: 2, feature2: 6, class: 'A' },
    { id: 4, feature1: 4, feature2: 2, class: 'B' },
    { id: 5, feature1: 3, feature2: 5, class: 'A' },
    { id: 6, feature1: 6, feature2: 1, class: 'B' },
    { id: 7, feature1: 2, feature2: 4, class: 'A' },
    { id: 8, feature1: 1, feature2: 1, class: 'B' },
    { id: 9, feature1: 1, feature2: 3, class: 'A' },
  ]);

  const [tree, setTree] = useState(null);
  const [step, setStep] = useState(0);
  const [giniData, setGiniData] = useState({ feature1: [], feature2: [] });
  const [currentNode, setCurrentNode] = useState(null);
  const [explanation, setExplanation] = useState('');

  const calculateGiniImpurity = (dataset) => {
    const classCounts = dataset.reduce((acc, item) => {
      acc[item.class] = (acc[item.class] || 0) + 1;
      return acc;
    }, {});

    const total = dataset.length;
    return 1 - Object.values(classCounts).reduce((acc, count) => {
      const p = count / total;
      return acc + p * p;
    }, 0);
  };

  const findBestSplit = (dataset, features) => {
    let bestGini = Infinity;
    let bestFeature = null;
    let bestThreshold = null;
    let newGiniData = { feature1: [], feature2: [] };

    features.forEach(feature => {
      const values = [...new Set(dataset.map(item => item[feature]))].sort((a, b) => a - b);
      const thresholds = values.slice(0, -1).map((v, i) => (v + values[i + 1]) / 2);

      thresholds.forEach(threshold => {
        const left = dataset.filter(item => item[feature] <= threshold);
        const right = dataset.filter(item => item[feature] > threshold);

        const giniLeft = calculateGiniImpurity(left);
        const giniRight = calculateGiniImpurity(right);
        const gini = (left.length / dataset.length) * giniLeft + (right.length / dataset.length) * giniRight;

        newGiniData[feature].push({ threshold, gini });

        if (gini < bestGini) {
          bestGini = gini;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      });
    });

    setGiniData(newGiniData);
    return { feature: bestFeature, threshold: bestThreshold, gini: bestGini };
  };

  const buildTreeStep = (node, dataset, depth = 0) => {
    if (dataset.length === 0) return { ...node, class: 'Empty' };
    if (depth >= 3 || new Set(dataset.map(item => item.class)).size === 1) {
      return { ...node, class: dataset[0].class };
    }

    const features = ['feature1', 'feature2'];
    const { feature, threshold, gini } = findBestSplit(dataset, features);

    if (!feature) return { ...node, class: dataset[0].class };

    const left = dataset.filter(item => item[feature] <= threshold);
    const right = dataset.filter(item => item[feature] > threshold);

    return {
      ...node,
      feature,
      threshold,
      gini,
      left: { dataset: left },
      right: { dataset: right },
    };
  };

  const findNextNodeToSplit = (node) => {
    if (!node) return null;
    if (!node.feature && !node.class) return node;
    if (node.left && !node.left.feature && !node.left.class) return node.left;
    if (node.right && !node.right.feature && !node.right.class) return node.right;
    const leftResult = findNextNodeToSplit(node.left);
    if (leftResult) return leftResult;
    return findNextNodeToSplit(node.right);
  };

  useEffect(() => {
    try {
      if (step === 0) {
        const rootNode = { dataset: data };
        setCurrentNode(rootNode);
        setTree(rootNode);
        setExplanation('Starting with the full dataset. Calculate Gini impurity for potential splits.');
      } else {
        setTree(prevTree => {
          const newTree = JSON.parse(JSON.stringify(prevTree)); // Deep copy
          const nodeToSplit = findNextNodeToSplit(newTree);

          if (!nodeToSplit) {
            setExplanation('Tree construction complete. All leaf nodes have been classified.');
            return newTree;
          }

          const splitNode = buildTreeStep(nodeToSplit, nodeToSplit.dataset, step - 1);
          Object.assign(nodeToSplit, splitNode);

          setCurrentNode(splitNode);
          if (splitNode.feature) {
            setExplanation(`Step ${step}: Splitting on ${splitNode.feature} at threshold ${splitNode.threshold.toFixed(2)}. Gini impurity: ${splitNode.gini.toFixed(3)}`);
          } else {
            setExplanation(`Step ${step}: Leaf node reached. Class: ${splitNode.class}`);
          }

          return newTree;
        });
      }
    } catch (error) {
      console.error('Error in tree building step:', error);
      setExplanation(`An error occurred at step ${step}. Please check the console for details.`);
    }
  }, [step, data]);

  const renderNode = (node, x, y, level = 0, isRoot = true) => {
    if (!node) return null;

    const radius = 30;
    const horizontalSpacing = 200 / (level + 1);

    return (
      <g key={`${x}-${y}`}>
        <circle 
          cx={x} 
          cy={y} 
          r={radius} 
          fill={node === currentNode ? "yellow" : "white"} 
          stroke="black" 
        />
        <text x={x} y={y - 5} textAnchor="middle" dy=".3em">
          {isRoot ? 'Root' : (node.feature || node.class)}
        </text>
        {node.threshold && (
          <text x={x} y={y + 15} textAnchor="middle" dy=".3em" fontSize="10">
            {`≤ ${node.threshold.toFixed(2)}`}
          </text>
        )}
        {node.gini !== undefined && (
          <text x={x} y={y + 30} textAnchor="middle" dy=".3em" fontSize="10" fill="red">
            {`Gini: ${node.gini.toFixed(3)}`}
          </text>
        )}
        {node.left && renderNode(node.left, x - horizontalSpacing, y + 100, level + 1, false)}
        {node.right && renderNode(node.right, x + horizontalSpacing, y + 100, level + 1, false)}
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Step-by-Step Decision Tree Visualization</h1>
      <div className="w-full max-w-4xl">
        <svg width="100%" height="400" viewBox="0 0 800 400">
          {tree && renderNode(tree, 400, 50)}
        </svg>
      </div>
      <div className="w-full max-w-4xl mt-4">
        <h2 className="text-xl font-semibold mb-2">Gini Impurity Charts</h2>
        <div className="flex justify-between">
          {['feature1', 'feature2'].map(feature => (
            <div key={feature} className="w-[48%]">
              <h3 className="text-lg font-medium mb-2">{feature}</h3>
              <LineChart width={400} height={200} data={giniData[feature]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="threshold" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gini" stroke="#8884d8" />
                {currentNode && currentNode.feature === feature && (
                  <ReferenceLine x={currentNode.threshold} stroke="red" label="Best Split" />
                )}
              </LineChart>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl mt-4">
        <p className="text-lg">{explanation}</p>
      </div>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          onClick={() => setStep(prevStep => Math.max(0, prevStep - 1))}
          disabled={step === 0}
        >
          Previous Step
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setStep(prevStep => prevStep + 1)}
          disabled={!tree || !findNextNodeToSplit(tree)}
        >
          Next Step
        </button>
      </div>
      <div className="mt-4 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Training Data:</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Feature 1</th>
              <th className="px-4 py-2">Feature 2</th>
              <th className="px-4 py-2">Class</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{item.id}</td>
                <td className="border px-4 py-2">{item.feature1}</td>
                <td className="border px-4 py-2">{item.feature2}</td>
                <td className="border px-4 py-2">{item.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StepByStepDecisionTreeVisualization;