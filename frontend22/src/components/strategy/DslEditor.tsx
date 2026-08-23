import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { StrategyDefinition } from '../../api/types'

export default function DslEditor({
  value,
  onChange,
}: {
  value: StrategyDefinition
  onChange: (next: StrategyDefinition) => void
}) {
  const lastEmitted = useRef<string | null>(null)
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  // If the strategy changed from somewhere other than this editor (i.e. the
  // form), reflect that into the JSON text. If the change originated here,
  // skip re-formatting so we don't fight the user's cursor while they type.
  useEffect(() => {
    const serialized = JSON.stringify(value, null, 2)
    if (serialized !== lastEmitted.current) {
      setText(serialized)
    }
  }, [value])

  function handleChange(newText: string | undefined) {
    const next = newText ?? ''
    setText(next)
    try {
      const parsed = JSON.parse(next) as StrategyDefinition
      lastEmitted.current = JSON.stringify(parsed, null, 2)
      setJsonError(null)
      onChange(parsed)
    } catch {
      setJsonError('This is not valid JSON yet — the form will update once it parses.')
    }
  }

  return (
    <div>
      <div className="rounded-lg overflow-hidden border border-base-border">
        <Editor
          height="360px"
          defaultLanguage="json"
          theme="vs-dark"
          value={text}
          onChange={handleChange}
          options={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            tabSize: 2,
          }}
        />
      </div>
      {jsonError && <p className="field-error">{jsonError}</p>}
    </div>
  )
}
