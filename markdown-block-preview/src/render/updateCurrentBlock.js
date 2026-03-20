export function updateCurrentBlock({
  blockIndex,
  nextBlocks,
  prevBlocks,
  preview,
  marked,
}) {
  const nextBlock = nextBlocks[blockIndex];
  const prevBlock = prevBlocks[blockIndex];

  if (nextBlock == null) return;
  if (nextBlock === prevBlock) return;

  const blockEl = preview.children[blockIndex];

  if (blockEl) {
    blockEl.innerHTML = marked.parse(nextBlock);
  }
}
