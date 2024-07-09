
"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, ExternalLink, Menu, X, FileText, Book, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const courses = [
    {
      semester: 1,
      courses: [
        { id: 1, name: 'Deep Learning for Computer Vision II: Advanced Topics', description: 'Learn about newest reserach topics in computer vision' },
        { id: 2, name: 'Natural Language Processing', description: 'Learn everything about NLP from the ground up starting ' },
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

const CourseCard = ({ course, isDarkMode }) => (
    <Link href={`/courses/${course.slug}`} className="block">
      <div 
        className={`border rounded-lg overflow-hidden p-4 transition-colors ${
          isDarkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50'
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

  const CourseSection = () => {
    return ( 
    <section id="courses" className="mb-16 pt-16">
    <h2 className="text-2xl font-semibold mb-6 text-center">Computer Science Master at the Karlsruhe Institute of Technology</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {courses.map((semester) => (
        <SemesterCourses key={semester.semester} semester={semester} isDarkMode={isDarkMode} />
      ))}
    </div>
  </section>)
  }