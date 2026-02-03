import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'StockPulse - Restaurant Inventory Tracker',
  description: 'Track and manage your restaurant inventory in real-time',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
