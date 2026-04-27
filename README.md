# 차즘 보물찾기 힌트 모음

차즘(chazm.co.kr) × 김선태 콜라보 **"숨겨진 차키를 찾아라"** 이벤트의 힌트를 카드 뷰로 정리한 **비공식 팬 큐레이션** 사이트.

🔗 **https://chazm.sionyul.com**

## 왜 만들었나

공식 채팅방에서는 힌트가 빠르게 지나가서 전체를 한눈에 보기 어렵습니다. 이 페이지는 힌트를 카드로 정제해 누구나 쉽게 훑어볼 수 있게 만든 사이드 프로젝트입니다.

## 이벤트 메커니즘

- 차키를 찾으면 테슬라 모델 Y L 3년 운용리스 (선착순 1명, 현금 3,000만원 대체 가능)
- **온라인 힌트 트랙** · 4/24~4/29 매일 오후 6시 키워드/이미지 힌트 공개
- **그림카드 트랙** · 전국 **11곳** 거점에 QR 그림카드가 숨겨져 있고, 11장을 모두 조합하면 차키 위치가 드러남
- 다른 사람이 먼저 발견한 그림카드는 다음날 전체 공개 — 안 찾아도 진행은 되지만, 직접 찾으면 보너스
- 친구 초대 / 인기차량 견적받기로 보너스 그림카드 획득 가능
- 5/7까지 미발견 그림카드는 5/8 일괄 공개 · 차키 발견자가 나오면 즉시 종료

## 기술 스택

- 정적 HTML + [Alpine.js](https://alpinejs.dev/)
- [Pretendard](https://github.com/orioncactus/pretendard) + `nyjDasan` (차즘 공식과 동일한 손글씨 폰트)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) 기반 카드 morph 애니메이션
- [Cloudflare Pages](https://pages.cloudflare.com/) 자동 배포 + [Web Analytics](https://www.cloudflare.com/web-analytics/)
- 단일 `hints.json` 데이터 파일

번들러/빌드 도구 없음. `hints.json` 수정 → `git push` → 1~2분 후 반영.

## 로컬 개발

```bash
python3 dev.py
# http://127.0.0.1:8765
```

`dev.py`는 Cloudflare Pages의 clean URL(예: `/about`)을 로컬에서도 동일하게 매핑하는 14줄짜리 Python 래퍼입니다. 표준 `python3 -m http.server`는 `/about`을 404로 떨어뜨리기 때문에 nav 링크가 깨집니다.

## 힌트 제보

공식 채팅방에 **이미 공개된** 힌트만 수록합니다. 사전 유출은 다루지 않습니다.

- [GitHub Issues → 힌트 제보](https://github.com/kathar0s/chazm-tesla-event/issues/new?template=hint-report.yml)
- 사이트 검색에서 **없는 키워드**를 입력하면 해당 템플릿으로 바로 이동하는 링크가 노출됩니다

## 공식 링크

- 차즘 공식 이벤트: https://chazm.co.kr/treasure
- 오픈 채팅방 (참여자 정보 공유): https://open.kakao.com/o/p8FeFVri

## 면책

차즘과 공식적으로 관련이 없는 팬 큐레이션입니다. 이벤트 규칙/상품/일정은 공식 페이지를 기준으로 합니다.
