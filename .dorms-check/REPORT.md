# dorms-check 점검 리포트

- 앱: 생태계 균형 맞추기 게임
- 주소: https://ais-dev-itb3ixcvp3yjsuqkxg4zxk-962247545765.asia-east1.run.app 
- 스택: Vite
- 점검 트랙: security, edzip

> 이 리포트는 dorms-check(코치)의 자체 점검 결과입니다. 최종 인증마크는 도름스 서버가 스스로 다시 검증해 발급하며, 이 리포트의 통과가 마크를 보장하지 않습니다.

## 보안 검토
- 점수: 98/100 (A+)
- 마크 자격(critical/high 0): 충족

### 통과 항목(증빙)
- [v] Content-Security-Policy — server.ts:13 - Content-Security-Policy header configured
- [v] Strict-Transport-Security — server.ts:14 - Strict-Transport-Security header configured
- [v] 클릭재킹 방어(X-Frame-Options / frame-ancestors) — server.ts:15 - X-Frame-Options SAMEORIGIN header configured
- [v] X-Content-Type-Options: nosniff — server.ts:16 - X-Content-Type-Options nosniff header configured
- [v] Referrer-Policy — server.ts:17 - Referrer-Policy header configured
- [v] Permissions-Policy — server.ts:18 - Permissions-Policy header configured
- [v] 서버/프레임워크 버전 노출 — x-powered-by 미노출(양호)
- [v] HTTPS 강제(HTTP→HTTPS 리다이렉트) — HTTP 요청이 HTTPS로 리다이렉트됨 (HTTP 302 -> https://ais-dev-itb3ixcvp3yjsuqkxg4zxk-962247545765.asia-east1.run.app/)
- [v] SSL 인증서 유효 — TLS 연결 성공 (TLSv1.3)
- [v] 구버전 TLS 미사용 — TLS 버전 양호: TLSv1.3
- [v] 민감 파일 노출(.env/.git) — 민감 파일(.env/.git) 노출 없음
- [v] 설정 파일 노출 — 설정 파일 비노출
- [v] 소스맵 노출 — 소스맵 참조 없음
- [v] 에러 스택트레이스 노출 — 스택트레이스 노출 없음
- [v] Mixed Content — mixed content 없음
- [v] CORS 설정 — CORS가 임의 Origin을 허용하지 않음(양호)
- [v] 페이지 제목 — <title> 있음
- [v] 모바일 viewport — viewport 메타
- [v] 응답 속도 — 응답 시간 135ms
- [v] 문서 크기 — 문서 크기 10KB
- [v] 개인정보처리방침 — server.ts:23-45 & src/components/PrivacyPolicyModal.tsx:1-149
- [v] 이용약관 — 이용약관 발견(path: /terms)
- [v] 연락처 — 연락처/문의 정보 있음
- [v] 하드코딩 시크릿 — 하드코딩 시크릿 미검출
- [v] 클라이언트 시크릿 노출 — 클라 시크릿 노출 미검출
- [v] 헤더 설정 위치 — server.ts:8-16 (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 구현)
- [v] 위험 코드 패턴(검토 후보) — 위험 코드 패턴 미검출

### 아직 고쳐야 할 항목
#### [info] 설명 메타
- 무엇: meta description 이 없어요.
- 지금 상태: 설명 메타
- AI에게 이렇게 시켜주세요: `meta name="description" 을 넣어줘.`

#### [info] Open Graph
- 무엇: 링크 공유 미리보기(OG) 태그가 없어요.
- 지금 상태: Open Graph 태그
- AI에게 이렇게 시켜주세요: `og:title/og:description/og:image 메타를 넣어줘.`

### 참고(검토 권장, 마크 게이트 아님)
- canonical: canonical 링크
- 압축: 압축 미표기

## 학운위 심사 준비(에듀집 필수기준)
- 준비 상태: 충족(제출 서류 준비됨)
- 개인정보처리방침 공개: 있음

> "학운위 심사 준비 완료"는 학교 심의에 낼 서류가 갖춰졌다는 뜻이며, 심의 통과를 보장하지 않습니다. 심의와 최종 결정은 각 학교가 합니다.
