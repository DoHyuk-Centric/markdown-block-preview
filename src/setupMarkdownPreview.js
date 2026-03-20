import { Marked } from "marked";
import { splitMarkdownBlocks } from "./core/splitMarkdownBlocks.js";
import { syncBlockStructure } from "./core/syncBlockStructure.js";
import { initialRender } from "./render/initialRender.js";

export function setupMarkdownPreview({ textarea, preview, breaks = true }) {
  if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error("textarea는 HTMLTextAreaElement여야 합니다.");
  }

  if (!(preview instanceof HTMLElement)) {
    throw new Error("preview는 HTMLElement여야 합니다.");
  }

  const marked = new Marked({ breaks });

  let prevBlocks = [];

  function handleInput() {
    const markdown = textarea.value;
    const nextBlocks = splitMarkdownBlocks(markdown);

    const result = syncBlockStructure({
      nextBlocks,
      prevBlocks,
      preview,
      marked,
    });

    if (result.structureChanged) {
      prevBlocks = result.prevBlocks;
      return;
    }

    for (let i = 0; i < nextBlocks.length; i++) {
      if (nextBlocks[i] !== prevBlocks[i]) {
        const blockEl = preview.children[i];
        if (blockEl) {
          blockEl.innerHTML = marked.parse(nextBlocks[i]);
        }
      }
    }

    prevBlocks = [...nextBlocks];
  }

  prevBlocks = initialRender({
    markdown: textarea.value,
    preview,
    marked,
  });

  textarea.addEventListener("input", handleInput);

  return {
    destroy() {
      textarea.removeEventListener("input", handleInput);
    },
    rerender() {
      prevBlocks = initialRender({
        markdown: textarea.value,
        preview,
        marked,
      });
    },
  };
}
