'use client';

export default function BlogPostStyles() {
  return (
    <style jsx global>{`
      .light-content pre {
        background-color: #f3f4f6 !important; /* Light gray background */
      }
      .light-content code {
        color: #1e40af; /* Dark blue text */
        background-color: #f3f4f6; /* Light gray background */
      }
      .light-content .hljs {
        background: #f3f4f6; /* Light gray background */
      }
      .light-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1rem auto;
      }
      .dark-content pre {
        background-color: #1f2937 !important; /* Dark gray background */
      }
      .dark-content code {
        color: #60a5fa; /* Light blue text */
        background-color: #1f2937; /* Dark gray background */
      }
      .dark-content .hljs {
        background: #1f2937; /* Dark gray background */
      }
    `}</style>
  );
}