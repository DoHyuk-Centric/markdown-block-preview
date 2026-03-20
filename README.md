# Markdown Block Preview

마크다운 입력을 **블록 단위로 분리**하고,  
변경된 블록만 다시 렌더링하는 **실시간 미리보기 유틸리티**입니다.

전체를 매번 다시 렌더링하지 않고, 필요한 부분만 업데이트하여  
더 효율적인 렌더링을 제공합니다.

---

## ✨ Features

- 📦 마크다운을 **블록 단위로 분리**
- ⚡ 변경된 블록만 **부분 렌더링 (incremental rendering)**
- 🧠 간단한 diff 전략 기반 업데이트
- ➕ 새 블록 추가 시 append 최적화
- 🚫 불필요한 전체 렌더링 방지
- 🧾 코드 블록(```` ``` ````) 유지 처리

---

## 🧠 Concept

이 프로젝트는 전통적인 diff 알고리즘(LCS, Myers 등)을 사용하지 않고,  
**블록 단위 비교 기반의 휴리스틱(diff-like) 전략**을 사용합니다.

```text
기존 방식:
전체 markdown → 전체 렌더링

현재 방식:
markdown → 블록 분리 → 변경된 블록만 렌더링
```
## 📦 Installation
```
npm install marked
```
## 🚀 Usage
```HTML
<textarea id="content"></textarea>
<div id="preview-content"></div>
```

## ⚙️ How it works

### 1. Block Splitting

- 마크다운을 **빈 줄 기준으로 블록 단위로 분리합니다**
- 코드 블록(```` ``` ````)은 하나의 블록으로 유지합니다

---

### 2. Incremental Rendering

- 전체를 다시 렌더링하지 않습니다
- **현재 수정된 블록만 선택적으로 업데이트합니다**

---

### 3. Structure Sync

- 블록 개수가 변경되었는지 확인합니다
- append-only 상황에서는:
  - 마지막 블록만 추가합니다
- 그 외의 경우:
  - 전체 구조를 다시 렌더링합니다

---

### 4. Cursor-based Update

- 커서 위치를 기준으로 현재 수정 중인 블록을 탐지합니다
- 해당 블록만 다시 렌더링합니다

---

### 🔄 Rendering Flow

- input 이벤트 발생
- markdown → 블록 분리
- 블록 구조 변경 여부 확인
- 현재 블록 인덱스 계산
- 해당 블록만 업데이트
