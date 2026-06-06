import { useState } from 'react';
import { COLORS } from '../cube/facelets';
import type { Face } from '../cube/notation';
import { useStore } from '../state/store';

const PALETTE: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
const CENTERS = new Set([4, 13, 22, 31, 40, 49]);

// Facelet start index per face for the unfolded net.
const FACE_START: Record<string, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };

function FaceGrid({ face, paint }: { face: string; paint: Face }) {
  const facelet = useStore((s) => s.facelet);
  const paintSticker = useStore((s) => s.paintSticker);
  const start = FACE_START[face];
  return (
    <div className="face-grid">
      {Array.from({ length: 9 }, (_, k) => {
        const idx = start + k;
        const isCenter = CENTERS.has(idx);
        return (
          <button
            key={idx}
            className="sticker"
            disabled={isCenter}
            style={{ background: COLORS[facelet[idx] as Face] }}
            onClick={() => !isCenter && paintSticker(idx, paint)}
            aria-label={`${face}면 ${k + 1}번`}
          />
        );
      })}
    </div>
  );
}

/** Unfolded-net editor: pick a colour, tap stickers to set the cube state. */
export function ColorInput() {
  const [paint, setPaint] = useState<Face>('U');
  return (
    <div className="color-input">
      <div className="palette">
        {PALETTE.map((f) => (
          <button
            key={f}
            className={`swatch${paint === f ? ' active' : ''}`}
            style={{ background: COLORS[f] }}
            onClick={() => setPaint(f)}
            aria-label={`${f}색 선택`}
          />
        ))}
        <span className="hint">색을 고른 뒤 칸을 탭하세요</span>
      </div>
      <div className="net">
        <div className="net-row">
          <div className="net-spacer" />
          <FaceGrid face="U" paint={paint} />
          <div className="net-spacer" />
          <div className="net-spacer" />
        </div>
        <div className="net-row">
          <FaceGrid face="L" paint={paint} />
          <FaceGrid face="F" paint={paint} />
          <FaceGrid face="R" paint={paint} />
          <FaceGrid face="B" paint={paint} />
        </div>
        <div className="net-row">
          <div className="net-spacer" />
          <FaceGrid face="D" paint={paint} />
          <div className="net-spacer" />
          <div className="net-spacer" />
        </div>
      </div>
    </div>
  );
}
