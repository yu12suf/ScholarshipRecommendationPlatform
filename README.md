

This README is designed to look like an industry-standard production project while highlighting the academic rigor required for a senior project. It aligns perfectly with your Software Design Document (SDD).
Educational Adventure Pathway (EAP) 🎓
An AI-Powered Platform for Ethiopian Students Pursuing International Education.
![alt text](https://img.shields.io/badge/Frontend-Next.js%2014-black)

![alt text](https://img.shields.io/badge/Backend-Express.js-green)

![alt text](https://img.shields.io/badge/Data%20Fetching-TanStack%20Query-red)

![alt text](https://img.shields.io/badge/Database-MongoDB-brightgreen)






📌 Project Overview
The Educational Adventure Pathway is a comprehensive digital ecosystem designed to support Ethiopian students in their journey toward international education. By integrating AI-powered scholarship discovery, English proficiency assessments, and a secure counselor-student marketplace, EAP addresses the fragmentation and high barriers to entry in the global education landscape.
This project was developed as a Senior Research Project, following the 4+1 Architectural View Model and Modular Subsystem Decomposition.
✨ Key Features (Subsystems)
As defined in the Software Design Document (SDD):
AI Scholarship Recommendation: Intelligent profile-to-scholarship matching using NLP and match-score algorithms.
English Assessment System: AI-assisted evaluation of reading, writing, listening, and speaking skills.
Personalized Learning Pathways: Dynamically generated roadmaps based on student goals and assessment gaps.
Counselor Marketplace: A secure platform for booking verified mentors with an integrated Escrow Payment System.
Mock Exam Management: Simulation of standardized tests (IELTS, TOEFL, GRE) with real-time analytics.
Document Analysis: OCR and AI analysis of SOPs, CVs, and academic transcripts.
🛠 Tech Stack
Frontend
Framework: Next.js 14 (App Router)
State Management & Data Fetching: TanStack Query (React Query)
Styling: Tailwind CSS + Shadcn UI
Form Handling: React Hook Form + Zod
Backend
Runtime: Node.js (Express.js)
Language: TypeScript
Database: MongoDB (Mongoose ODM)
Cache: Redis (for session management)
AI/ML: OpenAI API / Gemini API (for recommendations and voice analysis)



📂 Project Architecture
The project follows a Feature-Based Modular Architecture to ensure high maintainability and scalability (as per SDD Section 2.2).
Frontend Structure
code
Text





src/
├── app/ # Next.js Routes & Layouts
├── features/   # Domain-specific logic (The "Subsystems")
│   ├── scholarship/# Components, Hooks, and Services for Subsystem 2
│   ├── assessment/# UI and logic for Subsystem 3
│   └── counselor/# Booking logic for Subsystem 5
├── components/ # Global UI components (Shadcn)
├── lib/ # Shared configurations (Axios, TanStack Client)
└── types/# TS Interfaces (Matched to SDD Data Dictionary)





Backend Structure
code
Text
src/
├── modules/# Modular Subsystems
│   ├── auth/# Subsystem 1: Security & Roles
│   ├── scholarship/# Subsystem 2: AI Logic
│   └── payment/# Subsystem 6: Escrow & Gateways
├── middleware/# AuthGuard, RoleChecker
└── config/# DB and Cloudinary setup




🚀 Getting Started
Prerequisites
Node.js (v18+)
MongoDB (Local or Atlas)
API Keys for AI Services (OpenAI/Gemini)
Installation
Clone the repository:
code
Bash
git clone https://github.com/your-username/educational-adventure-pathway.git
Setup Backend:
code
Bash
cd backend
npm install
cp .env.example .env  # Add your DB URI and API Keys
npm run dev
Setup Frontend:
code
Bash
cd frontend
npm install
npm run dev




📊 Software Design Alignment
This implementation strictly adheres to the technical specifications outlined in the project's documentation:
Requirement Traceability: All functional requirements (FR1-FR53) are mapped to specific modules.
Design Goals: Prioritizes Scalability (modular services) and Security (Role-Based Access Control & Escrow).
Physical Data Model: Database schemas follow the Data Dictionary (SDD Section 3.3).
👨‍💻 Contributors
📄 License
This project is developed for academic evaluation purposes as part of the Department of Software Engineering Senior Project requirements.
