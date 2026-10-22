using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.DTOs
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int? MaLoai { get; set; }
        public string? TenLoai { get; set; }
        public string? Keyword { get; set; }
    }

    public class HangHoaDto
    {
        public int MaHh { get; set; }
        public string TenHh { get; set; } = null!;
        public string? TenAlias { get; set; }
        public int MaLoai { get; set; }
        public string? TenLoai { get; set; }
        public string? MoTaDonVi { get; set; }
        public double? DonGia { get; set; }
        public string? Hinh { get; set; }
        public DateTime NgaySx { get; set; }
        public double GiamGia { get; set; }
        public int SoLanXem { get; set; }
        public string? MoTa { get; set; }
        public string MaNcc { get; set; } = null!;
        public string? TenNcc { get; set; }
    }

    public class HangHoaSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public double? Price { get; set; }
        public string? Image { get; set; }
        public int CategoryId { get; set; }
    }

    public class HangHoaUpsertDto
    {
        [Required(ErrorMessage = "Tên hàng hóa là bắt buộc")]
        [StringLength(50)]
        public string TenHh { get; set; } = null!;

        [StringLength(50)]
        public string? TenAlias { get; set; }

        public int MaLoai { get; set; }

        [StringLength(50)]
        public string? MoTaDonVi { get; set; }

        public double? DonGia { get; set; }

        [StringLength(500)]
        public string? Hinh { get; set; }

        public DateTime NgaySx { get; set; } = DateTime.Now;

        public double GiamGia { get; set; }

        public int SoLanXem { get; set; }

        public string? MoTa { get; set; }

        [Required(ErrorMessage = "Mã nhà cung cấp là bắt buộc")]
        [StringLength(50)]
        public string MaNcc { get; set; } = null!;
    }

    public class UploadImageDto
    {
        public IFormFile? File { get; set; }
    }
}
