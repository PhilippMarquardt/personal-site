'use client'

import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const [inputText, setInputText] = useState('');
  const worker = useRef(null);

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
          setResult(e.data.output);
          break;
        default:
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    worker.current.postMessage({ command: 'init' }); // Ensure worker initialization

    return () => {
      worker.current.removeEventListener('message', onMessageReceived);
    };
  }, []);

  const generate = useCallback(() => {
    if (worker.current && inputText) {
      worker.current.postMessage({ text: inputText });
    }
  }, [inputText]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4 transition-colors"
        onClick={generate}
        disabled={!ready || !inputText}
      >
        Generate
      </button>
      {ready !== null && (
        <pre className="bg-gray-100 p-2 rounded w-full max-w-xs">
          { (!ready) ? 'Loading...' : (result ? JSON.stringify(result, null, 2) : 'Enter text and click Generate') }
        </pre>
      )}
    </main>
  );
}
