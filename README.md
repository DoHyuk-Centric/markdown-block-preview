# markdown-block-preview

🚀 Block-based incremental rendering for markdown live preview

마크다운을 **블록 단위로 분리**하고, 변경된 부분만 다시 렌더링하는
**경량 실시간 미리보기 유틸리티**입니다.

---

## ✨ Features

* 📦 마크다운을 **블록 단위로 분리**
* ⚡ 변경된 블록만 **부분 렌더링 (incremental rendering)**
* ➕ 새 블록 추가 시 append 최적화
* 🧠 커서 기반 업데이트 전략
* 🧾 코드 블록(` ` ```) 유지 처리
* 🔧 DOM 요소를 외부에서 주입 (재사용 가능 구조)

---

## 📦 Installation

```bash
npm install markdown-block-preview
```

---

## 🚀 Usage

```html
<textarea id="content"></textarea>
<div id="preview"></div>
```

```js
import { setupMarkdownPreview } from "markdown-block-preview";

const textarea = document.getElementById("content");
const preview = document.getElementById("preview");

setupMarkdownPreview({
  textarea,
  preview,
});
```

---

## ⚙️ Options

```js
setupMarkdownPreview({
  textarea, // HTMLTextAreaElement (required)
  preview,  // HTMLElement (required)
  breaks: true // 줄바꿈 처리 (default: true)
});
```

| 옵션       | 타입                  | 설명               |
| -------- | ------------------- | ---------------- |
| textarea | HTMLTextAreaElement | 입력 영역            |
| preview  | HTMLElement         | 렌더링 영역           |
| breaks   | boolean             | 줄바꿈 `<br>` 처리 여부 |

---

## 🧠 How it works

이 라이브러리는 전체를 매번 다시 렌더링하지 않고:

1. 마크다운을 블록 단위로 분리
2. 이전 상태와 비교
3. 변경된 블록만 업데이트

👉 불필요한 DOM 업데이트를 줄여 성능을 개선합니다.

---

## ⚠️ Limitations

* 빈 줄 기준으로 블록을 분리합니다
* 복잡한 구조 변경 시 전체 렌더링 fallback
* Markdown AST 기반 파서는 아닙니다
* sanitize 처리는 포함되어 있지 않습니다

---

## 🔧 API

### setupMarkdownPreview(options)

미리보기 기능을 초기화합니다.

#### 반환값

```js
{
  destroy(): void,
  rerender(): void
}
```

---

### destroy()

이벤트 리스너 제거

```js
instance.destroy();
```

---

### rerender()

전체 다시 렌더링

```js
instance.rerender();
```

---

## 🧪 Example

프로젝트에 포함된 `example/` 폴더에서 확인할 수 있습니다.

---

## 📄 License

MIT
