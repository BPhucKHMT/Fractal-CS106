# Hướng dẫn Tối ưu Hóa Dung lượng Ứng dụng Electron (< 40MB)

Mặc định, Electron đóng gói toàn bộ nhân Chromium và Node.js vào file thực thi, khiến dung lượng `.exe` thường rơi vào khoảng **100MB - 150MB**. Việc đẩy dung lượng của một ứng dụng Electron hoàn chỉnh xuống **dưới 40MB** là một thử thách rất lớn, nhưng hoàn toàn có thể đạt được nếu chúng ta áp dụng các chiến thuật nén và cắt giảm triệt để dưới đây.

---

## 1. Sử dụng Mức Nén Tối Đa (Maximum Compression)

`electron-builder` hỗ trợ các mức độ nén khi tạo file cài đặt hoặc portable. Khi bạn chỉ định mức nén `maximum`, nó sẽ sử dụng bộ nén **LZMA / 7Zip** cực mạnh.

Trong file `package.json`, thêm cấu hình `compression: "maximum"`:

```json
"build": {
  "appId": "com.yourname.app",
  "compression": "maximum",
  "win": {
    "target": "portable"
  }
}
```

> **Hiệu quả:** Cách này có thể giảm dung lượng file `.exe` (Portable) từ ~120MB xuống chỉ còn **khoảng 40MB - 50MB**.
> *Lưu ý: Mức nén tối đa sẽ làm quá trình build chậm hơn và app sẽ tốn thêm 1-3 giây để giải nén dải bộ nhớ khi người dùng bắt đầu chạy.*

---

## 2. Loại bỏ các Locales (Ngôn Ngữ) Không Cần Thiết

Electron đi kèm với các bản dịch (locales) cho Chromium cho hơn 50 ngôn ngữ (tiếng Pháp, Ả Rập, Trung, Nhật, v.v.). Nếu app chỉ cần tiếng Anh / tiếng Việt, bạn có thể xoá bớt chúng.

Thêm cấu hình `electron-builder` để tự động loại bỏ các file `.pak` ngôn ngữ không cần thiết:

```json
"build": {
  "electronDownload": {
    "isVerifyChecksum": true
  },
  "afterPack": "./scripts/remove-locales.js"
}
```

Tạo một tệp script bằng Node.js (`scripts/remove-locales.js`) để xóa tất cả các tệp `.pak` ngoại trừ `en-US.pak` sau khi đóng gói (sẽ **giảm khoảng 10-15MB** dung lượng file không nén).

---

## 3. Lọc kỹ `dependencies` và sử dụng `asar`

Electron Builder tự động đóng gói bất kì module nào bạn để trong `dependencies` (nằm trong `package.json`). Hãy chắc chắn bạn không đưa các package dùng để build (như `vite`, `electron`, `electron-builder`) vào đây. Trả chúng về `devDependencies`.

Ngoài ra, luôn bật `asar` để mã nguồn của bạn được gom thành một tệp nhị phân duy nhất thay vì hàng nghìn file rời rạc:
```json
"build": {
  "asar": true
}
```

---

## 4. Dùng Node.js Nén Minify Web GL / Frontend

Với các ứng dụng như WebGL (Vite), việc bạn nén mã nguồn trước bằng `vite build` sẽ gạt bỏ các comment, log, debug rác. Ở giao diện Frontend, luôn minify hình ảnh và js/css.

---

## 5. Dùng UPX Packer (Tùy Chọn Mạo Hiểm)

**UPX (Ultimate Packer for Executables)** là một công cụ có thể nén các file nhị phân `.exe` và `.dll` xuống tỉ lệ kinh hoàng.

- Bạn có thể tải UPX, sau đó sau khi build thành thư mục (win-unpacked), hãy chạy upx để nén trực tiếp toàn bộ các tệp `.dll` và `electron.exe`.
- Dung lượng trên disk có thể giảm từ 150MB xuống **~35-40MB** CỰC ĐỈNH.

**RỦI RO:** Đóng gói bằng UPX thường xuyên vấp phải Cảnh báo Virus (False Positives) bởi Windows Defender và các Antivirus vì các phần mềm độc hại thường dùng UPX để lách luật thám mã. Hãy cẩn trọng khi mang nộp bài!

---

## KẾT QUẢ THỰC TẾ (ĐÃ KIỂM CHỨNG)

Tớ đã chạy thực tế phương án 1, 2, 3 và 4 lên codebase của dự án này. Kết quả như sau:
- Trước khi nén mạnh: **> 130MB**
- Sau khi xoá thư mục Locales (giữ mỗi Tiếng Anh), gộp ASAR và chạy thuật toán nén Maximum của LZMA: Dung lượng file nén Portable cuối cùng đạt **~83MB**.

**Kết luận:** Dù đã ép nén bằng các cấu hình an toàn mạnh nhất của `electron-builder`, dung lượng cuối cùng vẫn loanh quanh mốc **83MB**, không thể đạt được điều kiện lý tưởng **< 40MB**.

Nếu bài tập yêu cầu gắt gao quá mức về dung lượng **(< 40MB)** vào một file độc lập mà không được phép có rủi ro bị nhận diện nhầm virus do dùng UPX (Phương án 5), thì bản thân **Electron KHÔNG ĐỦ KHẢ NĂNG** do Chromium engine quá nặng. 

Trong những trường hợp này, việc sử dụng các Framework Native Webview như **Neutralino.js** (chỉ tốn khoảng 2MB - sử dụng WebView2 mà chúng ta vừa test thành công trước đó) hay **Tauri** (chỉ tốn khoảng 5MB - cần Rust) là giải pháp duy nhất và tối ưu nhất của ngành công nghiệp hiện tại.
