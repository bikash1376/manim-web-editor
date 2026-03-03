import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { manimAutocomplete } from './autocomplete';

const manimGlobalsCompletion = javascriptLanguage.data.of({
  autocomplete: manimAutocomplete
});
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Scene } from 'manim-web';
import * as manim from 'manim-web';

import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { DarkTheme, LightTheme, BaseProvider } from 'baseui';
import { Button, KIND, SHAPE } from 'baseui/button';
import { Select } from 'baseui/select';
import { FaPlay, FaMoon, FaSun, FaGithub, FaBook } from 'react-icons/fa';

import { EXAMPLES } from './examples/examples';
import './App.css';

const DEFAULT_CODE = `// Welcome to the Manim-Web Editor!
// The "scene" object and all Manim exports are available globally.

const square = new Square({ sideLength: 3, color: BLUE });
const circle = new Circle({ radius: 1.5, color: RED });

// Animations are awaited
await scene.play(new Create(square));
await scene.play(new Indicate(square));
await scene.play(new Transform(square, circle));
await scene.play(new FadeOut(square));

// Always a good idea to render the final frame
scene.render();
`;

const MANIM_EXPORTS = Object.keys(manim).filter(key => key !== 'default' && key !== 'Player'); // Remove Player if it somehow got in to prevent duplicates
// Alias 'Player' to 'InteractiveScene' for users returning from old docs without needing imports
const aliasedExports = [...MANIM_EXPORTS, 'Player'];
const MANIM_VALUES = [...MANIM_EXPORTS.map(key => (manim as any)[key]), (manim as any).InteractiveScene || (manim as any).Scene];

const engine = new Styletron();

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDark]);

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={isDark ? DarkTheme : LightTheme}>
        <Main isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      </BaseProvider>
    </StyletronProvider>
  );
}

function Main({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [runCode, setRunCode] = useState(DEFAULT_CODE); // holds code to be executed
  const [compileTrigger, setCompileTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Example Selection state
  const [selectedExample, setSelectedExample] = useState<any[]>([]);

  // Font Size for editor zoom
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY > 0) {
          setFontSize(f => Math.max(8, f - 1));
        } else {
          setFontSize(f => Math.min(48, f + 1));
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleRun = () => {
    setError(null);
    if (runCode === code) {
      // If code is the same, re-trigger execution to replay
      setCompileTrigger(prev => prev + 1);
    } else {
      setRunCode(code);
      setCompileTrigger(prev => prev + 1);
    }
  };

  const handleExampleSelect = (params: any) => {
    setSelectedExample(params.value);
    if (params.value.length > 0) {
      if (params.value[0].id === '__blank__') {
        setCode('// Start writing your manim-web code here...\n');
        setRunCode('');
        setCompileTrigger(prev => prev + 1);
        return;
      }
      const selected = EXAMPLES.find(e => e.name === params.value[0].id);
      if (selected) {
        setCode(selected.code);
        // Clear the current running animation so it goes blank
        setRunCode('');
        setCompileTrigger(prev => prev + 1);
      }
    }
  };

  const exampleOptions = [
    { id: '__blank__', label: '✏️ Blank Editor' },
    ...EXAMPLES.map(ex => ({ id: ex.name, label: ex.name }))
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container" style={{ gap: '16px' }}>
          <span className="app-title" style={{ fontFamily: 'monospace', fontSize: '18px' }}>manim-web-editor</span>
          <a href="https://github.com/maloyan/manim-web" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <FaGithub size={16} /> GitHub
          </a>
          <a href="https://maloyan.github.io/manim-web/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <FaBook size={16} /> Docs
          </a>
        </div>
        <div className="controls">
          <div style={{ width: '250px' }}>
            <Select
              options={exampleOptions}
              value={selectedExample}
              placeholder="Load Example"
              onChange={handleExampleSelect}
              clearable={false}
              searchable={false}
              overrides={{
                Dropdown: {
                  style: { zIndex: 200 }
                },
                Popover: {
                  props: {
                    overrides: {
                      Body: {
                        style: { zIndex: 200 }
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <Button
            onClick={handleRun}
            startEnhancer={<FaPlay />}
            overrides={{
              BaseButton: {
                style: {
                  backgroundColor: '#fff',
                  color: '#000',
                  ':hover': { backgroundColor: '#e2e2e2' },
                }
              }
            }}
          >
            Play Animation
          </Button>
          <Button
            onClick={toggleTheme}
            kind={KIND.secondary}
            shape={SHAPE.circle}
            overrides={{
              BaseButton: {
                style: { backgroundColor: 'transparent', color: 'var(--text-main)' }
              }
            }}
          >
            {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
          </Button>
        </div>
      </header>

      <div className="split-pane">
        <div className="editor-pane">
          <div className="pane-header">Code Editor</div>
          <div className="editor-wrapper" ref={editorRef}>
            <CodeMirror
              style={{ fontSize: `${fontSize}px` }}
              value={code}
              height="100%"
              extensions={[
                javascript({ jsx: true, typescript: true }),
                manimGlobalsCompletion
              ]}
              theme={isDark ? vscodeDark : 'light'}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
              }}
            />
          </div>
        </div>

        <div className="preview-pane">
          <div className="pane-header">Preview Output</div>
          <div className="preview-container">
            {error && (
              <div className="error-overlay">
                <div className="error-header">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Error occurred during compilation/execution
                </div>
                {error}
              </div>
            )}

            <ManimPreview
              key={compileTrigger}
              code={runCode}
              onError={(err) => setError(err.message || String(err))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ManimPreview({
  code,
  onError
}: {
  code: string,
  onError: (error: any) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container if no code to run
    if (!code.trim()) {
      containerRef.current.innerHTML = '';
      return;
    }

    let userFunc: Function;
    try {
      // Strip import statements from manim-web so users can paste code from docs
      let processedCode = code.replace(/import\s+\{[^}]*\}\s+from\s+['"]manim-web['"];?\s*/g, '');
      // Convert 'const/let/var scene =' to 'scene =' so it reassigns the parameter
      // instead of redeclaring it (which causes SyntaxError)
      processedCode = processedCode.replace(/(?:const|let|var)\s+scene\s*=/g, 'scene =');

      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      userFunc = new AsyncFunction('scene', ...aliasedExports, processedCode);
    } catch (err: any) {
      onError(new Error(`Compilation Error: ${err.message}`));
      return;
    }

    let scene: any = null;
    const isCustomContext = code.includes('new InteractiveScene(') || code.includes('new Scene(') || code.includes('new ZoomedScene(') || code.includes('new ThreeDScene(');

    if (!isCustomContext) {
      scene = new Scene(containerRef.current, {
        width: 800,
        height: 450,
        backgroundColor: '#000000'
      });
    }

    const runScript = async () => {
      try {
        await userFunc(scene, ...MANIM_VALUES);
      } catch (err: any) {
        onError(new Error(`Runtime Error: ${err.message}`));
      }
    };

    runScript();

    return () => {
      if (scene && scene.dispose) scene.dispose();
      // Since users might create their own Player/Scene on #container, empty it fully
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [code, onError]);

  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }} />;
}