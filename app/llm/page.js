"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
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
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          setResult(e.data.output);
          setReady(true);
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

  const generate = useCallback(() => {
    console.log('Generate called with input:', inputText);
    if (worker.current && inputText.trim()) {
      worker.current.postMessage({ text: inputText });
      setReady(false);
    }
  }, [inputText]);

  return (
    <div className={`min-h-screen flex flex-col ${currentColors.background} ${currentColors.text}`}>
      <nav className={`${currentColors.cardBackground} shadow-md`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Text Generator</h1>
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
            placeholder="Enter text here"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button
            className={`px-4 py-2 rounded ${currentColors.accentBackground} text-white transition-opacity ${!ready ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            onClick={generate}
            disabled={!ready}
          >
            Generate
          </button>
        </div>
        
        <div className={`flex-grow ${currentColors.cardBackground} rounded-lg shadow-md p-4 overflow-auto`}>
          <h2 className="text-xl font-semibold mb-2">Generated Text:</h2>
          <pre className="whitespace-pre-wrap">
            {(!ready || !result) ? 'Loading...' : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}