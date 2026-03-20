import { isAppendOnly } from "./isAppendOnly.js";
import { createBlockElement } from "../render/createBlockElement.js";

export function syncBlockStructure({ nextBlocks, prevBlocks, preview, marked }) {
  if (nextBlocks.length === prevBlocks.length) {
    return {
      structureChanged: false,
      prevBlocks,
    };
  }

  if (isAppendOnly(prevBlocks, nextBlocks)) {
    const newBlock = nextBlocks[nextBlocks.length - 1];
    preview.appendChild(createBlockElement(newBlock, marked));

    return {
      structureChanged: true,
      prevBlocks: nextBlocks,
    };
  }

  const fragment = document.createDocumentFragment();

  nextBlocks.forEach((block) => {
    fragment.appendChild(createBlockElement(block, marked));
  });

  preview.innerHTML = "";
  preview.appendChild(fragment);

  return {
    structureChanged: true,
    prevBlocks: nextBlocks,
  };
}
