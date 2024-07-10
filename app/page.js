"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, ExternalLink, Menu, X, FileText, Book, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const researchProjects = [
  {
    id: 1,
    title: "KI basierte Diagnostik des Lungenkarzinoms zur Unterstützung personalisierter Therapieentscheidungen",
    company: "HS Analysis GmbH",
    task: "Development of the Deep Learning Model",
    funding: "€400,000",
    link: "https://www.gesundheitsindustrie-bw.de/fachbeitrag/aktuell/ki-gestuetzte-diagnostik-sagt-lungenkrebs-den-kampf#:~:text=Das%20Projektakronym%20IDOL%20steht%20f%C3%BCr,Lungenkarzinoms%20zur%20Unterst%C3%BCtzung%20personalisierter%20Therapieentscheidungen%E2%80%9C.&text=Bisher%20existiert%20noch%20kein%20klassischer,Arzneimittelresistenz%20bei%20Lungenkrebs%20nachweisen%20kann."
  },
  {
    id: 2,
    title: "Hybridlösung mit kontaktloser VIso-TAktiler Diagnostik",
    company: "HS Analysis GmbH",
    task: "Develop Segmentation Model for the Skin Detection and for the prediction of various parameters",
    funding: "€2,006,000",
    link: "https://www.interaktive-technologien.de/projekte/hybridvita"
  },
  {
    id: 3,
    title: "hyPro – Integration hybrider Intelligenz in die Prozesssteuerung von Produktionsanlagen der Glasumformung",
    company: "HS Analysis GmbH",
    task: "Development of the Deep Learning Model",
    funding: "€680,000",
    link: "https://www.ipt.fraunhofer.de/de/projekte/hypro.html"
  },
  {
    id: 4,
    title: "Analyse extremistischer Bestrebungen in sozialen Netzwerken (X-SONAR)",
    company: "Fraunhofer Insitut für Sichere Informationstechnolgie",
    task: "Development of a Model that can detect hate speech in social media posts",
    funding: "€3,100,000",
    link: "https://www.sifo.de/sifo/de/projekte/schutz-vor-kriminalitaet-und-terrorismus/terrorismusbekaempfung/x-sonar/x-sonar_node.html"
  },
];

const ResearchProjectCard = ({ project, isDarkMode }) => (
  <div className={`border rounded-lg overflow-hidden p-4 ${
    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
  }`}>
    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
      Funding: {project.funding}
    </p>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
      Task: {project.task}
    </p>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
      While I was working at: {project.company}
    </p>
    <a 
      href={project.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center text-blue-500 hover:text-blue-600"
    >
      <ExternalLink size={18} className="mr-1" /> Project Link
    </a>
  </div>
);

const CourseCard = ({ course, isDarkMode }) => (
  <Link href={`/courses/${course.slug}`} className="block">
    <div 
      className={`border rounded-lg overflow-hidden p-4 transition-transform hover:scale-105 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}
    >
      <h4 className="text-lg font-semibold mb-2 flex items-start">
        <Book size={18} className="mr-2 flex-shrink-0 mt-1" />
        <span>{course.name}</span>
      </h4>

      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {course.description}
      </p>
    </div>
  </Link>
);

const SemesterCourses = ({ semester, isDarkMode }) => {
  const [expanded, setExpanded] = useState(false);
  const displayedCourses = expanded ? semester.courses : semester.courses.slice(0, 3);
  const hasMoreCourses = semester.courses.length > 3;

  return (
    <div>
      <h3 className={`text-xl text-center font-semibold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        Semester {semester.semester}
      </h3>
      <div className="space-y-4">
        {displayedCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isDarkMode={isDarkMode} 
          />
        ))}
      </div>
      {hasMoreCourses && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-4 flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          {expanded ? (
            <>
              <ChevronUp size={20} className="mr-1" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown size={20} className="mr-1" /> Show More
            </>
          )}
        </button>
      )}
    </div>
  );
};

const SkillCard = ({ title, technologies, description, isDarkMode }) => (
  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <div className="mb-3">
      <h4 className="font-medium mb-1">Technologies:</h4>
      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {technologies.join(', ')}
      </p>
    </div>
    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
  </div>
);

