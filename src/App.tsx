/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, memo, useCallback } from 'react';
import { Printer, CheckCircle2, Mail, Globe, MapPin, Award, GraduationCap, Briefcase, Code2, School, Plus, Trash2, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CurriculumData {
  duration: string;
  domain: string;
  curriculum: string[];
}

interface CertificateProps {
  name: string;
  isPrint?: boolean;
  sharedRef?: any;
  collegeName: string;
  mode: string;
  refNo: string;
  currentDate: string;
  titleText: string;
  durationText: string;
  domain: string;
  startDate: string;
  endDate: string;
  curriculum: string[];
  setStudentName: (val: string) => void;
  setCollegeName: (val: string) => void;
  setRefNo: (val: string) => void;
  setCurrentDate: (val: string) => void;
  setTitleText: (val: string) => void;
  setDurationText: (val: string) => void;
  setDomain: (val: string) => void;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  addCurriculumItem: () => void;
  removeCurriculumItem: (idx: number) => void;
  updateCurriculumItem: (idx: number, val: string) => void;
}

const INTERNSHIP_PRESETS: Record<number, CurriculumData> = {
  1: {
    duration: "1 Month",
    domain: "Web Development",
    curriculum: [
      "20 Days Training: 10 Days Language basics, 7 Days HTML/CSS + Modern Tools, 3 Days MySQL.",
      "10 Days Project Phase: Implementation of a responsive web application module.",
      "Professional Development: Aptitude Practice and Mock Interview sessions."
    ]
  },
  3: {
    duration: "3 Months",
    domain: "Full Stack Java Development",
    curriculum: [
      "2.5 Months Training: 1 Month Core Language, 1.5 Months Front-end, Database, and Modern Dev Tools.",
      "15 Days Project Phase: Scalable enterprise-level application development.",
      "Professional Skills: Aptitude Practice, Interview Prep, and Mock Interviews."
    ]
  },
  6: {
    duration: "6 Months",
    domain: "Full Stack Java Development",
    curriculum: [
      "Phase I (3 Months): 2.5 Months Advanced Training + 15 Days Mini Project execution.",
      "Phase II (3 Months): 2 Months Industrial Training + 1 Month Major Capstone Project.",
      "Placement Support: Aptitude practice, Placement Support, and thorough Interview preparation."
    ]
  },
  9: {
    duration: "9 Months",
    domain: "Advanced Full Stack Development",
    curriculum: [
      "Phase I: 3 Months Advanced System Architecture & Database Design.",
      "Phase II: 3 Months Real-world Project Implementation with Microservices.",
      "Phase III: 3 Months Industrial Internship & Corporate Communication Mastery.",
      "Advanced Placement: Intensive technical rounds and portfolio fine-tuning."
    ]
  },
  12: {
    duration: "1 Year (Graduate Internship)",
    domain: "Full Stack Java Development",
    curriculum: [
      "Foundational Mastery: Extensive training in Enterprise Architecture and Microservices.",
      "Product Life Cycle: Active participation in end-to-end SDLC for industrial software solutions.",
      "Leadership & Mentorship: Collaborative project management and advanced placement support.",
      "Final Evaluation: Comprehensive technical assessment and professional interview simulation."
    ]
  }
};

const COURSE_PRESETS: Record<number, CurriculumData> = {
  1: {
    duration: "1 Month",
    domain: "Modern Web Development",
    curriculum: [
      "Foundational Web: HTML5, CSS3, and JavaScript modern syntax.",
      "Component Architecture: Modular design and state management basics.",
      "Deployment: Basic hosting and version control with Git."
    ]
  },
  3: {
    duration: "3 Months",
    domain: "Full Stack Development Masterclass",
    curriculum: [
      "Frontend Mastery: React.js, Tailwind CSS, and Framer Motion.",
      "Backend Excellence: Node.js, Express, and RESTful API design.",
      "Database Design: MongoDB schema modeling and SQL optimization.",
      "Capstone Project: Full-scale industrial application deployment."
    ]
  }
};

const SCHOOL_PRESETS: Record<number, CurriculumData> = {
  8: {
    duration: "8th Std Onwards",
    domain: "Foundation Level (Hybrid Smart Learning)",
    curriculum: [
      "Activity-Based Learning: Games, Drawing, and Fun Tasks.",
      "Advanced MS Office: Proficiency in Word, Excel, and PPT.",
      "Basic Programming: Introduction to logic and computer science concepts.",
      "Internet Lab Practice: Safe and effective web navigation skills."
    ]
  },
  9: {
    duration: "9th - 10th Std",
    domain: "Skill Level (Hybrid Smart Learning)",
    curriculum: [
      "C-Language (Intro): Foundations of procedural programming.",
      "Practical Mini Projects: Building small useable digital tools.",
      "Prompt Engineering: Basics of AI interaction and generative tools.",
      "Resume Basics: Introduction to professional identity building."
    ]
  },
  11: {
    duration: "11th - 12th Std",
    domain: "Career Level (Hybrid Smart Learning)",
    curriculum: [
      "HTML / CSS: Professional web interface designing.",
      "Advanced Excel & AI: Data analysis and intelligent automation.",
      "Programming Languages: Mastering Python / Java fundamentals.",
      "Career Guidance: Simplified roadmap for future tech careers."
    ]
  }
};

const LANGUAGE_PRESETS: Record<string, CurriculumData> = {
  "JAVA": {
    duration: "Full Course",
    domain: "Java Development",
    curriculum: [
      "Core Java Objects: OOPS, Multithreading, and Collections.",
      "Web Components: Servlets, JSP, and JSF fundamentals.",
      "Spring Framework: Spring Boot, MVC, and Data JPA mastery.",
      "Industry Project: Real-time application with Hibernate."
    ]
  },
  "PYTHON": {
    duration: "Full Course",
    domain: "Python Programming",
    curriculum: [
      "Python Basics: Syntax, Data Types, and File Handling.",
      "Frameworks: Django / Flask web development essentials.",
      "Data Science Intro: NumPy, Pandas, and Matplotlib integration.",
      "Automation: Scripting for task efficiency and web scraping."
    ]
  },
  "WEB": {
    duration: "6 Months",
    domain: "Modern Frontend Mastery",
    curriculum: [
      "Core UI: Advanced HTML5, Tailwind CSS, and Responsive Design.",
      "Interactive: JavaScript ES6+, DOM Manipulation, and API Fetching.",
      "Frameworks: React.js Ecosystem and State Management.",
      "Tooling: Vite, Git, and CI/CD Pipeline integration."
    ]
  }
};

type CertificateMode = 'INTERNSHIP' | 'COURSE' | 'SCHOOL' | 'LANGUAGE';

const Certificate = memo(({ 
  name, 
  isPrint = false, 
  sharedRef = null,
  collegeName,
  mode,
  refNo,
  currentDate,
  titleText,
  durationText,
  domain,
  startDate,
  endDate,
  curriculum,
  setStudentName,
  setCollegeName,
  setRefNo,
  setCurrentDate,
  setTitleText,
  setDurationText,
  setDomain,
  setStartDate,
  setEndDate,
  addCurriculumItem,
  removeCurriculumItem,
  updateCurriculumItem
}: CertificateProps) => (
  <div 
    ref={sharedRef}
    className={`a4-container ${isPrint ? 'print-page-break' : 'scale-[0.9] origin-top lg:scale-100'} mb-8`}
    style={{ boxShadow: isPrint ? 'none' : '0 25px 50px -12px rgba(0,0,0,0.25)' }}
  >
    {/* Decorative Elements */}
    <div 
      className="h-[20px] w-full" 
      style={{ background: 'linear-gradient(90deg, #020617 100%, #1e40af 100%, #f59e0b 100%)' }}
    />
    
    {/* Watermark Logo (Invoice-Style Center M) */}
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none z-0">
       <div className="relative w-[90%] aspect-square flex items-center justify-center">
          <img 
            src="https://drive.google.com/file/d/1DgWexrvai7QFai_ZHeuIQhHu83b4G1de/view?usp=drive_link" 
            alt="Manexra Watermark" 
            className="w-full h-auto object-contain blur-[2px]"
            referrerPolicy="no-referrer"
          />
       </div>
    </div>

    <div 
      className="relative z-10 px-16 pt-12 flex flex-col h-full" 
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
    >
      {/* Logo Section */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <img 
            src="clogo.png" 
            alt="Manexra" 
            className="h-24 w-auto p-1"
            referrerPolicy="no-referrer"
          />
          <div className="h-16 w-px bg-slate-200" />
          <div>
            <h1 className="font-display font-black text-4xl tracking-tighter text-slate-950 leading-none">
              MANEXRA <span className="text-blue-700">TECHVERSE</span>
            </h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">Private Limited</p>
            <p className="text-[10px] text-slate-400 italic font-medium tracking-tight mt-1">any time...any where...</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[12px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-2">CIN: U62099PN2025PTC248735</p>
           <a href="https://www.manexra.com" className="text-blue-700 font-black text-sm hover:underline">www.manexra.com</a>
        </div>
      </header>

      {/* Reference Section */}
      <div className="flex justify-between mt-12 text-[12px] text-slate-500 font-black uppercase tracking-widest border-y border-slate-100 py-4">
        <div className="flex items-center gap-2">
          REF NO: MTPL/{mode.slice(0, 3)}/2026/
          <span 
            data-field="ref-no"
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setRefNo(e.currentTarget.textContent || "")}
            className="editable-input min-w-[60px] text-slate-950 px-2"
          >
            {refNo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          DATE: 
          <span 
            data-field="cert-date"
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setCurrentDate(e.currentTarget.textContent || "")}
            className="editable-input min-w-[140px] text-slate-950 px-2"
          >
            {currentDate}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mt-14 text-center">
        <h2 
          contentEditable={!isPrint}
          suppressContentEditableWarning
          onBlur={(e) => setTitleText(e.currentTarget.textContent || "")}
          className="font-display text-4xl font-black text-slate-950 uppercase tracking-[0.1em] px-16 py-4 border-y-4 border-slate-950 editable-input"
          style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
        >
          {titleText}
        </h2>
      </div>

      {/* Certificate Body */}
      <div className="mt-14 space-y-8 text-xl leading-[1.8] text-slate-800 text-center max-w-4xl mx-auto font-medium">
        <p>
          This is to certify that {' '}
          <span 
            data-field="student-name"
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setStudentName(e.currentTarget.textContent || "")}
            className="font-black text-slate-950 editable-input px-4 inline-block underline decoration-[#2563eb4d] decoration-dashed underline-offset-8"
          >
            {name}
          </span> {' '}
          from {' '}
          <span 
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setCollegeName(e.currentTarget.textContent || "")}
            className="font-bold text-slate-950 editable-input px-4 inline-block decoration-slate-300 decoration-dashed underline-offset-8"
          >
            {collegeName}
          </span>, has successfully completed 
          a {' '}
          <span 
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setDurationText(e.currentTarget.textContent || "")}
            className="font-black text-blue-700 editable-input px-2 underline decoration-amber-500 decoration-4 underline-offset-8"
          >
            {durationText}
          </span> 
          {' '} {mode === 'INTERNSHIP' ? 'Internship' : mode === 'COURSE' ? 'Professional Training' : 'Smart Learning'} in {' '}
          <span 
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setDomain(e.currentTarget.textContent || "")}
            className="font-black text-slate-950 editable-input px-4 inline-block"
            style={{ backgroundColor: 'rgba(241, 245, 249, 0.5)' }}
          >
            {domain}
          </span> at {' '}
          <strong className="text-slate-950">Manexra Techverse Private Limited</strong>.
        </p>
        
        <p className="text-lg">
          The tenure was held from {' '}
          <span 
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setStartDate(e.currentTarget.textContent || "")}
            className="font-black text-slate-900 editable-input px-4"
          >
            {startDate}
          </span> {' '}
          to {' '}
          <span 
            contentEditable={!isPrint}
            suppressContentEditableWarning 
            onBlur={(e) => setEndDate(e.currentTarget.textContent || "")}
            className="font-black text-slate-900 editable-input px-4"
          >
            {endDate}
          </span>.
        </p>
      </div>

      {/* Curriculum Box */}
      <div 
        className="mt-12 border-l-[6px] border-blue-700 p-8 rounded-r-3xl shadow-lg"
        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '6px solid #1d4ed8' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-black text-[#1e3a8a] uppercase text-sm tracking-widest flex items-center gap-3">
            <CheckCircle2 size={18} style={{ color: '#2563eb' }} />
            Technical Curriculum & Practical Learning Outcomes
          </h3>
          {!isPrint && (
            <button onClick={addCurriculumItem} className="no-print p-2 bg-[#dbeafe] text-[#1d4ed8] rounded-lg hover:bg-[#bfdbfe] transition-colors">
              <Plus size={16} />
            </button>
          )}
        </div>
        <ul className="grid grid-cols-1 gap-5">
          {curriculum.map((item, idx) => (
            <li 
              key={idx}
              className="flex items-start gap-4 group"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" 
                style={{ background: 'linear-gradient(45deg, #2563eb 0%, #60a5fa 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <div className="flex-1 relative">
                  <span 
                    contentEditable={!isPrint}
                    suppressContentEditableWarning 
                    onBlur={(e) => updateCurriculumItem(idx, e.currentTarget.textContent || "")}
                    className="text-[15px] text-[#334155] font-semibold leading-relaxed block focus:bg-white p-1 rounded transition-colors editable-input-free"
                  >
                    {item}
                  </span>
              </div>
              {!isPrint && (
                <button onClick={() => removeCurriculumItem(idx)} className="no-print opacity-0 group-hover:opacity-100 p-1.5 text-[#e11d48] hover:bg-[#fff1f2] rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Closing */}
      <p className="mt-12 text-slate-700 italic text-lg leading-relaxed text-center px-16 font-medium">
        Throughout this period, the candidate demonstrated exceptional professional conduct, technical proficiency, and a consistent commitment to organizational values and excellence.
      </p>

      {/* Signatures */}
      <div className="mt-auto pb-16 flex justify-between items-end">
        <div className="text-center group">
          <div className="mb-4 relative">
            <div 
              className="w-36 h-36 border-2 border-dashed border-blue-200 rounded-full flex items-center justify-center transition-all group-hover:scale-105"
              style={{ opacity: 0.4 }}
            >
              <img src="clogo.png" alt="Seal" className="w-20 h-20 grayscale opacity-1000" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="w-48 h-0.5 bg-slate-300 mb-3 mx-auto" />
          <div className="text-[11px] text-slate-600 uppercase tracking-[0.3em] font-black">Official Seal</div>
        </div>
        <div className="text-center">
          <div className="mb-6 h-16 flex items-center justify-center">
             <img 
               src="clogo.png" 
               alt="Sign" 
               className="h-12 select-none grayscale" 
               style={{ opacity: 100 }}
               referrerPolicy="no-referrer" 
             />
          </div>
          <div className="font-black text-slate-950 mb-1 font-display text-xl tracking-tight uppercase">Authorized Signatory</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Manexra Techverse Pvt. Ltd.</div>
        </div>
      </div>

      {/* Footer Contact */}
      <footer className="mt-auto pt-8 pb-8" style={{ borderTop: '2px solid #f1f5f9' }}>
        <div className="grid grid-cols-2 gap-16 text-[11px] text-[#475569] font-bold">
          <div className="flex gap-5 items-start">
            <div 
              className="p-3 rounded-2xl shadow-sm" 
              style={{ backgroundColor: '#f1f5f9', color: '#1d4ed8' }}
            >
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <strong className="text-[#020617] block uppercase tracking-widest text-[10px] mb-1">Office Headquarters</strong>
              Plot No-21/1 Gala NO -121, Pencile Square, Rui Midc,<br />
              Baramati, Pune - 413102, Maharashtra, INDIA
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-4 text-right">
              <div className="space-y-0.5">
                <span className="text-[#94a3b8] block uppercase tracking-tighter text-[9px] font-black">Email Support</span>
                <span className="text-[#020617] text-[12px]">manexratechverse@gmail.com</span>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#f1f5f9', color: '#2563eb' }}>
                <Mail size={18} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 text-right">
              <div className="space-y-0.5">
                <span className="text-[#94a3b8] block uppercase tracking-tighter text-[9px] font-black">Online Presence</span>
                <span className="text-[#020617] text-[12px]">www.manexra.com</span>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#f1f5f9', color: '#2563eb' }}>
                <Globe size={18} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
));

export default function App() {
  const [mode, setMode] = useState<CertificateMode>('INTERNSHIP');
  const [selectedKey, setSelectedKey] = useState<string | number>(1);
  
  // Fully editable fields
  const [studentName, setStudentName] = useState("Mr./Ms. [Student Name]");
  const [collegeName, setCollegeName] = useState("[Institution Name]");
  const [startDate, setStartDate] = useState("[Start Date]");
  const [endDate, setEndDate] = useState("[End Date]");
  const [refNo, setRefNo] = useState("001");
  const [currentDate, setCurrentDate] = useState("April 20, 2026");
  const [domain, setDomain] = useState("");
  const [curriculum, setCurriculum] = useState<string[]>([]);
  const [durationText, setDurationText] = useState("");
  const [titleText, setTitleText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const certificateRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  // Batch Features (Removed as requested)
  // const [isBatchMode, setIsBatchMode] = useState(false);
  
  const generateRandomData = () => {
    const names = ["Aryan Sharma", "Zoya Khan", "Ishaan Verma", "Ananya Reddy", "Kabir Malhotra", "Sneha Patil", "Rahul Deshmukh"];
    const colleges = ["IIT Bombay", "BITS Pilani", "Delhi Technological University", "Anna University", "Manipal Institute of Technology", "Pune University"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const randomMode: CertificateMode = (['INTERNSHIP', 'COURSE', 'SCHOOL', 'LANGUAGE'] as CertificateMode[])[Math.floor(Math.random() * 4)];
    setMode(randomMode);
    
    setStudentName(names[Math.floor(Math.random() * names.length)]);
    setCollegeName(colleges[Math.floor(Math.random() * colleges.length)]);
    
    const startYear = 2024 + Math.floor(Math.random() * 2);
    const startMonth = months[Math.floor(Math.random() * 12)];
    const endMonth = months[Math.floor(Math.random() * 12)];
    
    setStartDate(`${startMonth} ${startYear}`);
    setEndDate(`${endMonth} ${startYear + (Math.random() > 0.5 ? 1 : 0)}`);
    setRefNo(Math.floor(Math.random() * 999).toString().padStart(3, '0'));
    setCurrentDate(`${months[new Date().getMonth()]} ${new Date().getDate()}, ${new Date().getFullYear()}`);
  };

  // Initialize data based on mode
  useMemo(() => {
    let dataset: any;
    switch(mode) {
      case 'INTERNSHIP': dataset = INTERNSHIP_PRESETS; setTitleText("Internship Completion Certificate"); break;
      case 'COURSE': dataset = COURSE_PRESETS; setTitleText("Course Completion Certificate"); break;
      case 'SCHOOL': dataset = SCHOOL_PRESETS; setTitleText("School Program (Smart Learning)"); break;
      case 'LANGUAGE': dataset = LANGUAGE_PRESETS; setTitleText("Professional Language Certificate"); break;
    }
    const defaultData = dataset[Object.keys(dataset)[0]];
    if (defaultData) {
      setDomain(defaultData.domain);
      setCurriculum([...defaultData.curriculum]);
      setDurationText(defaultData.duration);
    }
  }, [mode]);

  const handleUpdatePreset = (key: string | number) => {
    setSelectedKey(key);
    let dataset: any;
    switch(mode) {
      case 'INTERNSHIP': dataset = INTERNSHIP_PRESETS; break;
      case 'COURSE': dataset = COURSE_PRESETS; break;
      case 'SCHOOL': dataset = SCHOOL_PRESETS; break;
      case 'LANGUAGE': dataset = LANGUAGE_PRESETS; break;
    }
    const data = dataset[key];
    if (data) {
      setDomain(data.domain);
      setCurriculum([...data.curriculum]);
      setDurationText(data.duration);
    }
  };

  const updateCurriculumItem = useCallback((index: number, value: string) => {
    setCurriculum(prev => {
      const newLabels = [...prev];
      newLabels[index] = value;
      return newLabels;
    });
  }, []);

  const addCurriculumItem = useCallback(() => {
    setCurriculum(prev => [...prev, "[New Training Item]"]);
  }, []);

  const removeCurriculumItem = useCallback((index: number) => {
    setCurriculum(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePrint = async () => {
    if (!captureRef.current) return;
    
    // Check if we are in batch mode (split by newline or comma)
    const names = batchInput.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== "");
    const isBatch = names.length > 0;
    
    setIsGenerating(true);
    setBatchTotal(isBatch ? names.length : 1);
    setBatchProgress(0);

    try {
      const element = captureRef.current;

      const processName = async (name: string, index: number, targetPdf: jsPDF) => {
        setBatchProgress(index + 1);
        
        // Final minor delay for styles/images to settle
        await new Promise(resolve => window.requestAnimationFrame(resolve));

        // Use scale 3 for excellent clarity without hitting browser limits
        const canvas = await html2canvas(element, {
          scale: 3, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            const certElement = clonedDoc.querySelector('.a4-container') as HTMLElement;
            if (certElement) {
              certElement.style.transform = 'none';
              certElement.style.margin = '0';
              certElement.style.border = 'none';
              certElement.style.boxShadow = 'none';
              certElement.style.width = '210mm';
              certElement.style.height = '297mm';
              certElement.style.display = 'block';
              certElement.style.visibility = 'visible';
              certElement.style.opacity = '1';
            }

            // Update the name in the clone
            const nameEl = clonedDoc.querySelector('[data-field="student-name"]');
            if (nameEl) nameEl.textContent = name;

            // Fix CSS Colors & Variables (PDF engines struggle with oklch/oklab)
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              [data-field="student-name"] { 
                color: #020617 !important;
                text-decoration-color: rgba(37, 99, 235, 0.3) !important;
              }
              .a4-container { background-color: #ffffff !important; }
            `;
            clonedDoc.head.appendChild(style);

            // Recursively fix color functions on all elements
            const allElements = clonedDoc.querySelectorAll("*");
            allElements.forEach(node => {
              const el = node as HTMLElement;
              if (el.style) {
                const elStyle = window.getComputedStyle(el);
                ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
                  const val = (elStyle as any)[prop];
                  if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('var'))) {
                    // Force sensible defaults for problematic color formats
                    if (prop === 'backgroundColor' && (val.includes('slate') || val.includes('white'))) {
                       el.style.setProperty(prop, '#ffffff', 'important');
                    } else if (prop === 'color' && (val.includes('slate') || val.includes('black'))) {
                       el.style.setProperty(prop, '#0f172a', 'important');
                    }
                  }
                });
              }
            });
          }
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        if (index > 0) targetPdf.addPage();
        targetPdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW');
      };

      if (isBatch) {
        const bulkPdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        for (let i = 0; i < names.length; i++) {
          await processName(names[i], i, bulkPdf);
        }
        bulkPdf.save(`MTPL_Batch_Certificates_${new Date().getTime()}.pdf`);
      } else {
        const singlePdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        await processName(studentName, 0, singlePdf);
        singlePdf.save(`MTPL_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
      }

    } catch (error) {
      console.error('Batch Generation Error:', error);
      window.print();
    } finally {
      setIsGenerating(false);
      setBatchProgress(0);
    }
  };

  const certificateProps = {
    collegeName,
    mode,
    refNo,
    currentDate,
    titleText,
    durationText,
    domain,
    startDate,
    endDate,
    curriculum,
    setStudentName,
    setCollegeName,
    setRefNo,
    setCurrentDate,
    setTitleText,
    setDurationText,
    setDomain,
    setStartDate,
    setEndDate,
    addCurriculumItem,
    removeCurriculumItem,
    updateCurriculumItem
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Controls Panel */}
      <section className="no-print bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
            
            <div className="space-y-3">
              <h1 className="text-xl font-black tracking-tighter text-blue-400 flex items-center gap-2">
                <Award /> Manexra Pro v2
              </h1>
              <div className="flex flex-wrap gap-2 bg-slate-800/50 p-1 rounded-xl">
                {['INTERNSHIP', 'COURSE', 'SCHOOL', 'LANGUAGE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMode(type as CertificateMode)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      mode === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(
                  mode === 'INTERNSHIP' ? INTERNSHIP_PRESETS : 
                  mode === 'COURSE' ? COURSE_PRESETS : 
                  mode === 'SCHOOL' ? SCHOOL_PRESETS : LANGUAGE_PRESETS
                ).map((k) => (
                  <button
                    key={k}
                    onClick={() => handleUpdatePreset(isNaN(Number(k)) ? k : Number(k))}
                    className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase transition-all ${
                      selectedKey === (isNaN(Number(k)) ? k : Number(k)) 
                        ? 'bg-amber-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {k === "12" ? '1Y' : k === "9" ? '9M' : k === "11" ? '12th' : k === "8" ? '8th' : k}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Batch PDF Generator</span>
                {batchInput && (
                  <button 
                    onClick={() => setBatchInput("")}
                    className="text-[9px] text-rose-500 hover:text-rose-400 font-black uppercase tracking-tighter transition-colors"
                  >
                    Clear List
                  </button>
                )}
              </div>
              <textarea 
                placeholder="Paste names (a, b, c or multi-line)..."
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="bg-slate-800/80 border border-white/5 rounded-xl text-[11px] px-4 py-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-3 justify-end">
              <div className="flex gap-3">
                <button 
                  onClick={generateRandomData}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xl active:scale-95 shrink-0"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-xl shadow-emerald-900/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {batchTotal > 1 ? `${batchProgress}/${batchTotal}` : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Printer size={18} />
                      {batchInput.split(/[\n,]+/).filter(n => n.trim() !== "").length > 0 
                        ? 'Generate Batch PDF' 
                        : 'Generate A4 PDF'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] flex items-center justify-center gap-6 text-slate-500 border-t border-white/5 pt-4">
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Click any text to modify</span>
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Use presets for quick setup</span>
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Add/Remove items in curriculum list</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mt-8 px-4 no-print flex flex-col items-center">
        <Certificate name={studentName} {...certificateProps} sharedRef={certificateRef} />
      </main>

      {/* Hidden Capture Element for PDF Generation (Guarantees 1:1 scale and high quality) */}
      <div 
        className="fixed top-0 left-0 pointer-events-none overflow-hidden h-0 w-0 z-[-1]"
        aria-hidden="true"
      >
        <div className="bg-white" style={{ width: '210mm', height: '297mm' }}>
          <Certificate name={studentName} isPrint {...certificateProps} sharedRef={captureRef} />
        </div>
      </div>

      {/* Print View - Handled by @media print in index.css */}
      <div className="hidden print:block">
        <Certificate name={studentName} isPrint {...certificateProps} />
      </div>
      
      <style>{`
        .shadow-3xl {
            box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.1), 0 30px 60px -30px rgba(0, 0, 0, 0.15);
        }
        .editable-input-free {
            outline: none;
            border-bottom: 1px dashed transparent;
            transition: all 0.2s;
        }
        .editable-input-free:hover {
            border-bottom-color: #cbd5e1;
            background: rgba(241, 245, 249, 0.5);
        }
        .editable-input-free:focus {
            background: white !important;
            border-bottom-color: #2563eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
