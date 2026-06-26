import { DiscoveryFeed } from './components/discovery/DiscoveryFeed'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '0 0 60px'
    }}>
      {/* Top nav */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          color: 'var(--accent)',
          fontWeight: '400'
        }}>
          okra
        </h1>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          0 / 7 requests sent
        </span>
      </header>

      {/* Feed */}
      <main style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        <DiscoveryFeed />
      </main>
    </div>
  )
}

export default App