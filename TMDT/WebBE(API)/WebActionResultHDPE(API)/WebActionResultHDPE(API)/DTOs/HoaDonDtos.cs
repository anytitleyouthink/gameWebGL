using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.DTOs
{
    public class HoaDonChiTietItemDto
    {
        public int MaCt { get; set; }
        public int MaHh { get; set; }
        public string TenHh { get; set; } = null!;
        public string? Hinh { get; set; }
        public double DonGia { get; set; }
        public int SoLuong { get; set; }
        public double GiamGia { get; set; }
        public double ThanhTien { get; set; }
    }

    public class HoaDonDto
    {
        public int MaHd { get; set; }
        public string MaKh { get; set; } = null!;
        public string? TenKhachHang { get; set; }
        public DateTime NgayDat { get; set; }
        public DateTime? NgayCan { get; set; }
        public DateTime? NgayGiao { get; set; }
        public string? HoTen { get; set; }
        public string? DiaChi { get; set; }
        public string CachThanhToan { get; set; } = null!;
        public string CachVanChuyen { get; set; } = null!;
        public double PhiVanChuyen { get; set; }
        public int MaTrangThai { get; set; }
        public string? TenTrangThai { get; set; }
        public string? MaNv { get; set; }
        public string? GhiChu { get; set; }
        public double TongTien { get; set; }
        public List<HoaDonChiTietItemDto> ChiTietHds { get; set; } = new();
    }

    public class CreateHoaDonDto
    {
        [Required]
        public string MaKh { get; set; } = null!;

        public DateTime NgayDat { get; set; } = DateTime.Now;
        public DateTime? NgayCan { get; set; } = DateTime.Now.AddDays(3);
        public DateTime? NgayGiao { get; set; }

        [Required]
        public string HoTen { get; set; } = null!;

        [Required]
        public string DiaChi { get; set; } = null!;

        public string CachThanhToan { get; set; } = "COD";
        public string CachVanChuyen { get; set; } = "Giao hàng tận nơi";
        public double PhiVanChuyen { get; set; } = 0;
        public int MaTrangThai { get; set; } = 0;
        public string? MaNv { get; set; }
        public string? GhiChu { get; set; }
    }

    public class UpdateHoaDonDto
    {
        public DateTime? NgayCan { get; set; }
        public DateTime? NgayGiao { get; set; }
        public string? HoTen { get; set; }
        public string? DiaChi { get; set; }
        public string? CachThanhToan { get; set; }
        public string? CachVanChuyen { get; set; }
        public double PhiVanChuyen { get; set; }
        public int MaTrangThai { get; set; }
        public string? MaNv { get; set; }
        public string? GhiChu { get; set; }
    }
}
