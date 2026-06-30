import { useAscendStore } from './store/useAscendStore';
import Landing from './components/Landing';
import SkillTree from './components/SkillTree';
import LessonView from './components/LessonView';
import TimeTracker from './components/TimeTracker';
import ProgressDashboard from './components/ProgressDashboard';
import XPEditor from './components/XPEditor';

export default function App() {
  const view = useAscendStore((s) => s.view);
  const activeLesson = useAscendStore((s) => s.activeLesson);

  if (view === 'landing') return <Landing />;

  return (
    <>
      <SkillTree />
      <TimeTracker />
      <ProgressDashboard />
      <XPEditor />
      {activeLesson && <LessonView />}
    </>
  );
}
