"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, ExternalLink, Menu, X, FileText, Book, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
const colors = {
  light: {
    background: 'bg-gray-100',
    text: 'text-gray-900',
    navBackground: 'bg-white',
    cardBackground: 'bg-white',
    borderColor: 'border-gray-200',
    hoverBackground: 'hover:bg-gray-300',
    secondaryText: 'text-gray-600',
    accentText: 'text-blue-600',
    accentBackground: 'bg-blue-600',
    footerBackground: 'bg-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-white',
    navBackground: 'bg-gray-800',
    cardBackground: 'bg-gray-800',
    borderColor: 'border-gray-700',
    hoverBackground: 'hover:bg-gray-700',
    secondaryText: 'text-gray-400',
    accentText: 'text-blue-400',
    accentBackground: 'bg-blue-500',
    footerBackground: 'bg-gray-800',
  }
};

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
const projects = [
  { 
    id: 8, 
    title: 'Time Logging Project', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/time-logging', 
    blogSlug: 'time-logging-project',
    description: 'Time Logging Application to Manage Employees Working Times and Create Monthly Reports. Written in C# WPF'
  },
  { 
    id: 3, 
    title: 'C# Multiplayer Framework for VR/AR Applications in Unity', 
    category: 'C#', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/ar-vr-multiplayer-framework', 
    blogSlug: 'multiplayer_framework',
    description: 'A multiplayer framework written in c# for vr and ar applications. Can be used in Unity to enable TCP and UDP based multiplayer sessions with various features.'
  },
  { 
    id: 2, 
    title: 'Microscopy Image Viewer', 
    category: 'Full Stack', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/viewer.png?raw=true', 
    github: 'https://github.com/yourusername/microscopy-image-viewer', 
    blogSlug: 'viewer',
    description: 'A full-stack application for viewing and analyzing microscopy images.'
  },
  { 
    id: 6, 
    title: 'Machine Learning Basic Concepts Implementation and Visualization', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/mlconcept.png?raw=true', 
    github: 'https://github.com/yourusername/decision-trees', 

    page: 'machinelearningdemo',
    description: 'An implementation of multiple basic machine learning concepts.'
  },
  { 
    id: 1, 
    title: 'Deep Learning Framework for Training Classification, Segmentation, Object Detection and Instance Segmentation Models', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/visualdl.png?raw=true', 
    github: 'https://github.com/PhilippMarquardt/VisualDL', 
    blogSlug: 'visualdl',
    description: 'Deep Learning Framework for Training Classification, Segmentation, Object Detection and Instance Segmentation Models'
  },
  { 
    id: 9, 
    title: 'A simple Machine Learning Trainer and Annotation GUI in C#/WPF', 
    category: 'ML', 
    image: 'https://www.microsoft.com/en-us/research/uploads/prod/2023/03/AI_Microsoft_Research_Header_1920x720.png', 
    github: 'https://github.com/PhilippMarquardt/Machine-Learning-Trainer', 
    description: 'A simple C#/WPF application do define a custom deep learning architecture. Was extended to include a simple annotation tool for standard image formats.'
  },
  { 
    id: 5, 
    title: 'Training and deploying a custom LLM', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/llm.png?raw=true', 
    github: 'https://github.com/PhilippMarquardt/train-deploy-llm', 
    page: "llm",
    description: 'A small project that trains a custom llm and deploys it in the browser'
  },
  { 
    id: 7, 
    title: 'Mulitmodal Emotion Detection', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/emotion.png?raw=true', 
    github: 'https://github.com/PhilippMarquardt/multimodal-emotion-detection', 
    blogSlug: "emotion",
    description: 'A project that uses the RAVDESS Audio and Video dataset to train multimodal models that can detect emotion'
  },
  { 
    id: 4, 
    title: 'MMWrapper', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/mmwrapper.png?raw=true', 
    github: 'https://github.com/PhilippMarquardt/MMWrapper', 
    blogSlug: 'mmwrapper',
    description: 'A wrapper around the ecosytem of OpenMMLab to easily train models using an easy to use config'
  },
  { 
    id: 0, 
    title: 'LLM Supervised Finetuning, reward model, rlhf and dpo', 
    category: 'ML', 
    image: 'https://github.com/PhilippMarquardt/personal-site/blob/main/public/llmtwo.png?raw=true', 
    github: 'https://github.com/PhilippMarquardt/llm-sft-rm-rlhf', 
    blogSlug: 'llm',
    description: 'Guide a large language model to generate human-likable content in 2-3 steps: SFT and (Reward Model Training and RLHF) or (DPO)'
  },

];

