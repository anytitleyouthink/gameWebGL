using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.ViewModels
{
    public class LoginVM
    {
        public string? UserName { get; set; }

        public string? Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        // Trả về định danh người dùng đăng nhập (Username hoặc Email)
        public string GetIdentifier()
        {
            if (!string.IsNullOrWhiteSpace(UserName)) return UserName.Trim();
            if (!string.IsNullOrWhiteSpace(Email)) return Email.Trim();
            return string.Empty;
        }
    }
}