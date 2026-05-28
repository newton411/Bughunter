import React from 'react'
import EditorWithActions from '../components/EditorWithActions'

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-gray-800 p-6 rounded-lg">
        <h1 className="text-3xl font-semibold">BugHunter AI</h1>
        <p className="text-gray-300 mt-2">Upload or paste Solidity contracts for Elite analysis.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Editor</h2>
          <EditorWithActions />
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Analysis</h2>
          <div id="analysis" className="h-96 overflow-auto text-sm text-gray-200 p-2">No analysis yet.</div>
        </div>
      </section>
    </div>
  )
}
