import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RepoFlight - Compliance & Security Dashboard',
  description: 'AI-Powered Compliance & Security Copilot with Kiro',
  keywords: ['compliance', 'security', 'dashboard', 'AI', 'repository', 'scanning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}