const papers = [
  {
    id: 1,
    title: 'An Improved Topic Masking Technique for Authorship Analysis',
    authors: 'Oren Halvani, Lukas Graner, Roey Regev, Philipp Marquardt',
    journal: 'ARES',
    year: 2021,
    link: 'https://www.researchgate.net/publication/341046337_An_Improved_Topic_Masking_Technique_for_Authorship_Analysis',
    description: 'An Improved Topic Masking Technique for Authorship Analysis'
  },
  {
    id: 7,
    title: 'Using Deep Learning to Distinguish Highly Malignant Uveal Melanoma from Benign Choroidal Nevi',
    authors: 'Laura Hoffmann, Constance B. Runkel, Steffen Künzel, Payam Kabiri, Anne Rübsam, Theresa Bonaventura, Philipp Marquardt, Valentin Haas, Nathalie Biniaminov, Sergey Biniaminov, Antonia M. Joussen, Oliver Zeitz',
    journal: 'Journal of Clinical Medicine',
    year: 2024,
    link: 'https://doi.org/10.3390/jcm13144141',
    description: 'This study evaluates deep learning models for distinguishing highly malignant uveal melanoma from benign choroidal nevi based on fundus photographs.'
  },
  
  {
    id: 3,
    title: 'Resemblance-Ranking Peptide Library to Screen for Binders to Antibodies on a Peptidomic Scale',
    authors: 'Felix Jenne, Sergey Biniaminov, Nathalie Biniaminov, Philipp Marquardt, Clemens von Bojničić-Kninski, Roman Popov, Anja Seckinger, Dirk Hose, Alexander Nesterov-Mueller',
    journal: 'International Journal of Molecular Sciences',
    year: 2021,
    link: 'https://www.mdpi.com/1422-0067/23/7/3515',
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
    id: 2,
    title: 'An Unsophisticated Neural Bots and Gender Profiling System',
    authors: 'Oren Halvani and Philipp Marquardt',
    journal: 'Conference and Labs of the Evaluation Forum',
    year: 2019,
    link: 'https://ceur-ws.org/Vol-2380/paper_206.pdf',
    description: 'An Unsophisticated Neural Bots and Gender Profiling System'
  },
  {
    id: 5,
    title: 'Nutzen der partizipatorischen Mitwirkung von PatientInnen an der Entwicklung einer dermatologischen Therapie-App – ein Bericht aus der Praxis',
    authors: 'Anne Koopmann, Anna Maria Pfeifer, Lara Schweickart, Nathalie Biniaminov, Valentin Haas, Philipp Marquardt, Astrid Gößwein, Christopher Czaban, Sergey Biniaminov, Mara Blauth, Caroline Glatzel, Christoph Zimmermann, Wilhelm Stork, Victor Olsavszky, Astrid Schmieder',
    journal: 'Die Dermatologie',
    year: 2024,
    link: 'https://doi.org/10.1007/s00105-024-05326-7',
    description: 'Benefits of participatory involvement of patients in the development of a dermatological treatment app—A report from the practice'
  },
  {
    id: 6,
    title: 'Complement Convertases in Glomerulonephritis: An Explainable Artificial Intelligence-Assisted Renal Biopsy Study',
    authors: 'Wiech, Thorsten; de las Mercedes Noriega, Maria; Schmidt, Tilman; Wulf, Sonia; Koch, Timo; Marquardt, Philipp; Biniaminov, Sergey; Hoxha, Elion; Tomas, Nicola M.; Huber, Tobias B.; Zipfel, Peter F.',
    journal: 'Journal of the American Society of Nephrology',
    year: 2021,
    link: 'https://journals.lww.com/jasn/citation/2021/10001/complement_convertases_in_glomerulonephritis__an.120.aspx',
    description: 'An AI assisted study on complement convertases in glomerulonephritis using renal biopsies.'
  },
  
];

