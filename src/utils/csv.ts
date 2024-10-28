export function downloadCsv(headers: { name: string, uid: string }[], data: { [key: string]: string | number }[]) {
  console.log("headers:", headers);
  console.log("data:", data);
  // CSVの内容を生成
  const csvContent = data.map((row) =>
    headers.map((header) => JSON.stringify(row[header.uid])).join(",")
  );
  console.log("csvContent:", csvContent);

  const csvHeaders = headers.map((header) => header.name).join(",");
  console.log("csvHeaders:", csvHeaders);
  // ヘッダーを追加
  csvContent.unshift(headers.map(header => header.name).join(","));
  console.log("csvContent:", csvContent);

  // CSVデータをBlobに変換
  const blob = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  // ダウンロードリンクを作成
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "data.csv");
  link.style.visibility = "hidden";

  // リンクをクリックしてダウンロードを開始
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
