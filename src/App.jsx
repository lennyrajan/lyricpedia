import React, { useState } from 'react';
import './index.css';
import Home from './pages/Home';
import SongDetail from './pages/SongDetail';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import Hub from './pages/Hub';
import { songService } from './services/songService';

const App = () => {
  const [user, setUser] = useState({ username: 'mastermad' });
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
    setUser({ username: 'mastermad' });
    setShowLogin(false);
    setLoginForm({ username: '', password: '' });
  };

  // In production, this would be your worker URL
  // PASTE YOUR WORKER URL HERE (from the terminal after running 'npx wrangler deploy')
  const WORKER_URL = 'https://lyriverse-brain.lennyrajan.workers.dev';

  const startReindexing = async () => {
    setIsIndexing(true);
    setIndexingLogs(['Initiating remote discovery engine...']);

    try {
      const res = await fetch(`${WORKER_URL}/api/index`, { method: 'POST' });
      if (res.ok) {
        setIndexingLogs(prev => [...prev, '--- Indexing Triggered Successfully ---', 'The Cloud Scraper is now running in the background.', 'Updates will reflect in ~2 minutes.']);
        // Poll for report after a delay
        setTimeout(fetchReport, 5000);
      } else {
        throw new Error('Trigger failed');
      }
    } catch (e) {
      setIndexingLogs(prev => [...prev, '[ERROR] Could not connect to Cloud Worker. Ensure Worker is deployed.']);
    } finally {
      setIsIndexing(false);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/report`);
      if (res.ok) {
        const data = await res.json();
        setAdminReport(data);
      }
    } catch (e) {
      console.log('Failed to fetch report');
    }
  };

  const [categories, setCategories] = useState({ languages: [], genres: [] });

  React.useEffect(() => {
    const loadCategories = async () => {
      const [langs, genres] = await Promise.all([
        songService.getUniqueLanguages(),
        songService.getUniqueGenres()
      ]);
      setCategories({ languages: langs, genres: genres });
    };
    if (currentPage === 'home') loadCategories();
  }, [currentPage]);

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
                <h3>Cloud Discovery Management</h3>
                <p>Trigger an autonomous sweep of the latest trends.</p>
                <div className="status-badge">SELF-CONTAINED (CLOUDFLARE)</div>
                <button
                  className="btn-spotify"
                  onClick={startReindexing}
                  disabled={isIndexing}
                >
                  {isIndexing ? 'TRIGGERING...' : 'INVOKE CLOUD INDEX'}
                </button>
              </div>

              {indexingLogs.length > 0 && (
                <div className="log-viewer glass-panel">
                  <h4>Cloud Execution Status</h4>
                  <div className="logs-container">
                    {indexingLogs.map((log, i) => <div key={i} className="log-line">{log}</div>)}
                  </div>
                </div>
              )}

              {adminReport && (
                <div className="report-card glass-panel">
                  <h4>Cloud Discovery Report</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="s-label">WEBSITE TRACKS</span>
                      <span className="s-value">{adminReport.scanned_web || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="s-label">INTERNAL SEEDS</span>
                      <span className="s-value">{adminReport.seeded_internal || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="s-label">TOTAL INDEXED</span>
                      <span className="s-value">{adminReport.total_active_index || 0}</span>
                    </div>
                  </div>

                  <div className="diagnostic-box">
                    <div className="diag-line"><b>Scraper:</b> {adminReport.diag_base_scrape || 'Outdated Worker Detected'}</div>
                    <div className="diag-line"><b>Storage (KV):</b> {adminReport.diag_kv_status || 'Outdated Worker Detected'}</div>
                  </div>

                  <p className="report-meta">Last sync: {adminReport.last_sync ? new Date(adminReport.last_sync).toLocaleString() : 'Old Version'}</p>
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
            <div className={`search-container-modern ${searchQuery ? 'active' : ''}`}>
              <div className="search-glass">
                <span className="search-icon-svg">🔍</span>
                <input
                  type="text"
                  placeholder="Search lyrics, artists, languages..."
                  className="search-input-premium"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {isSearching && <div className="search-spinner-modern"></div>}
              </div>
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
                        <div className="row-meta">{song.artist} • {song.language}</div>
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
                <div className="discovery-pills-wrapper">
                  <div className="discovery-pills">
                    <button
                      className={`pill-btn ${!selectedHub ? 'active' : ''}`}
                      onClick={() => navigateTo('home')}
                    >All</button>

                    {categories.languages.map(lang => (
                      <button
                        key={lang}
                        className={`pill-btn ${selectedHub?.value === lang ? 'active' : ''}`}
                        onClick={() => navigateTo('hub', { type: 'language', value: lang })}
                      >
                        {lang}
                      </button>
                    ))}

                    {categories.genres.filter(g => !['Pop', 'Charts'].includes(g)).map(genre => (
                      <button
                        key={genre}
                        className={`pill-btn ${selectedHub?.value === genre ? 'active' : ''}`}
                        onClick={() => navigateTo('hub', { type: 'genre', value: genre })}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
                <Home
                  onSongSelect={(song) => navigateTo('detail', song)}
                  onLanguageSelect={(lang) => navigateTo('hub', { type: 'language', value: lang })}
                />
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
          <button
            className={`nav-btn ${currentPage === 'hub' && selectedHub?.value === 'Pop' ? 'active' : ''}`}
            onClick={() => navigateTo('hub', { type: 'genre', value: 'Pop' })}
          >
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
          position: relative;
        }

        .status-badge {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          background: var(--accent);
          color: white;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 1px;
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

        .search-container-modern {
          margin-bottom: var(--space-xl);
          transition: transform 0.3s ease;
        }
        .search-container-modern.active {
          transform: translateY(-5px);
        }
        .search-glass {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 12px 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-glass:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary);
          box-shadow: 0 8px 32px 0 rgba(var(--primary-rgb), 0.2);
          transform: scale(1.01);
        }
        .search-icon-svg {
          font-size: 1.2rem;
          opacity: 0.6;
        }
        .search-input-premium {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1.1rem;
          font-weight: 500;
          outline: none;
        }
        .search-input-premium::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .search-spinner-modern {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .diagnostic-box {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: var(--space-sm);
          margin-top: var(--space-md);
          border: 1px solid var(--glass-border);
        }
        .diag-line {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 4px;
          font-family: monospace;
        }
        .diag-line b { color: var(--primary); }
      `}</style>
    </div>
  );
};

export default App;
