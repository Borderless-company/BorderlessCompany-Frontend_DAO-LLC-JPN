import "@testing-library/jest-dom";

// Jest環境変数設定（TypeScriptの型エラーを回避）
Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
});
Object.defineProperty(process.env, "JWT_SECRET", {
  value: "test_jwt_secret_key_32_chars_long",
  writable: true,
});
Object.defineProperty(process.env, "SUPABASE_URL", {
  value: "https://test-project.supabase.co",
  writable: true,
});
Object.defineProperty(process.env, "SUPABASE_ANON_KEY", {
  value: "test_anon_key",
  writable: true,
});
Object.defineProperty(process.env, "SUPABASE_SERVICE_KEY", {
  value: "test_service_key",
  writable: true,
});

// テスト用グローバル設定
global.fetch = jest.fn();

// コンソールエラーを抑制（テスト時の不要なログを削減）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    return originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 各テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
  if (global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
});
