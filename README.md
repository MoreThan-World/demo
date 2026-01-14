# Evaluation | Record Marketplace (Frontend MVP)

프론트/디자인을 먼저 완성하기 위한 실서비스 수준의 음반 거래 MVP UI입니다. 백엔드는 아직 붙이지 않았으며, mock 데이터 + fake API로 동작합니다.

## 화면 흐름
- 검색/필터 → Variant 상세 → Listing 상세 → 구매(샌드박스 결제) → 주문 상태
- 오퍼 제출/수락/카운터 흐름
- 마이페이지(내 오퍼/관심/판매/주문)

## 폴더 구조
```
src/
  app/                  # 앱 엔트리
    App.jsx
    App.css
  features/             # 기능별 도메인 (2~3단계에서 확장)
    variants/
    listings/
    orders/
    offers/
    auth/
  shared/
    lib/                # mock API, utils, constants
    styles/             # tokens, base, components
    ui/                 # 공통 UI 컴포넌트
  test/
    setup.js
```

## Mock API 교체 방법
`src/shared/lib/api.js`에서 `fetchMarketData()`가 현재 mock 데이터를 반환합니다.
Firebase 또는 백엔드 연동 시, 이 함수에서 실제 API 호출로 교체하면 전체 화면이 그대로 동작하도록 설계되어 있습니다.

## 실행 방법
```
npm install
npm run dev
```

## 테스트
```
npm run test
```

## UI 체크리스트
- 반응형: 모바일/태블릿/데스크톱 레이아웃 확인
- 접근성: 탭 포커스, aria-label, 키보드 클릭 가능
- 상태: loading / empty / error 모두 제공
- 텍스트 톤: 한국 서비스 톤 유지
- 가격 표시: 원화 천 단위 표기
