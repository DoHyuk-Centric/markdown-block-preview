/**
 * markdown-block-preview 성능 벤치마크
 *
 * 비교 대상:
 *   Full render  — 매 입력마다 전체 마크다운을 파싱 + DOM 교체 (일반적인 방식)
 *   Block render — 블록 단위 비교 후 변경분만 파싱 + DOM 교체 (이 라이브러리 방식)
 *
 * 실행: node benchmark/run.js
 */

import { JSDOM } from "jsdom";
import { Marked } from "marked";
import { splitMarkdownBlocks } from "../src/core/splitMarkdownBlocks.js";

// ── jsdom 환경 설정 ──
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
const document = dom.window.document;

const marked = new Marked({ breaks: true });

// ── 테스트 마크다운 생성 ──
function generateMarkdown(blockCount) {
  const types = [
    (i) => `## Section ${i}\nLorem ipsum dolor sit amet, **consectetur** adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    (i) => `- Item ${i}-a\n- Item ${i}-b with *emphasis*\n- Item ${i}-c with [link](https://example.com)`,
    (i) => `> Blockquote ${i}: The only way to do great work is to love what you do.\n> — Steve Jobs`,
    (i) =>
      "```js\nfunction example" +
      i +
      "() {\n  const x = " +
      i +
      ';\n  return x * 2;\n}\n```',
    (i) => `Paragraph ${i}: React와 Vue 같은 프레임워크는 Virtual DOM으로 변경 감지를 합니다.\n이 라이브러리는 마크다운 텍스트 레벨에서 블록 비교를 수행합니다.`,
  ];

  const blocks = [];
  for (let i = 0; i < blockCount; i++) {
    blocks.push(types[i % types.length](i));
  }
  return blocks.join("\n\n");
}

// ── DOM 초기화 헬퍼 ──
function createContainer() {
  return document.createElement("div");
}

function initBlocks(markdown, container) {
  const blocks = splitMarkdownBlocks(markdown);
  container.innerHTML = "";
  blocks.forEach((block) => {
    const div = document.createElement("div");
    div.innerHTML = marked.parse(block);
    container.appendChild(div);
  });
  return blocks;
}

// ── 벤치마크 대상 함수 ──

/** 전체 렌더링: 매번 전체 마크다운을 파싱하고 DOM 전체 교체 */
function fullRender(markdown, container) {
  container.innerHTML = marked.parse(markdown);
}

/** 블록 렌더링: 변경된 블록만 파싱하고 해당 DOM만 교체 */
function blockRender(modifiedMarkdown, container, prevBlocks) {
  const nextBlocks = splitMarkdownBlocks(modifiedMarkdown);

  for (let i = 0; i < nextBlocks.length; i++) {
    if (nextBlocks[i] !== prevBlocks[i]) {
      const el = container.children[i];
      if (el) {
        el.innerHTML = marked.parse(nextBlocks[i]);
      }
    }
  }

  return nextBlocks;
}

// ── 측정 유틸 ──
function measure(fn, iterations) {
  // warmup
  for (let i = 0; i < Math.min(50, iterations); i++) fn();

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  return {
    avg: times.reduce((a, b) => a + b) / times.length,
    median: times[Math.floor(times.length / 2)],
    p95: times[Math.floor(times.length * 0.95)],
    min: times[0],
    max: times[times.length - 1],
  };
}

function fmt(ms) {
  return ms.toFixed(3) + "ms";
}

// ── 벤치마크 실행 ──
const scenarios = [
  { name: "10 blocks", blockCount: 10, iterations: 2000 },
  { name: "50 blocks", blockCount: 50, iterations: 1000 },
  { name: "100 blocks", blockCount: 100, iterations: 500 },
  { name: "300 blocks", blockCount: 300, iterations: 200 },
  { name: "500 blocks", blockCount: 500, iterations: 100 },
];

console.log("=".repeat(72));
console.log(" markdown-block-preview  Performance Benchmark");
console.log("=".repeat(72));
console.log();
console.log(
  "시나리오: 문서 중간의 블록 1개를 수정했을 때의 렌더링 시간 비교",
);
console.log("환경: Node.js + jsdom (DOM 파싱 비용 포함, 페인트 비용 미포함)");
console.log();

const results = [];

for (const { name, blockCount, iterations } of scenarios) {
  const markdown = generateMarkdown(blockCount);
  const editIndex = Math.floor(blockCount / 2);

  // 수정된 마크다운 만들기 (중간 블록에 텍스트 추가)
  const originalBlocks = splitMarkdownBlocks(markdown);
  const modifiedBlocks = [...originalBlocks];
  modifiedBlocks[editIndex] += " (edited: added extra text here)";
  const modifiedMarkdown = modifiedBlocks.join("\n\n");

  // 블록 수 검증
  const modifiedCheck = splitMarkdownBlocks(modifiedMarkdown);
  if (originalBlocks.length !== modifiedCheck.length) {
    console.error(`  ERROR: block count mismatch! original=${originalBlocks.length} modified=${modifiedCheck.length}`);
    continue;
  }

  // Full render 벤치마크
  const fullContainer = createContainer();
  fullRender(markdown, fullContainer); // 초기 상태

  const fullResult = measure(
    () => fullRender(modifiedMarkdown, fullContainer),
    iterations,
  );

  // Block render 벤치마크
  const blockContainer = createContainer();
  const prevBlocks = initBlocks(markdown, blockContainer);

  const blockResult = measure(
    () => blockRender(modifiedMarkdown, blockContainer, prevBlocks),
    iterations,
  );

  const speedup = fullResult.avg / blockResult.avg;

  results.push({ name, blockCount, fullResult, blockResult, speedup });

  console.log(`--- ${name} (${iterations} iterations) ---`);
  console.log(
    `  Full render:   avg=${fmt(fullResult.avg)}   median=${fmt(fullResult.median)}   p95=${fmt(fullResult.p95)}`,
  );
  console.log(
    `  Block render:  avg=${fmt(blockResult.avg)}   median=${fmt(blockResult.median)}   p95=${fmt(blockResult.p95)}`,
  );
  console.log(`  Speedup:       ${speedup.toFixed(1)}x faster`);
  console.log();
}

// ── 결과 요약 테이블 ──
console.log("=".repeat(72));
console.log(" Summary");
console.log("=".repeat(72));
console.log();
console.log(
  "| Blocks | Full (avg) | Block (avg) | Speedup | Full (p95) | Block (p95) |",
);
console.log(
  "|--------|------------|-------------|---------|------------|-------------|",
);
for (const r of results) {
  console.log(
    `| ${String(r.blockCount).padStart(6)} | ${fmt(r.fullResult.avg).padStart(10)} | ${fmt(r.blockResult.avg).padStart(11)} | ${(r.speedup.toFixed(1) + "x").padStart(7)} | ${fmt(r.fullResult.p95).padStart(10)} | ${fmt(r.blockResult.p95).padStart(11)} |`,
  );
}
console.log();

// ── 추가 벤치마크: splitMarkdownBlocks 오버헤드 측정 ──
console.log("=".repeat(72));
console.log(" Overhead: splitMarkdownBlocks()");
console.log("=".repeat(72));
console.log();

for (const { name, blockCount } of scenarios) {
  const markdown = generateMarkdown(blockCount);
  const splitResult = measure(() => splitMarkdownBlocks(markdown), 2000);
  console.log(`  ${name}: avg=${fmt(splitResult.avg)}  p95=${fmt(splitResult.p95)}`);
}
console.log();

// ── 추가 벤치마크: 여러 블록 동시 변경 (붙여넣기 시나리오) ──
console.log("=".repeat(72));
console.log(" Multi-block edit (paste scenario, 100 blocks)");
console.log("=".repeat(72));
console.log();

const pasteMarkdown = generateMarkdown(100);
const pasteOriginal = splitMarkdownBlocks(pasteMarkdown);

for (const changedCount of [1, 5, 10, 25, 50, 100]) {
  const pasteModified = [...pasteOriginal];
  // 처음 N개 블록 수정
  for (let i = 0; i < changedCount; i++) {
    pasteModified[i] += " (edited)";
  }
  const pasteModifiedMarkdown = pasteModified.join("\n\n");

  const fc = createContainer();
  fullRender(pasteMarkdown, fc);
  const fr = measure(() => fullRender(pasteModifiedMarkdown, fc), 500);

  const bc = createContainer();
  const pb = initBlocks(pasteMarkdown, bc);
  const br = measure(
    () => blockRender(pasteModifiedMarkdown, bc, pb),
    500,
  );

  const s = fr.avg / br.avg;
  console.log(
    `  ${String(changedCount).padStart(3)} blocks changed: Full=${fmt(fr.avg)}  Block=${fmt(br.avg)}  Speedup=${s.toFixed(1)}x`,
  );
}

console.log();
console.log("Done.");
