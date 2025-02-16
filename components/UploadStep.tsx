import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

const UploadStep = ({ onNextStep }: { onNextStep: (resumeFile: File, jdFile: File) => void }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [draggingResume, setDraggingResume] = useState(false);
  const [draggingJD, setDraggingJD] = useState(false);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
    }
  };

  const handleJDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setJobDescription(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: 'resume' | 'jd') => {
    e.preventDefault();
    if (type === 'resume') setDraggingResume(true);
    else setDraggingJD(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, type: 'resume' | 'jd') => {
    e.preventDefault();
    if (type === 'resume') setDraggingResume(false);
    else setDraggingJD(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'resume' | 'jd') => {
    e.preventDefault();
    setDraggingResume(false);
    setDraggingJD(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (type === 'resume') setResume(file);
      else setJobDescription(file);
    }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      key="step-0"
      transition={{
        duration: 0.95,
        ease: [0.165, 0.84, 0.44, 1],
      }}
      className="max-w-lg mx-auto px-4 lg:px-0"
    >
      <h2 className="text-4xl font-bold text-[#1E2B3A]">
        Let's prep for your interview
      </h2>
      <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4">
        Upload your resume and the job description to help us tailor the interview preparation to your specific needs.
      </p>

      <div className="space-y-4 mt-8">
        {/* Resume Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            draggingResume ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => handleDragOver(e, 'resume')}
          onDragLeave={(e) => handleDragLeave(e, 'resume')}
          onDrop={(e) => handleDrop(e, 'resume')}
        >
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
          <label htmlFor="resume" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">
              {resume ? resume.name : 'Upload your resume'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drop your PDF file here or click to browse
            </p>
          </label>
        </div>

        {/* Job Description Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            draggingJD ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => handleDragOver(e, 'jd')}
          onDragLeave={(e) => handleDragLeave(e, 'jd')}
          onDrop={(e) => handleDrop(e, 'jd')}
        >
          <input
            type="file"
            id="jobDescription"
            accept=".pdf"
            onChange={handleJDUpload}
            className="hidden"
          />
          <label htmlFor="jobDescription" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">
              {jobDescription ? jobDescription.name : 'Upload job description'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drop your PDF file here or click to browse
            </p>
          </label>
        </div>
      </div>

      <div className="flex gap-[15px] justify-end mt-8">
        <button
          onClick={() => {
            if (resume && jobDescription) {
              onNextStep(resume, jobDescription);
            }
          }}
          disabled={!resume || !jobDescription}
          className={`group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white no-underline flex gap-x-2  active:scale-95 scale-100 duration-75 ${
            !resume || !jobDescription 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247]'
          }`}
          style={{
            boxShadow:
              "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <span> Continue </span>
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.75 6.75L19.25 12L13.75 17.25"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 12H4.75"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default UploadStep;