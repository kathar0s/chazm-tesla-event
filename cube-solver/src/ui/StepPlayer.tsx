import { stepLabel } from '../patterns/detectPatterns';
import { isFaceletSolved, useStore, currentStepIndex } from '../state/store';

/** Step-by-step guide: shows the current trigger/move and drives the 3D animation. */
export function StepPlayer() {
  const steps = useStore((s) => s.steps);
  const cursor = useStore((s) => s.cursor);
  const queue = useStore((s) => s.queue);
  const facelet = useStore((s) => s.facelet);
  const playNextStep = useStore((s) => s.playNextStep);
  const gotoStep = useStore((s) => s.gotoStep);

  const stepIdx = currentStepIndex(steps, cursor);
  const animating = queue.length > 0;
  const solved = isFaceletSolved(facelet);
  const done = stepIdx >= steps.length;
  const current = steps[stepIdx];

  return (
    <div className="step-player">
      <div className="step-progress">
        <span>
          {Math.min(stepIdx, steps.length)} / {steps.length} 단계
        </span>
        <div className="bar">
          <div
            className="bar-fill"
            style={{ width: `${steps.length ? (stepIdx / steps.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {solved ? (
        <div className="step-current solved">🎉 큐브를 다 맞췄어요!</div>
      ) : current ? (
        <div className="step-current">
          <div className="step-label">{stepLabel(current)}</div>
          {current.trigger && <div className="step-alias">{current.trigger.alias}</div>}
          <div className="step-moves">
            {current.moves.map((m, i) => (
              <span key={i} className="move-chip">
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="step-controls">
        <button onClick={() => gotoStep(stepIdx - 1)} disabled={stepIdx <= 0 || animating}>
          ◀ 이전
        </button>
        <button className="primary" onClick={playNextStep} disabled={done || animating}>
          {animating ? '…' : '다음 ▶'}
        </button>
      </div>

      <ol className="step-list">
        {steps.map((s, i) => (
          <li key={i} className={i === stepIdx ? 'active' : i < stepIdx ? 'done' : ''}>
            <span className="num">{i + 1}</span>
            {stepLabel(s)}
          </li>
        ))}
      </ol>
    </div>
  );
}
