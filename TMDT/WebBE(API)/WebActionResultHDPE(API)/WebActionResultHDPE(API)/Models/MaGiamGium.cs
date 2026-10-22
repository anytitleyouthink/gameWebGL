using System;
using System.Collections.Generic;

namespace WebActionResultHDPE.Models;

public partial class MaGiamGium
{
    public string MaVoucher { get; set; } = null!;

    public string TenVoucher { get; set; } = null!;

    public string? MoTa { get; set; }

    public string LoaiGiamGia { get; set; } = null!;

    public double GiaTriGiam { get; set; }

    public double? GiamToiDa { get; set; }

    public double DonHangToiThieu { get; set; }

    public int SoLuongGiaiHan { get; set; }

    public int SoLuongDaDung { get; set; }

    public DateTime NgayBatDau { get; set; }

    public DateTime NgayHetHan { get; set; }

    public bool IsActive { get; set; }
}
