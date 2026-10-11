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
import { TeamRegistration } from './components/TeamRegistration';
import { Footer } from './components/Footer';
import { SpiderWebBackground } from './components/SpiderWebBackground';

export const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rankedTeams, setRankedTeams] = useState<RankedTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Route state: /admin or #admin (organizer), /register or #register (teams)
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.toLowerCase() === '#admin'
      );
    }
    return false;
  });
  const [isRegisterView, setIsRegisterView] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/register') ||
        window.location.hash.toLowerCase() === '#register'
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

  // Listen to popstate/hashchange for /admin and /register routing
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.toLowerCase();
      setIsAdminView(path.startsWith('/admin') || hash === '#admin');
      setIsRegisterView(path.startsWith('/register') || hash === '#register');
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
    setIsRegisterView(false);
    window.location.hash = '#admin';
  };

  const navigateToRegister = () => {
    setIsRegisterView(true);
    setIsAdminView(false);
    window.location.hash = '#register';
  };

  const navigateToPublic = () => {
    setIsAdminView(false);
    setIsRegisterView(false);
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.pathname !== '/') {
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
        isRegisterView={isRegisterView}
        onToggleAdmin={isAdminView ? navigateToPublic : navigateToAdmin}
        onToggleRegister={isRegisterView ? navigateToPublic : navigateToRegister}
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
        ) : isRegisterView ? (
          <TeamRegistration
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
              onOpenRegister={navigateToRegister}
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
