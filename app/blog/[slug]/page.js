import { getPostData, getAllPostSlugs } from '../../../utils/markdown';
import Link from 'next/link';
import BlogPostStyles from './BlogPostStyles';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function BlogPost({ params }) {
  const postData = await getPostData(params.slug);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-blue-400 hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <article className="prose prose-invert lg:prose-xl max-w-none">
            <h1 className="text-3xl font-bold text-white mb-4">{postData.title}</h1>
            <div
              dangerouslySetInnerHTML={{ __html: postData.content }}
              className="dark-content"
            />
          </article>
        </main>
      </div>
      <BlogPostStyles />
    </>
  );
}

export const metadata = {
  title: 'Blog Post',
  head: [
    <link
      key="katex-css"
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css"
      integrity="sha384-KiWOvVjnN8qwAZbuQyWDIbfCLFhLXNETzBQjA/92pIowpC0d2O3nppDGQVgwd2nB"
      crossOrigin="anonymous"
    />,
  ],
};