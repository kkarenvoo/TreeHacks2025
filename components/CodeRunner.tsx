import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";

declare global {
  interface Window {
    loadPyodide: ((config: { indexURL: string }) => Promise<any>) | undefined;
    pyodide: any;
  }
}

const CodeRunner: React.FC<{ language: string; initialCode: string }> = ({ language, initialCode }) => {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    async function loadPyodideScript() {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js';
        script.async = true;
        script.onload = initializePyodide;
        document.body.appendChild(script);
      } else {
        await initializePyodide();
      }
    }

    async function initializePyodide() {
      while (!window.loadPyodide) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      try {
        const pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/" });
        window.pyodide = pyodide;
        setPyodideReady(true);
        console.log("Pyodide loaded successfully!");
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setOutput(`Failed to load Pyodide. Error: ${error}`);
      }
    }

    loadPyodideScript();
  }, []);

  const runCode = async () => {
    setOutput('');
    if (language === "python") {
      if (!pyodideReady) {
        setOutput("Loading Python environment... Please wait.");
        return;
      }
      try {
        const result = await window.pyodide.runPythonAsync(editorRef.current.getValue());
        setOutput(result);
      } catch (error) {
        setOutput(`Python Error: ${error}`);
      }
    } else if (language === "javascript") {
      try {
        setOutput(`JavaScript Output:\n${eval(editorRef.current.getValue())}`);
      } catch (error) {
        setOutput(`JavaScript Error: ${error}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Instructions Panel */}
      <div style={{ width: '30%', padding: '20px', backgroundColor: '#000', color: 'white', fontSize: '1.2em', overflowY: 'auto' }}>
        <h2>Instructions</h2>
        <p>Fill in this section with task-specific instructions.</p>
      </div>

      {/* Code Editor and Output Panel */}
      <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <Editor
          height="50vh"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value: string | undefined) => setCode(value || '')}
          onMount={(editor: any) => { editorRef.current = editor; }}
        />
        <button onClick={runCode} style={{ marginTop: '10px', padding: '10px', alignSelf: 'flex-start' }}>Run Code</button>
        <pre style={{ marginTop: '10px', padding: '10px', backgroundColor: '#222', color: 'white', borderRadius: '5px', minHeight: '100px' }}>
          {output}
        </pre>
      </div>
    </div>
  );
};

export default CodeRunner;