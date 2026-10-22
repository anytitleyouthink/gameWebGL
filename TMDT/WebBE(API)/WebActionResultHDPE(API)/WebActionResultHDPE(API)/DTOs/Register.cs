using System.ComponentModel.DataAnnotations;
namespace WebActionResultHDPE.DTOs
{
    public class Register
    {
        [Display(Name = "Tên đăng nhập")]
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3 đến 20 ký tự")]
        public string User_name { get; set; } = null!;

        [Display(Name = "Họ và tên")]
        [Required(ErrorMessage = "Vui lòng nhập họ tên")]
        [MaxLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự")]
        public string full_name { get; set; } = null!;

        [Display(Name = "Mật khẩu")]
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [RegularExpression(@"^[a-zA-Z0-9]{6,}$", ErrorMessage = "Mật khẩu ít nhất 6 ký tự (chữ và số)")]
        [DataType(DataType.Password)]
        public string password { get; set; } = null!;

        [Display(Name = "Xác nhận mật khẩu")]
        [Compare("password", ErrorMessage = "Mật khẩu xác nhận không khớp")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; } = null!;

        [Display(Name = "Địa chỉ Email")]
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ")]
        public string email { get; set; } = null!;

        [Display(Name = "Số điện thoại")]
        [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
        [RegularExpression(@"^0[35789]\d{8}$", ErrorMessage = "Số điện thoại Việt Nam không đúng định dạng")]
        public string phone { get; set; } = null!;

        [Display(Name = "Ngày sinh")]
        [DataType(DataType.Date)]
        public DateTime? birthday { get; set; }
    }
}
