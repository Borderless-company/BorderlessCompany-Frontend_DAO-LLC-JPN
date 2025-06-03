import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/uploadfile";
import { createMocks } from "node-mocks-http";

// Supabaseクライアントのモック
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({
          data: {
            publicUrl: "https://fake-storage.supabase.co/attack-file.exe",
          },
        })),
      })),
    },
  })),
}));

describe("/api/uploadfile - ファイルアップロード脆弱性テスト", () => {
  let mockUpload: jest.Mock;
  let mockGetPublicUrl: jest.Mock;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Supabaseモックの詳細設定
    mockUpload = jest.fn();
    mockGetPublicUrl = jest.fn();
    mockFrom = jest.fn();

    const { createClient } = require("@supabase/supabase-js");
    const mockSupabase = createClient();

    // モック関数の設定
    mockFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    mockSupabase.storage.from = mockFrom;

    // デフォルトで成功レスポンスを返すように設定
    mockUpload.mockResolvedValue({
      data: { path: "uploaded-file" },
      error: null,
    });

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://fake-storage.supabase.co/uploaded-file" },
    });
  });

  describe("🚨 CRITICAL: 認証なしアップロード脆弱性", () => {
    it("認証チェックなしでアップロードエンドポイントにアクセス可能（脆弱性）", async () => {
      // Arrange: 認証なしのリクエスト
      const base64Image =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // 1x1px白画像

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "images/attack.png",
          base64: base64Image,
          contentType: "image/png",
        },
      });

      // Act: ファイルアップロード実行
      await handler(req, res);

      // Assert: 🚨 認証チェックなしで処理が進む（401エラーが返されない）
      // 実際は500エラーになるが、これは認証チェックを通過した証拠
      expect(res._getStatusCode()).not.toBe(401); // 認証エラーではない
      expect(res._getStatusCode()).not.toBe(403); // 認可エラーでもない

      // ファイルアップロード処理が実際に実行されたことを確認
      expect(mockFrom).toHaveBeenCalledWith("uploads");
    });

    it("大容量ファイルアップロードに対する制限なし（DoS脆弱性）", async () => {
      // Arrange: 大容量データ（実際は小さなサンプル）
      const largeBase64 = "A".repeat(1024); // 1KB（実際のテストでは小さく）

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "large-attack-file.bin",
          base64: largeBase64,
          contentType: "application/octet-stream",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 サイズ制限チェックなし（401/413エラーが返されない）
      expect(res._getStatusCode()).not.toBe(413); // Payload Too Largeエラーではない
      expect(res._getStatusCode()).not.toBe(401); // 認証エラーでもない
    });
  });

  describe("🔍 ファイル形式チェック抜けテスト", () => {
    it("実行ファイル(.exe)アップロードの形式チェックなし（脆弱性）", async () => {
      // Arrange: 悪意ある実行ファイルのシグネチャ
      const maliciousBase64 =
        "TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAA"; // PE header

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "malware.exe",
          base64: maliciousBase64,
          contentType: "application/x-msdownload",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 ファイル形式チェックなし（400エラーが返されない）
      expect(res._getStatusCode()).not.toBe(400); // Bad Requestエラーではない
      expect(res._getStatusCode()).not.toBe(415); // Unsupported Media Typeエラーでもない

      // 危険なファイル形式でも処理が進むことを確認
      expect(mockFrom).toHaveBeenCalledWith("uploads");
    });

    it("スクリプトファイル(.js)の形式チェックなし（XSS脆弱性）", async () => {
      // Arrange: 悪意あるJavaScriptファイル
      const jsCode = Buffer.from(
        'alert("XSS Attack via uploaded JS file");'
      ).toString("base64");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "attack.js",
          base64: jsCode,
          contentType: "application/javascript",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 スクリプトファイルが拒否されない
      expect(res._getStatusCode()).not.toBe(400);
      expect(res._getStatusCode()).not.toBe(415);
    });

    it("画像偽装ファイルの検証なし（ファイル形式偽装攻撃）", async () => {
      // Arrange: 実行ファイルを画像として偽装
      const disguisedFile =
        "TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAA"; // .exe内容

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "innocent-image.png", // 🚨 偽装されたファイル名
          base64: disguisedFile,
          contentType: "image/png", // 🚨 偽装されたMIMEタイプ
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 ファイル内容検証なし
      expect(res._getStatusCode()).not.toBe(400);
      expect(mockFrom).toHaveBeenCalledWith("uploads");
    });
  });

  describe("🔐 パストラバーサル攻撃テスト", () => {
    it("ディレクトリトラバーサル攻撃の検証なし（脆弱性）", async () => {
      // Arrange: パストラバーサル攻撃
      const attackBase64 = Buffer.from("HACKED SYSTEM FILE").toString("base64");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "../../../etc/passwd", // 🚨 ディレクトリトラバーサル
          base64: attackBase64,
          contentType: "text/plain",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 危険なパスが検証されない
      expect(res._getStatusCode()).not.toBe(400);
      expect(mockFrom).toHaveBeenCalledWith("uploads");
    });

    it("nullバイト攻撃による拡張子偽装の検証なし", async () => {
      // Arrange: nullバイトで拡張子偽装
      const attackBase64 = Buffer.from("EXECUTABLE CODE").toString("base64");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "safe-image.png\0.exe", // 🚨 nullバイト攻撃
          base64: attackBase64,
          contentType: "image/png",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 nullバイト攻撃が検証されない
      expect(res._getStatusCode()).not.toBe(400);
    });
  });

  describe("✅ セキュリティ機能の不存在証明", () => {
    it("空のファイル名は適切に拒否される（唯一の正常な検証）", async () => {
      // Arrange: 不正なファイル名
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          filePath: "", // 空のファイル名
          base64: "dGVzdA==",
          contentType: "text/plain",
        },
      });

      // Act
      await handler(req, res);

      // Assert: ✅ この場合のみ適切にバリデーションが機能
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "bucket, filePath, and base64 are required.",
      });
    });

    it("GETリクエストは適切に拒否される", async () => {
      // Arrange: 不正なHTTPメソッド
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      // Act
      await handler(req, res);

      // Assert: ✅ HTTPメソッド検証は機能
      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Method Not Allowed",
      });
    });

    it("必須パラメータ不足は適切に検出される", async () => {
      // Arrange: 必須パラメータ不足
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          bucket: "uploads",
          // filePath, base64が不足
        },
      });

      // Act
      await handler(req, res);

      // Assert: ✅ 基本的なパラメータ検証は機能
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "bucket, filePath, and base64 are required.",
      });
    });
  });

  describe("🔧 セキュリティ強化必要項目", () => {
    it("TODO: 認証ミドルウェア追加が必要", () => {
      // 現在のエンドポイントには authMiddleware が適用されていない
      // 修正後は全リクエストで JWT 認証が必要になるべき
      expect(true).toBe(true); // プレースホルダー
    });

    it("TODO: ファイル形式ホワイトリスト検証が必要", () => {
      // 現在は任意のファイル形式をアップロード可能
      // 修正後は画像ファイルのみ許可するべき
      expect(true).toBe(true); // プレースホルダー
    });

    it("TODO: ファイルサイズ制限が必要", () => {
      // 現在はファイルサイズ制限なし
      // 修正後は最大5MBまでなど制限を設けるべき
      expect(true).toBe(true); // プレースホルダー
    });

    it("TODO: ファイルパス検証が必要", () => {
      // 現在はディレクトリトラバーサル攻撃が可能
      // 修正後は安全なファイルパスのみ許可するべき
      expect(true).toBe(true); // プレースホルダー
    });
  });
});
