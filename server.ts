import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable("x-powered-by");

  // Set Security Headers for dorms-check & production security
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https:; frame-ancestors 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'");
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // Privacy Policy and Terms endpoints for scanner and direct page access
  app.get("/privacy", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>개인정보처리방침 - 생태계 균형 맞추기 게임</title>
</head>
<body style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6;">
  <h1>개인정보처리방침</h1>
  <p>본 앱('생태계 균형 맞추기 게임')은 사용자의 개인정보를 수집, 저장, 전송하지 않는 순수 단일 클라이언트 학습용 시뮬레이터입니다.</p>
  <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
  <p>본 앱은 회원가입이나 개인정보 입력 없이 이용 가능하며, 어떠한 개인정보(이름, 이메일, IP 등)도 수집하거나 외부 서버로 전송하지 않습니다.</p>
  <h2>2. 개인정보의 보유 및 이용 기간</h2>
  <p>개인정보를 수집하지 않으므로 보유하거나 파기할 개인정보가 존재하지 않습니다. 모든 게임 진행 상태는 사용자의 브라우저 메모리에만 일시 보관됩니다.</p>
  <h2>3. 제3자 제공 및 위탁</h2>
  <p>본 앱은 제3자에게 개인정보를 제공하거나 처리를 위탁하지 않습니다.</p>
  <h2>4. 만 14세 미만 아동의 개인정보 보호</h2>
  <p>본 앱은 아동의 식별정보나 학습 데이터를 외부로 전송하지 않는 안전한 학습 도구입니다.</p>
  <h2>5. 개인정보 보호책임자 및 문의</h2>
  <p>보호책임자: Gabriel Math (Gabriel Byeongje Jeon)<br>이메일: gabriel@gabrielmath.kr</p>
</body>
</html>`);
  });

  app.get("/terms", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>이용약관 - 생태계 균형 맞추기 게임</title>
</head>
<body style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6;">
  <h1>이용약관</h1>
  <p>본 약관은 '생태계 균형 맞추기 게임' 서비스 이용에 관한 사항을 규정합니다.</p>
  <p>1. 本 앱은 교육 및 학습 목적의 무료 생태계 시뮬레이션 게임입니다.</p>
  <p>2. 이용자는 본 앱을 자유롭게 무료로 탐구 학습 목적으로 이용할 수 있습니다.</p>
</body>
</html>`);
  });

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
