import './globals.css'
import React from 'react'
import Header from '../components/Header'

export const metadata = {
  title: 'BugHunter AI',
  description: 'EliteBugHunter — AI-powered smart contract security auditing'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <Header />
          <main className="container py-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
