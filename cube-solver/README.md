# 큐브 코치 (cube-solver)

루빅스 큐브를 **3D로 보며 단계별로 맞추는 것을 도와주는** 웹 앱(PWA)입니다.

- 🧊 **3D 큐브** — 손가락/마우스로 360° 자유롭게 돌려볼 수 있습니다 (Three.js + OrbitControls).
- 🎨 **색 직접 입력** — 펼친 전개도에서 색을 탭해 현재 큐브 상태를 입력합니다. *(2단계에서 카메라 인식 예정)*
- 🧠 **두 가지 해법 모드**
  - **최단 해법** — Kociemba 2-phase (약 20수)
  - **쉬운 해법** — 초보자용 레이어 방식(CFOP) 공식 위주
- 🔁 **트리거 패턴 안내** — `R U R' U'` 같은 흔한 수순을 **"트위스트 한 번"** 처럼 이름으로 묶어 보여줍니다 (원래 표기도 함께 표시).
- 👣 **단계별 재생** — 각 수순을 3D 큐브에서 애니메이션으로 보여주고 다음/이전으로 따라갈 수 있습니다.

## 기술 스택

Vite · React · TypeScript · @react-three/fiber + drei (Three.js) · zustand · vite-plugin-pwa ·
[cubejs](https://www.npmjs.com/package/cubejs) (Kociemba) · [rubiks-cube-solver](https://www.npmjs.com/package/rubiks-cube-solver) (CFOP)

## 개발

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드
npm test         # 단위 테스트 (vitest)
```

## 구조

```
src/
  cube/      # facelet 상태 모델, 무브 표기, 3D 기하(=cubejs 검증), cubejs 엔진 래퍼
  solver/    # 최단(워커) / 초보 솔버 + 모드 통합
  patterns/  # 트리거 사전 + 최장일치 패턴 검출
  three/     # 3D 씬 + 큐브 + 무브 애니메이션
  ui/        # 색 입력(전개도), 모드 선택, 단계 플레이어
  state/     # zustand 스토어
```

### 정확성 검증

`cube/geometry.ts`의 3D 회전·매핑은 `cube/cube.test.ts`에서 **37종 무브 전체에 대해 cubejs
엔진과 1:1로 일치**함을 검증합니다. 초보 솔버 입력 변환은 라이브러리 README의 정답 벡터로,
풀이는 무작위 스크램블에 적용해 완성되는지로 검증합니다.

## 로드맵 (2단계)

- 📷 **카메라 인식** — 카메라를 들고 큐브를 한 면씩 돌리며 스티커 이동을 추적해 6면을 자동 인식.
