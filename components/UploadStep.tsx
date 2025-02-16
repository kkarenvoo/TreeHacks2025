import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Upload } from "lucide-react"; // Install npm install lucide-react
import Link from "next/link";

interface UploadStepProps {
  onNextStep: (resumeFile: File | null, jdText: string) => void;
}
  
const UploadStep: React.FC<UploadStepProps> = ({ onNextStep }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [draggingResume, setDraggingResume] = useState(false);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingResume(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingResume(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingResume(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
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
        Upload your resume and provide the job description so we can tailor your interview preparation.
      </p>

      <div className="space-y-4 mt-8">
        {/* Resume Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            draggingResume ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
              {resume ? resume.name : 'Upload your resume (Optional)'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drop your PDF file here or click to browse
            </p>
          </label>
        </div>

        {/* Job Description Textbox */}
        <div className="border-2 border-dashed rounded-lg p-4 text-center border-gray-300">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-900 mb-2">
            Enter Job Description (Optional)
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-[15px] justify-end mt-8">
        <div>
            <Link
            href="/"
            className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
            style={{
                boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
            }}
            >
            Back to home
            </Link>
        </div>
        <button
          onClick={() => {
            onNextStep(resume, jobDescription.trim());
          }}
          className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white no-underline flex gap-x-2 active:scale-95 scale-100 duration-75 hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247]"
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
