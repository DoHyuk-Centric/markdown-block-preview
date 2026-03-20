import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { splitMarkdownBlocks } from "./core/splitMarkdownBlocks.js";
import { getCurrentBlockIndex } from "./core/getCurrentBlockIndex.js";
import { syncBlockStructure } from "./core/syncBlockStructure.js";
import { initialRender } from "./render/initialRender.js";
import { updateCurrentBlock } from "./render/updateCurrentBlock.js";

export function setupMarkdownPreview({ textarea, preview, breaks = true }) {
  if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error("textarea는 HTMLTextAreaElement여야 합니다.");
  }

  if (!(preview instanceof HTMLElement)) {
    throw new Error("preview는 HTMLElement여야 합니다.");
  }

  marked.setOptions({ breaks });

  let prevBlocks = [];

  function handleInput() {
    const markdown = textarea.value;
    const cursorIndex = textarea.selectionStart;
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

    const currentBlockIndex = getCurrentBlockIndex(markdown, cursorIndex);

    updateCurrentBlock({
      blockIndex: currentBlockIndex,
      nextBlocks,
      prevBlocks,
      preview,
      marked,
    });

    prevBlocks[currentBlockIndex] = nextBlocks[currentBlockIndex];
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
