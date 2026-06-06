import { SOLVE_MODE_LABELS, type SolveMode } from '../solver';
import { useStore } from '../state/store';

const MODES: SolveMode[] = ['beginner', 'optimal'];

/** Choose between the easy (beginner) and shortest (optimal) solving methods. */
export function ModeSelector() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  return (
    <div className="mode-selector">
      {MODES.map((m) => {
        const { title, subtitle } = SOLVE_MODE_LABELS[m];
        return (
          <button
            key={m}
            className={`mode-card${mode === m ? ' active' : ''}`}
            onClick={() => setMode(m)}
          >
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}
