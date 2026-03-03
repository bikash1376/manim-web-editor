import { CompletionContext } from "@codemirror/autocomplete";
import type { Completion } from "@codemirror/autocomplete";
import * as manim from 'manim-web';

const MANIM_EXPORTS = Object.keys(manim).filter(key => key !== 'default');

const manimCompletions: Completion[] = MANIM_EXPORTS.map(key => ({
    label: key,
    type: "function",
    info: `manim-web API Reference: https://maloyan.github.io/manim-web/api`
}));

manimCompletions.push({
    label: "scene",
    type: "variable",
    info: "The global Scene instance for rendering animations."
});

manimCompletions.push({
    label: "interactiveScene",
    type: "variable",
    info: "The global InteractiveScene instance for creating interactive sequences (optional alternative to scene)."
});

export function manimAutocomplete(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit))
        return null;
    return {
        from: word.from,
        options: manimCompletions
    };
}
