import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, ExternalLink, Menu, X, FileText, Book, ChevronDown, ChevronUp } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';

const ProjectCard = ({ project, isDarkMode }) => (
  <div 
    className={`border rounded-lg overflow-hidden transition-transform hover:scale-105 ${
      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}
  >
    <Link href={`/blog/${project.blogSlug}`} legacyBehavior>
      <a className="block">
        <div className="relative">
          <Image 
            src={project.image} 
            alt={project.title} 
            width={400} 
            height={200} 
            layout="responsive" 
            objectFit="cover" 
          />
          <div className={`absolute top-0 right-0 m-2 px-2 py-1 rounded-full text-xs ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {project.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.github && (
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-500 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={18} className="mr-1" /> GitHub
              </a>
            )}
            {project.live && (
              <a 
                href={project.live}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-500 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={18} className="mr-1" /> Live Demo
              </a>
            )}
          </div>
        </div>
      </a>
    </Link>
  </div>
);

const ProjectSection = ({ projects, categories, selectedCategory, setSelectedCategory, isDarkMode }) => (
  <section id="projects" className="mb-16 pt-16">
    <h2 className="text-2xl font-semibold mb-4 text-center">Projects</h2>
    <div className="flex flex-wrap gap-4 mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-full transition-colors ${
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects
        .filter(project => selectedCategory === 'All' || project.category === selectedCategory)
        .map((project) => (
          <ProjectCard key={project.id} project={project} isDarkMode={isDarkMode} />
        ))}
    </div>
  </section>
);

export default ProjectSection;