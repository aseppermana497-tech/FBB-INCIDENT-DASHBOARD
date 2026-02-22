import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'NOC Dashboard - Incident Monitoring',
  description: 'Network Operations Center Dashboard for IndiHome Fixed Broadband Incident Monitoring',
}

export const viewport: Viewport = {
  themeColor: '#0a0f1c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body
  style={{ backgroundImage: "url('/wow.jpg')" }}
  className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-cover bg-center`}
>
  {children}
</body>
    </html>
  )
}