const timelineEvents = [
  { year: 2017, events: ['Started working at the HS Analysis GmbH as backend developer']},
  { year: 2018, events: ['Started Bachelor of Science in Computer Science at the TU Darmstadt', 'Completed the Udacity Deep Learning Nanodegree'] },
  { year: 2019, events: ['Second job at the Fraunhofer Insitute for Secure Information Technology in Darmstadt'] },
  { year: 2022, events: ['Graduated from TU Darmstadt with the Thesis: Mulit-Modality Abdominal Multi-Organ Segmentation','Enrolled in Master of Science in Computer Science at the Karlsruhe Institute of Technology'] },
  { year: 2024, events: ['Finishing Master Degree'] },
];

const courses = [
  {
    semester: 1,
    courses: [
      { id: 1, name: 'Deep Learning for Computer Vision II: Advanced Topics', description: 'Learn about newest reserach topics in computer vision' },
      { id: 2, name: 'Natural Language Processing', description: 'Learn everything about NLP from the ground up starting from basic morphology and ending with current state of the art llms ', slug:'vns' },
      { id: 3, name: 'Energy Informatics 1', description: 'Learned about energy forms, storage, transmission, and conversion; the use and evaluation of equations; energy system components; energy informatics applications; analysis of the German energy system; energy economics; and the Smart Grid concept. The module covered energy forms, systems, storage, power plant processes, renewable energies, energy transmission networks, future electrical networks, and energy economics.' },
    ]
  },
  {
    semester: 2,
    courses: [
      { id: 4, name: 'Machine Translation', description: 'Learned about linguistic approaches to machine translation, with a focus on methods and algorithms for statistical machine translation (SMT), including word alignment, phrase extraction, language modeling, decoding, and optimization. Explored methods for evaluating machine translations and examined applications of machine translation through the example of simultaneous speech-to-speech translation. Practically applied the acquired knowledge by training a translation system during exercises.', slug:'machinetranslation' },
      { id: 5, name: 'Practical Course Computer Vision for Human-Computer Interaction', description: 'Created a graph-explaining system for visually impaired people.' },
      { id: 9, name: 'Machine Learning for Natural Sciences Exercises', description: '' },
      { id: 10, name: 'Advanced Artificial Intelligence', description: 'Learned about the key elements of technical cognitive systems and their functions. Understood the algorithms and methods of AI to model cognitive systems. Developed and analyzed different components of a system and applied this knowledge to new applications, comparing various methods.' },
      { id: 11, name: 'Research Practical Course: Interactive Learning', description: 'Developed an emotion detection system using multiple modalities and multimodal large language models (LLMs).', slug:'interactivelearning' },
      { id: 12, name: 'Seminar: Interactive Learning', description: 'Seminar about newest topics on Interactive Learning' },
      { id: 13, name: 'Human Computer Interaction ', description: 'Covered human information processing, including models, physiological and psychological basics, human senses, and action processes. Learned about design fundamentals and methods, as well as input and output units for computers, embedded systems, and mobile devices. Studied principles, guidelines, and standards for designing user interfaces. Explored technical foundations and examples for designing user interfaces, such as text dialogues, forms, menu systems, graphical interfaces, web interfaces, audio dialogue systems, haptic interaction, and gestures. Examined methods for modeling user interfaces, including abstract interaction descriptions and integration into requirements analysis and software design processes. Evaluated human-machine interaction systems using tools, assessment methods, performance measurement, and checklists. Practically applied these fundamentals through exercises and developed new and alternative user interfaces.' },
      { id: 14, name: 'Energy Informatics 2', description: 'Learned about the architectures, protocols, and standards of modern control center software and concepts. Gained knowledge on hardware and software for simulating and analyzing energy networks. Acquired skills in assessing Big Data in future energy systems and applying data analysis methods to energy datasets. Understood the basics of system theory, control engineering, and mathematical optimization related to energy networks. Discussed the foundations of real-time, reliable, and secure software systems in energy systems. Evaluated the Energy Lab 2.0, future scenarios, and the overall energy system. Assessed the significance of IT approaches and methods for the future energy system and the relevance of energy informatics for academic progression.' },
      { id: 15, name: 'Software Engineering II', description: 'Covered advanced topics in software engineering, including requirements engineering, software processes, software architectures, enterprise software patterns, security, software quality, software maintainability, dependability, secure coding guidelines, model-driven development, domain-driven design, and embedded software.' },
    ]
  },
  {
    semester: 3,
    courses: [
      { id: 18, name: 'Humanoid Robots - Seminar', description: 'Wrote a paper about newest trends in Movement Primitives' },
      { id: 17, name: 'IT Security', description: 'Learned advanced topics in cryptography and IT security, including sophisticated techniques and security primitives to achieve protection goals. Gained an understanding of scientific evaluation and analysis methods for IT security, such as game-based formalization of confidentiality and integrity, and concepts of security and anonymity. Acquired knowledge about data types, personal references, legal, and technical foundations of data protection. Learned the basics of system security, including buffer overflow and return-oriented programming. Explored various mechanisms for anonymous communication (TOR, Nym, ANON) and evaluated their effectiveness. Understood blockchains and their consensus mechanisms, assessing their strengths and weaknesses.', slug:'itsec'},
      { id: 21, name: 'Machine Learning in Climate and Environmental Sciences ', description: 'This module covers key concepts for real-world applications of machine learning, focusing on environmental data science. Topics include the foundations of machine learning (such as the curse of dimensionality, cross-validation, cost functions, and feature engineering), widely applied regression, classification, and unsupervised learning algorithms (like LASSO, random forests, Gaussian processes, neural networks, LSTMs, transformers, and self-organizing maps), time series forecasting, and causal inference. It also explores explainable AI methods (such as SHAP value analyses, feature permutation methods, and intrinsically interpretable methods).', slug:'envsciences' },
    ]
  },
  {
    semester: 4,
    courses: [
      { id: 19, name: 'Advanced Machine Learning and Data Science', description: 'Develop a system to regress measures of option pricing before and after ecb meetings to determine their impact on the price' },
      { id: 20, name: 'Master Thesis', description: 'Few Shot Image to Image Translation' },
    
    ]
  },
];
const categories = ['All', 'C#', 'Full Stack', 'ML', 'Math'];

