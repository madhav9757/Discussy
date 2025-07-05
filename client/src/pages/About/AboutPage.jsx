import React from 'react';
import './AboutPage.css';
import { FaGithub, FaCode, FaRocket } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-box">
        <h1 className="about-title">About Discussly</h1>
        <p className="about-description">
          Discussly is a modern Reddit-style discussion platform built with the MERN stack. It enables users to create posts, join communities, and engage in thoughtful conversations.
        </p>

        <div className="about-section">
          <h2><FaCode className="icon" /> Tech Stack</h2>
          <ul>
            <li>Frontend: React, Redux Toolkit, React Router</li>
            <li>Backend: Node.js, Express</li>
            <li>Database: MongoDB</li>
            <li>Auth & Storage: Appwrite</li>
          </ul>
        </div>

        <div className="about-section">
          <h2><FaRocket className="icon" /> Project Goals</h2>
          <p>
            Our goal is to provide a clean, responsive, and user-friendly platform for discussion and community engagement — ideal for developers, tech enthusiasts, or anyone who loves to share ideas.
          </p>
        </div>

        <div className="about-section">
          <h2><FaGithub className="icon" /> GitHub</h2>
          <a
            href="https://github.com/your-repo/discussly"
            target="_blank"
            rel="noreferrer"
            className="github-link"
          >
            View Source Code on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
