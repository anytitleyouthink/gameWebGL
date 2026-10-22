# TÀI LIỆU KỸ THUẬT VÀ API - DỰ ÁN CHUYỂN ĐỔI WEBACTIONRESULTHDPE (MVC SANG WEB API)

## 1. Giới thiệu tổng quan
Dự án **WebActionResultHDPE(API)** là phiên bản chuyển đổi toàn diện từ giải pháp thương mại điện tử **WebActionResultHDPE(MVC)** sang nền tảng **ASP.NET Core 8.0 Web API**.
Toàn bộ nghiệp vụ kinh doanh, dữ liệu, logic giỏ hàng lai (Session & Tài khoản đăng nhập), mã giảm giá voucher, thanh toán trực tuyến qua VietQR, mã hóa bảo mật BCrypt, gửi email xác thực và quản lý đơn hàng đều được kế thừa và bảo toàn 100%.

- **Framework**: .NET 8.0 (C# 12)
- **Kiến trúc**: RESTful Web API với Clean DTO Separation, Entity Framework Core 8.0
- **Xác thực & Phân quyền**: JWT Bearer Token (JSON Web Token) kết hợp ClaimsIdentity
- **Database**: SQL Server `Hshop2023` (Connection string giữ nguyên chuẩn MVC)
- **Tài liệu API**: OpenAPI / Swagger UI tích hợp Bearer Authentication trực tiếp

---

## 2. Bảng đối chiếu MVC Actions ➔ API Endpoints

| STT | MVC Controller / Action | HTTP Method & Route API | Mô tả nghiệp vụ |
|:---:|:---|:---|:---|
| 1 | `HomeController.Index` | `GET /api/v1/Home` | Lấy danh sách sản phẩm hiển thị trang chủ |
| 2 | `HomeController.Privacy` | `GET /api/v1/Home/Privacy` | Chính sách bảo mật hệ thống |
| 3 | `HangHoasController.Index` | `GET /api/v1/HangHoas` | Danh sách hàng hóa, phân trang, lọc theo danh mục, tìm kiếm |
| 4 | `HangHoasController.Search` | `GET /api/v1/HangHoas/Search` | Tìm kiếm nhanh hàng hóa theo từ khóa (live search) |
| 5 | `HangHoasController.Details` | `GET /api/v1/HangHoas/{id}` | Chi tiết hàng hóa (tự động tăng `SoLanXem`) |
| 6 | `MenuLoaiViewComponent` | `GET /api/v1/HangHoas/Loai` | Lấy danh sách danh mục và số lượng sản phẩm mỗi loại |
| 7 | `HangHoasController.Create` (POST) | `POST /api/v1/HangHoas` | Thêm mới hàng hóa |
| 8 | `HangHoasController.Edit` (POST) | `PUT /api/v1/HangHoas/{id}` | Cập nhật thông tin hàng hóa |
| 9 | `HangHoasController.DeleteConfirmed` | `DELETE /api/v1/HangHoas/{id}` | Xóa hàng hóa |
| 10 | `KhachHangController.DangKy` (POST) | `POST /api/v1/KhachHang/DangKy` | Đăng ký thành viên, mã hóa mật khẩu BCrypt |
| 11 | `KhachHangController.DangNhap` (POST) | `POST /api/v1/KhachHang/DangNhap` | Đăng nhập, cấp JWT Token, tự động gộp giỏ hàng session, gửi email ngầm |
| 12 | `KhachHangController.Profile` | `GET /api/v1/KhachHang/Profile` | Xem thông tin hồ sơ cá nhân (Yêu cầu JWT) |
| 13 | `KhachHangController.EditProfile` (POST) | `PUT /api/v1/KhachHang/EditProfile` | Cập nhật hồ sơ cá nhân (Yêu cầu JWT) |
| 14 | `KhachHangController.DangXuat` | `POST /api/v1/KhachHang/DangXuat` | Đăng xuất người dùng |
| 15 | `GioHangsController.Index` | `GET /api/v1/GioHangs` | Xem giỏ hàng (hỗ trợ cả Khách vãng lai qua `sessionId` và User đăng nhập) |
| 16 | `GioHangsController.Add` | `POST /api/v1/GioHangs/Add` | Thêm sản phẩm vào giỏ |
| 17 | `GioHangsController.UpdateQuantity` | `POST /api/v1/GioHangs/UpdateQuantity` | Tăng/giảm số lượng (AJAX logic) |
| 18 | `GioHangsController.Delete` | `DELETE /api/v1/GioHangs/{id}` | Xóa mục khỏi giỏ hàng |
| 19 | `GioHangsController.GetAvailableVouchers` | `GET /api/v1/GioHangs/AvailableVouchers` | Lấy danh sách mã giảm giá còn hiệu lực |
| 20 | `GioHangsController.ApplyVoucher` | `POST /api/v1/GioHangs/ApplyVoucher` | Kiểm tra điều kiện và tính số tiền giảm giá |
| 21 | `GioHangsController.ProcessCheckout` | `POST /api/v1/GioHangs/Checkout` | Đặt hàng, trừ voucher, lưu Hóa đơn & Chi tiết, sinh QR nếu chọn QR |
| 22 | `GioHangsController.PaymentQR` | `GET /api/v1/GioHangs/PaymentQR/{orderId}` | Sinh mã VietQR động theo tỷ giá quy đổi USD ➔ VND |
| 23 | `DonHangsController.LichSu` | `GET /api/v1/DonHangs/LichSu` | Xem lịch sử đơn hàng của khách hàng hiện tại |
| 24 | `DonHangsController.Details` | `GET /api/v1/DonHangs/{id}` | Chi tiết hóa đơn và các dòng sản phẩm mua |
| 25 | `DonHangsController.Index` | `GET /api/v1/DonHangs` | Quản lý danh sách đơn hàng |
| 26 | `DonHangsController.Create` (POST) | `POST /api/v1/DonHangs` | Tạo mới đơn hàng quản trị |
| 27 | `DonHangsController.Edit` (POST) | `PUT /api/v1/DonHangs/{id}` | Cập nhật trạng thái / thông tin đơn hàng |
| 28 | `DonHangsController.DeleteConfirmed` | `DELETE /api/v1/DonHangs/{id}` | Xóa đơn hàng và chi tiết |

---

## 3. Cấu hình Database & Kết nối

File cấu hình tại `WebActionResultHDPE(API)/WebActionResultHDPE(API)/WebActionResultHDPE(API)/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "MyConnectString": "Data Source=localhost; Initial Catalog=Hshop2023; Persist Security Info=True; User ID=sa; Password=123456; Trust Server Certificate=True;"
  },
  "VietQR": {
    "BankId": "MB",
    "AccountNo": "02909022005",
    "AccountName": "CONG TY HDPE",
    "Template": "compact",
    "ExchangeRate": 25000
  },
  "Jwt": {
    "Key": "HDPE_Shop_Super_Secret_Jwt_Security_Key_2024_Token",
    "Issuer": "HDPE_API",
    "Audience": "HDPE_Client",
    "ExpireDays": 7
  }
}
```

---

## 4. Hướng dẫn chạy và kiểm thử

### Cách 1: Khởi chạy bằng .NET CLI
```bash
cd "d:\TMDT\WebActionResultHDPE(API)\WebActionResultHDPE(API)\WebActionResultHDPE(API)"
dotnet restore
dotnet build
dotnet run
```
Mở trình duyệt truy cập Swagger UI tại:
`http://localhost:5088` (hoặc cổng cấu hình trong `launchSettings.json`).

### Cách 2: Kiểm thử với Swagger
1. Đăng ký tài khoản tại `POST /api/v1/KhachHang/DangKy`.
2. Đăng nhập tại `POST /api/v1/KhachHang/DangNhap` ➔ Copy chuỗi `token`.
3. Nhấp nút **Authorize** ở góc trên Swagger, nhập: `Bearer <token>` rồi bấm **Authorize**.
4. Thực hiện các request được bảo vệ: `Profile`, `Checkout`, `LichSu đơn hàng`, v.v.