const ResearchProjectCard = ({ project, colors }) => (
  <div className={`border rounded-lg overflow-hidden p-4 ${colors.borderColor} ${colors.cardBackground}`}>
    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
    <p className={`text-sm ${colors.secondaryText} mb-2`}>
      Funding: {project.funding}
    </p>
    <p className={`text-sm ${colors.secondaryText} mb-2`}>
      Task: {project.task}
    </p>
    <p className={`text-sm ${colors.secondaryText} mb-2`}>
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

const CourseCard = ({ course, colors }) => {
  const cardContent = (
    <div 
      className={`border rounded-lg overflow-hidden p-4 transition-transform hover:scale-105 ${colors.borderColor} ${colors.cardBackground}`}
    >
      <h4 className="text-lg font-semibold mb-2 flex items-start">
        <Book size={18} className="mr-2 flex-shrink-0 mt-1" />
        <span className={course.slug ? `hover:underline ${colors.accentText}` : ''}>{course.name}</span>
      </h4>
      <p className={`text-sm ${colors.secondaryText}`}>
        {course.description}
      </p>
    </div>
  );

  return course.slug ? (
    <Link href={`/courses/${course.slug}`} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

const SemesterCourses = ({ semester, colors }) => {
  const [expanded, setExpanded] = useState(false);
  const displayedCourses = expanded ? semester.courses : semester.courses.slice(0, 3);
  const hasMoreCourses = semester.courses.length > 3;

  return (
    <div>
      <h3 className={`text-xl text-center font-semibold mb-4 ${colors.accentText}`}>
        Semester {semester.semester}
      </h3>
      <div className="space-y-4">
        {displayedCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            colors={colors} 
          />
        ))}
      </div>
      {hasMoreCourses && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-4 flex items-center ${colors.accentText} hover:${colors.accentText}`}
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

const SkillCard = ({ title, technologies, description, colors }) => (
  <div className={`p-6 rounded-lg ${colors.cardBackground} shadow-md`}>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <div className="mb-3">
      <h4 className="font-medium mb-1">Technologies:</h4>
      <p className={`text-sm ${colors.secondaryText}`}>
        {technologies.join(', ')}
      </p>
    </div>
    <p className={`text-sm ${colors.secondaryText}`}>{description}</p>
  </div>
);

const SkillsSection = ({ colors }) => (
  <section id="skills" className="mb-16 pt-16">
    <h2 className="text-2xl font-semibold mb-6 text-center">Professional Work</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkillCard
        title="Machine Learning Engineer at HS Analysis (2017-Present)"
        technologies={['python', 'pytorch', 'tensorflow', 'React', 'Node.js', 'flask', 'C#', 'WPF']}
        description="Sole developer of the deep learning backend for data of any domain with a focus on computer vision for a self-training webpage. The idea is that untrained staff, for example in medical facilities, can annotate and train their own models without any understanding. My task is to provide self-configuring networks that adapt to the given project"
        colors={colors}
      />
      <SkillCard
        title="Fraunhofer Insitute of Secure Information Technology (2019-2020)"
        technologies={['Python', 'TensorFlow', 'PyTorch']}
        description="Developing authorship verification methods. I was responsible for implementing the actual ideas and also implement methods from other papers to compare our methods to. "
        colors={colors}
      />
    </div>
  </section>
);

const ProjectsSection = ({ colors }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = selectedCategory === 'All'
    ? projects.sort((a, b) => a.id - b.id)
    : projects.filter(project => project.category === selectedCategory).sort((a, b) => a.id - b.id);

  const getCategoryColor = (category) => {
    switch(category) {
      default: return 'bg-blue-500';
    }
  };

  const ProjectCard = ({ project }) => {
    const cardContent = (
      <div 
        className={`relative flex flex-col h-full border rounded-lg overflow-hidden ${project.page || project.blogSlug ? 'cursor-pointer' : ''} transition-transform hover:scale-105 ${colors.borderColor} ${colors.cardBackground}`}
      >
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(project.category)}`}>
          {project.category}
        </div>
        <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
        <div className="flex flex-col flex-grow p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          <p className={`mt-2 text-sm ${colors.secondaryText} flex-grow`}>
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.github, '_blank');
              }}
            >
              <Github size={18} className="mr-1" /> GitHub
            </button>
            {project.live && (
              <button 
                className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.live, '_blank');
                }}
              >
                <ExternalLink size={18} className="mr-1" /> Live Demo
              </button>
            )}
          </div>
        </div>
      </div>
    );

    if (project.page || project.blogSlug) {
      return (
        <Link href={project.blogSlug ? `/blog/${project.blogSlug}` : `/${project.page}`} passHref className="w-full">
          {cardContent}
        </Link>
      );
    }

    return <div className="w-full">{cardContent}</div>;
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
                ? colors.accentBackground + ' text-white'
                : colors.cardBackground + ' ' + colors.hoverBackground
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};

