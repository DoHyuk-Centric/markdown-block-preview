import { JSDOM } from "jsdom";

/**
 * src/ 는 document, HTMLElement 등 브라우저 전역에 의존한다.
 * Node에서 실행하려면 import 전에 전역을 채워야 한다.
 */
export function setupDom(initialMarkdown = "") {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>
       <textarea id="content"></textarea>
       <div id="preview"></div>
     </body></html>`,
  );

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;

  const textarea = dom.window.document.getElementById("content");
  const preview = dom.window.document.getElementById("preview");
  textarea.value = initialMarkdown;

  return { dom, textarea, preview };
}

export function type(dom, textarea, value) {
  textarea.value = value;
  textarea.dispatchEvent(new dom.window.Event("input"));
}
