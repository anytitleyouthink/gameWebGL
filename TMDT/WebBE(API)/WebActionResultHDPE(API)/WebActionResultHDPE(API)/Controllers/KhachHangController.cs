using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Helpers;
using WebActionResultHDPE.Models;
using WebActionResultHDPE.ViewModels;

namespace WebActionResultHDPE.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class KhachHangController : ControllerBase
    {
        private readonly Hshop2023Context _context;
        private readonly IMapper _mapper;
        private readonly JwtService _jwtService;

        public KhachHangController(Hshop2023Context context, IMapper mapper, JwtService jwtService)
        {
            _context = context;
            _mapper = mapper;
            _jwtService = jwtService;
        }

        // POST: api/v1/KhachHang/DangKy
        [HttpPost("DangKy")]
        public async Task<ActionResult<ApiResponse<KhachHangProfileDto>>> DangKy([FromBody] RegisterVM model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<KhachHangProfileDto>.Fail("Dữ liệu đăng ký không hợp lệ", ModelState));
            }

            if (await _context.KhachHangs.AnyAsync(kh => kh.MaKh == model.MaKh))
            {
                return BadRequest(ApiResponse<KhachHangProfileDto>.Fail("Tên đăng nhập này đã có người sử dụng."));
            }

            if (await _context.KhachHangs.AnyAsync(kh => kh.Email == model.Email))
            {
                return BadRequest(ApiResponse<KhachHangProfileDto>.Fail("Email này đã có người dùng."));
            }

            try
            {
                var khachHang = _mapper.Map<KhachHang>(model);
                khachHang.RandomKey = Guid.NewGuid().ToString().Substring(0, 8);
                khachHang.MatKhau = BCrypt.Net.BCrypt.HashPassword(model.MatKhau);
                khachHang.HieuLuc = true;
                khachHang.VaiTro = 0;
                khachHang.HoTen = string.IsNullOrWhiteSpace(model.MaKh) ? "User" : model.MaKh;
                khachHang.NgaySinh = DateTime.Now;
                khachHang.Hinh = "default-user.png";

                _context.Add(khachHang);
                await _context.SaveChangesAsync();

                // Gửi email chào mừng thành viên mới qua EmailSender
                if (!string.IsNullOrWhiteSpace(khachHang.Email))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            string subject = "Chào mừng bạn đến với HDPE Phone Store!";
                            string body = $@"
                                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                                    <div style='background: #198754; color: white; padding: 20px; text-align: center;'>
                                        <h2 style='margin: 0;'>HDPE Phone Store</h2>
                                        <p style='margin: 5px 0 0 0;'>Thế Giới Công Nghệ Đỉnh Cao</p>
                                    </div>
                                    <div style='padding: 24px;'>
                                        <h3 style='color: #198754;'>Xin chào {khachHang.HoTen}!</h3>
                                        <p>Chúc mừng bạn đã tạo tài khoản thành công tại <strong>HDPE Phone Store</strong>.</p>
                                        <div style='background: #f8f9fa; border-left: 4px solid #198754; padding: 12px 16px; margin: 16px 0;'>
                                            <p style='margin: 4px 0;'><strong>Tên đăng nhập:</strong> {khachHang.MaKh}</p>
                                            <p style='margin: 4px 0;'><strong>Email đăng ký:</strong> {khachHang.Email}</p>
                                            <p style='margin: 4px 0;'><strong>Số điện thoại:</strong> {khachHang.DienThoai ?? "Chưa cập nhật"}</p>
                                        </div>
                                        <p>Bạn có thể đăng nhập ngay để mua sắm điện thoại chính hãng, tích lũy điểm thưởng và tham gia các minigame thú vị.</p>
                                        <p style='margin-top: 24px;'>Trân trọng,<br/><strong>Đội ngũ HDPE Phone Store</strong></p>
                                    </div>
                                    <div style='background: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #777;'>
                                        Email này được gửi tự động. Vui lòng không trả lời thư này.
                                    </div>
                                </div>";
                            await EmailSender.SendMail(khachHang.Email, subject, body);
                        }
                        catch
                        {
                            // Tránh crash tiến trình ngầm nếu SMTP gặp sự cố mạng tạm thời
                        }
                    });
                }

                var profile = new KhachHangProfileDto
                {
                    MaKh = khachHang.MaKh,
                    HoTen = khachHang.HoTen,
                    GioiTinh = khachHang.GioiTinh,
                    NgaySinh = khachHang.NgaySinh,
                    DiaChi = khachHang.DiaChi,
                    DienThoai = khachHang.DienThoai,
                    Email = khachHang.Email,
                    Hinh = khachHang.Hinh,
                    HieuLuc = khachHang.HieuLuc,
                    VaiTro = khachHang.VaiTro
                };

                return Ok(ApiResponse<KhachHangProfileDto>.Ok(profile, "Đăng ký thành công! Mời bạn đăng nhập."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<KhachHangProfileDto>.Fail("Lỗi hệ thống: " + ex.Message));
            }
        }

        // POST: api/v1/KhachHang/DangNhap
        [HttpPost("DangNhap")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> DangNhap([FromBody] LoginVM model, [FromQuery] string? sessionId = null)
        {
            if (model == null)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Dữ liệu đăng nhập trống."));
            }

            var identifier = model.GetIdentifier();
            if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Vui lòng nhập tên đăng nhập hoặc email và mật khẩu."));
            }

            // 1. Tìm tài khoản dựa theo tên đăng nhập hoặc email
            var kh = await _context.KhachHangs.SingleOrDefaultAsync(k => k.MaKh == identifier || k.Email == identifier);

            // 2. Kiểm tra mật khẩu
            if (kh == null || !BCrypt.Net.BCrypt.Verify(model.Password, kh.MatKhau))
            {
                return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Tên đăng nhập hoặc mật khẩu không chính xác."));
            }

            // 3. Kiểm tra trạng thái hiệu lực
            if (!kh.HieuLuc)
            {
                return StatusCode(403, ApiResponse<AuthResponseDto>.Fail("Tài khoản của bạn đã bị khóa."));
            }

            // --- GỘP GIỎ HÀNG TỪ SESSION SANG TÀI KHOẢN ---
            if (!string.IsNullOrEmpty(sessionId))
            {
                var sessionCart = await _context.GioHangs.Where(x => x.SessionId == sessionId).ToListAsync();
                foreach (var item in sessionCart)
                {
                    var userCartItem = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaKh == kh.MaKh && x.MaHh == item.MaHh);
                    if (userCartItem != null)
                    {
                        userCartItem.SoLuong += item.SoLuong;
                        _context.GioHangs.Remove(item);
                    }
                    else
                    {
                        item.MaKh = kh.MaKh;
                        item.SessionId = kh.MaKh;
                    }
                }
                await _context.SaveChangesAsync();
            }

            // --- GỬI MAIL THÔNG BÁO ĐĂNG NHẬP (Chạy ngầm) ---
            if (!string.IsNullOrEmpty(kh.Email))
            {
                string tieuDe = "Thông báo đăng nhập tài khoản - HDPE Shop";
                string noiDung = $@"
                    <h3>Chào {kh.HoTen},</h3>
                    <p>Tài khoản của bạn vừa được đăng nhập thành công vào hệ thống HDPE Shop.</p>
                    <p>Thời gian: {DateTime.Now:dd/MM/yyyy HH:mm:ss}</p>
                    <p>Nếu không phải là bạn, vui lòng liên hệ admin hoặc đổi mật khẩu ngay lập tức để bảo vệ tài khoản.</p>
                    <br/>
                    <p>Trân trọng,<br/>Đội ngũ HDPE Shop</p>";

                _ = EmailSender.SendMail(kh.Email, tieuDe, noiDung);
            }

            // 4. Tạo Access Token và Refresh Token
            var accessToken = _jwtService.GenerateAccessToken(kh);
            var refreshTokenString = _jwtService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Token = refreshTokenString,
                MaKh = kh.MaKh,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            var profile = new KhachHangProfileDto
            {
                MaKh = kh.MaKh,
                HoTen = kh.HoTen,
                GioiTinh = kh.GioiTinh,
                NgaySinh = kh.NgaySinh,
                DiaChi = kh.DiaChi,
                DienThoai = kh.DienThoai,
                Email = kh.Email,
                Hinh = kh.Hinh,
                HieuLuc = kh.HieuLuc,
                VaiTro = kh.VaiTro
            };

            return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = accessToken,
                AccessToken = accessToken,
                RefreshToken = refreshTokenString,
                TokenType = "Bearer",
                ExpiresIn = _jwtService.GetAccessTokenExpirySeconds(),
                User = profile
            }, "Đăng nhập thành công!"));
        }

        // GET: api/v1/KhachHang/Profile
        [Authorize]
        [HttpGet("Profile")]
        public async Task<ActionResult<ApiResponse<KhachHangProfileDto>>> Profile()
        {
            var maKh = User.FindFirst("CustomerID")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maKh))
            {
                return Unauthorized(ApiResponse<KhachHangProfileDto>.Fail("Không xác định được danh tính người dùng."));
            }

            var khachHang = await _context.KhachHangs.SingleOrDefaultAsync(kh => kh.MaKh == maKh);
            if (khachHang == null)
            {
                return NotFound(ApiResponse<KhachHangProfileDto>.Fail("Không tìm thấy thông tin khách hàng."));
            }

            var profile = new KhachHangProfileDto
            {
                MaKh = khachHang.MaKh,
                HoTen = khachHang.HoTen,
                GioiTinh = khachHang.GioiTinh,
                NgaySinh = khachHang.NgaySinh,
                DiaChi = khachHang.DiaChi,
                DienThoai = khachHang.DienThoai,
                Email = khachHang.Email,
                Hinh = khachHang.Hinh,
                HieuLuc = khachHang.HieuLuc,
                VaiTro = khachHang.VaiTro
            };

            return Ok(ApiResponse<KhachHangProfileDto>.Ok(profile));
        }

        // PUT: api/v1/KhachHang/EditProfile
        [Authorize]
        [HttpPut("EditProfile")]
        public async Task<ActionResult<ApiResponse<KhachHangProfileDto>>> EditProfile([FromBody] EditProfileDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<KhachHangProfileDto>.Fail("Dữ liệu chỉnh sửa không hợp lệ", ModelState));
            }

            var maKh = User.FindFirst("CustomerID")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var khachHang = await _context.KhachHangs.SingleOrDefaultAsync(kh => kh.MaKh == maKh);

            if (khachHang == null)
            {
                return NotFound(ApiResponse<KhachHangProfileDto>.Fail("Không tìm thấy người dùng"));
            }

            // Kiểm tra trùng email với user khác
            if (await _context.KhachHangs.AnyAsync(kh => kh.Email == model.Email && kh.MaKh != maKh))
            {
                return BadRequest(ApiResponse<KhachHangProfileDto>.Fail("Email đã được sử dụng bởi tài khoản khác"));
            }

            khachHang.HoTen = model.HoTen;
            khachHang.Email = model.Email;
            khachHang.DienThoai = model.DienThoai;
            khachHang.DiaChi = model.DiaChi;

            _context.Update(khachHang);
            await _context.SaveChangesAsync();

            var profile = new KhachHangProfileDto
            {
                MaKh = khachHang.MaKh,
                HoTen = khachHang.HoTen,
                GioiTinh = khachHang.GioiTinh,
                NgaySinh = khachHang.NgaySinh,
                DiaChi = khachHang.DiaChi,
                DienThoai = khachHang.DienThoai,
                Email = khachHang.Email,
                Hinh = khachHang.Hinh,
                HieuLuc = khachHang.HieuLuc,
                VaiTro = khachHang.VaiTro
            };

            return Ok(ApiResponse<KhachHangProfileDto>.Ok(profile, "Cập nhật hồ sơ thành công!"));
        }

        // POST: api/v1/KhachHang/RefreshToken
        [HttpPost("RefreshToken")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Dữ liệu refresh token không hợp lệ", ModelState));
            }

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == model.RefreshToken);

            if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt <= DateTime.UtcNow)
            {
                return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Refresh token không hợp lệ hoặc đã hết hạn/bị thu hồi."));
            }

            var kh = await _context.KhachHangs.FirstOrDefaultAsync(k => k.MaKh == storedToken.MaKh);
            if (kh == null || !kh.HieuLuc)
            {
                return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Người dùng không tồn tại hoặc tài khoản đã bị khóa."));
            }

            // Thu hồi token cũ và sinh refresh token mới (Token Rotation)
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;

            var newRefreshTokenString = _jwtService.GenerateRefreshToken();
            storedToken.ReplacedByToken = newRefreshTokenString;

            var newRefreshToken = new RefreshToken
            {
                Token = newRefreshTokenString,
                MaKh = kh.MaKh,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            var newAccessToken = _jwtService.GenerateAccessToken(kh);

            var profile = new KhachHangProfileDto
            {
                MaKh = kh.MaKh,
                HoTen = kh.HoTen,
                GioiTinh = kh.GioiTinh,
                NgaySinh = kh.NgaySinh,
                DiaChi = kh.DiaChi,
                DienThoai = kh.DienThoai,
                Email = kh.Email,
                Hinh = kh.Hinh,
                HieuLuc = kh.HieuLuc,
                VaiTro = kh.VaiTro
            };

            return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = newAccessToken,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshTokenString,
                TokenType = "Bearer",
                ExpiresIn = _jwtService.GetAccessTokenExpirySeconds(),
                User = profile
            }, "Làm mới token thành công!"));
        }

        // POST: api/v1/KhachHang/DangXuat
        [HttpPost("DangXuat")]
        public async Task<ActionResult<ApiResponse>> DangXuat([FromBody] LogoutRequestDto? model = null)
        {
            var maKh = User.FindFirst("CustomerID")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 1. Thu hồi theo token được gửi lên nếu có
            if (model != null && !string.IsNullOrEmpty(model.RefreshToken))
            {
                var token = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == model.RefreshToken);
                if (token != null && !token.IsRevoked)
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                }
            }

            // 2. Nếu người dùng đang đăng nhập với Bearer token, thu hồi các token còn hoạt động của họ
            if (!string.IsNullOrEmpty(maKh))
            {
                var userTokens = await _context.RefreshTokens
                    .Where(t => t.MaKh == maKh && !t.IsRevoked)
                    .ToListAsync();

                foreach (var t in userTokens)
                {
                    t.IsRevoked = true;
                    t.RevokedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse.SuccessResult("Đăng xuất thành công!"));
        }
    }
}
