using System;
using System.Collections.Generic;

namespace WebActionResultHDPE.Models;

public partial class VCategoryList
{
    public int MaLoai { get; set; }

    public string TenLoai { get; set; } = null!;

    public string? Hinh { get; set; }

    public string? MoTa { get; set; }
}