const SkillsSection = ({ isDarkMode }) => (
  <section id="skills" className="mb-16 pt-16">
    <h2 className="text-2xl font-semibold mb-6 text-center">Professional Work</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkillCard
        title="Machine Learning Engineer at HS Analysis (2018-Present)"
        technologies={['React', 'Node.js', 'flask', 'C#', 'WPF']}
        description="Sole developer of the deep learning backend. "
        isDarkMode={isDarkMode}
      />
      <SkillCard
        title="Fraunhofer Insitute of Secure Information Technology (2019-2020)"
        technologies={['Python', 'TensorFlow', 'PyTorch']}
        description="Developing authorship verification methods"
        isDarkMode={isDarkMode}
      />
    </div>
  </section>
);
const categories = ['All', 'C#', 'Full Stack', 'ML', 'Math'];

const projects = [
  { 
    id: 1, 
    title: 'Time Logging Project', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/time-logging', 
    blogSlug: 'time-logging-project',
    description: 'Time Logging Application to Manage Employees Working Times and Create Monthly Reports. Written in C# WPF'
  },
  { 
    id: 2, 
    title: 'C# Multiplayer Framework for VR/AR Applications in Unity', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/ar-vr-multiplayer-framework', 
    blogSlug: 'vr-ar-multiplayer-framework',
    description: 'A multiplayer framework written in c# for vr and ar applications. Can be used in Unity to enable TCP and UDP based multiplayer sessions with various features.'
  },
  { 
    id: 3, 
    title: 'Microscopy Image Viewer', 
    category: 'Full Stack', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/viewer.png?raw=true', 
    github: 'https://github.com/yourusername/microscopy-image-viewer', 
    live: 'https://microscopy-viewer-demo.com', 
    blogSlug: 'viewer',
    description: 'A full-stack application for viewing and analyzing microscopy images.'
  },
  { 
    id: 4, 
    title: 'Decision Trees Implementation', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/decision-trees', 
    live: '/decisiontree', 
    blogSlug: 'decision-trees-implementation',
    description: 'An implementation of decision trees for machine learning classification tasks.'
  },
  { 
    id: 5, 
    title: 'Deep Learning Framework for Training Classification, Segmentation, Object Detection and Instance Segmentation Models', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/yourusername/reinforcement-learning', 
    blogSlug: 'reinforcement-learning-project',
    description: 'Exploration of reinforcement learning algorithms and applications.'
  },
  { 
    id: 6, 
    title: 'A simple Machine Learning Trainer and Annotation GUI in C#/WPF', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/Machine-Learning-Trainer', 
    blogSlug: 'linear-algebra-visualizer',
    description: 'A simple C#/WPF application do define a custom deep learning architecture. Was extended to include a simple annotation tool for standard image formats.'
  },
];

const papers = [
  {
    id: 1,
    title: 'An Improved Topic Masking Technique for Authorship Analysis',
    authors: 'Oren Halvani, Lukas Graner, Roey Regev, Philipp Marquardt',
    journal: 'Journal of Medical Imaging',
    year: 2021,
    link: 'https://arxiv.org/abs/2005.06605v1',
    description: 'An Improved Topic Masking Technique for Authorship Analysis'
  },
  {
    id: 2,
    title: 'An Unsophisticated Neural Bots and Gender Profiling System',
    authors: 'Oren Halvani and Philipp Marquardt',
    journal: '...',
    year: 2019,
    link: 'https://ceur-ws.org/Vol-2380/paper_206.pdf',
    description: 'An Unsophisticated Neural Bots and Gender Profiling System'
  },
  {
    id: 3,
    title: 'Resemblance-Ranking Peptide Library to Screen for Binders to Antibodies on a Peptidomic Scale',
    authors: 'Emily Brown, David Lee',
    journal: 'IEEE Robotics and Automation Letters',
    year: 2021,
    link: 'https://pubmed.ncbi.nlm.nih.gov/35408876/',
    description: 'Resemblance-Ranking Peptide Library to Screen for Binders to Antibodies on a Peptidomic Scale'
  },
  {
    id: 4,
    title: 'Neuromorphic Vision mit Spiking Neural Networks zur Sturzerkennung im betreuten Wohnen',
    authors: `Sven Nitzsche, Brian Pachideh, Victor Pazmino, Norbert Link, Christoph Schauer, Lukas Theurer, Valentin Haas, Philipp Marquardt, Sergey Biniaminov, Jürgen Becker`,
    journal: 'IEEE Robotics and Automation Letters',
    year: 2021,
    link: 'https://dl.gi.de/items/f27e40ad-d9d6-426f-b258-32e88f08b768',
    description: 'Neuromorphic Vision mit Spiking Neural Networks zur Sturzerkennung im betreuten Wohnen'
  },
  {
    id: 5,
    title: 'Nutzen der partizipatorischen Mitwirkung von PatientInnen an der Entwicklung einer dermatologischen Therapie-App – ein Bericht aus der Praxis',
    authors: 'Anne Koopmann, Anna Maria Pfeifer, Lara Schweickart, Nathalie Biniaminov, Valentin Haas, Philipp Marquardt, Astrid Gößwein, Christopher Czaban, Sergey Biniaminov, Mara Blauth, Caroline Glatzel, Christoph Zimmermann, Wilhelm Stork, Victor Olsavszky, Astrid Schmieder',
    journal: 'Die Dermatologie',
    year: 2024,
    link: 'https://doi.org/10.1007/s00105-024-05326-7',
    description: 'Benefits of participatory involvement of patients in the development of a dermatological treatment app—A report from the practice'
  }
];

