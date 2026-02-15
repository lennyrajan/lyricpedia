import React, { useState } from 'react';
import './index.css';
import Home from './pages/Home';
import SongDetail from './pages/SongDetail';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import Hub from './pages/Hub';
import { songService } from './services/songService';

const App = () => {
  const [user, setUser] = useState(null); // { username: 'mastermad' }
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState(['home']);

  // Settings State
  const [indexingLogs, setIndexingLogs] = useState([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [adminReport, setAdminReport] = useState(null);

  const navigateTo = (page, data = null) => {
    setHistory(prev => [...prev, page]);
    setCurrentPage(page);
    if (page === 'detail') setSelectedSong(data);
    if (page === 'artist') setSelectedArtist(data);
    if (page === 'album') setSelectedAlbum(data);
    if (page === 'hub') setSelectedHub(data);
    if (page === 'home') {
      setSearchQuery('');
      setHistory(['home']);
    }
    window.scrollTo(0, 0);
  };
  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPage(prevPage);
    } else {
      navigateTo('home');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      const results = await songService.searchSongs(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'mastermad') {
      setUser({ username: 'mastermad' });
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      alert('Welcome, ADMIN.');
    } else {
      alert('Unauthorized access.');
    }
  };

  const startReindexing = () => {
    setIsIndexing(true);
    setIndexingLogs(['Initiating remote discovery engine...']);

    // Connect to native bridge
    const eventSource = new EventSource('http://localhost:3001/api/index');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setIndexingLogs(prev => [...prev, data.message]);
      } else if (data.type === 'error') {
        setIndexingLogs(prev => [...prev, `[ERROR] ${data.message}`]);
      } else if (data.type === 'done') {
        setIndexingLogs(prev => [...prev, '--- Indexing Complete ---']);
        setIsIndexing(false);
        eventSource.close();
        fetchReport();
      }
    };

    eventSource.onerror = () => {
      setIndexingLogs(prev => [...prev, '[BRIDGE] Connection failed. Ensure server.js is running.']);
      setIsIndexing(false);
      eventSource.close();
    };
  };

  const fetchReport = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/report');
      if (res.ok) {
        const data = await res.json();
        setAdminReport(data);
      }
    } catch (e) {
      console.log('Failed to fetch report');
    }
  };

  const renderPage = () => {
    if (currentPage === 'settings') {
      return (
        <div className="settings-page">
          <h2 className="title-premium">System Settings</h2>
          {!user ? (
            <div className="login-prompt glass-panel">
              <p>Authentication Required for Admin Tools</p>
              <button className="btn-spotify" onClick={() => setShowLogin(true)}>ACCESS SYSTEM</button>
            </div>
          ) : (
            <div className="admin-tools">
              <div className="dashboard-card glass-panel">
                <h3>Discovery Management</h3>
                <p>Trigger a full sweep of the latest trends.</p>
                <button
                  className="btn-spotify"
                  onClick={startReindexing}
                  disabled={isIndexing}
                >
                  {isIndexing ? 'INDEXING...' : 'INVOKE FULL INDEX'}
                </button>
              </div>

              {indexingLogs.length > 0 && (
                <div className="log-viewer glass-panel">
                  <h4>Indexing Progress</h4>
                  <div className="logs-container">
                    {indexingLogs.map((log, i) => <div key={i} className="log-line">{log}</div>)}
                  </div>
                </div>
              )}

              {adminReport && (
                <div className="report-card glass-panel">
                  <h4>Admin Discovery Report</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="s-label">SCANNED</span>
                      <span className="s-value">{adminReport.scanned}</span>
                    </div>
                    <div className="stat-item">
                      <span className="s-label">ENRICHED</span>
                      <span className="s-value">{adminReport.enriched}</span>
                    </div>
                    <div className="stat-item">
                      <span className="s-label">FAILED</span>
                      <span className="s-value">{adminReport.failed}</span>
                    </div>
                  </div>
                  <p className="report-meta">Run completed at: {new Date(adminReport.endTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    switch (currentPage) {
      case 'detail':
        return (
          <SongDetail
            song={selectedSong}
            onBack={goBack}
            onArtistSelect={(name) => navigateTo('artist', name)}
            onAlbumSelect={(name) => navigateTo('album', name)}
            onHubSelect={(type, value) => navigateTo('hub', { type, value })}
          />
        );
      case 'artist':
        return (
          <ArtistDetail
            artistName={selectedArtist}
            onBack={goBack}
            onSongSelect={(song) => navigateTo('detail', song)}
          />
        );
      case 'album':
        return (
          <AlbumDetail
            albumName={selectedAlbum}
            onBack={goBack}
            onSongSelect={(song) => navigateTo('detail', song)}
          />
        );
      case 'hub':
        return (
          <Hub
            type={selectedHub?.type}
            value={selectedHub?.value}
            onBack={goBack}
            onSongSelect={(song) => navigateTo('detail', song)}
          />
        );
      default:
        return (
          <div className="discovery-view">
            <div className="search-container glass-panel">
              <input
                type="text"
                placeholder="Search lyrics, artists..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
              {isSearching && <div className="search-spinner"></div>}
            </div>

            {searchQuery.length > 2 ? (
              <div className="search-results">
                <h2 className="section-title">Results for "{searchQuery}"</h2>
                <div className="grid-layout">
                  {searchResults.map(song => (
                    <div key={song.id} className="song-row glass-panel" onClick={() => navigateTo('detail', song)}>
                      <img src={song.image} alt={song.title} className="row-thumb" />
                      <div className="song-info">
                        <div className="row-title">{song.title}</div>
                        <div className="row-meta">{song.artist}</div>
                      </div>
                      <button className="view-song-btn">EXPLORE</button>
                    </div>
                  ))}
                  {searchResults.length === 0 && !isSearching && (
                    <div className="no-results">No matches found in our index.</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="discovery-pills">
                  <button className="pill-btn active" onClick={() => navigateTo('home')}>All</button>
                  <button className="pill-btn" onClick={() => navigateTo('hub', { type: 'genre', value: 'Pop' })}>Trends</button>
                  <button className="pill-btn" onClick={() => navigateTo('hub', { type: 'genre', value: 'R&B' })}>R&B</button>
                  <button className="pill-btn" onClick={() => navigateTo('hub', { type: 'language', value: 'English' })}>English</button>
                  <button className="pill-btn" onClick={() => navigateTo('hub', { type: 'genre', value: 'Global' })}>Global</button>
                </div>
                <Home onSongSelect={(song) => navigateTo('detail', song)} />
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="main-header glass-panel sticky">
        <div className="container header-content">
          <div className="logo" onClick={() => navigateTo('home')}>
            <span className="logo-text">LYRIVERSE</span>
          </div>
        </div>
      </header>

      <main className="main-content container">
        {renderPage()}
      </main>

      <nav className="mobile-nav glass-panel">
        <div className="nav-items">
          <button
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </button>
          <button className="nav-btn">
            <span className="nav-icon">🔥</span>
            <span className="nav-label">Hot</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => navigateTo('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
          <button className="nav-btn" onClick={() => user ? setUser(null) : setShowLogin(true)}>
            <span className="nav-icon">{user ? '🔓' : '👤'}</span>
            <span className="nav-label">{user ? 'Exit' : 'Admin'}</span>
          </button>
        </div>
      </nav>

      {showLogin && (
        <div className="login-overlay">
          <div className="login-modal glass-panel">
            <h3>Admin Authentication</h3>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Master username..."
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-share" onClick={() => setShowLogin(false)}>CANCEL</button>
                <button type="submit" className="btn-spotify">AUTHORIZE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .app-container {
          padding-bottom: 110px;
        }
        
        .main-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: var(--space-md) 0;
          border-radius: 0 0 16px 16px;
          margin-bottom: var(--space-md);
        }

        .header-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo {
          cursor: pointer;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 2px;
        }

        .discovery-pills {
          display: flex;
          gap: var(--space-sm);
          overflow-x: auto;
          padding-bottom: var(--space-md);
          scrollbar-width: none;
        }

        .discovery-pills::-webkit-scrollbar {
          display: none;
        }

        .pill-btn {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pill-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .mobile-nav {
          position: fixed;
          bottom: var(--space-md);
          left: var(--space-md);
          right: var(--space-md);
          height: 72px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .nav-items {
          display: flex;
          justify-content: space-around;
          width: 100%;
          padding: 0 var(--space-sm);
        }

        .nav-btn {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .nav-btn.active {
          color: var(--primary);
        }

        .nav-icon {
          font-size: 1.4rem;
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .settings-page {
          animation: fadeIn 0.3s ease;
        }

        .title-premium {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: var(--space-xl);
        }

        .login-prompt {
          padding: var(--space-xl);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          align-items: center;
        }

        .admin-tools {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .dashboard-card {
          padding: var(--space-lg);
        }

        .log-viewer {
          padding: var(--space-md);
          max-height: 300px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .logs-container {
          flex: 1;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: var(--space-sm);
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          overflow-y: auto;
          color: #00ff00;
        }

        .log-line {
          margin-bottom: 2px;
        }

        .report-card {
          padding: var(--space-lg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin: var(--space-md) 0;
        }

        .stat-item {
          text-align: center;
        }

        .s-label {
          display: block;
          font-size: 0.65rem;
          color: var(--text-dim);
          font-weight: 700;
        }

        .s-value {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--primary);
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-md);
        }

        .login-modal {
          width: 100%;
          max-width: 400px;
          padding: var(--space-xl);
        }

        .form-group {
          margin-bottom: var(--space-md);
        }

        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .form-group input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 12px;
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .form-actions {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .form-actions button {
          flex: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
