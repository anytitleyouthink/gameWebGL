import httpClient, { getSessionId } from './httpClient';
import {
  ApiResponse,
  PagedResult,
  HangHoaDto,
  HangHoaSearchDto,
  HangHoaUpsertDto,
  MenuLoaiVM,
  KhachHangProfileDto,
  AuthResponseDto,
  CartSummaryDto,
  AddToCartRequest,
  UpdateQuantityRequest,
  UpdateCartResponse,
  VoucherDto,
  ApplyVoucherResponse,
  CheckoutRequest,
  CheckoutResponse,
  PaymentQRResponse,
  HoaDonDto,
} from '../types';

// ==================== PRODUCT & HOME API ====================
export const productApi = {
  getHomeProducts: async () => {
    const res = await httpClient.get<ApiResponse<HangHoaDto[]>>('/Home');
    return res.data;
  },

  getProducts: async (params: { loai?: number; page?: number; pageSize?: number; keyword?: string }) => {
    const res = await httpClient.get<ApiResponse<PagedResult<HangHoaDto>>>('/HangHoas', { params });
    return res.data;
  },

  searchProducts: async (keyword: string) => {
    const res = await httpClient.get<ApiResponse<HangHoaSearchDto[]>>('/HangHoas/Search', {
      params: { keyword },
    });
    return res.data;
  },

  getProductDetails: async (id: number) => {
    const res = await httpClient.get<ApiResponse<HangHoaDto>>(`/HangHoas/${id}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await httpClient.get<ApiResponse<MenuLoaiVM[]>>('/HangHoas/Loai');
    return res.data;
  },

  createProduct: async (data: HangHoaUpsertDto) => {
    const res = await httpClient.post<ApiResponse<HangHoaDto>>('/HangHoas', data);
    return res.data;
  },

  updateProduct: async (id: number, data: HangHoaUpsertDto) => {
    const res = await httpClient.put<ApiResponse<HangHoaDto>>(`/HangHoas/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: number) => {
    const res = await httpClient.delete<ApiResponse>(`/HangHoas/${id}`);
    return res.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await httpClient.post<ApiResponse<{ url: string; secureUrl: string }>>(
      '/HangHoas/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },
};

// ==================== AUTH & USER API ====================
export const authApi = {
  register: async (data: { maKh: string; matKhau: string; email: string }) => {
    const res = await httpClient.post<ApiResponse<KhachHangProfileDto>>('/KhachHang/DangKy', data);
    return res.data;
  },

  login: async (data: { userName: string; password: string }) => {
    const sessionId = getSessionId();
    const res = await httpClient.post<ApiResponse<AuthResponseDto>>('/KhachHang/DangNhap', data, {
      params: { sessionId },
    });
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await httpClient.post<ApiResponse<AuthResponseDto>>('/KhachHang/RefreshToken', {
      refreshToken,
    });
    return res.data;
  },

  getProfile: async () => {
    const res = await httpClient.get<ApiResponse<KhachHangProfileDto>>('/KhachHang/Profile');
    return res.data;
  },

  updateProfile: async (data: { hoTen: string; email: string; dienThoai?: string; diaChi?: string }) => {
    const res = await httpClient.put<ApiResponse<KhachHangProfileDto>>('/KhachHang/EditProfile', data);
    return res.data;
  },

  logout: async (refreshToken?: string) => {
    const res = await httpClient.post<ApiResponse>('/KhachHang/DangXuat', { refreshToken });
    return res.data;
  },
};

// ==================== CART & CHECKOUT API ====================
export const cartApi = {
  getCart: async () => {
    const sessionId = getSessionId();
    const res = await httpClient.get<ApiResponse<CartSummaryDto>>('/GioHangs', {
      params: { sessionId },
    });
    return res.data;
  },

  addToCart: async (maHh: number, soLuong = 1) => {
    const sessionId = getSessionId();
    const payload: AddToCartRequest = { maHh, soLuong, sessionId };
    const res = await httpClient.post<ApiResponse<CartSummaryDto>>('/GioHangs/Add', payload);
    return res.data;
  },

  updateQuantity: async (maHh: number, delta: number) => {
    const sessionId = getSessionId();
    const payload: UpdateQuantityRequest = { maHh, delta, sessionId };
    const res = await httpClient.post<ApiResponse<UpdateCartResponse>>('/GioHangs/UpdateQuantity', payload);
    return res.data;
  },

  removeFromCart: async (id: number) => {
    const sessionId = getSessionId();
    const res = await httpClient.delete<ApiResponse>(`/GioHangs/${id}`, {
      params: { sessionId },
    });
    return res.data;
  },

  getAvailableVouchers: async () => {
    const res = await httpClient.get<ApiResponse<VoucherDto[]>>('/GioHangs/AvailableVouchers');
    return res.data;
  },

  applyVoucher: async (code: string) => {
    const sessionId = getSessionId();
    const res = await httpClient.post<ApiResponse<ApplyVoucherResponse>>('/GioHangs/ApplyVoucher', {
      code,
      sessionId,
    });
    return res.data;
  },

  checkout: async (data: CheckoutRequest) => {
    const sessionId = getSessionId();
    const payload = { ...data, sessionId };
    const res = await httpClient.post<ApiResponse<CheckoutResponse>>('/GioHangs/Checkout', payload);
    return res.data;
  },

  getPaymentQr: async (orderId: number) => {
    const res = await httpClient.get<ApiResponse<PaymentQRResponse>>(`/GioHangs/PaymentQR/${orderId}`);
    return res.data;
  },
};

// ==================== ORDER API ====================
export const orderApi = {
  getOrderHistory: async () => {
    const res = await httpClient.get<ApiResponse<HoaDonDto[]>>('/DonHangs/LichSu');
    return res.data;
  },

  getOrderDetails: async (id: number) => {
    const res = await httpClient.get<ApiResponse<HoaDonDto>>(`/DonHangs/${id}`);
    return res.data;
  },

  getAllOrders: async () => {
    const res = await httpClient.get<ApiResponse<HoaDonDto[]>>('/DonHangs');
    return res.data;
  },

  updateOrder: async (id: number, data: any) => {
    const res = await httpClient.put<ApiResponse<HoaDonDto>>(`/DonHangs/${id}`, data);
    return res.data;
  },

  deleteOrder: async (id: number) => {
    const res = await httpClient.delete<ApiResponse>(`/DonHangs/${id}`);
    return res.data;
  },
};

// ==================== PUZZLE GAME API ====================
export const puzzleApi = {
  getStatus: async () => {
    const res = await httpClient.get<any>('/puzzle/status');
    return res.data;
  },

  startPuzzle: async () => {
    const res = await httpClient.post<any>('/puzzle/start');
    return res.data;
  },

  completePuzzle: async (sessionId: number, result: string) => {
    const res = await httpClient.post<any>('/puzzle/complete', {
      sessionId,
      result,
    });
    return res.data;
  },

  startProductView: async (productId: number) => {
    const res = await httpClient.post<any>('/puzzle/product-view/start', { productId });
    return res.data;
  },

  completeProductView: async (productViewId: number) => {
    const res = await httpClient.post<any>('/puzzle/product-view/complete', { productViewId });
    return res.data;
  },

  claimTicket: async (productViewId: number) => {
    const res = await httpClient.post<any>('/puzzle/claim-ticket', { productViewId });
    return res.data;
  },

  lockDailyProgress: async () => {
    const res = await httpClient.post<any>('/puzzle/lock');
    return res.data;
  },
};

// ==================== VOUCHER SHOP & LUCKY WHEEL API ====================
export const gameVoucherApi = {
  getShopVouchers: async () => {
    const res = await httpClient.get<any[]>('/vouchers');
    return res.data;
  },

  getMyVouchers: async () => {
    const res = await httpClient.get<any[]>('/vouchers/my');
    return res.data;
  },

  purchaseVoucher: async (voucherId: number) => {
    const res = await httpClient.post<any>(`/vouchers/${voucherId}/purchase`);
    return res.data;
  },

  useVoucher: async (voucherCode: string) => {
    const res = await httpClient.post<any>('/vouchers/use', { voucherCode });
    return res.data;
  },

  spinWheel: async () => {
    const res = await httpClient.post<any>('/vouchers/spin');
    return res.data;
  },
};

