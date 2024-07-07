'use client';

export default function BlogPostStyles() {
  return (
    <style jsx global>{`
      .light-content pre {
        background-color: #f3f3f3 !important;
      }
      .light-content code {
        color: #333;
        background-color: #f3f3f3;
      }
      .light-content .hljs {
        background: #f3f3f3;
      }
    `}</style>
  );
}