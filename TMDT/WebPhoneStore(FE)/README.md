# HDPE Shop - Frontend React + TypeScript (SPA)

Dự án Frontend được xây dựng bằng **React**, **TypeScript**, **Vite** và **Bootstrap 5**, tái sử dụng toàn bộ thiết kế giao diện từ [WebActionResultHDPE(MVC)](../WebActionResultHDPE(MVC)), kết nối trực tiếp với [WebActionResultHDPE(API)](../WebActionResultHDPE(API)).

---

## 1. Công nghệ & Thư viện sử dụng
- **Core Framework**: React 19 + TypeScript (Strict mode)
- **Bundler & Build Tool**: Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (Tích hợp Interceptors gắn Bearer Token & quản lý Guest SessionId)
- **Icons**: Lucide React
- **Styles**: Tái sử dụng CSS gốc của MVC (`bootstrap.min.css`, `style.css`, `TimKiem.css`) kết hợp Google Font `Plus Jakarta Sans`.

---

## 2. Cấu trúc thư mục dự án

```text
WebActionResultHDPE(FE)/
├── public/
│   ├── css/                  # Bootstrap và custom styles kế thừa từ MVC
│   └── img/                  # Ảnh sản phẩm, logo, banner từ MVC
├── src/
│   ├── api/
│   │   ├── httpClient.ts     # Cấu hình Axios, baseURL, Interceptor Bearer Token
│   │   └── services.ts       # Service module: productApi, authApi, cartApi, orderApi
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx    # Header, Live Search gợi ý sản phẩm, giỏ hàng
│   │       ├── Footer.tsx    # Footer liên kết, thông tin công ty, bản quyền
│   │       └── MainLayout.tsx# Layout chung
│   ├── context/
│   │   ├── AuthContext.tsx   # Quản lý trạng thái đăng nhập, JWT, quyền Admin
│   │   └── CartContext.tsx   # Quản lý giỏ hàng lai (SessionId cho khách & MaKh)
│   ├── pages/
│   │   ├── HomePage.tsx          # Trang chủ, Banner Carousel, Danh mục, Sản phẩm nổi bật
│   │   ├── ProductListPage.tsx   # Danh sách hàng hóa, lọc theo danh mục, phân trang, tìm kiếm
│   │   ├── ProductDetailPage.tsx # Chi tiết hàng hóa, thông số, chọn số lượng, thêm giỏ
│   │   ├── CartPage.tsx          # Xem giỏ hàng, tăng giảm số lượng, áp dụng Voucher
│   │   ├── CheckoutPage.tsx      # Đặt hàng, chọn hình thức thanh toán COD / VietQR
│   │   ├── PaymentQRPage.tsx     # Sinh mã VietQR động theo tỷ giá quy đổi
│   │   ├── OrderHistoryPage.tsx  # Lịch sử đơn hàng của người dùng
│   │   ├── OrderDetailPage.tsx   # Chi tiết từng đơn hàng và trạng thái vận chuyển
│   │   ├── LoginPage.tsx         # Đăng nhập tài khoản
│   │   ├── RegisterPage.tsx      # Đăng ký tài khoản
│   │   ├── ProfilePage.tsx       # Xem và chỉnh sửa thông tin cá nhân
│   │   ├── AdminPage.tsx         # Quản trị hệ thống: đơn hàng & hàng hóa
│   │   └── PrivacyPage.tsx       # Chính sách bảo mật
│   ├── types/
│   │   └── index.ts          # Định nghĩa TypeScript interface chuẩn theo backend DTO
│   ├── App.tsx               # Cấu hình định tuyến Route
│   └── main.tsx              # Entry point React
├── .env                      # Cấu hình biến môi trường VITE_API_BASE_URL
├── .env.example
├── API_MAPPING.md            # Bảng đối chiếu chi tiết MVC ➔ React ➔ API
└── package.json
```

---

## 3. Nguyên tắc bảo mật & Xác thực dữ liệu
1. **Frontend không tự quyết định giá và tiền**: Đơn giá, mức giảm giá voucher và tổng tiền đều được máy chủ ASP.NET Core Web API xác minh và tính toán từ cơ sở dữ liệu `Hshop2023`.
2. **Không tự quyết định quyền Admin**: Biến vai trò chỉ dùng để ẩn/hiện menu trải nghiệm; toàn bộ endpoint quản trị (`GET/PUT /api/v1/DonHangs`, `POST/PUT/DELETE /api/v1/HangHoas`) đều được kiểm tra chặt chẽ bởi backend.
3. **Giỏ hàng lai (Hybrid Cart)**: Khách vãng lai dùng `sessionId` được sinh tự động; khi đăng nhập, backend tự động gộp sản phẩm từ `sessionId` sang tài khoản khách hàng.

---

## 4. Hướng dẫn chạy dự án

### Bước 1: Khởi động Backend API
Mở Visual Studio hoặc terminal tại thư mục backend:
```bash
cd "d:\TMDT\WebActionResultHDPE(API)\WebActionResultHDPE(API)\WebActionResultHDPE(API)"
dotnet run
```
Backend sẽ lắng nghe tại: `https://localhost:7099` (hoặc `http://localhost:5024`).

### Bước 2: Khởi động Frontend React
Mở terminal tại thư mục frontend:
```bash
cd "d:\TMDT\WebActionResultHDPE(FE)"
npm install
npm run dev
```
Trình duyệt sẽ mở tại: `http://localhost:5173`.
