# dorms-check 점검 리포트

- 앱: 생태계 균형 맞추기 게임
- 주소: https://ais-dev-itb3ixcvp3yjsuqkxg4zxk-962247545765.asia-east1.run.app 
- 스택: Vite
- 점검 트랙: security, edzip

> 이 리포트는 dorms-check(코치)의 자체 점검 결과입니다. 최종 인증마크는 도름스 서버가 스스로 다시 검증해 발급하며, 이 리포트의 통과가 마크를 보장하지 않습니다.

## 보안 검토
- 점수: 92/100 (A-)
- 마크 자격(critical/high 0): 미충족

### 통과 항목(증빙)
- [v] Content-Security-Policy — 헤더값: default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https:; frame-ancestors 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'
- [v] Strict-Transport-Security — 헤더값: max-age=63072000; includeSubDomains
- [v] 클릭재킹 방어(X-Frame-Options / frame-ancestors) — 헤더값: SAMEORIGIN
- [v] X-Content-Type-Options: nosniff — 헤더값: nosniff
- [v] Referrer-Policy — 헤더값: strict-origin-when-cross-origin
- [v] Permissions-Policy — 헤더값: camera=(), microphone=(), geolocation=()
- [v] 서버/프레임워크 버전 노출 — x-powered-by 미노출(양호)
- [v] 구버전 TLS 미사용 — TLS 버전 양호: (측정 실패)
- [v] 민감 파일 노출(.env/.git) — 민감 파일(.env/.git) 노출 없음
- [v] 설정 파일 노출 — 설정 파일 비노출
- [v] 소스맵 노출 — 소스맵 참조 없음
- [v] 에러 스택트레이스 노출 — 스택트레이스 노출 없음
- [v] Mixed Content — mixed content 없음
- [v] CORS 설정 — CORS가 임의 Origin을 허용하지 않음(양호)
- [v] 페이지 제목 — <title> 있음
- [v] 설명 메타 — 설명 메타
- [v] 모바일 viewport — viewport 메타
- [v] Open Graph — Open Graph 태그
- [v] 응답 속도 — 응답 시간 112ms
- [v] 문서 크기 — 문서 크기 2KB
- [v] 개인정보처리방침 — server.ts:23-45 & src/components/PrivacyPolicyModal.tsx:1-149
- [v] 이용약관 — 이용약관 발견(link: /terms)
- [v] 연락처 — 연락처/문의 정보 있음
- [v] 하드코딩 시크릿 — 하드코딩 시크릿 미검출
- [v] 클라이언트 시크릿 노출 — 클라 시크릿 노출 미검출
- [v] 헤더 설정 위치 — server.ts:8-16 (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 구현)
- [v] 위험 코드 패턴(검토 후보) — 위험 코드 패턴 미검출

### 아직 고쳐야 할 항목
#### [critical] SSL 인증서 유효
- 무엇: 보안 인증서가 유효하지 않아요. 접속 자체가 안전하지 않다고 표시될 수 있어요.
- 지금 상태: TLS 연결 실패: connect ECONNREFUSED 127.0.0.1:443
- AI에게 이렇게 시켜주세요: `호스팅(예: Vercel)에서 도메인의 SSL 인증서를 정상 발급받도록 도메인 설정을 확인해줘.`

#### [high] HTTPS 강제(HTTP→HTTPS 리다이렉트)
- 무엇: http로 들어와도 암호화된 https로 자동 전환되지 않아, 중간에서 내용이 새거나 조작될 수 있어요.
- 지금 상태: HTTP 요청이 HTTPS로 강제되지 않음 (HTTP 0)
- AI에게 이렇게 시켜주세요: `Vite 앱에서 http 요청을 https 로 강제 리다이렉트하도록 설정해줘.`

### 참고(검토 권장, 마크 게이트 아님)
- canonical: canonical 링크
- 압축: 압축 미표기

## 학운위 심사 준비(에듀집 필수기준)
- 준비 상태: 충족(제출 서류 준비됨)
- 개인정보처리방침 공개: 있음

> "학운위 심사 준비 완료"는 학교 심의에 낼 서류가 갖춰졌다는 뜻이며, 심의 통과를 보장하지 않습니다. 심의와 최종 결정은 각 학교가 합니다.
