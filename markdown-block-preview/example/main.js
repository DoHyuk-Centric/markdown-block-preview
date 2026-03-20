import { setupMarkdownPreview } from "../src/index.js";

const textarea = document.getElementById("content");
const preview = document.getElementById("preview-content");

setupMarkdownPreview({ textarea, preview });
