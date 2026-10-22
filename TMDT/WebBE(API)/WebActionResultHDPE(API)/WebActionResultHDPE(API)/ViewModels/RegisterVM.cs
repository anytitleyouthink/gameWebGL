using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.ViewModels
{
    public class RegisterVM
    {
        [Display(Name = "Tên đăng nhập")]
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
        [MaxLength(50, ErrorMessage = "Tối đa 50 ký tự")]
        public string MaKh { get; set; } = null!;

        [Display(Name = "Mật khẩu")]
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        [DataType(DataType.Password)]
        public string MatKhau { get; set; } = null!;

        [Display(Name = "Email")]
        [Required(ErrorMessage = "Vui lòng nhập Email")]
        [EmailAddress(ErrorMessage = "Chưa đúng định dạng email")]
        public string Email { get; set; } = null!;

        // --- CÁC TRƯỜNG DƯỚI ĐÂY LÀ OPTIONAL (CÓ THỂ NULL) ---

        [Display(Name = "Họ tên")]
        [MaxLength(50, ErrorMessage = "Tối đa 50 ký tự")]
        public string? HoTen { get; set; }

        public bool GioiTinh { get; set; } = true;

        [Display(Name = "Ngày sinh")]
        [DataType(DataType.Date)]
        public DateTime? NgaySinh { get; set; }

        [MaxLength(100, ErrorMessage = "Tối đa 100 ký tự")]
        public string? DiaChi { get; set; }

        [MaxLength(24, ErrorMessage = "Tối đa 24 ký tự")]
        public string? DienThoai { get; set; }

        public string? Hinh { get; set; }
    }
}