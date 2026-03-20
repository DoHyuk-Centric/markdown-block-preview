import { splitMarkdownBlocks } from "../core/splitMarkdownBlocks.js";
import { createBlockElement } from "./createBlockElement.js";

export function initialRender({ markdown, preview, marked }) {
  const blocks = splitMarkdownBlocks(markdown);
  const fragment = document.createDocumentFragment();

  blocks.forEach((block) => {
    fragment.appendChild(createBlockElement(block, marked));
  });

  preview.innerHTML = "";
  preview.appendChild(fragment);

  return blocks;
}
