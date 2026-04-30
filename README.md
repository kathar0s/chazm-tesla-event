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

## 이벤트 아카이브

이벤트는 **2026-04-29** 그림카드 11개 중 10개 발견 후 모델 Y L 차키의 주인공이 나오면서 종료되었습니다.

원본 공식 이벤트 페이지(https://chazm.co.kr/treasure)는 추후 변경/삭제될 수 있으므로 아래 자료들을 보존합니다.

### 공식 안내 화면

| 화면 | 파일 |
|------|------|
| 이벤트 인트로 | [event-intro.png](assets/screenshots/event-intro.png) |
| 이벤트 안내 (참여 방법, 모델 Y L 경품) | [event-info-1.png](assets/screenshots/event-info-1.png) |
| 모델 Y L 외 경품 / 유의 사항 | [event-info-2.png](assets/screenshots/event-info-2.png) |
| 종료 안내 | [event-end.png](assets/screenshots/event-end.png) |
| 종료 일러스트 | [ending-image.png](assets/treasure/ending-image.png) |

### 이벤트 안내 (원문)

**[이벤트 안내]**

- 차즘×김선태의 '숨겨진 차키를 찾아라'(이하 이벤트)는 숨겨진 테슬라 모델Y L 차키를 찾는 보물찾기 이벤트
- 이벤트 기간: 2026년 4월 24일부터 모델 Y L 차키를 찾는 당첨자가 나올 때까지 운영
- 회사 사정에 따라 조기 종료되거나 연장될 수 있음
- 참여 제한: 만 19세 미만은 참여하거나 경품을 받을 수 없음

**[참여 방법]**

1. 이벤트 페이지에서 매일 힌트를 한 개씩 받음 (4월 24일~4월 29일, 6일간)
2. 받은 힌트로 그림카드 위치 파악 — 그림카드는 오프라인 11곳에 숨겨져 있고 QR을 찍으면 나타남
3. 오프라인에 숨겨진 그림카드를 조합하면 차키 위치를 알 수 있음
4. 다른 사람이 먼저 발견한 그림카드는 24시간 후 전체 공개
5. 차키를 찾고 QR을 등록 (경품 수령을 위해 필수)

**[참여 유의사항]**

- 그림카드/차키는 출입이 허용된 구역에만 위치하며 폐쇄된 건물 내부나 별도의 허가가 필요한 통제 구역에는 존재하지 않음
- 참여 과정에서 안전사고 및 법적 분쟁이 발생하지 않도록 공공질서와 안전수칙 준수

### 경품 안내

**1. 모델 Y L 3년 무료 리스**

- 테슬라 모델 Y L 운용리스 3년 계약 무료
- 수령 조건
  - 당첨 QR을 등록한 본인에 한해 수령 가능
  - 당첨 QR 등록 시점에 만 21세 이상이며, 유효한 2종 보통 이상 운전면허를 보유한 대한민국 국적자
  - 위 조건 미충족 및 리스 계약이 불가하거나 현금 수령을 희망하는 경우 현금 3,000만 원으로 대체
  - 리스 계약은 차즘이 지정한 금융사를 통해 진행
  - 운용리스 계약 시 차량 보험은 당첨자가 별도로 가입
- 제세공과금 22% 당첨자 본인 부담 (전액 현금)
- 차량 출고 최대 6개월 소요, 6개월 초과 시 현금 3,000만 원으로 대체

**2. 모델 Y L 외 경품**

- 닌텐도 스위치 2, 애플워치 SE3, 아웃백 10만 원권, 코난 음성변조 나비넥타이 등 랜덤 선물
- 각 그림카드를 발견한 최초 1인에게 지급
- 모델 Y L을 제외한 모든 경품에 대한 제세공과금은 차즘에서 부담
- **모델 Y L 차키의 주인공이 먼저 나올 경우, 지급 가능한 경품이 있더라도 이벤트는 종료되며 경품 지급도 함께 종료**

### 종료 안내 (원문)

**[이벤트 종료 안내]**

- 차즘×김선태 '숨겨진 차키를 찾아라' 이벤트 종료
- 총 11개의 그림카드 중 **10개 발견 후 모델 YL 차키의 주인공이 나왔으며** 이에 따라 이벤트가 종료
- 발견된 10개 그림카드의 경품 당첨자에게는 영업일 기준 5일 이내에 이벤트 담당자가 개별 연락
- 모델 YL 3년 무료 리스 경품 당첨자에게는 영업일 기준 5일 이내에 이벤트 담당자가 개별 연락
- 경품 수령 조건, 제세공과금 부담, 개인정보 제공 동의 등 세부 사항은 기존 이벤트 안내의 '경품 안내' 및 '유의 사항'을 따름

**문의:** help@dnp.im

## 보안 인시던트 메모: S3 버킷 public list 권한 노출

이벤트 종료 후 확인 결과, 차즘 측 CDN 백엔드 S3 버킷이 `s3:ListBucket` 권한이 public으로 열려 있는 상태였음을 발견했습니다. 즉 **이벤트 진행 중 누구든 `https://cdn.chazm.co.kr/` 루트에 GET 요청만 보내면 전체 객체 목록을 XML로 받을 수 있었음**.

### 확인 방법 (재현 가능)

```bash
# 응답 헤더에서 S3 origin 노출
curl -sI https://cdn.chazm.co.kr/
# → server: AmazonS3
# → x-amz-bucket-region: ap-northeast-2
# → x-amz-bucket-arn: arn:aws:s3:::s3-an2-prd-frontend-web-cdn

# 루트 GET → ListBucketResult XML
curl -s https://cdn.chazm.co.kr/ | head

# prefix 필터로 폴더 단위 listing
curl -s "https://cdn.chazm.co.kr/?prefix=treasure/"
```

### 노출된 자산 타임라인 (`treasure/` prefix 기준 77개 객체)

| 업로드 시점 | 개수 | 내용 |
|------------|-----|------|
| **2026-04-23 19:10** (이벤트 시작 전날) | 22개 | 11개 그림카드 마스터 일러스트(PNG 822×720) + 11개 경품 사진(JPG 600×426) |
| 2026-04-23 19:49 | 12개 | 차즘 캐릭터 아이콘(187×187, 5,403 bytes 동일) — 중복 업로드 |
| 2026-04-26 03:11 | 11개 | 그림카드 공개 버전 ("그림카드 힌트 No.X" 헤더 포함, JPG) |
| 2026-04-26 05:43 | 7개 | 3일차 이미지 힌트 |
| 2026-04-27 08:21 | 1개 | 4일차 1611호 회의실 사진 |
| 2026-04-28 07:37 | 11개 | 4/23 마스터 일러스트와 동일 콘텐츠 PNG 재업로드 |
| 2026-04-29 05:09–10:04 | 11개 | 6일차 사진 힌트 |
| 2026-04-29 05:17 | 1개 | Beats Pill 경품 사진 추가분 |

### 잠재적 영향

- **이벤트 시작 전 시점에 그림카드 11장의 일러스트가 모두 업로드 완료**되어 있었기 때문에, 이 버킷을 listing 한 사람은 이벤트 시작 전부터 어떤 그림이 어떤 카드인지 매핑을 시도할 수 있었음.
- 4/23 19:10 마스터 일러스트(헤더 없는 원본)와 4/26 03:11 공개 버전(헤더 포함)을 비교하면 **각 일러스트가 어떤 "그림카드 힌트 No.X"에 해당하는지 매핑 가능**.
- 경품 종류와 모양도 사전에 노출됨.
- 직접적인 차키 위치까지 드러나지는 않았으나, 그림카드 분석 단계에서 큰 부정 우위를 가질 수 있었음.

### 보존된 증거

- `assets/treasure/` — 이벤트 중 공식적으로 공개된 30개 이미지
- `assets/treasure/leaked/` — public listing으로만 접근 가능했던 46개 추가 파일 (13MB)
- `assets/treasure/leaked/_bucket-listing-root-first1000.xml` — 루트 listing 응답 (1000건)
- `assets/treasure/leaked/_bucket-listing-treasure-prefix.xml` — `treasure/` prefix listing 응답

### 권장 조치

운영자(차즘) 입장에서는 다음 중 하나를 적용해 list 권한을 닫는 것이 표준 대응입니다.

```json
// 버킷 정책 — Public list 명시 차단
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:ListBucket",
  "Resource": "arn:aws:s3:::s3-an2-prd-frontend-web-cdn"
}
```

또는 S3 Block Public Access 설정에서 "Block public access to buckets and objects granted through any access control lists (ACLs)" 활성화. CloudFront만 origin으로 두고 OAI/OAC로 직접 접근을 막는 방식도 가능.

## 면책

차즘과 공식적으로 관련이 없는 팬 큐레이션입니다. 이벤트 규칙/상품/일정은 공식 페이지를 기준으로 합니다.
