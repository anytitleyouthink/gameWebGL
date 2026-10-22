# API MAPPING TABLE - WEBACTIONRESULTHDPE

Bảng đối chiếu toàn bộ các chức năng Frontend React + TypeScript kết nối với ASP.NET Core Web API backend thực tế:

| Chức năng frontend | HTTP method | Endpoint thực tế | Request Body / Query Params | Response Type | Xác thực |
|---|---|---|---|---|---|
| Lấy sản phẩm trang chủ | `GET` | `/api/v1/Home` | Không có | `ApiResponse<HangHoaDto[]>` | Public |
| Chính sách bảo mật | `GET` | `/api/v1/Home/Privacy` | Không có | `ApiResponse<object>` | Public |
| Danh sách hàng hóa (lọc/phân trang) | `GET` | `/api/v1/HangHoas` | `?loai={int}&page={int}&pageSize={int}&keyword={str}` | `ApiResponse<PagedResult<HangHoaDto>>` | Public |
| Live search sản phẩm | `GET` | `/api/v1/HangHoas/Search` | `?keyword={str}` | `ApiResponse<HangHoaSearchDto[]>` | Public |
| Chi tiết sản phẩm | `GET` | `/api/v1/HangHoas/{id}` | Không có | `ApiResponse<HangHoaDto>` | Public |
| Danh mục & số lượng sản phẩm | `GET` | `/api/v1/HangHoas/Loai` | Không có | `ApiResponse<MenuLoaiVM[]>` | Public |
| Thêm mới hàng hóa (Admin) | `POST` | `/api/v1/HangHoas` | `HangHoaUpsertDto` (JSON) | `ApiResponse<HangHoaDto>` | Public / Admin |
| Chỉnh sửa hàng hóa (Admin) | `PUT` | `/api/v1/HangHoas/{id}` | `HangHoaUpsertDto` (JSON) | `ApiResponse<HangHoaDto>` | Public / Admin |
| Xóa hàng hóa (Admin) | `DELETE` | `/api/v1/HangHoas/{id}` | Không có | `ApiResponse` | Public / Admin |
| Đăng ký tài khoản | `POST` | `/api/v1/KhachHang/DangKy` | `RegisterVM` (JSON) | `ApiResponse<KhachHangProfileDto>` | Public |
| Đăng nhập tài khoản | `POST` | `/api/v1/KhachHang/DangNhap` | `LoginVM` (JSON) `?sessionId={str}` | `ApiResponse<AuthResponseDto>` | Public |
| Xem hồ sơ cá nhân | `GET` | `/api/v1/KhachHang/Profile` | Không có | `ApiResponse<KhachHangProfileDto>` | Bearer JWT |
| Chỉnh sửa hồ sơ cá nhân | `PUT` | `/api/v1/KhachHang/EditProfile` | `EditProfileDto` (JSON) | `ApiResponse<KhachHangProfileDto>` | Bearer JWT |
| Đăng xuất | `POST` | `/api/v1/KhachHang/DangXuat` | Không có | `ApiResponse` | Bearer JWT |
| Xem giỏ hàng (Guest / User) | `GET` | `/api/v1/GioHangs` | `?sessionId={str}` | `ApiResponse<CartSummaryDto>` | Optional (JWT / Session) |
| Thêm vào giỏ hàng | `POST` | `/api/v1/GioHangs/Add` | `AddToCartRequest` (JSON) | `ApiResponse<CartSummaryDto>` | Optional (JWT / Session) |
| Cập nhật số lượng giỏ hàng | `POST` | `/api/v1/GioHangs/UpdateQuantity`| `UpdateQuantityRequest` (JSON) | `ApiResponse<UpdateCartResponse>` | Optional (JWT / Session) |
| Xóa sản phẩm khỏi giỏ hàng | `DELETE` | `/api/v1/GioHangs/{id}` | `?sessionId={str}` | `ApiResponse` | Optional (JWT / Session) |
| Lấy danh sách Voucher khả dụng | `GET` | `/api/v1/GioHangs/AvailableVouchers` | Không có | `ApiResponse<VoucherDto[]>` | Public |
| Kiểm tra & Áp dụng voucher | `POST` | `/api/v1/GioHangs/ApplyVoucher` | `ApplyVoucherRequest` (JSON) | `ApiResponse<ApplyVoucherResponse>`| Optional (JWT / Session) |
| Đặt hàng (Checkout) | `POST` | `/api/v1/GioHangs/Checkout` | `CheckoutRequest` (JSON) | `ApiResponse<CheckoutResponse>` | Bearer JWT |
| Tạo mã VietQR thanh toán | `GET` | `/api/v1/GioHangs/PaymentQR/{orderId}` | Không có | `ApiResponse<PaymentQRResponse>` | Bearer JWT |
| Lịch sử đơn hàng khách hàng | `GET` | `/api/v1/DonHangs/LichSu` | Không có | `ApiResponse<HoaDonDto[]>` | Bearer JWT |
| Chi tiết đơn hàng | `GET` | `/api/v1/DonHangs/{id}` | Không có | `ApiResponse<HoaDonDto>` | Bearer JWT |
| Danh sách quản trị đơn hàng | `GET` | `/api/v1/DonHangs` | Không có | `ApiResponse<HoaDonDto[]>` | Bearer JWT |
| Cập nhật trạng thái đơn hàng | `PUT` | `/api/v1/DonHangs/{id}` | `UpdateHoaDonDto` (JSON) | `ApiResponse<HoaDonDto>` | Bearer JWT |
| Hủy / Xóa đơn hàng | `DELETE` | `/api/v1/DonHangs/{id}` | Không có | `ApiResponse` | Bearer JWT |
