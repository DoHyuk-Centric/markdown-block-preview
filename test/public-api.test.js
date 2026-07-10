import { test } from "node:test";
import assert from "node:assert/strict";
import { setupDom, type } from "./dom.js";

import * as pkg from "../src/index.js";
import { setupMarkdownPreview, splitMarkdownBlocks } from "../src/index.js";

/**
 * 이 파일은 README에 문서화된 사용법이 실제로 동작하는지 검증한다.
 * README가 코드보다 앞서 나가면 CI가 깨진다.
 */

test("공개 export 목록이 README와 일치한다", () => {
  assert.deepEqual(Object.keys(pkg).sort(), [
    "getCurrentBlockIndex",
    "isAppendOnly",
    "setupMarkdownPreview",
    "splitMarkdownBlocks",
  ]);
});

test("README Usage 예제가 그대로 동작한다", () => {
  const { dom, textarea, preview } = setupDom("# Hello");

  const instance = setupMarkdownPreview({ textarea, preview });

  assert.equal(typeof instance.destroy, "function");
  assert.equal(typeof instance.rerender, "function");
  assert.equal(preview.children.length, 1);
  assert.match(preview.innerHTML, /<h1[^>]*>Hello<\/h1>/);

  type(dom, textarea, "# Hello\n\n본문입니다.");
  assert.equal(preview.children.length, 2);
  assert.match(preview.children[1].innerHTML, /본문입니다/);
});

test("breaks 옵션이 줄바꿈을 <br>로 처리한다", () => {
  const { preview: on, textarea: taOn, dom } = setupDom("a\nb");
  setupMarkdownPreview({ textarea: taOn, preview: on, breaks: true });
  assert.match(on.innerHTML, /<br\s*\/?>/);

  const { preview: off, textarea: taOff } = setupDom("a\nb");
  setupMarkdownPreview({ textarea: taOff, preview: off, breaks: false });
  assert.doesNotMatch(off.innerHTML, /<br\s*\/?>/);
  void dom;
});

test("변경되지 않은 블록의 DOM 요소는 재생성되지 않는다", () => {
  const { dom, textarea, preview } = setupDom("첫 번째\n\n두 번째\n\n세 번째");
  setupMarkdownPreview({ textarea, preview });

  const before = [...preview.children];
  assert.equal(before.length, 3);

  type(dom, textarea, "첫 번째\n\n두 번째 수정됨\n\n세 번째");

  const after = [...preview.children];
  assert.equal(after[0], before[0], "앞 블록은 같은 요소여야 한다");
  assert.equal(after[2], before[2], "뒤 블록은 같은 요소여야 한다");
  assert.match(after[1].innerHTML, /두 번째 수정됨/);
});

test("블록을 뒤에 추가하면 앞 블록을 다시 만들지 않는다 (append 최적화)", () => {
  const { dom, textarea, preview } = setupDom("첫 번째\n\n두 번째");
  setupMarkdownPreview({ textarea, preview });

  const before = [...preview.children];
  type(dom, textarea, "첫 번째\n\n두 번째\n\n세 번째");

  const after = [...preview.children];
  assert.equal(after.length, 3);
  assert.equal(after[0], before[0]);
  assert.equal(after[1], before[1]);
});

test("destroy() 이후에는 input 이벤트를 반영하지 않는다", () => {
  const { dom, textarea, preview } = setupDom("원본");
  const instance = setupMarkdownPreview({ textarea, preview });

  instance.destroy();
  type(dom, textarea, "수정본");

  assert.match(preview.innerHTML, /원본/);
  assert.doesNotMatch(preview.innerHTML, /수정본/);
});

test("rerender() 는 destroy() 이후에도 현재 값을 다시 그린다", () => {
  const { textarea, preview } = setupDom("원본");
  const instance = setupMarkdownPreview({ textarea, preview });

  instance.destroy();
  textarea.value = "수정본";
  instance.rerender();

  assert.match(preview.innerHTML, /수정본/);
});

test("잘못된 인자에 대해 명확한 에러를 던진다", () => {
  const { preview, textarea } = setupDom("");

  assert.throws(
    () => setupMarkdownPreview({ textarea: {}, preview }),
    /HTMLTextAreaElement/,
  );
  assert.throws(
    () => setupMarkdownPreview({ textarea, preview: {} }),
    /HTMLElement/,
  );
});

test("코드 블록 안의 빈 줄은 블록을 나누지 않는다", () => {
  const markdown = "```js\nconst a = 1;\n\nconst b = 2;\n```\n\n바깥 문단";
  assert.deepEqual(splitMarkdownBlocks(markdown), [
    "```js\nconst a = 1;\n\nconst b = 2;\n```",
    "바깥 문단",
  ]);
});
