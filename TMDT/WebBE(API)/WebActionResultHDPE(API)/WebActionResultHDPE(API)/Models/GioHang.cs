using System;
using System.Collections.Generic;

namespace WebActionResultHDPE.Models;

public partial class GioHang
{
    public int Id { get; set; }

    public int MaHh { get; set; }

    public double? DonGia { get; set; }

    public int SoLuong { get; set; }

    public double GiamGia { get; set; }

    public DateTime Ngay { get; set; }

    public string SessionId { get; set; } = null!;

    public string? Hinh { get; set; }

    public string? MaKh { get; set; }
}
