import logo from "./logo.svg";
import styles from "./App.module.css";
import { createEffect, createSignal, onMount } from "solid-js";
import { convertToText } from "./util/convertToText";
import showdown from 'showdown';
import { OldEditor } from "./StacksEditor";

function App() {
  const [value, setValue] = createSignal("");
  // const [pristineValue, setPristineValue] = createSignal('aaa\nbbb');
  let mdEditor;
  let richTextEditor;

  var converter = new showdown.Converter()

  onMount(() => {
    setValue("");
  });

  // https://gist.github.com/nathansmith/86b5d4b23ed968a92fd4
  function handleJsonEditorChange(e) {
    const text = convertToText(e.currentTarget.innerHTML)
    const richEditorText = converter.makeHtml(text);
    richTextEditor.innerHTML = richEditorText;
  }

  function handleHTMLEditorChange(e) {
    const mdEditorText = converter.makeMarkdown(e.currentTarget.innerHTML);
    mdEditor.innerHTML = mdEditorText;
  }

  createEffect(() => {
    console.log(value());
  });

  // https://discourse.mozilla.org/t/how-to-get-the-caret-position-in-contenteditable-elements-with-respect-to-the-innertext/91068
  function getEditorCaretPosition() {
    const target = mdEditor;
    target.focus(); 
    const _range = document.getSelection().getRangeAt(0); 
    if (!_range.collapsed) { 
      return; 
    } 
    const range = _range.cloneRange(); 
    const temp = document.createTextNode("\0"); 
    range.insertNode(temp); 
    const caretposition = target.innerText.indexOf("\0"); 
    temp.parentNode.removeChild(temp); 
    return caretposition;
  }

  function getSelection() {
    const caretPosition = getEditorCaretPosition();
    const editorText = convertToText(mdEditor.innerHTML)
    let startSelectionIndex = 0;
    const prevLineBreak = editorText.lastIndexOf('\n', caretPosition - 1);
    if (prevLineBreak > startSelectionIndex) {
      startSelectionIndex = prevLineBreak;
    }
    const prevWhiteSpace = editorText.lastIndexOf(' ', caretPosition - 1);
    if (prevWhiteSpace > startSelectionIndex) {
      startSelectionIndex = prevWhiteSpace;
    }
    startSelectionIndex += 1;
    let endSelectionIndex = editorText.length;
    const nextLineBreak = editorText.indexOf('\n', caretPosition);
    if (nextLineBreak !== -1) {
      endSelectionIndex = nextLineBreak;
    }
    const nextWhiteSpace = editorText.indexOf(' ', caretPosition);
    if (nextWhiteSpace !== -1 && nextWhiteSpace < endSelectionIndex) {
      endSelectionIndex = nextWhiteSpace;
    }
    const selection = editorText.substring(startSelectionIndex, endSelectionIndex)
    return { editorText, selection, startSelectionIndex, endSelectionIndex };
  }

  // TODO get selected text
  // TODO update caret position
  function bold(e) {
    // console.log(document.getSelection())
    // return;
    const { editorText, selection, startSelectionIndex, endSelectionIndex } = getSelection();
    const newWord = `**${selection}**`;
    const newText = `${editorText.substring(0, startSelectionIndex)}${newWord}${editorText.substring(endSelectionIndex, editorText.length)}`
    mdEditor.setSelectionRange(startSelectionIndex)
    mdEditor.innerHTML = newText;
  }

  return (<div>
    <div>
      <button onClick={bold}>B</button>
    </div>
    <div
      ref={v => mdEditor = v}
      contentEditable
      onInput={handleJsonEditorChange}
      style={{ "white-space": 'pre-wrap', width: '400px', height: '200px', border: '1px solid black', "margin-bottom": '20px', overflow: 'auto' }}
    >
    </div>
    <div
      ref={v => richTextEditor = v}
      contentEditable
      onInput={handleHTMLEditorChange}
      style={{ "white-space": 'pre-wrap', width: '400px', height: '200px', border: '1px solid black', overflow: 'auto' }}
    >
    </div>
    <OldEditor />
  </div>
  );
}

export default App;
