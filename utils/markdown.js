import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import math from 'remark-math';
import rehypeKatex from 'rehype-katex';

const postsDirectory = path.join(process.cwd(), 'blog-posts');

export async function getPostData(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(math)
    .use(html)
    .use(rehypeKatex)
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    ...data,
    content: contentHtml,
  };
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}