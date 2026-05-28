import React from 'react'
import dynamic from 'next/dynamic'

const AuthButton = dynamic(() => import('./AuthButton'), { ssr: false })

export default function Header() {
  return (
    <header className="bg-gray-850 border-b border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-500 rounded flex items-center justify-center font-bold">EB</div>
          <div>
            <div className="font-semibold">BugHunter AI</div>
            <div className="text-sm text-gray-400">Elite automated smart contract audits</div>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

