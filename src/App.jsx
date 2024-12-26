import logo from "./logo.svg";
import styles from "./App.module.css";
import { createEffect, createSignal, onMount } from "solid-js";
import { convertToText } from "./util/convertToText";
import showdown from 'showdown';
import { OldEditor } from "./StacksEditor";

function App() {
  const [value, setValue] = createSignal("");
  const [activeEditor, setActiveEditor] = createSignal(null);
  let mdEditor;
  let richTextEditor;

  var converter = new showdown.Converter()

  onMount(() => {
    setValue("");
  });

  // https://gist.github.com/nathansmith/86b5d4b23ed968a92fd4
  function handleMarkdownEditorChange(e) {
    const text = convertToText(e.currentTarget.innerHTML)
    setValue(text);
  }

  function handleHTMLEditorChange(e) {
    const mdEditorText = converter.makeMarkdown(e.currentTarget.innerHTML);
    setValue(mdEditorText)
  }

  createEffect(() => {
    if (activeEditor() !== mdEditor) {
      mdEditor.innerHTML = value();
    }
    if (activeEditor() !== richTextEditor) {
      const richEditorText = converter.makeHtml(value());
      richTextEditor.innerHTML = richEditorText;
    }
  });

  // https://discourse.mozilla.org/t/how-to-get-the-caret-position-in-contenteditable-elements-with-respect-to-the-innertext/91068
  function getEditorCaretPositions() {
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
    const carentPositions = getEditorCaretPositions();
    const caretPosition = getEditorCaretPositions().start;
    const editorText = convertToText(mdEditor.innerHTML)
    let startSelectionIndex = 0;
    let endSelectionIndex = editorText.length;
    if (carentPositions.end !== carentPositions.start) {
      startSelectionIndex = carentPositions.start;
      endSelectionIndex = carentPositions.end;
    } else {
      const prevLineBreak = editorText.lastIndexOf('\n', caretPosition - 1);
      if (prevLineBreak > startSelectionIndex) {
        startSelectionIndex = prevLineBreak;
      }
      const prevWhiteSpace = editorText.lastIndexOf(' ', caretPosition - 1);
      if (prevWhiteSpace > startSelectionIndex) {
        startSelectionIndex = prevWhiteSpace;
      }
      startSelectionIndex += 1;
      const nextLineBreak = editorText.indexOf('\n', caretPosition);
      if (nextLineBreak !== -1) {
        endSelectionIndex = nextLineBreak;
      }
      const nextWhiteSpace = editorText.indexOf(' ', caretPosition);
      if (nextWhiteSpace !== -1 && nextWhiteSpace < endSelectionIndex) {
        endSelectionIndex = nextWhiteSpace;
      }
    }
    const selection = editorText.substring(startSelectionIndex, endSelectionIndex)
    return { editorText, selection, startSelectionIndex, endSelectionIndex };
  }

  function setEditorCaretPosition(editor, pos) {
    var selectedText = window.getSelection();
    var selectedRange = document.createRange();
    selectedRange.setStart(editor.childNodes[0], pos);
    selectedText.removeAllRanges();
    selectedText.addRange(selectedRange);
  }

  function bold(e) {
    const { editorText, selection, startSelectionIndex, endSelectionIndex } = getSelection();
    const newWord = `**${selection}**`;
    const newText = `${editorText.substring(0, startSelectionIndex)}${newWord}${editorText.substring(endSelectionIndex, editorText.length)}`
    mdEditor.innerHTML = newText;
    setValue(newText);
    setEditorCaretPosition(mdEditor, endSelectionIndex + '**'.length)
  }

  return (<div>
    <div>
      <button onClick={bold}>B</button>
    </div>
    <div
      ref={v => mdEditor = v}
      contentEditable
      onFocus={() => setActiveEditor(mdEditor)}
      onInput={handleMarkdownEditorChange}
      style={{ "white-space": 'pre-wrap', width: '400px', height: '200px', border: '1px solid black', "margin-bottom": '20px', overflow: 'auto' }}
    >
    </div>
    <div
      ref={v => richTextEditor = v}
      contentEditable
      onFocus={() => setActiveEditor(richTextEditor)}
      onInput={handleHTMLEditorChange}
      style={{ "white-space": 'pre-wrap', width: '400px', height: '200px', border: '1px solid black', overflow: 'auto' }}
    >
    </div>
    <OldEditor />
  </div>
  );
}

export default App;
