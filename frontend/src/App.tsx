import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom'
import { DiscoveryFeed } from './components/discovery/DiscoveryFeed'
import { ResearchHome } from './components/research/ResearchHome'

function Nav() {
  const location = useLocation()
  const isResearch = location.pathname.startsWith('/research')

  return (
    <header
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              color: 'var(--accent)',
              fontWeight: '400',
            }}
          >
            okra
          </h1>
        </Link>
        <Link
          to="/research"
          style={{
            fontSize: '13px',
            color: isResearch ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: isResearch ? '500' : '400',
          }}
        >
          research lab
        </Link>
      </div>
      {!isResearch && (
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          0 / 7 requests sent
        </span>
      )}
    </header>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          padding: '0 0 60px',
        }}
      >
        <Nav />
        <main
          style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                  <DiscoveryFeed />
                </div>
              }
            />
            <Route path="/research" element={<ResearchHome />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
