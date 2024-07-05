"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, ExternalLink, Menu, X } from 'lucide-react';
import Link from 'next/link';

const categories = ['All', 'C#', 'Full Stack', 'ML', 'Math'];

const projects = [
  { 
    id: 1, 
    title: 'Time Logging Project', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/time-logging-project', 
    blogSlug: 'time-logging-project',
    description: 'A C# application for efficient time tracking and reporting.'
  },
  { 
    id: 2, 
    title: 'C# Multiplayer Framework for VR/AR', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/vr-ar-multiplayer-framework', 
    blogSlug: 'vr-ar-multiplayer-framework',
    description: 'A robust framework for developing multiplayer VR and AR experiences in C#.'
  },
  { 
    id: 3, 
    title: 'Microscopy Image Viewer', 
    category: 'Full Stack', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/microscopy-image-viewer', 
    live: 'https://microscopy-viewer-demo.com', 
    blogSlug: 'microscopy-image-viewer',
    description: 'A full-stack application for viewing and analyzing microscopy images.'
  },
  { 
    id: 4, 
    title: 'Decision Trees Implementation', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/decision-trees', 
    blogSlug: 'decision-trees-implementation',
    description: 'An implementation of decision trees for machine learning classification tasks.'
  },
  { 
    id: 5, 
    title: 'Reinforcement Learning Project', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/reinforcement-learning', 
    blogSlug: 'reinforcement-learning-project',
    description: 'Exploration of reinforcement learning algorithms and applications.'
  },
  { 
    id: 6, 
    title: 'Linear Algebra Visualizer', 
    category: 'Math', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/linear-algebra-visualizer', 
    live: 'https://linear-algebra-viz.com', 
    blogSlug: 'linear-algebra-visualizer',
    description: 'Interactive tool for visualizing linear algebra concepts.'
  },
];

const timelineEvents = [
  { year: 2016, events: ['Created first application and sold it to a company that uses it until this day'] },
  { year: 2018, events: ['Started Bachelor of Science in Computer Science at the TU Darmstadt', 'Started working at the HS Analysis GmbH as backend developer', 'Completed the Udacity Deep Learning Nanodegree', 'Lead workshop group at hackathon with Microsoft being a sponsor'] },
  { year: 2019, events: ['Started working a second job at the Fraunhofer Insitute for Secure Information Technology in Darmstadt', 'First paper', 'Lead workshop group at hackathon with Microsoft being a sponsor', 'Lead a workshop group at the Etengo Symposiom which Jürgen Schmidhuber was present at'] },
  { year: 2022, events: ['Graduated from TU Darmstadt with the Thesis: Mulit-Modality Abdominal Multi-Organ Segmentation'] },
  { year: 2023, events: ['Enrolled in Master of Science in Computer Science at the Karlsruhe Institute of Technology'] },
  { year: 2024, events: ['Finishing Master Degree'] },
];

const TimelineEvent = ({ year, events, isDarkMode }) => {
  return (
    <div className="mb-8 flex">
      <div className="flex flex-col items-center mr-4">
        <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">{year}</span>
        </div>
        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
      </div>
      <div className="flex-grow">
        {events.map((event, index) => (
          <div key={index} className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{event}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll('section');
      const navItems = document.querySelectorAll('nav a');

      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          navItems.forEach(item => item.classList.remove('text-blue-500'));
          navItems[index].classList.add('text-blue-500');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Name</h1>
          <div className="hidden md:flex space-x-4">
            <a onClick={() => scrollToSection('about')} className="cursor-pointer hover:text-blue-500 transition-colors">About</a>
            <a onClick={() => scrollToSection('journey')} className="cursor-pointer hover:text-blue-500 transition-colors">Journey</a>
            <a onClick={() => scrollToSection('projects')} className="cursor-pointer hover:text-blue-500 transition-colors">Projects</a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <a onClick={() => scrollToSection('about')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">About</a>
            <a onClick={() => scrollToSection('journey')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Journey</a>
            <a onClick={() => scrollToSection('projects')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Projects</a>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-12 mt-16">
        <section id="about" className="mb-12 pt-16">
          <h2 className="text-2xl font-semibold mb-4">About Me</h2>
          <p className="text-lg">
            Welcome to my personal website! I'm a passionate developer with experience in various technologies.
            Here, you can explore some of the projects I've worked on and see my skills in action.
          </p>
        </section>

        <section id="journey" className="mb-16 pt-16">
          <h2 className="text-2xl font-semibold mb-6">My Journey</h2>
          <div className="relative">
            {timelineEvents.map((event, index) => (
              <TimelineEvent 
                key={index}
                year={event.year}
                events={event.events}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </section>

        <section id="projects" className="pt-16">
          <h2 className="text-2xl font-semibold mb-4">Project Categories</h2>
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
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className={`border rounded-lg overflow-hidden ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.category}
                  </span>
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-600">
                      <Github size={18} className="mr-1" /> GitHub
                    </a>
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center text-green-500 hover:text-green-600">
                        <ExternalLink size={18} className="mr-1" /> Live Demo
                      </a>
                    )}
                    <Link href={`/blog/${project.blogSlug}`} className="flex items-center text-purple-500 hover:text-purple-600">
                      <ExternalLink size={18} className="mr-1" /> Blog Post
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={`mt-12 py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Your Name. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;