const ProjectsSection = ({ isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const getCategoryColor = (category) => {
    switch(category) {

      default: return 'bg-blue-500';
    }
  };

  return (
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
        {filteredProjects.map((project) => (
          <div key={project.id} className="flex">
            <Link href={`/blog/${project.blogSlug}`} passHref className="w-full">
              <div 
                className={`relative flex flex-col h-full border rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(project.category)}`}>
                  {project.category}
                </div>
                <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
                <div className="flex flex-col flex-grow p-4">
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex-grow`}>
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button 
                      className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(project.github, '_blank');
                      }}
                    >
                      <Github size={18} className="mr-1" /> GitHub
                    </button>
                    {project.live && (
                      <button 
                        className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(project.live, '_blank');
                        }}
                      >
                        <ExternalLink size={18} className="mr-1" /> Live Demo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
const timelineEvents = [

  { year: 2018, events: ['Started Bachelor of Science in Computer Science at the TU Darmstadt', 'Started working at the HS Analysis GmbH as backend developer', 'Completed the Udacity Deep Learning Nanodegree'] },
  { year: 2019, events: ['Second job at the Fraunhofer Insitute for Secure Information Technology in Darmstadt'] },
  { year: 2022, events: ['Graduated from TU Darmstadt with the Thesis: Mulit-Modality Abdominal Multi-Organ Segmentation','Enrolled in Master of Science in Computer Science at the Karlsruhe Institute of Technology'] },
  { year: 2024, events: ['Finishing Master Degree'] },
];

const courses = [
  {
    semester: 1,
    courses: [
      { id: 1, name: 'Deep Learning for Computer Vision II: Advanced Topics', description: 'Learn about newest reserach topics in computer vision' },
      { id: 2, name: 'Natural Language Processing', description: 'Learn everything about NLP from the ground up starting ', slug:'vns' },
      { id: 3, name: 'Energy Informatics 1', description: 'asd.' },
    ]
  },
  {
    semester: 2,
    courses: [
      { id: 4, name: 'Machine Translation', description: '.', slug:'machinetranslation' },
      { id: 5, name: 'Practical Course Computer Vision for Human-Computer Interaction', description: '.asd' },
      { id: 9, name: 'Machine Learning for Natural Sciences Exercises', description: 'asd.' },
      { id: 10, name: 'Advanced Artificial Intelligence', description: 'asd.' },
      { id: 11, name: 'Research Practical Course: Interactive Learning', description: 'asd.', slug:'interactivelearning' },
      { id: 12, name: 'Seminar: Interactive Learning', description: 'ads.' },
      { id: 13, name: 'Human Computer Interaction ', description: 'asd.' },
      { id: 14, name: 'Energy Informatics 2', description: 'asd.' },
      { id: 15, name: 'Software Engineering II', description: 'asd.' },
    ]
  },
  {
    semester: 3,
    courses: [
      { id: 18, name: 'Humanoid Robots - Seminar', description: 'asd.' },
      { id: 17, name: 'IT Security', description: 'asd.', slug:'itsec'},
      { id: 16, name: 'Machine Learning in Climate and Environmental Sciences ', description: 'asd.', slug:'envsciences' },
    ]
  },
  {
    semester: 4,
    courses: [
      { id: 19, name: 'Advanced Machine Learning and Data Science', description: 'asd.' },
      { id: 20, name: 'Master Thesis', description: 'asd.' },
    
    ]
  },
];


const TimelineEvent = ({ year, events, isDarkMode }) => {
  return (
    <div className="w-full sm:w-64 p-4">
      <h3 className={`text-xl text-center font-semibold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        {year}
      </h3>
      <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {events.map((event, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} text-sm`}
          >
            {event}
          </div>
        ))}
      </div>
    </div>
  );
};

const ShortCV = ({ isDarkMode }) => {
  return (
    <section id="journey" className="mb-16 pt-16">
      <h2 className="text-2xl font-semibold mb-6 text-center">Short CV</h2>
      <div className="flex flex-wrap justify-center">
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
  );
};

const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);
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
          <h1 className="text-2xl font-bold">PM</h1>
          <div className="hidden md:flex space-x-4">
            <a onClick={() => scrollToSection('about')} className="cursor-pointer hover:text-blue-500 transition-colors">About</a>
            <a onClick={() => scrollToSection('journey')} className="cursor-pointer hover:text-blue-500 transition-colors">CV</a>
            <a onClick={() => scrollToSection('skills')} className="cursor-pointer hover:text-blue-500 transition-colors">Professional Work</a>
            <a onClick={() => scrollToSection('research-projects')} className="cursor-pointer hover:text-blue-500 transition-colors">Funded Projects</a>
            <a onClick={() => scrollToSection('projects')} className="cursor-pointer hover:text-blue-500 transition-colors">Projects</a>
            <a onClick={() => scrollToSection('papers')} className="cursor-pointer hover:text-blue-500 transition-colors">Papers</a>
            <a onClick={() => scrollToSection('courses')} className="cursor-pointer hover:text-blue-500 transition-colors">Masters Degree</a>
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
            <a onClick={() => scrollToSection('journey')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">CV</a>
            <a onClick={() => scrollToSection('skills')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Skills</a>
            <a onClick={() => scrollToSection('research-projects')} className="block py-2 px-4 hover:bg-gray-700 transition-colorss">Funded Projects</a>
            <a onClick={() => scrollToSection('projects')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Projects</a>
            <a onClick={() => scrollToSection('papers')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Papers</a>
            <a onClick={() => scrollToSection('courses')} className="block py-2 px-4 hover:bg-gray-700 transition-colors">Masters Degree</a>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-12 mt-16">
        <section id="about" className="mb-12 pt-16">
          <h2 className="text-2xl font-semibold mb-4 text-center">About Me</h2>
          <p className="text-lg">
            HIIIIII
          </p>
        </section>

        <ShortCV isDarkMode={isDarkMode} />

        <SkillsSection isDarkMode={isDarkMode} />
        <section id="research-projects" className="mb-16 pt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Participation at Funded Research Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchProjects.map((project) => (
              <ResearchProjectCard key={project.id} project={project} isDarkMode={isDarkMode} />
            ))}
          </div>
        </section>

        <ProjectsSection isDarkMode={isDarkMode} />

        <section id="papers" className="pt-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Published Papers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div 
              key={paper.id} 
              className={`border rounded-lg overflow-hidden p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {paper.authors} • {paper.journal} • {paper.year}
              </p>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {paper.description}
              </p>
              <div className="mt-4">
                <a 
                  href={paper.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <FileText size={18} className="mr-1" /> Read Paper
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

        <section id="courses" className="mb-16 pt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Computer Science Master at the Karlsruhe Institute of Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((semester) => (
              <SemesterCourses key={semester.semester} semester={semester} isDarkMode={isDarkMode} />
            ))}
          </div>
        </section>
      </main>

      <footer className={`mt-12 py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;