export const clearAuthCookie = () => {
  // 複数のパスとドメインの組み合わせでcookieを削除
  const paths = ["/", "/dao", "/api"];
  paths.forEach((path) => {
    // 基本的な削除
    document.cookie = `token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;

    // セキュアフラグ付きの削除
    document.cookie = `token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure;`;

    // ドメイン指定での削除
    if (typeof window !== "undefined") {
      const domain = window.location.hostname;
      document.cookie = `token=; path=${path}; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
  });

  // デバッグ用のログ出力
  console.log("Cookies after deletion:", document.cookie);
};
