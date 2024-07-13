
"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

const colors = {
  light: {
    background: 'bg-gray-100',
    text: 'text-gray-900',
    cardBackground: 'bg-white',
    borderColor: 'border-gray-200',
    hoverBackground: 'hover:bg-gray-300',
    secondaryText: 'text-gray-600',
    accentText: 'text-blue-600',
    accentBackground: 'bg-blue-600',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-white',
    cardBackground: 'bg-gray-800',
    borderColor: 'border-gray-700',
    hoverBackground: 'hover:bg-gray-700',
    secondaryText: 'text-gray-400',
    accentText: 'text-blue-400',
    accentBackground: 'bg-blue-500',
  }
};

export default function Home() {
  const [result, setResult] = useState('');
  const [ready, setReady] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const worker = useRef(null);

  const currentColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      console.log('Message received from worker:', e.data);
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          setProgress(null);
          break;
        case 'ready':
          setReady(true);
          setProgress(null);
          break;
        case 'complete':
          setResult(e.data.output);
          setReady(true);
          setProgress(null);
          break;
        case 'progress':
          setProgress(e.data.progress);
          break;
        case 'error':
          console.error('Error:', e.data.error);
          setError(e.data.error);
          setReady(true);
          setProgress(null);
          break;
        default:
          console.log('Unknown status:', e.data.status);
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    worker.current.postMessage({ action: 'initialize' });

    return () => {
      worker.current.removeEventListener('message', onMessageReceived);
    };
  }, []);

  const generateText = useCallback(() => {
    console.log('Generate text called with input:', inputText);
    if (worker.current && inputText.trim()) {
      worker.current.postMessage({ text: inputText });
      setReady(false);
      setError(null);
      setResult('');
    }
  }, [inputText]);

  return (
    <div className={`min-h-screen flex flex-col ${currentColors.background} ${currentColors.text}`}>
      <nav className={`${currentColors.cardBackground} shadow-md`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Philipp Marquardt</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${currentColors.hoverBackground} transition-colors`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col p-4">
        <div className="mb-4 flex space-x-2">
          <input
            className={`flex-grow p-2 rounded ${currentColors.background} ${currentColors.text} ${currentColors.borderColor} border`}
            type="text"
            placeholder="Enter text to start generation"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button
            className={`px-4 py-2 rounded ${currentColors.accentBackground} text-white transition-opacity ${!ready ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            onClick={generateText}
            disabled={!ready}
          >
            Generate
          </button>
        </div>
        
        <div className={`flex-grow ${currentColors.cardBackground} rounded-lg shadow-md p-4 overflow-auto`}>
          <h2 className="text-xl font-semibold mb-2">Generated Text:</h2>
          {!ready && progress !== null && <p>Loading... {typeof progress === 'number' ? `${progress.toFixed(2)}%` : 'In progress...'}</p>}
          {ready && !result && !error && <p>Ready.</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {result && (
            <div>
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}