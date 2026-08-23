import Editor from '@monaco-editor/react';
import { StrategyDefinition } from '../../api/types';

interface DslEditorProps {
  value: StrategyDefinition;
  onChange: (value: StrategyDefinition) => void;
  readOnly?: boolean;
}

export function DslEditor({ value, onChange, readOnly = false }: DslEditorProps) {
  const handleEditorChange = (val: string | undefined) => {
    if (!val) return;
    try {
      const parsed = JSON.parse(val);
      onChange(parsed);
    } catch (e) {
      // Don't update state if JSON is invalid, user might be typing
    }
  };

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden border border-slate-700">
      <Editor
        height="100%"
        defaultLanguage="json"
        theme="vs-dark"
        value={JSON.stringify(value, null, 2)}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          readOnly,
          scrollBeyondLastLine: false,
          fontSize: 14,
        }}
      />
    </div>
  );
}
