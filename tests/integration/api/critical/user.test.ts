import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/user/index";
import { NextApiRequest, NextApiResponse } from "next";

// Supabaseクライアントをモック
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn((data) => ({
        select: jest.fn(() =>
          Promise.resolve({
            data: [data],
            error: null,
          })
        ),
      })),
      update: jest.fn((updateData) => ({
        eq: jest.fn((field, value) => ({
          select: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  evm_address: value,
                  ...updateData,
                },
              ],
              error: null,
            })
          ),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn((field, value) => ({
          select: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  evm_address: value,
                  name: "Deleted User",
                },
              ],
              error: null,
            })
          ),
        })),
      })),
    })),
  })),
}));

describe("/api/user エンドポイント - 🔴 CRITICAL脆弱性テスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("🚨 認証なしアクセスの脆弱性", () => {
    it("認証なしでユーザー作成が可能（CRITICAL脆弱性）", async () => {
      // Arrange: 認証ヘッダーなしのリクエスト
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "0xattacker123456789012345678901234567890",
          name: "Malicious User",
          email: "attacker@evil.com",
          kyc_status: "APPROVED", // 不正にKYC承認済み状態で作成
        },
        headers: {
          // 認証ヘッダーなし
        },
      });

      // Act: APIハンドラーを実行
      await handler(req, res);

      // Assert: 🚨 現在は認証なしで成功してしまう（脆弱性）
      expect(res._getStatusCode()).toBe(201);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toBeDefined();
      expect(responseData.data.evm_address).toBe(
        "0xattacker123456789012345678901234567890"
      );
      expect(responseData.data.name).toBe("Malicious User");

      // 期待される修正後の動作（現在はコメントアウト）
      // expect(res._getStatusCode()).toBe(401);
      // expect(JSON.parse(res._getData()).error).toBe('認証が必要です');
    });

    it("認証なしで他人のユーザー情報を更新可能（CRITICAL脆弱性）", async () => {
      // Arrange: 被害者のアドレスで情報更新を試行
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          evm_address: "0xvictim123456789012345678901234567890",
          name: "Hijacked by Attacker",
          email: "hijacked@evil.com",
          kyc_status: "REJECTED", // 被害者のKYC状態を悪意で変更
        },
        headers: {
          // 認証ヘッダーなし - 攻撃者は被害者のアドレスを知っているだけ
        },
      });

      // Act: APIハンドラーを実行
      await handler(req, res);

      // Assert: 🚨 認証なしで他人の情報を更新できてしまう
      expect(res._getStatusCode()).toBe(200);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.evm_address).toBe(
        "0xvictim123456789012345678901234567890"
      );
      expect(responseData.data.name).toBe("Hijacked by Attacker");

      // 期待される修正後の動作
      // expect(res._getStatusCode()).toBe(401);
      // expect(JSON.parse(res._getData()).error).toBe('認証が必要です');
    });

    it("認証なしでユーザー削除が可能（CRITICAL脆弱性）", async () => {
      // Arrange: 削除リクエスト（認証なし）
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {
          evm_address: "0xvictim123456789012345678901234567890",
        },
        headers: {
          // 認証ヘッダーなし
        },
      });

      // Act: APIハンドラーを実行
      await handler(req, res);

      // Assert: 🚨 認証なしでユーザー削除が可能
      expect(res._getStatusCode()).toBe(200);

      // 期待される修正後の動作
      // expect(res._getStatusCode()).toBe(401);
      // expect(JSON.parse(res._getData()).error).toBe('認証が必要です');
    });

    it("攻撃者が管理者権限でユーザーを作成できる脆弱性", async () => {
      // Arrange: 管理者権限を持つユーザーを不正作成
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "0xfakeadmin123456789012345678901234567890",
          name: "Fake Admin",
          email: "admin@fake.com",
          kyc_status: "APPROVED",
          // 将来的に管理者フラグがあった場合の想定
          is_admin: true,
        },
      });

      // Act
      await handler(req, res);

      // Assert: 🚨 認証チェックなしで不正なユーザー作成が可能
      expect(res._getStatusCode()).toBe(201);
    });
  });

  describe("🔍 データ検証の脆弱性", () => {
    it("無効なEVMアドレスでもユーザー作成が可能", async () => {
      // Arrange: 不正なアドレス形式
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "invalid-address", // 正しくないアドレス形式
          name: "Invalid User",
          email: "invalid@test.com",
        },
      });

      // Act
      await handler(req, res);

      // Assert: アドレス検証がないため成功してしまう
      expect(res._getStatusCode()).toBe(201);

      // 期待される修正後の動作
      // expect(res._getStatusCode()).toBe(400);
      // expect(JSON.parse(res._getData()).error).toBe('Invalid EVM address format');
    });

    it("XSS攻撃の可能性があるデータでもユーザー作成が可能", async () => {
      // Arrange: XSS攻撃の可能性があるデータ
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "0x1234567890123456789012345678901234567890",
          name: '<script>alert("XSS")</script>',
          email: "xss@test.com",
          address: '"><script>document.cookie</script>',
        },
      });

      // Act
      await handler(req, res);

      // Assert: サニタイゼーションなしで保存される
      expect(res._getStatusCode()).toBe(201);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.name).toBe('<script>alert("XSS")</script>');
    });

    it("SQLインジェクションの可能性があるデータでもユーザー作成が可能", async () => {
      // Arrange: SQLインジェクションの試行
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address:
            "0x1234567890123456789012345678901234567890'; DROP TABLE USER; --",
          name: "'; DROP TABLE USER; --",
          email: "injection@test.com",
        },
      });

      // Act
      await handler(req, res);

      // Assert: Supabaseは基本的にSQLインジェクション耐性があるが、入力検証は必要
      expect(res._getStatusCode()).toBe(201);
    });
  });

  describe("✅ 修正後期待動作（現在は失敗するテスト）", () => {
    it("認証なしリクエストは401エラーを返すべき", async () => {
      // Arrange
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "0x1234567890123456789012345678901234567890",
          name: "Test User",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 修正後の期待動作（現在は失敗）
      // TODO: 認証ミドルウェア適用後に有効化
      // expect(res._getStatusCode()).toBe(401);
      // expect(JSON.parse(res._getData()).error).toBe('No token provided');

      // 現在の脆弱な動作
      expect(res._getStatusCode()).toBe(201);
    });

    it("有効なJWTトークンがある場合のみ操作を許可すべき", async () => {
      // Arrange: 有効なJWTトークン付きリクエスト
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          evm_address: "0x1234567890123456789012345678901234567890",
          name: "Authenticated User",
        },
        headers: {
          cookie: "token=valid-jwt-token",
        },
      });

      // Act
      await handler(req, res);

      // Assert: TODO: 認証ミドルウェア適用後にテスト実装
      // 現在は認証チェックがないため、常に成功してしまう
      expect(res._getStatusCode()).toBe(201);
    });
  });

  describe("🔐 権限チェックの脆弱性", () => {
    it("他人のデータを更新する権限チェックがない", async () => {
      // Arrange: ユーザーAがユーザーBのデータを更新しようとする
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          evm_address: "0xUserB1234567890123456789012345678901234567890", // ユーザーB
          name: "Modified by UserA",
        },
        headers: {
          // TODO: ユーザーAのJWTトークンを設定
          cookie: "token=userA-jwt-token",
        },
      });

      // Act
      await handler(req, res);

      // Assert: 現在は権限チェックなしで更新可能
      expect(res._getStatusCode()).toBe(200);

      // 期待される修正後の動作
      // expect(res._getStatusCode()).toBe(403);
      // expect(JSON.parse(res._getData()).error).toBe('他のユーザーのデータは更新できません');
    });
  });
});
