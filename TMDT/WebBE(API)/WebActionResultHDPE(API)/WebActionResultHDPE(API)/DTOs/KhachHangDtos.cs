using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.DTOs
{
    public class KhachHangProfileDto
    {
        public string MaKh { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public bool GioiTinh { get; set; }
        public DateTime NgaySinh { get; set; }
        public string? DiaChi { get; set; }
        public string? DienThoai { get; set; }
        public string Email { get; set; } = null!;
        public string? Hinh { get; set; }
        public bool HieuLuc { get; set; }
        public int VaiTro { get; set; }
    }

    public class EditProfileDto
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string HoTen { get; set; } = null!;

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        public string? DienThoai { get; set; }

        public string? DiaChi { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }
        public KhachHangProfileDto User { get; set; } = null!;
    }

    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "RefreshToken là bắt buộc")]
        public string RefreshToken { get; set; } = null!;
    }

    public class LogoutRequestDto
    {
        public string? RefreshToken { get; set; }
    }
}
