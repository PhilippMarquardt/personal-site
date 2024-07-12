'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export default function Home() {
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
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
          setResult(e.data.output)
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const generate = useCallback((text) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onInput={e => generate(e.target.value)}
      />
      {ready !== null && (
        <pre className="bg-gray-100 p-2 rounded">
          { (!ready || !result) ? 'Loading...' : JSON.stringify(result, null, 2) }
        </pre>
      )}
    </main>
  )
}