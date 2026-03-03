/**
 * App.tsx
 *
 * Main application component for the Manim-Web Editor.
 * Provides a split-pane layout with a CodeMirror code editor on the left
 * and a live animation preview on the right. Users can write manim-web code,
 * load built-in examples, toggle dark/light themes, and zoom the editor.
 */

import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { manimAutocomplete } from './autocomplete';

/**
 * Register the manim-web autocomplete provider with CodeMirror's JavaScript language.
 * This allows manim-web exports to appear as suggestions while the user types.
 */
const manimGlobalsCompletion = javascriptLanguage.data.of({
  autocomplete: manimAutocomplete
});

import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Scene } from 'manim-web';
import * as manim from 'manim-web';

// UI framework imports (Base Web + Styletron for theming)
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { DarkTheme, LightTheme, BaseProvider } from 'baseui';
import { Button, KIND, SHAPE } from 'baseui/button';
import { Select } from 'baseui/select';

// Icons used throughout the UI
import { FaPlay, FaMoon, FaSun, FaGithub, FaBook, FaEdit } from 'react-icons/fa';

import { EXAMPLES } from './examples/examples';
import './App.css';

/**
 * Default code shown in the editor on initial load.
 * Demonstrates basic shape creation, animation, and rendering.
 */
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

/**
 * Collect all named exports from the manim-web library (excluding 'default' and 'Player').
 * These are injected as parameters into the user's code sandbox so they can be
 * referenced without import statements (e.g. `new Circle(...)` just works).
 */
const MANIM_EXPORTS = Object.keys(manim).filter(key => key !== 'default' && key !== 'Player');

/**
 * Alias 'Player' to 'InteractiveScene' for backward compatibility.
 * Some older docs reference a `Player` class that maps to `InteractiveScene`.
 */
const aliasedExports = [...MANIM_EXPORTS, 'Player'];
const MANIM_VALUES = [...MANIM_EXPORTS.map(key => (manim as any)[key]), (manim as any).InteractiveScene || (manim as any).Scene];

/** Styletron CSS-in-JS engine instance for Base Web UI components */
const engine = new Styletron();

/**
 * Root App component.
 * Manages the dark/light theme state and wraps everything in Styletron + BaseUI providers.
 */