const TimelineEvent = ({ year, events, colors }) => {
  return (
    <div className="w-full sm:w-64 p-4">
      <h3 className={`text-xl text-center font-semibold mb-4 ${colors.accentText}`}>
        {year}
      </h3>
      <div className={`space-y-2 ${colors.secondaryText}`}>
        {events.map((event, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg ${colors.cardBackground} text-sm`}
          >
            {event}
          </div>
        ))}
      </div>
    </div>
  );
};

const AboutMe = ({ colors }) => {
  return (
    <section id="about" className="mb-12 pt-16">
      <h2 className="text-2xl font-semibold mb-4 text-center">About Me</h2>
      <div className={`bg-opacity-50 rounded-lg p-6 ${colors.cardBackground}`}>
        <p className={`text-lg mb-4 ${colors.text}`}>
          Hey! I am Philipp Marquardt, a Machine Learning Engineer completing my Computer Science Masters at KIT. I have been exploring AI and machine learning since 2018, and I am always excited to take on new challenges.
        </p>
        
        <h3 className={`text-xl font-semibold mb-2 text-center ${colors.text}`}>My Areas of Interest:</h3>
        <ul className={`list-none text-center mb-4 ${colors.secondaryText}`}>
          <li>• Natural language processing</li>
          <li>• Computer Vision</li>
          <li>• Machine learning for climate science and energy grids</li>
          <li>• AI in robotics, especially mimicking human movement</li>
          <li>• Applications of ML in material sciences and finance</li>
        </ul>
        
        <p className={`text-lg ${colors.text}`}>
          Currently, I am working at HS Analysis GmbH, developing deep learning systems for medical image analysis. In my free time, I enjoy working on full-stack projects and improving my skills in Python, C#, and JavaScript.
        </p>
      </div>
    </section>
  );
};

const ShortCV = ({ colors }) => {
  return (
    <section id="journey" className="mb-16 pt-16">
      <h2 className="text-2xl font-semibold mb-6 text-center">Short CV</h2>
      <div className="flex flex-wrap justify-center">
        {timelineEvents.map((event, index) => (
          <TimelineEvent 
            key={index}
            year={event.year}
            events={event.events}
            colors={colors}
          />
        ))}
      </div>
    </section>
  );
};

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentColors = isDarkMode ? colors.dark : colors.light;

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
    <div className={`min-h-screen ${currentColors.background} ${currentColors.text}`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${currentColors.navBackground} shadow-md`}>
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Philipp Marquardt</h1>
            <div className="flex items-center">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${currentColors.hoverBackground} transition-colors`}
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden ml-4 p-2 rounded-full ${currentColors.hoverBackground} transition-colors`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <a onClick={() => scrollToSection('about')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">About</a>
            <a onClick={() => scrollToSection('journey')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">CV</a>
            <a onClick={() => scrollToSection('skills')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">Professional Work</a>
            <a onClick={() => scrollToSection('research-projects')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">Funded Projects</a>
            <a onClick={() => scrollToSection('projects')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">Projects</a>
            <a onClick={() => scrollToSection('papers')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">Papers</a>
            <a onClick={() => scrollToSection('courses')} className="mx-3 cursor-pointer hover:text-blue-500 transition-colors">Masters Degree</a>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <a onClick={() => scrollToSection('about')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>About</a>
            <a onClick={() => scrollToSection('journey')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>CV</a>
            <a onClick={() => scrollToSection('skills')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>Skills</a>
            <a onClick={() => scrollToSection('research-projects')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>Funded Projects</a>
            <a onClick={() => scrollToSection('projects')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>Projects</a>
            <a onClick={() => scrollToSection('papers')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>Papers</a>
            <a onClick={() => scrollToSection('courses')} className={`block py-2 px-4 ${currentColors.hoverBackground} transition-colors`}>Masters Degree</a>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-12 mt-16">
        <AboutMe colors={currentColors} />
        <ShortCV colors={currentColors} />
        <SkillsSection colors={currentColors} />
        <section id="research-projects" className="mb-16 pt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Participation at Funded Research Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchProjects.map((project) => (
              <ResearchProjectCard key={project.id} project={project} colors={currentColors} />
            ))}
          </div>
        </section>
        <ProjectsSection colors={currentColors} />
        <section id="papers" className="pt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Published Papers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div 
                key={paper.id} 
                className={`border rounded-lg overflow-hidden p-4 ${currentColors.borderColor} ${currentColors.cardBackground}`}
              >
                <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
                <p className={currentColors.secondaryText}>
                  {paper.authors} • {paper.journal} • {paper.year}
                </p>
                <p className={`mt-2 text-sm ${currentColors.secondaryText}`}>
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
              <SemesterCourses key={semester.semester} semester={semester} colors={currentColors} />
            ))}
          </div>
        </section>
      </main>

      <footer className={`mt-12 py-6 ${currentColors.footerBackground}`}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
