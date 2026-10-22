export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data?: T;
  errors?: any;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  maLoai?: number | null;
  tenLoai?: string | null;
  keyword?: string | null;
}

export interface HangHoaDto {
  maHh: number;
  tenHh: string;
  tenAlias?: string | null;
  maLoai: number;
  tenLoai?: string | null;
  moTaDonVi?: string | null;
  donGia?: number | null;
  hinh?: string | null;
  ngaySx: string;
  giamGia: number;
  soLanXem: number;
  moTa?: string | null;
  maNcc: string;
  tenNcc?: string | null;
}

export interface HangHoaSearchDto {
  id: number;
  name: string;
  price?: number | null;
  image?: string | null;
  categoryId: number;
}

export interface HangHoaUpsertDto {
  tenHh: string;
  tenAlias?: string;
  maLoai: number;
  moTaDonVi?: string;
  donGia?: number;
  hinh?: string;
  ngaySx?: string;
  giamGia?: number;
  soLanXem?: number;
  moTa?: string;
  maNcc: string;
}

export interface MenuLoaiVM {
  maLoai: number;
  tenLoai: string;
  hinh?: string | null;
  moTa?: string | null;
  soLuong: number;
}

export interface KhachHangProfileDto {
  maKh: string;
  hoTen: string;
  gioiTinh: boolean;
  ngaySinh: string;
  diaChi?: string | null;
  dienThoai?: string | null;
  email: string;
  hinh?: string | null;
  hieuLuc: boolean;
  vaiTro: number;
}

export interface AuthResponseDto {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: KhachHangProfileDto;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ImageUploadResponse {
  url: string;
  secureUrl: string;
}

export interface CartItemDto {
  id: number;
  maHh: number;
  tenHh?: string | null;
  hinh?: string | null;
  donGia: number;
  soLuong: number;
  thanhTien: number;
}

export interface CartSummaryDto {
  items: CartItemDto[];
  totalQuantity: number;
  totalPrice: number;
}

export interface AddToCartRequest {
  maHh: number;
  soLuong?: number;
  sessionId?: string;
}

export interface UpdateQuantityRequest {
  maHh: number;
  delta: number;
  sessionId?: string;
}

export interface UpdateCartResponse {
  success: boolean;
  message?: string;
  currentQty: number;
  itemTotal: number;
  cartTotal: number;
}

export interface VoucherDto {
  code: string;
  description?: string | null;
  type: string;
  value: number;
  minOrder: number;
}

export interface ApplyVoucherResponse {
  success: boolean;
  message: string;
  discountAmount: number;
  finalTotal: number;
}

export interface CheckoutRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  note?: string;
  paymentMethod: string;
  voucherCode?: string;
  sessionId?: string;
}

export interface PaymentQRResponse {
  maHd: number;
  tongTien: number;
  soTienQuyDoi: number;
  qrCodeUrl: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  noiDungChuyenKhoan: string;
  hoTen?: string;
  diaChi?: string;
}

export interface CheckoutResponse {
  orderId: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  qrInfo?: PaymentQRResponse | null;
  message: string;
}

export interface HoaDonChiTietItemDto {
  maCt: number;
  maHh: number;
  tenHh: string;
  hinh?: string | null;
  donGia: number;
  soLuong: number;
  giamGia: number;
  thanhTien: number;
}

export interface HoaDonDto {
  maHd: number;
  maKh: string;
  tenKhachHang?: string | null;
  ngayDat: string;
  ngayCan?: string | null;
  ngayGiao?: string | null;
  hoTen?: string | null;
  diaChi?: string | null;
  cacthThanhToan?: string;
  cachThanhToan: string;
  cachVanChuyen: string;
  phiVanChuyen: number;
  maTrangThai: number;
  tenTrangThai?: string | null;
  maNv?: string | null;
  ghiChu?: string | null;
  tongTien: number;
  chiTietHds: HoaDonChiTietItemDto[];
}

// ==================== GAME & VOUCHER TYPES ====================
export interface GameStatus {
  gameId: number;
  currentLevel: number;
  completedLevels: number;
  tickets: number;
  playCount: number;
  dailyLevelLimit: number;
  status: string;
  currentCoins: number;
  canPlay: boolean;
  canClaimProductTicket: boolean;
}

export interface StartPuzzleResponse {
  success: boolean;
  message?: string;
  sessionId: number;
  levelNumber: number;
  imageIndex: number;
  tickets: number;
  currentCoins: number;
}

export interface CompletePuzzleResponse {
  success: boolean;
  result: string;
  rewardCoins: number;
  currentCoins: number;
  currentLevel: number;
  completedLevels: number;
  tickets: number;
  status: string;
  canContinue: boolean;
  message?: string;
}

export interface ShopVoucher {
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  coinPrice: number;
  remainingQuantity: number;
  endDate: string;
}

export interface UserVoucher {
  userVoucherId: number;
  voucherName: string;
  voucherCode: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  status: string;
  purchasedAt: string;
  expiredAt: string;
}

export interface PurchaseVoucherResponse {
  success: boolean;
  voucherCode?: string;
  voucherName?: string;
  coinSpent: number;
  remainingCoins: number;
  expiredAt?: string;
  message: string;
}

export interface SpinWheelResponse {
  success: boolean;
  isWin: boolean;
  rollValue: number;
  targetSliceIndex: number;
  voucherCode?: string;
  voucherName?: string;
  discountValue: number;
  coinSpent: number;
  remainingCoins: number;
  message: string;
}
