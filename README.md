# JaiWeb 專案

親子專家 Agent 工作台的網頁應用程式。

## 開發環境設定

### 啟動本地開發服務器

**推薦使用 Python HTTP 服務器：**

```bash
python3 -m http.server 8080
```

然後在瀏覽器中打開：`http://127.0.0.1:8080/`

### ⚠️ 注意事項

**請勿使用 Live Server 擴充功能**，因為它會在 SVG 標籤中注入 WebSocket 代碼，導致 HTML 結構被破壞，側邊欄無法正常顯示。

### 其他可用的開發服務器

**使用 Node.js http-server：**
```bash
npx http-server -p 8080
```

**使用 PHP 內建服務器：**
```bash
php -S 127.0.0.1:8080
```

## 專案結構

```
JaiWeb/
├── components/          # 可重用的 HTML 組件
│   ├── chat-sidebar.html
│   ├── header.html
│   └── sidebar.html
├── css/                 # 樣式表
├── js/                  # JavaScript 腳本
├── images/              # 圖片資源
└── *.html              # 各個頁面
```

## 主要頁面

- `index.html` - 首頁
- `chat.html` - Agent 工作台
- `chat-logs.html` - 聊天記錄
- `contacts.html` - 聯絡人
- `sources-*.html` - 資料來源相關頁面
- `settings-*.html` - 設定相關頁面

## 組件載入

本專案使用 JavaScript 動態載入可重用組件（header、sidebar 等），確保代碼的可維護性。

