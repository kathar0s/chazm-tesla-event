import { Scene } from './three/Scene';
import { ColorInput } from './ui/ColorInput';
import { ModeSelector } from './ui/ModeSelector';
import { StepPlayer } from './ui/StepPlayer';
import { useStore } from './state/store';

export default function App() {
  const phase = useStore((s) => s.phase);
  const solving = useStore((s) => s.solving);
  const error = useStore((s) => s.error);
  const randomScramble = useStore((s) => s.randomScramble);
  const reset = useStore((s) => s.reset);
  const startSolve = useStore((s) => s.startSolve);
  const backToInput = useStore((s) => s.backToInput);

  return (
    <div className="app">
      <header className="app-header">
        <h1>큐브 코치</h1>
        <p>손으로 돌려보고, 색을 맞춰 입력하면 단계별로 풀이를 알려드려요.</p>
      </header>

      <div className="viewport">
        <Scene />
      </div>

      <main className="panel">
        {phase === 'input' ? (
          <>
            <ModeSelector />
            <ColorInput />
            {error && <div className="error">{error}</div>}
            <div className="actions">
              <button onClick={randomScramble}>🎲 랜덤 섞기</button>
              <button onClick={reset}>↺ 초기화</button>
              <button className="primary" onClick={startSolve} disabled={solving}>
                {solving ? '계산 중…' : '이 상태 풀기 →'}
              </button>
            </div>
          </>
        ) : (
          <>
            <StepPlayer />
            <div className="actions">
              <button onClick={backToInput}>← 색 다시 입력</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
