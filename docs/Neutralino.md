# Neutralino Windows Exe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chuyển đổi công cụ đóng gói dự án từ Electron sang Neutralino.js để tạo ra một file `.exe` duy nhất cực kỳ nhẹ (chỉ tốn khoảng 2MB) chạy mượt trên Windows. **Đặc biệt:** Kết quả đầu ra phải đóng gói tự động vào thư mục `Release/`, kèm theo thư mục `src/` để đem nộp bài, giúp người chấm chỉ việc mở `Release` lên chạy `.exe` là xong.

**Architecture:** Gỡ bỏ hoàn toàn nhân Chromium/Node.js cồng kềnh của Electron. Thêm file cấu hình `neutralino.config.json` để CLI của Neutralino gom thư mục `dist` của Vite thành một file `resources.neu` cùng công cụ chạy `.exe` sử dụng Webview hệ thống.

**Tech Stack:** Neutralino.js, Vite

---

### Task 1: Dọn dẹp cấu hình Electron cũ 🟢 **[DONE]**

**Files:**
- Modify: `package.json:1-45`
- Delete: `electron/main.js` (hoặc cả thư mục `electron`)
- Delete: `scripts/remove-locales.js` (thư mục `scripts`)

**Step 1: Xóa bộ sinh lỗi và folder cũ**

```bash
Remove-Item -Recurse -Force electron
Remove-Item -Recurse -Force scripts
Remove-Item -Recurse -Force release
```

**Step 2: Gỡ Electron khỏi package.json (devDependencies & config)**

Sửa thông tin trong `package.json` loại bỏ khối `"build": {...}`, xóa `"main": "electron/main.js"`, xóa `electron` và `electron-builder` khỏi `devDependencies`.

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: remove electron dependencies and config"
```

---

### Task 2: Cài đặt Neutralino.js Build Scripts 🟢 **[DONE]**

**Files:**
- Modify: `package.json`

**Step 1: Thêm npx script cho cài đặt**

Sửa thuộc tính `scripts` trong `package.json` thành:
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "dist": "npm run build && npx @neutralinojs/neu build && node -e \"const fs=require('fs'); fs.mkdirSync('Release', {recursive:true}); fs.copyFileSync('dist/fractal-explorer/fractal-explorer-win_x64.exe', 'Release/FractalExplorer.exe'); fs.copyFileSync('dist/fractal-explorer/resources.neu', 'Release/resources.neu');\""
  }
```

**Step 2: Uninstall NPM old & Install mới**

```bash
npm uninstall electron electron-builder
npm install
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: setup neutralino build script"
```

---

### Task 3: Tạo cấu hình Neutralino 🟢 **[DONE]**

**Files:**
- Create: `neutralino.config.json`

**Step 1: Tạo neutralino.config.json tại root dự án**

```json
{
  "$schema": "https://raw.githubusercontent.com/neutralinojs/neutralinojs/main/schemas/neutralino.config.schema.json",
  "applicationId": "com.cs106.fractal-explorer",
  "version": "1.0.0",
  "defaultMode": "window",
  "port": 0,
  "documentRoot": "/dist/",
  "url": "/",
  "enableServer": true,
  "enableNativeAPI": false,
  "tokenSecurity": "one-time",
  "logging": {
    "enabled": false,
    "writeToLogFile": false
  },
  "nativeAllowList": [],
  "globalVariables": {},
  "modes": {
    "window": {
      "title": "Fractal Explorer",
      "width": 1024,
      "height": 768,
      "minWidth": 800,
      "minHeight": 600,
      "center": true,
      "fullScreen": false,
      "alwaysOnTop": false,
      "enableInspector": false,
      "borderless": false,
      "maximize": false,
      "hidden": false,
      "resizable": true,
      "exitProcessOnClose": true
    }
  },
  "cli": {
    "binaryName": "fractal-explorer",
    "resourcesPath": "/dist/",
    "extensionsPath": "/extensions/",
    "clientLibrary": "/dist/index.html",
    "binaryVersion": "6.7.0",
    "clientVersion": "6.7.0"
  }
}
```

**Step 2: Commit**

```bash
git add neutralino.config.json
git commit -m "chore: add neutralino configuration"
```

---

### Task 4: Chạy Verify Build 🟢 **[DONE]**

**Files:** N/A

**Step 1: Run build**

```bash
npm run dist
```
Expected: PASS, báo log `Application package was generated at the dist directory!` và script tự động copy 2 file sang thư mục `Release`.

**Step 2: Mở thư mục nộp bài và hiển thị kết quả**

Chạy file thực thi trong thư mục Release vừa tự động tạo ra:
```bash
Start-Process "Release/FractalExplorer.exe"
```
Kiểm tra cấu trúc: Đảm bảo thư mục chỉ có `src/` và `Release/` để nén Zip nộp bài. Dành cho người chấm bài: Tới thư mục `Release` click đúp chuột chạy `FractalExplorer.exe`.
