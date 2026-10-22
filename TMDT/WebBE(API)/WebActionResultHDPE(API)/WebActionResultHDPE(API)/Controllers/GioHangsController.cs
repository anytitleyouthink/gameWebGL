using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Helpers;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class GioHangsController : ControllerBase
    {
        private readonly Hshop2023Context _context;
        private readonly IConfiguration _configuration;

        public GioHangsController(Hshop2023Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst("CustomerID")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // 1. GET: api/v1/GioHangs
        [HttpGet]
        public async Task<ActionResult<ApiResponse<CartSummaryDto>>> Index([FromQuery] string? sessionId = null)
        {
            string? maKH = GetCurrentUserId();

            var query = _context.ViewGioHangs.AsQueryable();

            if (!string.IsNullOrEmpty(maKH))
            {
                query = query.Where(x => x.MaKh == maKH);
            }
            else if (!string.IsNullOrEmpty(sessionId))
            {
                query = query.Where(x => x.SessionId == sessionId);
            }
            else
            {
                return Ok(ApiResponse<CartSummaryDto>.Ok(new CartSummaryDto(), "Giỏ hàng trống."));
            }

            var items = await query.Select(x => new CartItemDto
            {
                Id = x.Id,
                MaHh = x.MaHh,
                TenHh = x.TenHh,
                Hinh = x.Hinh,
                DonGia = x.DonGia ?? 0,
                SoLuong = x.SoLuong,
                ThanhTien = x.ThanhTien ?? 0
            }).ToListAsync();

            var summary = new CartSummaryDto
            {
                Items = items,
                TotalQuantity = items.Sum(i => i.SoLuong),
                TotalPrice = items.Sum(i => i.ThanhTien)
            };

            return Ok(ApiResponse<CartSummaryDto>.Ok(summary));
        }

        // 2. POST: api/v1/GioHangs/Add
        [HttpPost("Add")]
        public async Task<ActionResult<ApiResponse<CartSummaryDto>>> Add([FromBody] AddToCartRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CartSummaryDto>.Fail("Dữ liệu không hợp lệ", ModelState));
            }

            string? maKH = GetCurrentUserId();
            string? sessionId = req.SessionId;

            string cartSessionId = !string.IsNullOrEmpty(sessionId) 
                ? sessionId 
                : (!string.IsNullOrEmpty(maKH) ? maKH : Guid.NewGuid().ToString("N"));

            var hangHoa = await _context.HangHoas.FirstOrDefaultAsync(p => p.MaHh == req.MaHh);
            if (hangHoa == null)
            {
                return NotFound(ApiResponse<CartSummaryDto>.Fail("Không tìm thấy hàng hóa."));
            }

            var data = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaHh == req.MaHh &&
                ((maKH != null && x.MaKh == maKH) || (!string.IsNullOrEmpty(sessionId) && x.SessionId == sessionId)));

            if (data != null)
            {
                data.SoLuong += req.SoLuong;
                _context.Update(data);
            }
            else
            {
                data = new GioHang
                {
                    MaHh = req.MaHh,
                    SoLuong = req.SoLuong,
                    Ngay = DateTime.Now,
                    SessionId = cartSessionId,
                    MaKh = maKH,
                    Hinh = hangHoa.Hinh,
                    DonGia = hangHoa.DonGia,
                    GiamGia = 0
                };
                _context.Add(data);
            }

            await _context.SaveChangesAsync();

            // Lấy lại danh sách để trả về
            return await Index(sessionId);
        }

        // 3. POST: api/v1/GioHangs/UpdateQuantity
        [HttpPost("UpdateQuantity")]
        public async Task<ActionResult<ApiResponse<UpdateCartResponse>>> UpdateQuantity([FromBody] UpdateQuantityRequest req)
        {
            string? maKH = GetCurrentUserId();
            string? sessionId = req.SessionId;

            var cartItem = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaHh == req.MaHh &&
                ((maKH != null && x.MaKh == maKH) || (!string.IsNullOrEmpty(sessionId) && x.SessionId == sessionId)));

            if (cartItem == null)
            {
                return NotFound(ApiResponse<UpdateCartResponse>.Fail("Không tìm thấy sản phẩm trong giỏ hàng."));
            }

            cartItem.SoLuong += req.Delta;

            if (cartItem.SoLuong <= 0)
            {
                _context.GioHangs.Remove(cartItem);
            }
            else
            {
                _context.Update(cartItem);
            }

            await _context.SaveChangesAsync();

            var allItems = await _context.GioHangs.Where(x =>
                (maKH != null && x.MaKh == maKH) || (!string.IsNullOrEmpty(sessionId) && x.SessionId == sessionId)).ToListAsync();

            var total = allItems.Sum(x => x.SoLuong * (x.DonGia ?? 0));

            return Ok(ApiResponse<UpdateCartResponse>.Ok(new UpdateCartResponse
            {
                Success = true,
                Message = "Cập nhật số lượng thành công",
                CurrentQty = cartItem.SoLuong > 0 ? cartItem.SoLuong : 0,
                ItemTotal = (cartItem.SoLuong > 0 ? cartItem.SoLuong : 0) * (cartItem.DonGia ?? 0),
                CartTotal = total
            }));
        }

        // 4. DELETE: api/v1/GioHangs/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> Delete(int id, [FromQuery] string? sessionId = null)
        {
            string? maKH = GetCurrentUserId();

            var gioHang = await _context.GioHangs.FirstOrDefaultAsync(x => x.Id == id &&
                ((maKH != null && x.MaKh == maKH) || (!string.IsNullOrEmpty(sessionId) && x.SessionId == sessionId)));

            if (gioHang == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy sản phẩm trong giỏ hàng để xóa."));
            }

            _context.GioHangs.Remove(gioHang);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResult("Xóa sản phẩm khỏi giỏ hàng thành công!"));
        }

        // 5. GET: api/v1/GioHangs/AvailableVouchers
        [HttpGet("AvailableVouchers")]
        public async Task<ActionResult<ApiResponse<List<VoucherDto>>>> GetAvailableVouchers()
        {
            var now = DateTime.Now;

            var vouchers = await _context.MaGiamGia
                .Where(v => v.IsActive
                         && v.SoLuongDaDung < v.SoLuongGiaiHan
                         && v.NgayBatDau <= now
                         && v.NgayHetHan >= now)
                .Select(v => new VoucherDto
                {
                    Code = v.MaVoucher,
                    Description = v.MoTa,
                    Type = v.LoaiGiamGia,
                    Value = v.GiaTriGiam,
                    MinOrder = v.DonHangToiThieu
                })
                .ToListAsync();

            return Ok(ApiResponse<List<VoucherDto>>.Ok(vouchers));
        }

        // 6. POST: api/v1/GioHangs/ApplyVoucher
        [HttpPost("ApplyVoucher")]
        public async Task<ActionResult<ApiResponse<ApplyVoucherResponse>>> ApplyVoucher([FromBody] ApplyVoucherRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail("Mã voucher không hợp lệ", ModelState));
            }

            string? maKH = GetCurrentUserId();
            string? sessionId = req.SessionId;

            var allItems = await _context.GioHangs.Where(x =>
                (maKH != null && x.MaKh == maKH) || (!string.IsNullOrEmpty(sessionId) && x.SessionId == sessionId)).ToListAsync();

            double totalCart = allItems.Sum(x => x.SoLuong * (x.DonGia ?? 0));
            if (totalCart <= 0)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail("Giỏ hàng của bạn đang trống."));
            }

            var now = DateTime.Now;
            var voucher = await _context.MaGiamGia.FirstOrDefaultAsync(v => v.MaVoucher == req.Code);

            if (voucher == null || !voucher.IsActive)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail("Mã giảm giá không tồn tại hoặc đã bị khóa!"));
            }

            if (voucher.NgayBatDau > now || voucher.NgayHetHan < now)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail("Mã giảm giá đã hết hạn sử dụng!"));
            }

            if (voucher.SoLuongDaDung >= voucher.SoLuongGiaiHan)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail("Mã giảm giá này đã hết lượt sử dụng!"));
            }

            if (totalCart < voucher.DonHangToiThieu)
            {
                return BadRequest(ApiResponse<ApplyVoucherResponse>.Fail($"Mã này chỉ áp dụng cho đơn hàng từ {voucher.DonHangToiThieu}$ trở lên!"));
            }

            double discountAmount = 0;
            if (voucher.LoaiGiamGia.Equals("Percent", StringComparison.OrdinalIgnoreCase))
            {
                discountAmount = totalCart * (voucher.GiaTriGiam / 100.0);
                if (voucher.GiamToiDa.HasValue && discountAmount > voucher.GiamToiDa.Value)
                {
                    discountAmount = voucher.GiamToiDa.Value;
                }
            }
            else if (voucher.LoaiGiamGia.Equals("Fixed", StringComparison.OrdinalIgnoreCase))
            {
                discountAmount = voucher.GiaTriGiam;
            }

            if (discountAmount > totalCart) discountAmount = totalCart;
            double finalTotal = totalCart - discountAmount;

            return Ok(ApiResponse<ApplyVoucherResponse>.Ok(new ApplyVoucherResponse
            {
                Success = true,
                Message = "Áp dụng mã giảm giá thành công!",
                DiscountAmount = discountAmount,
                FinalTotal = finalTotal
            }));
        }

        // 7. POST: api/v1/GioHangs/Checkout
        [Authorize]
        [HttpPost("Checkout")]
        public async Task<ActionResult<ApiResponse<CheckoutResponse>>> ProcessCheckout([FromBody] CheckoutRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CheckoutResponse>.Fail("Thông tin đặt hàng không hợp lệ", ModelState));
            }

            string? maKH = GetCurrentUserId();
            if (string.IsNullOrEmpty(maKH))
            {
                return Unauthorized(ApiResponse<CheckoutResponse>.Fail("Vui lòng đăng nhập để thực hiện đặt hàng."));
            }

            var gioHangs = await _context.GioHangs
                .Where(x => x.MaKh == maKH || (!string.IsNullOrEmpty(req.SessionId) && x.SessionId == req.SessionId))
                .ToListAsync();

            if (!gioHangs.Any())
            {
                return BadRequest(ApiResponse<CheckoutResponse>.Fail("Giỏ hàng của bạn đang trống."));
            }

            try
            {
                double totalCart = gioHangs.Sum(x => x.SoLuong * (x.DonGia ?? 0));
                double discountAmount = 0;

                // KIỂM TRA VÀ TÍNH TOÁN LẠI VOUCHER TRÊN SERVER BẢO MẬT
                if (!string.IsNullOrEmpty(req.VoucherCode))
                {
                    var now = DateTime.Now;
                    var voucher = await _context.MaGiamGia.FirstOrDefaultAsync(v => v.MaVoucher == req.VoucherCode && v.IsActive);

                    if (voucher != null && now >= voucher.NgayBatDau && now <= voucher.NgayHetHan
                        && voucher.SoLuongDaDung < voucher.SoLuongGiaiHan && totalCart >= voucher.DonHangToiThieu)
                    {
                        if (voucher.LoaiGiamGia.Equals("Percent", StringComparison.OrdinalIgnoreCase))
                        {
                            discountAmount = totalCart * (voucher.GiaTriGiam / 100.0);
                            if (voucher.GiamToiDa.HasValue && discountAmount > voucher.GiamToiDa.Value)
                            {
                                discountAmount = voucher.GiamToiDa.Value;
                            }
                        }
                        else if (voucher.LoaiGiamGia.Equals("Fixed", StringComparison.OrdinalIgnoreCase))
                        {
                            discountAmount = voucher.GiaTriGiam;
                        }

                        if (discountAmount > totalCart) discountAmount = totalCart;

                        voucher.SoLuongDaDung += 1;
                        _context.Update(voucher);
                    }
                }

                var hoaDon = new HoaDon
                {
                    MaKh = maKH,
                    NgayDat = DateTime.Now,
                    NgayCan = DateTime.Now.AddDays(3),
                    NgayGiao = null,
                    HoTen = req.FullName,
                    DiaChi = req.Address,
                    CachThanhToan = string.IsNullOrEmpty(req.PaymentMethod) ? "COD" : req.PaymentMethod,
                    CachVanChuyen = "Giao hàng tận nơi",
                    PhiVanChuyen = 0,
                    MaTrangThai = 0,
                    GhiChu = req.Note
                };

                _context.HoaDons.Add(hoaDon);
                await _context.SaveChangesAsync();

                foreach (var item in gioHangs)
                {
                    var ct = new ChiTietHd
                    {
                        MaHd = hoaDon.MaHd,
                        MaHh = item.MaHh,
                        DonGia = item.DonGia ?? 0,
                        SoLuong = item.SoLuong,
                        GiamGia = item.GiamGia
                    };
                    _context.ChiTietHds.Add(ct);
                }

                _context.GioHangs.RemoveRange(gioHangs);
                await _context.SaveChangesAsync();

                PaymentQRResponse? qrResponse = null;
                if (hoaDon.CachThanhToan == "QR")
                {
                    qrResponse = GenerateQrInfo(hoaDon, totalCart - discountAmount);
                }

                var response = new CheckoutResponse
                {
                    OrderId = hoaDon.MaHd,
                    TotalAmount = totalCart,
                    DiscountAmount = discountAmount,
                    FinalAmount = totalCart - discountAmount,
                    PaymentMethod = hoaDon.CachThanhToan,
                    QrInfo = qrResponse,
                    Message = "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý."
                };

                return Ok(ApiResponse<CheckoutResponse>.Ok(response, response.Message));
            }
            catch (Exception ex)
            {
                var fullError = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, ApiResponse<CheckoutResponse>.Fail("Đã xảy ra lỗi trong quá trình đặt hàng: " + fullError));
            }
        }

        // 8. GET: api/v1/GioHangs/PaymentQR/{orderId}
        [Authorize]
        [HttpGet("PaymentQR/{orderId}")]
        public async Task<ActionResult<ApiResponse<PaymentQRResponse>>> PaymentQR(int orderId)
        {
            string? maKH = GetCurrentUserId();

            var order = await _context.HoaDons
                .Include(h => h.ChiTietHds)
                .FirstOrDefaultAsync(h => h.MaHd == orderId && h.MaKh == maKH);

            if (order == null)
            {
                return NotFound(ApiResponse<PaymentQRResponse>.Fail("Không tìm thấy đơn hàng."));
            }

            double tongTienHang = order.ChiTietHds.Sum(ct => ct.SoLuong * ct.DonGia);
            var qr = GenerateQrInfo(order, tongTienHang);

            return Ok(ApiResponse<PaymentQRResponse>.Ok(qr));
        }

        private PaymentQRResponse GenerateQrInfo(HoaDon order, double amount)
        {
            var bankId = _configuration["VietQR:BankId"] ?? "MB";
            var accountNo = _configuration["VietQR:AccountNo"] ?? "02909022005";
            var accountName = _configuration["VietQR:AccountName"] ?? "CONG TY HDPE";
            var template = _configuration["VietQR:Template"] ?? "compact";
            var exchangeRateStr = _configuration["VietQR:ExchangeRate"];

            double exchangeRate = 1.0;
            if (!string.IsNullOrEmpty(exchangeRateStr) && double.TryParse(exchangeRateStr, out var rate))
            {
                exchangeRate = rate;
            }

            double soTienQuyDoi = amount * exchangeRate;
            int qrAmount = (int)Math.Round(soTienQuyDoi);

            string addInfo = $"Thanh toan don hang {order.MaHd}";
            string encodedAddInfo = Uri.EscapeDataString(addInfo);
            string encodedAccountName = Uri.EscapeDataString(accountName);
            string qrCodeUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={qrAmount}&addInfo={encodedAddInfo}&accountName={encodedAccountName}";

            return new PaymentQRResponse
            {
                MaHd = order.MaHd,
                TongTien = amount,
                SoTienQuyDoi = soTienQuyDoi,
                QrCodeUrl = qrCodeUrl,
                BankId = bankId,
                AccountNo = accountNo,
                AccountName = accountName,
                NoiDungChuyenKhoan = addInfo,
                HoTen = order.HoTen,
                DiaChi = order.DiaChi
            };
        }
    }
}
