import { lazy, Suspense, useEffect } from 'react';
import { useAscendStore } from './store/useAscendStore';
import Landing from './components/Landing';
import SkillTree from './components/SkillTree';

// Overlays are code-split: they load on demand, keeping the main bundle
// (canvas + store + lesson data) as small as possible.
const LessonView = lazy(() => import('./components/LessonView'));
const TimeTracker = lazy(() => import('./components/TimeTracker'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
const XPEditor = lazy(() => import('./components/XPEditor'));
const SkillSprint = lazy(() => import('./components/SkillSprint'));
const ReviewQueue = lazy(() => import('./components/ReviewQueue'));
const AccountPanel = lazy(() => import('./components/AccountPanel'));

export default function App() {
  const view = useAscendStore((s) => s.view);
  const activeLesson = useAscendStore((s) => s.activeLesson);

  // Restore any existing cloud session and wire auto-sync (no-op if unconfigured).
  // Dynamic import keeps supabase-js (~170KB) out of the critical main bundle.
  useEffect(() => {
    void import('./lib/sync').then((m) => m.initSync());
  }, []);

  if (view === 'landing') return <Landing />;

  return (
    <>
      <SkillTree />
      <Suspense fallback={null}>
        <TimeTracker />
        <ProgressDashboard />
        <XPEditor />
        <SkillSprint />
        <ReviewQueue />
        <AccountPanel />
        {activeLesson && <LessonView />}
      </Suspense>
    </>
  );
}
