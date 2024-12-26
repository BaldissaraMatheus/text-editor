import { createSignal, onMount } from "solid-js";
import { StacksEditor } from "@stackoverflow/stacks-editor";
import "@stackoverflow/stacks";
import stacksEditorStyle from "@stackoverflow/stacks-editor/dist/styles.css?inline";
import stacksStyle from "@stackoverflow/stacks/dist/css/stacks.css?inline";

export function OldEditor() {
  // const [editor, setEditor] = createSignal();

	let editorContainerRef;

  onMount(() => {
    const editorClasses = ["editor", "theme-system"];
    const newEditor = new StacksEditor(
      editorContainerRef,
      "",
      {
        classList: ["theme-system"],
        targetClassList: editorClasses,
        editorHelpLink: "https://github.com/BaldissaraMatheus/Tasks.md/issues",
        // imageUpload: { handler: uploadImage },
      }
    );
    // setEditor(newEditor);
  });

  return (
    <div>
      <style>{stacksStyle}</style>
      <style>{stacksEditorStyle}</style>
      <div
        id="editor-container"
        autofocus
        ref={(el) => {
          editorContainerRef = el;
        }}
        // onKeyDown={handleEditorOnChange}
        // onClick={handleEditorOnChange}
      />
    </div>
  );
}
