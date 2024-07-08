import { getCourseData, getAllCourseSlugs } from '../../../utils/markdown';
import Link from 'next/link';
import CourseStyles from './CourseStyles';

export async function generateStaticParams() {
  const paths = getAllCourseSlugs();
  return paths;
}

export default async function CoursePage({ params }) {
  const courseData = await getCourseData(params.slug);

  return (
    <>
      <div className="min-h-screen bg-white text-gray-800">
        <nav className="bg-gray-100 shadow-md">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-blue-600 hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <article className="prose lg:prose-xl max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{courseData.title}</h1>
            <div
              dangerouslySetInnerHTML={{ __html: courseData.content }}
              className="light-content"
            />
          </article>
        </main>
      </div>
      <CourseStyles />
    </>
  );
}

export const metadata = {
  title: 'Course Details',
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