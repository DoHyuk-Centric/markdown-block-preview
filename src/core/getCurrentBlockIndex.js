import { splitMarkdownBlocks } from "./splitMarkdownBlocks.js";

export function getCurrentBlockIndex(markdown, cursorIndex) {
  const blocks = splitMarkdownBlocks(markdown);

  let searchStart = 0;

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const start = markdown.indexOf(block, searchStart);
    const end = start + block.length;

    if (cursorIndex >= start && cursorIndex <= end) {
      return i;
    }

    searchStart = end;
  }

  return blocks.length - 1;
}
