import React, { useState } from 'react'

export default function MonacoEditor() {
  const [code, setCode] = useState<string>("// Paste Solidity contract here\n")

  return (
    <div className="h-96">
      {/* Placeholder for Monaco editor integration. Replace with dynamic import of Monaco. */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-full bg-gray-900 text-green-200 p-2 rounded resize-none"
      />
    </div>
  )
}
