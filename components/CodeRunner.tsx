import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";

declare global {
  interface Window {
    loadPyodide: ((config: { indexURL: string }) => Promise<any>) | undefined;
    pyodide: any;
  }
}

const CodeRunner: React.FC<{ language: string; initialCode: string }> = ({ 
  language, 
  initialCode 
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    let pyodideScript: HTMLScriptElement | null = null;

    async function loadPyodideScript() {
      if (document.querySelector('script[src*="pyodide.js"]')) {
        await initializePyodide();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.async = true;
      
      script.onload = async () => {
        await initializePyodide();
      };
      
      script.onerror = () => {
        setOutput('Failed to load Pyodide script. Please check your internet connection.');
        setLoading(false);
      };

      document.body.appendChild(script);
      pyodideScript = script;
    }

    async function initializePyodide() {
      try {
        if (!window.loadPyodide) {
          throw new Error('Pyodide not loaded properly');
        }

        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
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

  const runCode = async () => {
    if (!pyodideReady) {
      setOutput("Python environment is still loading... Please wait.");
      return;
    }

    setOutput('Running...');
    const codeToRun = editorRef.current?.getValue() || code;

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

      let finalOutput = stdout || '';
      if (result !== undefined && result !== null) {
        finalOutput += (finalOutput ? '\n' : '') + String(result);
      }

      setOutput(finalOutput || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Python Error: ${error.message || error}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Panel - Interview Question */}
      <div className="w-full md:w-1/2 p-6 bg-[#1D2B3A] text-white overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          What is a your mom?
        </h2>
        <p className="text-sm text-gray-300 mb-6">
          Asked by top companies like Google, Facebook and more
        </p>
        <div className="bg-[#2D3B4A] rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3">Tips for answering:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Be professional and respectful in your response</li>
            <li>• Focus on relevant experience and qualifications</li>
            <li>• Structure your answer clearly and concisely</li>
            <li>• Provide specific examples to support your points</li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-full md:w-1/2 flex flex-col bg-[#1E1E1E]">
        <div className="flex-1 p-6">
          <Editor
            height="50vh"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={(value: string | undefined) => setCode(value || '')}
            onMount={(editor: any) => { editorRef.current = editor; }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
          <div className="mt-4">
            <button
              onClick={runCode}
              disabled={loading || !pyodideReady}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading Python...' : 'Run Code'}
            </button>
          </div>
          <pre className="mt-4 p-4 bg-[#2D2D2D] text-white rounded-md font-mono text-sm h-[20vh] overflow-y-auto">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;