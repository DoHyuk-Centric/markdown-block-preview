export function isAppendOnly(prevBlocks, nextBlocks) {
  if (nextBlocks.length !== prevBlocks.length + 1) {
    return false;
  }

  for (let i = 0; i < prevBlocks.length; i += 1) {
    if (prevBlocks[i] !== nextBlocks[i]) {
      return false;
    }
  }

  return true;
}