export default function App() {
  const [isDark, setIsDark] = useState(true);

  // Sync the theme state with the document body class for CSS variable switching
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

/**
 * Main layout component.
 * Contains the header (logo, links, example selector, play button, theme toggle)
 * and the split-pane editor/preview layout.
 */
function Main({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [runCode, setRunCode] = useState(DEFAULT_CODE); // The code snapshot sent to ManimPreview
  const [compileTrigger, setCompileTrigger] = useState(0); // Incremented to force re-execution
  const [error, setError] = useState<string | null>(null);

  // Currently selected example in the dropdown
  const [selectedExample, setSelectedExample] = useState<any[]>([]);

  // Editor font size (adjusted by Ctrl/Cmd + scroll wheel)
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * Attach a wheel event listener to the editor wrapper for zoom functionality.
   * Ctrl/Cmd + scroll up = increase font size, scroll down = decrease.
   * Font size is clamped between 8px and 48px.
   */
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

  /**
   * Handle the "Play Animation" button click.
   * If the code hasn't changed since the last run, increment the trigger to
   * force a re-render/re-execution. Otherwise, update the run code snapshot.
   */
  const handleRun = () => {
    setError(null);
    if (runCode === code) {
      setCompileTrigger(prev => prev + 1);
    } else {
      setRunCode(code);
      setCompileTrigger(prev => prev + 1);
    }
  };

  /**
   * Handle example selection from the dropdown.
   * If "Blank Editor" is selected, reset to a clean state.
   * Otherwise, load the selected example's code into the editor.
   */
  const handleExampleSelect = (params: any) => {
    setSelectedExample(params.value);
    if (params.value.length > 0) {
      // Handle the special "Blank Editor" option
      if (params.value[0].id === '__blank__') {
        setCode('// Start writing your manim-web code here...\n');
        setRunCode('');
        setCompileTrigger(prev => prev + 1);
        return;
      }
      const selected = EXAMPLES.find(e => e.name === params.value[0].id);
      if (selected) {
        setCode(selected.code);
        // Clear the preview so previous animations don't persist
        setRunCode('');
        setCompileTrigger(prev => prev + 1);
      }
    }
  };

  /**
   * Dropdown options list.
   * Starts with a "Blank Editor" option, followed by all pre-built examples.
   */
  const exampleOptions = [
    { id: '__blank__', label: 'Blank Editor' },
    ...EXAMPLES.map(ex => ({ id: ex.name, label: ex.name }))
  ];

  return (
    <div className="app-container">
      {/* ===== HEADER BAR ===== */}
      <header className="app-header">
        {/* Logo and navigation links */}
        <div className="logo-container" style={{ gap: '16px' }}>
          <span className="app-title" style={{ fontFamily: 'monospace', fontSize: '18px' }}>manim-web-editor</span>
          <a href="https://github.com/maloyan/manim-web" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <FaGithub size={16} /> GitHub
          </a>
          <a href="https://maloyan.github.io/manim-web/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <FaBook size={16} /> Docs
          </a>
        </div>

        {/* Controls: example selector, play button, theme toggle */}
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

          {/* Play Animation button */}
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

          {/* Dark/Light mode toggle */}
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

      {/* ===== SPLIT PANE: Editor + Preview ===== */}
      <div className="split-pane">
        {/* Left pane: CodeMirror code editor */}
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

        {/* Right pane: Animation preview output */}
        <div className="preview-pane">
          <div className="pane-header">Preview Output</div>
          <div className="preview-container">
            {/* Error overlay — displayed above the canvas when compilation/runtime errors occur */}
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

            {/* ManimPreview handles code execution and canvas rendering */}
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

/**
 * ManimPreview component.
 *
 * Takes user code as a string, compiles it into an async function, and executes
 * it within a sandboxed context where all manim-web exports are available as
 * local variables. The animation output is rendered into a container div.
 *
 * Key behaviors:
 * - Strips `import { ... } from 'manim-web'` so users can paste doc code directly
 * - Converts `const scene =` to `scene =` to avoid redeclaring the injected parameter
 * - Detects custom scene types (ZoomedScene, ThreeDScene, etc.) and skips default Scene creation
 * - Handles cleanup on unmount by disposing scenes and clearing the container
 */
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

    // If there's no code to run, clear the container and exit early
    if (!code.trim()) {
      containerRef.current.innerHTML = '';
      return;
    }

    let userFunc: Function;
    try {
      // Strip `import { ... } from 'manim-web'` statements so users can paste
      // code directly from the docs without getting SyntaxError
      let processedCode = code.replace(/import\s+\{[^}]*\}\s+from\s+['"]manim-web['"];?\s*/g, '');

      // Convert 'const/let/var scene =' to 'scene =' (reassignment) so it doesn't
      // conflict with the 'scene' parameter injected by the AsyncFunction constructor
      processedCode = processedCode.replace(/(?:const|let|var)\s+scene\s*=/g, 'scene =');

      // Create an async function with 'scene' + all manim exports as named parameters.
      // This makes every manim-web export available as a local variable in the user's code.
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      userFunc = new AsyncFunction('scene', ...aliasedExports, processedCode);
    } catch (err: any) {
      onError(new Error(`Compilation Error: ${err.message}`));
      return;
    }

    // Determine if the user's code creates its own scene (custom context).
    // If so, we skip creating a default Scene to avoid conflicts.
    let scene: any = null;
    const isCustomContext = code.includes('new InteractiveScene(') || code.includes('new Scene(') || code.includes('new ZoomedScene(') || code.includes('new ThreeDScene(');

    if (!isCustomContext) {
      // Create a default Scene attached to the container for simple examples
      scene = new Scene(containerRef.current, {
        width: 800,
        height: 450,
        backgroundColor: '#000000'
      });
    }

    // Execute the user's code asynchronously, passing the scene and all manim exports
    const runScript = async () => {
      try {
        await userFunc(scene, ...MANIM_VALUES);
      } catch (err: any) {
        onError(new Error(`Runtime Error: ${err.message}`));
      }
    };

    runScript();

    // Cleanup: dispose the scene and clear the container when the component unmounts
    // or when new code is submitted
    return () => {
      if (scene && scene.dispose) scene.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [code, onError]);

  // The container div where manim-web renders its canvas.
  // Uses position:relative so ZoomedScene can position its zoomed display overlay.
  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }} />;
}