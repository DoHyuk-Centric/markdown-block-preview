export function createBlockElement(blockMarkdown, marked) {
  const blockEl = document.createElement("div");
  blockEl.className = "preview-block";
  blockEl.innerHTML = marked.parse(blockMarkdown);
  return blockEl;
}
