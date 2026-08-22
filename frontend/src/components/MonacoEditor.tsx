import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function MonacoEditor({
  value,
  onChange,
}: MonacoEditorProps) {
  return (
    <Editor
      height="450px"
      defaultLanguage="json"
      theme="vs-dark"
      value={value}
      onChange={(newValue) => onChange(newValue ?? "")}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        lineNumbers: "on",
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}

export default MonacoEditor;