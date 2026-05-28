import React from 'react'
import CopilotKitUI from '../../components/CopilotKitUI'

export default function AgentPage() {
  return (
    <div className="space-y-6">
      <section className="bg-gray-800 p-6 rounded-lg">
        <h1 className="text-2xl font-semibold">EliteBugHunter Agent</h1>
        <p className="text-gray-400 mt-1">Interactive agent powered by CopilotKit / Copilot SDK.</p>
      </section>

      <section>
        <CopilotKitUI />
      </section>
    </div>
  )
}
