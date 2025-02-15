import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";

// Extend the Window interface to include loadPyodide and pyodide
declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
    pyodide: any;
  }
}

interface CodeRunnerProps {
  language: string;
  initialCode: string;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({ language, initialCode }) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    async function initializePyodide() {
      if (window.loadPyodide) {
        try {
          window.pyodide = await window.loadPyodide();
          setPyodideReady(true);
          console.log("Pyodide loaded!");
        } catch (error) {
          setOutput("Failed to load Pyodide. Please try again later.");
        }
      } else {
        setOutput("Pyodide is not available. Ensure the script is loaded.");
      }
    }
    initializePyodide();
  }, []);

  const runCode = async () => {
    setOutput(''); // Clear previous output

    if (language === "python") {
      if (!pyodideReady) {
        setOutput("Loading Python environment... Please wait.");
        return;
      }

      try {
        await window.pyodide.runPythonAsync(`
          import sys
          from js import document

          class StdoutCatcher:
              def write(self, text):
                  document.getElementById("output").innerHTML += text

          sys.stdout = StdoutCatcher()
          sys.stderr = StdoutCatcher()
        `);
        await window.pyodide.runPythonAsync(editorRef.current.getValue());
      } catch (error) {
        setOutput("Python Error: " + error);
      }
    } else if (language === "javascript") {
      try {
        // eslint-disable-next-line no-eval
        setOutput("JavaScript Output:\n" + eval(editorRef.current.getValue()));
      } catch (error) {
        setOutput("JavaScript Error: " + error);
      }
    } else if (language === "cpp") {
      setOutput("C++ functionality not implemented in this version");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Editor
        height="40vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || '')}
        onMount={(editor: any) => editorRef.current = editor}
      />
      <button onClick={runCode} style={{ marginTop: '10px', padding: '5px 10px' }}>Run Code</button>
      <pre id="output" style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        minHeight: '100px'
      }}>
        {output}
      </pre>
    </div>
  );
};

export default CodeRunner;