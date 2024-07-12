"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/python?prompt=${encodeURIComponent(inputValue)}`);
      const data = await response.json();
      setGeneratedText(data.message);
    } catch (error) {
      console.error("Error generating text:", error);
      setGeneratedText("An error occurred while generating text.");
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <Link href="/api/python">
            <code className="font-mono font-bold">api/index.py</code>
          </Link>
        </p>
      </div>

      <div className="relative flex flex-col items-center space-y-4">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your prompt here"
          className="w-64 p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
        {generatedText && (
          <div className="mt-4 p-4 bg-gray-100 rounded max-w-md">
            <h3 className="font-bold mb-2">Generated Text:</h3>
            <p>{generatedText}</p>
          </div>
        )}
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        {/* ... (keep the existing grid items) */}
      </div>
    </main>
  );
}