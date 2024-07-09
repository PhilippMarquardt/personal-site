'use client';

export default function BlogPostStyles() {
  return (
    <style jsx global>{`
      .light-content pre {
        background-color: #2e2e2e !important;
      }
      .light-content code {
        color: #ddd;
        background-color: #2e2e2e;
      }
      .light-content .hljs {
        background: #2e2e2e;
      }
      .light-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1rem auto;
      }
    `}</style>
  );
}