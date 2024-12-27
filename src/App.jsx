import logo from "./logo.svg";
import styles from "./App.module.css";
import { createEffect, createSignal, onMount } from "solid-js";
import { convertToText } from "./util/convertToText";
import { OldEditor } from "./StacksEditor";
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeRemark from "rehype-remark";
import {unified} from 'unified'
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";

function App() {
  const [value, setValue] = createSignal("");
  const [activeEditor, setActiveEditor] = createSignal(null);
  let mdEditor;
  let richTextEditor;

  onMount(() => {
    setValue("");
  });

  // https://gist.github.com/nathansmith/86b5d4b23ed968a92fd4
  function handleMarkdownEditorChange(e) {
    const text = convertToText(e.currentTarget.innerHTML);
    setValue(text);
  }

  function handleHTMLEditorChange(e) {
    unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .process(e.currentTarget.innerHTML)
      .then(res => setValue(res))
    // const mdEditorText = converter.makeMarkdown(e.currentTarget.innerHTML);
    // setValue(mdEditorText);
  }

  createEffect(() => {
    if (activeEditor() !== mdEditor) {
      mdEditor.innerHTML = value();
    }
    if (activeEditor() !== richTextEditor) {
      unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        // TODO Visit each check box and remove or replace the disabled property https://github.com/orgs/remarkjs/discussions/1205#discussioncomment-6717030
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(value())
        .then(res => richTextEditor.innerHTML = res)
    }
  });

  // https://discourse.mozilla.org/t/how-to-get-the-caret-position-in-contenteditable-elements-with-respect-to-the-innertext/91068
  function getEditorSelectionRange() {
    const target = mdEditor;
    target.focus();
    const _range = document.getSelection().getRangeAt(0);
    let length = 0;
    if (!_range.collapsed) {
      length = _range.endOffset - _range.startOffset;
    }
    const range = _range.cloneRange();
    const temp = document.createTextNode("\0");
    range.insertNode(temp);
    const caretposition = target.innerText.indexOf("\0");
    temp.parentNode.removeChild(temp);
    return { start: caretposition, end: caretposition + length };
  }

  function getSelection() {
    const selectionRange = getEditorSelectionRange();
    const editorText = convertToText(mdEditor.innerHTML);
    let startSelectionIndex = 0;
    let endSelectionIndex = editorText.length;
    if (selectionRange.end !== selectionRange.start) {
      startSelectionIndex = selectionRange.start;
      endSelectionIndex = selectionRange.end;
    } else {
      const prevLineBreak = editorText.lastIndexOf(
        "\n",
        selectionRange.start - 1
      );
      if (prevLineBreak > startSelectionIndex) {
        startSelectionIndex = prevLineBreak;
      }
      const prevWhiteSpace = editorText.lastIndexOf(
        " ",
        selectionRange.start - 1
      );
      if (prevWhiteSpace > startSelectionIndex) {
        startSelectionIndex = prevWhiteSpace;
      }
      startSelectionIndex += 1;
      const nextLineBreak = editorText.indexOf("\n", selectionRange.start);
      if (nextLineBreak !== -1) {
        endSelectionIndex = nextLineBreak;
      }
      const nextWhiteSpace = editorText.indexOf(" ", selectionRange.start);
      if (nextWhiteSpace !== -1 && nextWhiteSpace < endSelectionIndex) {
        endSelectionIndex = nextWhiteSpace;
      }
    }
    const selection = editorText.substring(
      startSelectionIndex,
      endSelectionIndex
    );
    const prevFragment = editorText.substring(0, startSelectionIndex);
    const nextFragment = editorText.substring(
      endSelectionIndex,
      editorText.length
    );
    const caretPosition = selectionRange.start;
    return {
      selection,
      caretPosition,
      startSelectionIndex,
      endSelectionIndex,
      prevFragment,
      nextFragment,
    };
  }

  function setEditorCaretPosition(editor, pos) {
    var selectedText = window.getSelection();
    var selectedRange = document.createRange();
    selectedRange.setStart(editor.childNodes[0], pos);
    selectedText.removeAllRanges();
    selectedText.addRange(selectedRange);
  }

  function bold(e) {
    const { selection, prevFragment, nextFragment, caretPosition } =
      getSelection();
    const newWord = `**${selection}**`;
    const newText = `${prevFragment}${newWord}${nextFragment}`;
    applyTextModifier(newText, caretPosition + "**".length);
  }

  function italic(e) {
    const { selection, prevFragment, nextFragment, caretPosition } =
      getSelection();
    const newWord = `*${selection}*`;
    const newText = `${prevFragment}${newWord}${nextFragment}`;
    applyTextModifier(newText, caretPosition + "*".length);
  }

  function applyTextModifier(newText, caretPosition) {
    mdEditor.innerHTML = newText;
    setValue(newText);
    setEditorCaretPosition(mdEditor, caretPosition);
  }

  return (
    <div>
      <div>
        <button onClick={bold}>B</button>
        <button onClick={italic}>I</button>
        {/* <button onClick={strikethrough}>S</button> */}
      </div>
      <div
        ref={(v) => (mdEditor = v)}
        contentEditable
        onFocus={() => setActiveEditor(mdEditor)}
        onInput={handleMarkdownEditorChange}
        style={{
          "white-space": "pre-wrap",
          width: "400px",
          height: "200px",
          border: "1px solid black",
          "margin-bottom": "20px",
          overflow: "auto",
        }}
      ></div>
      <div
        ref={(v) => (richTextEditor = v)}
        contentEditable
        onFocus={() => setActiveEditor(richTextEditor)}
        onInput={handleHTMLEditorChange}
        style={{
          "white-space": "pre-wrap",
          width: "400px",
          height: "200px",
          border: "1px solid black",
          overflow: "auto",
        }}
      >
      </div>
      <OldEditor />
    </div>
  );
}

export default App;
