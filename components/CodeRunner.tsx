import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import Webcam from "react-webcam";
import { Conversation } from "./Conversation";

declare global {
  interface Window {
    loadPyodide: ((config: { indexURL: string }) => Promise<any>) | undefined;
    pyodide: any;
  }
}

const CodeRunner: React.FC<{ language: string; initialCode: string }> = ({
  language,
  initialCode,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>("");
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const editorRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0); // Timer state
  const [question, setQuestion] = useState<string | null>(null);

  useEffect(() => {
    let pyodideScript: HTMLScriptElement | null = null;

    async function loadPyodideScript() {
      if (document.querySelector('script[src*="pyodide.js"]')) {
        await initializePyodide();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
      script.async = true;

      script.onload = async () => {
        await initializePyodide();
      };

      script.onerror = () => {
        setOutput(
          "Failed to load Pyodide script. Please check your internet connection."
        );
        setLoading(false);
      };

      document.body.appendChild(script);
      pyodideScript = script;
    }

    async function initializePyodide() {
      try {
        if (!window.loadPyodide) {
          throw new Error("Pyodide not loaded properly");
        }

        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        });

        await pyodide.runPythonAsync(`
          import sys
          from io import StringIO
          
          class CaptureOutput:
              def __init__(self):
                  self.stdout = StringIO()
                  self.stderr = StringIO()
              
              def write(self, text):
                  self.stdout.write(text)
              
              def flush(self):
                  pass
          
          sys.stdout = CaptureOutput()
          sys.stderr = sys.stdout
        `);

        window.pyodide = pyodide;
        setPyodideReady(true);
        setLoading(false);
      } catch (error) {
        console.error("Pyodide initialization error:", error);
        setOutput(`Failed to initialize Pyodide: ${error}`);
        setLoading(false);
      }
    }

    loadPyodideScript();

    return () => {
      if (pyodideScript) {
        document.body.removeChild(pyodideScript);
      }
    };
  }, []);

interface ConversationObject {
    setQuestion: React.Dispatch<React.SetStateAction<string | null>>;
    code: string;
}

const createConversationObject = (
    setQuestion: React.Dispatch<React.SetStateAction<string | null>>,
    code: string
): ConversationObject => {
    return {
        setQuestion: setQuestion,
        code: code,
    };
};

  let codeToRun : string = "hasnt been updated yetttt";
  let conversation = createConversationObject(setQuestion, codeToRun);
  const runCode = async () => {
    console.log("RUN CODE HAS BEEN CALLED")
    if (!pyodideReady) {
      setOutput("Python environment is still loading... Please wait.");
      return;
    }
    // def twoSum(nums, target):
    //     for i in range(len(nums)):
    //         for j in range(i + 1, len(nums)):
    //             if nums[j] == target - nums[i]:
    //                 return [i, j]
    //     return []
    setOutput("Running...");
    codeToRun = editorRef.current?.getValue() || code;
    //const codeToRun = editorRef.current?.getValue() || code;
    console.log("from coderunner",codeToRun);


    // interface ConversationObject {
    //     setQuestion: React.Dispatch<React.SetStateAction<string | null>>;
    //     code: string;
    // }

    // const createConversationObject = (
    //     setQuestion: React.Dispatch<React.SetStateAction<string | null>>,
    //     code: string
    // ): ConversationObject => {
    //     return {
    //         setQuestion: setQuestion,
    //         code: code,
    //     };
    // };

    conversation = createConversationObject(setQuestion, codeToRun);
    console.log('technically in conversation...', conversation.code);
    // conversationProperties = {
    //     setQuestion: setQuestion,
    //     code: codeToRun,
    // };
    try {
      await window.pyodide.runPythonAsync(`
        sys.stdout.stdout.truncate(0)
        sys.stdout.stdout.seek(0)
      `);

      const result = await window.pyodide.runPythonAsync(codeToRun);

      const stdout = await window.pyodide.runPythonAsync(`
        output = sys.stdout.stdout.getvalue()
        sys.stdout.stdout.truncate(0)
        sys.stdout.stdout.seek(0)
        output
      `);

      let finalOutput = stdout || "";
      if (result !== undefined && result !== null) {
        finalOutput += (finalOutput ? "\n" : "") + String(result);
      }

      setOutput(finalOutput || "Code executed successfully (no output)");
    } catch (error) {
      setOutput(`Python Error: ${error.message || error}`);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimer(0); // Reset timer when recording starts
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log("Recording stopped");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1); // Increase timer every second
      }, 1000);
    } else {
      clearInterval(interval); // Stop timer when recording is off
    }

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [isRecording]);

  codeToRun = editorRef.current?.getValue() || code;
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Panel - Interview Question */}
      <div className="w-full md:w-1/2 p-6 bg-[#1D2B3A] text-white overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {"Mock Interview Environment"}
        </h2>
        <p className="text-sm text-gray-300 mb-6">
          You will be given 45 minutes to complete the technical coding question.
        </p>
        <div className="bg-[#2D3B4A] rounded-lg p-6">
          {question ?? (
            <>
              <h3 className="text-lg font-medium mb-3">Tips for answering:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Be professional and respectful in your response</li>
                <li>• Focus on relevant experience and qualifications</li>
                <li>• Structure your answer clearly and concisely</li>
                <li>• Provide specific examples to support your points</li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-full md:w-1/2 flex flex-col bg-[#1E1E1E] relative">
        {" "}
        {/* Added `relative` for positioning */}
        <div className="flex-1 p-6">
          <Editor
            height="50vh"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={(value: string | undefined) => setCode(value || "")}
            onMount={(editor: any) => {
              editorRef.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={runCode}
              disabled={loading || !pyodideReady}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? "Loading Python..." : "Run Code"}
              <Conversation setQuestion={conversation.setQuestion} code={codeToRun} />
            </button>
          </div>

          <pre className="mt-4 p-4 bg-[#2D2D2D] text-white rounded-md font-mono text-sm h-[20vh] overflow-y-auto">
            {output || "Output will appear here..."}
          </pre>
        </div>
        {/* Webcam in Bottom Right */}
        <Webcam
          mirrored
          audio
          muted
          ref={webcamRef}
          videoConstraints={{ facingMode: "user" }}
          onUserMedia={() => console.log("Webcam ready")}
          className="absolute bottom-5 right-5 z-50 w-[150px] h-[150px] object-cover"
        />
        {/* Timer Above the Button */}
        <div className="absolute bottom-20 right-5 z-50 text-white flex flex-col items-center">
          <div className="mb-2 text-sm">{`Timer: ${timer}s`}</div>

          {/* Record Button as a Red Dot
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700"
          /> */}
        </div>
      </div>
      
    </div>
  );
};

export default CodeRunner;
