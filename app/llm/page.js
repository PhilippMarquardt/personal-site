'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Moon, Sun, Loader } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const worker = useRef(null);

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

  const currentColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          setResult(e.data.output)
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const generate = useCallback(() => {
    if (worker.current) {
      worker.current.postMessage({ text: inputText });
    }
  }, [inputText]);

  return (
    <div className={`min-h-screen ${currentColors.background} ${currentColors.text}`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${currentColors.cardBackground} shadow-md`}>
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

      <main className="container mx-auto px-4 py-12 mt-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <input
            className={`w-full p-3 ${currentColors.cardBackground} ${currentColors.text} border ${currentColors.borderColor} rounded mb-4`}
            type="text"
            placeholder="Enter text here"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button
            className={`w-full ${currentColors.accentBackground} text-white p-3 rounded mb-6 transition-colors ${currentColors.hoverBackground}`}
            onClick={generate}
          >
            Generate
          </button>
          {ready !== null && (
            <div className={`${currentColors.cardBackground} p-6 rounded-lg shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Generated Text</h2>
              {(!ready || !result) ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" size={24} />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className={`${currentColors.secondaryText} whitespace-pre-wrap`}>
                  {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}