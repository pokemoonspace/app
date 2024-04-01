import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Web3Modal } from '../context/web3modal'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: 'Pokemoon NFT',
  description: 'Is a space where your Pokemon automatically evolve over time.',
  icons: '/favicon.png',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-VEWE8G4PRK" />
      <body>
        <Web3Modal>{children}</Web3Modal>
      </body>
    </html>
  )
}