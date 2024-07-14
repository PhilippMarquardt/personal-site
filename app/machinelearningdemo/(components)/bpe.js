import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BPEVisualization = ({ isDarkMode }) => {
  const [text, setText] = useState("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.");
  const [vocabulary, setVocabulary] = useState({});
  const [mergeStep, setMergeStep] = useState(0);
  const [merges, setMerges] = useState([]);

  useEffect(() => {
    initializeVocabulary();
  }, [text]);

  const initializeVocabulary = () => {
    const words = text.split(' ');
    const initialVocab = {};
    words.forEach(word => {
      const chars = word.split('');
      initialVocab[word] = chars.map((char, idx) => (idx === chars.length - 1 ? char + '</w>' : char));
    });
    setVocabulary(initialVocab);
    setMergeStep(0);
    setMerges([]);
  };

  const countPairs = () => {
    const pairCounts = {};
    Object.values(vocabulary).forEach(tokens => {
      for (let i = 0; i < tokens.length - 1; i++) {
        const pair = tokens[i] + tokens[i + 1];
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    });
    return pairCounts;
  };

  const findMostFrequentPair = (pairCounts) => {
    let maxCount = 0;
    let mostFrequentPair = '';
    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentPair = pair;
      }
    }
    return mostFrequentPair;
  };

  const mergePair = (pair) => {
    const newVocabulary = {};
    Object.entries(vocabulary).forEach(([word, tokens]) => {
      const newTokens = [];
      for (let i = 0; i < tokens.length; i++) {
        if (i < tokens.length - 1 && tokens[i] + tokens[i + 1] === pair) {
          newTokens.push(pair);
          i++;
        } else {
          newTokens.push(tokens[i]);
        }
      }
      newVocabulary[word] = newTokens;
    });
    return newVocabulary;
  };

  const handleNextStep = () => {
    if (mergeStep === 0) {
      const pairCounts = countPairs();
      const mostFrequentPair = findMostFrequentPair(pairCounts);
      setMerges([...merges, { pair: mostFrequentPair, counts: pairCounts }]);
      setMergeStep(1);
    } else {
      const newVocabulary = mergePair(merges[merges.length - 1].pair);
      setVocabulary(newVocabulary);
      setMergeStep(0);
    }
  };

  const handlePreviousStep = () => {
    if (mergeStep === 1) {
      setMergeStep(0);
    } else if (merges.length > 0) {
      const words = text.split(' ');
      const previousVocab = {};
      words.forEach(word => {
        let tokens = word.split('').map((char, idx) => (idx === word.length - 1 ? char + '</w>' : char));
        for (let i = 0; i < merges.length - 1; i++) {
          tokens = mergePair(merges[i].pair)[word];
        }
        previousVocab[word] = tokens;
      });
      setVocabulary(previousVocab);
      setMerges(merges.slice(0, -1));
    }
  };

  const renderVocabulary = () => (
    <div className="flex flex-wrap justify-center">
      {Object.entries(vocabulary).map(([word, tokens], wordIndex) => (
        <motion.div key={wordIndex} className="m-2 p-2 border rounded">
          <div className="font-bold mb-1">{word}</div>
          <div className="flex flex-wrap">
            {tokens.map((token, tokenIndex) => (
              <motion.div
                key={`${wordIndex}-${tokenIndex}`}
                className={`m-1 p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: tokenIndex * 0.05 }}
              >
                {token}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPairCounts = () => {
    if (mergeStep === 1 && merges.length > 0) {
      const { counts, pair } = merges[merges.length - 1];
      return (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Pair Counts:</h3>
          <div className="flex flex-wrap justify-center">
            {Object.entries(counts).map(([pair, count], index) => (
              <motion.div
                key={index}
                className={`m-1 p-2 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                } ${pair === merges[merges.length - 1].pair ? 'border-2 border-green-500' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {pair}: {count}
              </motion.div>
            ))}
          </div>
          <p className="mt-2">Most frequent pair: <strong>{pair}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-4">Byte Pair Encoding (BPE) Visualization</h2>
      <div className="mb-4">
        <label htmlFor="input" className="block mb-2">Input Text:</label>
        <input
          type="text"
          id="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
        />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">
          Step {merges.length + 1}: {mergeStep === 0 ? 'Current Vocabulary' : 'Pair Counting'}
        </h3>
        <AnimatePresence mode="wait">
          {renderVocabulary()}
          {renderPairCounts()}
        </AnimatePresence>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousStep}
          disabled={merges.length === 0 && mergeStep === 0}
          className={`px-4 py-2 rounded ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Previous
        </button>
        <button
          onClick={handleNextStep}
          className={`px-4 py-2 rounded ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BPEVisualization;
