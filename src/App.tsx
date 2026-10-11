import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Team, RankedTeam } from './types/leaderboard';
import { fetchTeams, subscribeToTeams, isSupabaseConfigured } from './lib/supabase';
import { calculateCompetitionRanking } from './utils/ranking';
import { playVictoryChime, playRankUpSound } from './utils/sound';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { LeaderboardTable } from './components/LeaderboardTable';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { SpiderWebBackground } from './components/SpiderWebBackground';

export const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rankedTeams, setRankedTeams] = useState<RankedTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Route state: check if path is /admin or hash is #admin
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.toLowerCase() === '#admin'
      );
    }
    return false;
  });

  // Track previous top leader to trigger confetti on change
  const prevTopLeaderRef = useRef<{ id: string; score: number } | null>(null);

  // Load teams
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const { data } = await fetchTeams();
    if (data) {
      setTeams(data);
      const ranked = calculateCompetitionRanking(data);
      setRankedTeams(ranked);

      // Check if new leader took 1st place with positive score
      if (ranked.length > 0 && ranked[0].final_points > 0) {
        const currentTop = { id: ranked[0].captain_id, score: ranked[0].final_points };
        if (
          prevTopLeaderRef.current &&
          (prevTopLeaderRef.current.id !== currentTop.id ||
            currentTop.score > prevTopLeaderRef.current.score)
        ) {
          // Trigger celebration
          triggerCelebration();
          if (soundEnabled) playVictoryChime();
        }
        prevTopLeaderRef.current = currentTop;
      }
    }
    setIsRefreshing(false);
  }, [soundEnabled]);

  // Initial load and live subscription
  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToTeams(() => {
      loadData();
      if (soundEnabled) playRankUpSound();
    });

    return () => {
      unsubscribe();
    };
  }, [loadData, soundEnabled]);

  // Listen to popstate/hashchange for /admin routing
  useEffect(() => {
    const handleUrlChange = () => {
      const isNowAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.toLowerCase() === '#admin';
      setIsAdminView(isNowAdmin);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    setIsAdminView(true);
    window.location.hash = '#admin';
  };

  const navigateToPublic = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
  };

  const toggleProjectorMode = () => {
    const next = !isProjectorMode;
    setIsProjectorMode(next);
    if (next) {
      document.body.classList.add('projector-mode');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.body.classList.remove('projector-mode');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff1744', '#00e5ff', '#ffd700', '#ffffff'],
    });
  };

  const leadingPoints = rankedTeams.length > 0 ? rankedTeams[0].final_points : 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'var(--bg-deep)',
      }}
    >
      {/* Spider-Man Lattice Background & Canvas */}
      <SpiderWebBackground />

      {/* Top Navigation */}
      <Navbar
        isAdminView={isAdminView}
        onToggleAdmin={isAdminView ? navigateToPublic : navigateToAdmin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        isProjectorMode={isProjectorMode}
        onToggleProjector={toggleProjectorMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {isAdminView ? (
          <AdminDashboard
            teams={teams}
            onDataChanged={loadData}
            onBackToPublic={navigateToPublic}
          />
        ) : (
          <>
            <Header
              totalTeams={teams.length}
              leadingPoints={leadingPoints}
              isConnectedToSupabase={isSupabaseConfigured}
            />

            <LeaderboardTable
              teams={rankedTeams}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onOpenAdmin={navigateToAdmin}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
