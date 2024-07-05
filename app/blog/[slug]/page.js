import { getPostData, getAllPostSlugs } from '../../../utils/markdown';
import Link from 'next/link';
import Head from 'next/head';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function BlogPost({ params }) {
  const postData = await getPostData(params.slug);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css"
          integrity="sha384-KiWOvVjnN8qwAZbuQyWDIbfCLFhLXNETzBQjA/92pIowpC0d2O3nppDGQVgwd2nB"
          crossOrigin="anonymous"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
        <article className="prose lg:prose-xl dark:prose-invert">
          <h1>{postData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: postData.content }} />
        </article>
      </div>
    </>
  );
}