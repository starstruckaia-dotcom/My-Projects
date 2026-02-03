import './globals.css'

export const metadata = {
  title: 'StockPulse - Restaurant Inventory Tracker',
  description: 'Track and manage your restaurant inventory in real-time',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-content">
            <div className="logo">StockPulse</div>
            <nav>
              <button className="btn btn-outline">Settings</button>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
