using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;

namespace WebActionResultHDPE.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly Hshop2023Context _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger, Hshop2023Context context)
        {
            _logger = logger;
            _context = context;
        }

        // GET: api/v1/Home
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<HangHoaDto>>>> Index()
        {
            var items = await _context.HangHoas
                .Include(h => h.MaLoaiNavigation)
                .Include(h => h.MaNccNavigation)
                .OrderByDescending(h => h.NgaySx)
                .Take(20)
                .Select(h => new HangHoaDto
                {
                    MaHh = h.MaHh,
                    TenHh = h.TenHh,
                    TenAlias = h.TenAlias,
                    MaLoai = h.MaLoai,
                    TenLoai = h.MaLoaiNavigation.TenLoai,
                    MoTaDonVi = h.MoTaDonVi,
                    DonGia = h.DonGia,
                    Hinh = h.Hinh,
                    NgaySx = h.NgaySx,
                    GiamGia = h.GiamGia,
                    SoLanXem = h.SoLanXem,
                    MoTa = h.MoTa,
                    MaNcc = h.MaNcc,
                    TenNcc = h.MaNccNavigation.TenCongTy
                })
                .ToListAsync();

            return Ok(ApiResponse<List<HangHoaDto>>.Ok(items));
        }

        // GET: api/v1/Home/Privacy
        [HttpGet("Privacy")]
        public ActionResult<ApiResponse<object>> Privacy()
        {
            return Ok(ApiResponse<object>.Ok(new
            {
                Policy = "HDPE Shop Privacy Policy",
                Updated = "2024",
                Contact = "hdpeshop@gmail.com"
            }));
        }
    }
}
