'use client';

export default function BlogPostStyles() {
  return (
    <style jsx global>{`
      .dark-content pre {
        background-color: #1e1e1e !important; /* Slightly lighter background */
        border-radius: 6px;
        padding: 1em;
      }
      .dark-content code {
        color: #d4d4d4; /* Lighter text color for better contrast */
        background-color: #1e1e1e; /* Matching the pre background */
      }
      .dark-content .hljs {
        background: #1e1e1e; /* Matching the pre background */
        color: #d4d4d4;
      }
      .dark-content .hljs-keyword,
      .dark-content .hljs-selector-tag,
      .dark-content .hljs-type {
        color: #569cd6; /* Light blue for keywords */
      }
      .dark-content .hljs-literal,
      .dark-content .hljs-symbol,
      .dark-content .hljs-bullet,
      .dark-content .hljs-attribute {
        color: #9cdcfe; /* Light blue for variables */
      }
      .dark-content .hljs-string,
      .dark-content .hljs-bullet {
        color: #ce9178; /* Soft orange for strings */
      }
      .dark-content .hljs-comment {
        color: #6a9955; /* Green for comments */
      }
      .dark-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1rem auto;
      }
      .dark-content {
        color: #e5e7eb;
      }
      .dark-content a {
        color: #60a5fa;
      }
      .dark-content h1,
      .dark-content h2,
      .dark-content h3,
      .dark-content h4,
      .dark-content h5,
      .dark-content h6 {
        color: #f3f4f6;
      }
      .dark-content blockquote {
        border-left-color: #4b5563;
        color: #9ca3af;
      }
      /* Additional styles for inline code */
      .dark-content p code,
      .dark-content li code {
        background-color: #2d3748; /* Slightly lighter than the block background */
        color: #d4d4d4;
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }
    `}</style>
  );
}