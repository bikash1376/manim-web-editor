/**
 * autocomplete.ts
 *
 * Provides intelligent autocompletion for manim-web exports inside the
 * CodeMirror editor. Dynamically reads all named exports from the manim-web
 * library at build time and exposes them as completion suggestions.
 */

import { CompletionContext } from "@codemirror/autocomplete";
import type { Completion } from "@codemirror/autocomplete";
import * as manim from 'manim-web';

// Collect all named exports from manim-web, excluding the default export
const MANIM_EXPORTS = Object.keys(manim).filter(key => key !== 'default');

/**
 * Build the completion list from manim-web exports.
 * Each export gets a "function" type and links to the API reference.
 */
const manimCompletions: Completion[] = MANIM_EXPORTS.map(key => ({
    label: key,
    type: "function",
    info: `manim-web API Reference: https://maloyan.github.io/manim-web/api`
}));

// Add the globally available 'scene' variable that the sandbox injects
manimCompletions.push({
    label: "scene",
    type: "variable",
    info: "The global Scene instance for rendering animations."
});

// Add the 'interactiveScene' variable for interactive sequence-based usage
manimCompletions.push({
    label: "interactiveScene",
    type: "variable",
    info: "The global InteractiveScene instance for creating interactive sequences (optional alternative to scene)."
});

/**
 * CodeMirror autocomplete provider function.
 * Matches the current word being typed and returns relevant manim-web completions.
 *
 * @param context - The CodeMirror CompletionContext providing cursor position and text
 * @returns Completion result with matching options, or null if no word is being typed
 */
export function manimAutocomplete(context: CompletionContext) {
    // Match the word currently being typed (any word characters)
    let word = context.matchBefore(/\w*/);

    // Don't show completions if there's no word and user didn't explicitly trigger it
    if (!word || (word.from === word.to && !context.explicit))
        return null;

    return {
        from: word.from,
        options: manimCompletions
    };
}
