# 패키지 메타데이터 보강 및 공개 API 계약 테스트

- 작업일: 2026-07-11
- 관련 PR: #2
- 발견 경로: 포트폴리오 점검 중 AI 코드 리뷰(Claude Code)로 지적받고, 직접 재현·검증 후 수정

## 요약

npm에 배포된 이 패키지가 (1) 작성자·저장소 정보 없이 익명으로 노출되고 있었고,
(2) README에 문서화된 사용법이 실제 export와 어긋나도 아무도 알 수 없는 상태였다.
후자는 메인 프로젝트(myBlog) README에서 실제로 잘못된 예제로 이어져 있었다.

---

## 문제 1 — npm에서 패키지가 익명이다

### 증상
[npm 페이지](https://www.npmjs.com/package/markdown-block-preview)에 작성자 이름도 GitHub 저장소 링크도 표시되지 않았다.

### 원인
`package.json`의 `author`가 빈 문자열(`""`)이고 `repository`, `homepage`, `bugs` 필드가 아예 없었다.
직접 만들어 배포한 라이브러리인데도, npm에서는 누가 만들었는지 드러나지 않았다.

### 수정
```json
"author": "DoHyuk-Centric (https://github.com/DoHyuk-Centric)",
"repository": { "type": "git", "url": "git+https://github.com/DoHyuk-Centric/markdown-block-preview.git" },
"homepage": "https://github.com/DoHyuk-Centric/markdown-block-preview#readme",
"bugs": { "url": "https://github.com/DoHyuk-Centric/markdown-block-preview/issues" }
```

---

## 문제 2 — README와 코드가 어긋나도 잡히지 않는다

### 증상
myBlog README에 이 패키지 사용법이 아래처럼 적혀 있었다.

```js
import { BlockPreview } from 'markdown-block-preview';
const preview = new BlockPreview({ editor, output });
```

하지만 이 패키지가 실제로 내보내는 것은 `setupMarkdownPreview({ textarea, preview })`이고,
`BlockPreview`라는 이름은 코드 어디에도 없다. npm에서 설치해 문서대로 따라 하면 첫 줄에서 실패한다.

### 원인
README(사용법 문서)와 `src/index.js`(실제 export)가 서로를 검증하지 않았다.
어느 한쪽이 바뀌어도 CI가 없으니 조용히 어긋난다.

### 수정 — 문서를 실행 가능한 테스트로
`test/public-api.test.js`가 README의 Usage / Options / API 절을 그대로 실행하고,
공개 export 목록을 고정한다. jsdom 기반, `node --test`로 실행.

특히 이 라이브러리의 존재 이유인 "변경된 블록만 다시 렌더링한다"를
**DOM 요소의 동일성**으로 검증한다. 전체 재렌더링으로 회귀하면 요소가 새로 생성되어 테스트가 깨진다.

```js
const before = [...preview.children];
type(dom, textarea, "첫 번째\n\n두 번째 수정됨\n\n세 번째");
const after = [...preview.children];
assert.equal(after[0], before[0]); // 안 바뀐 블록은 같은 요소
assert.equal(after[2], before[2]);
```

### 재발 방지
`.github/workflows/ci.yml`이 Node 22/24에서 `npm test`를 실행한다.
export 이름을 바꾸면 CI가 실패하므로 README와 코드가 다시 어긋날 수 없다.

### 검증
테스트가 실제로 문제를 잡는지 확인하려고 `src/index.js`의 export를 일부러 `BlockPreview`로 바꿔봤다.

```
### export 이름을 BlockPreview로 바꿔치기 후
✖ test/public-api.test.js   (pass 0 / fail 1)

### 원복 후
✔ (pass 9 / fail 0)
```

myBlog README를 틀리게 만들었던 그 변경이 이제 CI에서 막힌다.

---

## 남은 일

- README `Limitations`에 명시된 대로 `sanitize`는 미포함이다. 사용처에서 신뢰할 수 없는 입력을 렌더링한다면 별도 대응(예: DOMPurify)이 필요하다.
- myBlog README의 잘못된 예제 수정은 별도 PR(myBlog#43)에서 처리했다.
