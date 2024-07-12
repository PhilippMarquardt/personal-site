"use client"

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LinearRegressionComponent from './(components)/linearregression'
import LogisticRegressionComponent from './(components)/logisticregression';
import SVMComponent from './(components)/svm';
import DecisionTreeVisualization from './(components)/decisiontree';
import LassoRidgeRegression from './(components)/lassoridge';
import SelfAttentionVisualization from './(components)/attention';
const sections = [
    {
      id: 'linearRegression',
      title: 'Linear Regression',
      Component: LinearRegressionComponent,
    },
    {
      id: 'logisticRegression',
      title: 'Logistic Regression',
      Component: LogisticRegressionComponent,
    },
    {
        id: 'svm',
        title: 'svm Regression',
        Component: SVMComponent,
      },
      {
        id: 'dt',
        title: 'dt',
        Component: DecisionTreeVisualization,
      },
      {
        id: 'lr',
        title: 'lr',
        Component: LassoRidgeRegression,
      },
      {
        id: 'sa',
        title: 'sa',
        Component: SelfAttentionVisualization,
      },

    // Add more sections here as needed
  ];
  
  const MLExplanationPage = ({ isDarkMode }) => {
    const [expandedSections, setExpandedSections] = useState({});
  
    const toggleSection = (sectionId) => {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: !prev[sectionId]
      }));
    };
  
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Machine Learning Concepts</h1>
  
          {sections.map(({ id, title, Component }) => (
            <section key={id} className="mb-8">
              <h2 
                className="text-2xl font-semibold mb-4 cursor-pointer flex items-center"
                onClick={() => toggleSection(id)}
              >
                {title}
                {expandedSections[id] ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
              </h2>
              {expandedSections[id] && <Component isDarkMode={isDarkMode} />}
            </section>
          ))}
        </main>
      </div>
    );
  };
  
  export default MLExplanationPage;