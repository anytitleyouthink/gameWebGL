using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Controllers
{
    [Authorize]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DonHangsController : ControllerBase
    {
        private readonly Hshop2023Context _context;

        public DonHangsController(Hshop2023Context context)
        {
            _context = context;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst("CustomerID")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        // GET: api/v1/DonHangs/LichSu
        [HttpGet("LichSu")]
        public async Task<ActionResult<ApiResponse<List<HoaDonDto>>>> LichSu()
        {
            string? maKH = GetCurrentUserId();
            if (string.IsNullOrEmpty(maKH))
            {
                return Unauthorized(ApiResponse<List<HoaDonDto>>.Fail("Vui lòng đăng nhập để xem lịch sử đơn hàng."));
            }

            var lichSuDonHang = await _context.HoaDons
                .Include(h => h.MaTrangThaiNavigation)
                .Include(h => h.ChiTietHds)
                    .ThenInclude(ct => ct.MaHhNavigation)
                .Where(h => h.MaKh == maKH)
                .OrderByDescending(h => h.NgayDat)
                .Select(h => new HoaDonDto
                {
                    MaHd = h.MaHd,
                    MaKh = h.MaKh,
                    TenKhachHang = h.HoTen,
                    NgayDat = h.NgayDat,
                    NgayCan = h.NgayCan,
                    NgayGiao = h.NgayGiao,
                    HoTen = h.HoTen,
                    DiaChi = h.DiaChi,
                    CachThanhToan = h.CachThanhToan,
                    CachVanChuyen = h.CachVanChuyen,
                    PhiVanChuyen = h.PhiVanChuyen,
                    MaTrangThai = h.MaTrangThai,
                    TenTrangThai = h.MaTrangThaiNavigation.TenTrangThai,
                    MaNv = h.MaNv,
                    GhiChu = h.GhiChu,
                    TongTien = h.ChiTietHds.Sum(ct => ct.SoLuong * ct.DonGia),
                    ChiTietHds = h.ChiTietHds.Select(ct => new HoaDonChiTietItemDto
                    {
                        MaCt = ct.MaCt,
                        MaHh = ct.MaHh,
                        TenHh = ct.MaHhNavigation.TenHh,
                        Hinh = ct.MaHhNavigation.Hinh,
                        DonGia = ct.DonGia,
                        SoLuong = ct.SoLuong,
                        GiamGia = ct.GiamGia,
                        ThanhTien = ct.SoLuong * ct.DonGia * (1 - ct.GiamGia)
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<HoaDonDto>>.Ok(lichSuDonHang));
        }

        // GET: api/v1/DonHangs/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<HoaDonDto>>> Details(int id)
        {
            string? maKH = GetCurrentUserId();
            var query = _context.HoaDons
                .Include(h => h.MaKhNavigation)
                .Include(h => h.MaTrangThaiNavigation)
                .Include(h => h.ChiTietHds)
                    .ThenInclude(ct => ct.MaHhNavigation)
                .AsQueryable();

            if (!IsAdmin())
            {
                query = query.Where(m => m.MaHd == id && m.MaKh == maKH);
            }
            else
            {
                query = query.Where(m => m.MaHd == id);
            }

            var h = await query.FirstOrDefaultAsync();

            if (h == null)
            {
                return NotFound(ApiResponse<HoaDonDto>.Fail("Không tìm thấy đơn hàng."));
            }

            var dto = new HoaDonDto
            {
                MaHd = h.MaHd,
                MaKh = h.MaKh,
                TenKhachHang = h.HoTen ?? h.MaKhNavigation?.HoTen,
                NgayDat = h.NgayDat,
                NgayCan = h.NgayCan,
                NgayGiao = h.NgayGiao,
                HoTen = h.HoTen,
                DiaChi = h.DiaChi,
                CachThanhToan = h.CachThanhToan,
                CachVanChuyen = h.CachVanChuyen,
                PhiVanChuyen = h.PhiVanChuyen,
                MaTrangThai = h.MaTrangThai,
                TenTrangThai = h.MaTrangThaiNavigation?.TenTrangThai,
                MaNv = h.MaNv,
                GhiChu = h.GhiChu,
                TongTien = h.ChiTietHds.Sum(ct => ct.SoLuong * ct.DonGia),
                ChiTietHds = h.ChiTietHds.Select(ct => new HoaDonChiTietItemDto
                {
                    MaCt = ct.MaCt,
                    MaHh = ct.MaHh,
                    TenHh = ct.MaHhNavigation?.TenHh ?? "",
                    Hinh = ct.MaHhNavigation?.Hinh,
                    DonGia = ct.DonGia,
                    SoLuong = ct.SoLuong,
                    GiamGia = ct.GiamGia,
                    ThanhTien = ct.SoLuong * ct.DonGia * (1 - ct.GiamGia)
                }).ToList()
            };

            return Ok(ApiResponse<HoaDonDto>.Ok(dto));
        }

        // ==========================================
        // Admin / Management Endpoints
        // ==========================================

        // GET: api/v1/DonHangs
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<HoaDonDto>>>> Index()
        {
            var query = _context.HoaDons
                .Include(h => h.MaKhNavigation)
                .Include(h => h.MaNvNavigation)
                .Include(h => h.MaTrangThaiNavigation)
                .Include(h => h.ChiTietHds)
                    .ThenInclude(ct => ct.MaHhNavigation)
                .OrderByDescending(h => h.NgayDat)
                .AsQueryable();

            if (!IsAdmin())
            {
                string? maKH = GetCurrentUserId();
                query = query.Where(h => h.MaKh == maKH);
            }

            var orders = await query.Select(h => new HoaDonDto
            {
                MaHd = h.MaHd,
                MaKh = h.MaKh,
                TenKhachHang = h.HoTen ?? h.MaKhNavigation.HoTen,
                NgayDat = h.NgayDat,
                NgayCan = h.NgayCan,
                NgayGiao = h.NgayGiao,
                HoTen = h.HoTen,
                DiaChi = h.DiaChi,
                CachThanhToan = h.CachThanhToan,
                CachVanChuyen = h.CachVanChuyen,
                PhiVanChuyen = h.PhiVanChuyen,
                MaTrangThai = h.MaTrangThai,
                TenTrangThai = h.MaTrangThaiNavigation.TenTrangThai,
                MaNv = h.MaNv,
                GhiChu = h.GhiChu,
                TongTien = h.ChiTietHds.Sum(ct => ct.SoLuong * ct.DonGia),
                ChiTietHds = h.ChiTietHds.Select(ct => new HoaDonChiTietItemDto
                {
                    MaCt = ct.MaCt,
                    MaHh = ct.MaHh,
                    TenHh = ct.MaHhNavigation.TenHh,
                    Hinh = ct.MaHhNavigation.Hinh,
                    DonGia = ct.DonGia,
                    SoLuong = ct.SoLuong,
                    GiamGia = ct.GiamGia,
                    ThanhTien = ct.SoLuong * ct.DonGia * (1 - ct.GiamGia)
                }).ToList()
            }).ToListAsync();

            return Ok(ApiResponse<List<HoaDonDto>>.Ok(orders));
        }

        // POST: api/v1/DonHangs
        [HttpPost]
        public async Task<ActionResult<ApiResponse<HoaDonDto>>> Create([FromBody] CreateHoaDonDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<HoaDonDto>.Fail("Dữ liệu không hợp lệ", ModelState));
            }

            var hoaDon = new HoaDon
            {
                MaKh = model.MaKh,
                NgayDat = model.NgayDat,
                NgayCan = model.NgayCan,
                NgayGiao = model.NgayGiao,
                HoTen = model.HoTen,
                DiaChi = model.DiaChi,
                CachThanhToan = model.CachThanhToan,
                CachVanChuyen = model.CachVanChuyen,
                PhiVanChuyen = model.PhiVanChuyen,
                MaTrangThai = model.MaTrangThai,
                MaNv = model.MaNv,
                GhiChu = model.GhiChu
            };

            _context.HoaDons.Add(hoaDon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Details), new { id = hoaDon.MaHd },
                ApiResponse<HoaDonDto>.Ok(new HoaDonDto
                {
                    MaHd = hoaDon.MaHd,
                    MaKh = hoaDon.MaKh,
                    NgayDat = hoaDon.NgayDat,
                    HoTen = hoaDon.HoTen,
                    DiaChi = hoaDon.DiaChi,
                    CachThanhToan = hoaDon.CachThanhToan,
                    CachVanChuyen = hoaDon.CachVanChuyen,
                    PhiVanChuyen = hoaDon.PhiVanChuyen,
                    MaTrangThai = hoaDon.MaTrangThai,
                    GhiChu = hoaDon.GhiChu
                }, "Tạo đơn hàng thành công!"));
        }

        // PUT: api/v1/DonHangs/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<HoaDonDto>>> Edit(int id, [FromBody] UpdateHoaDonDto model)
        {
            var hoaDon = await _context.HoaDons.FindAsync(id);
            if (hoaDon == null)
            {
                return NotFound(ApiResponse<HoaDonDto>.Fail("Không tìm thấy đơn hàng cần sửa."));
            }

            if (model.NgayCan.HasValue) hoaDon.NgayCan = model.NgayCan;
            if (model.NgayGiao.HasValue) hoaDon.NgayGiao = model.NgayGiao;
            if (!string.IsNullOrEmpty(model.HoTen)) hoaDon.HoTen = model.HoTen;
            if (!string.IsNullOrEmpty(model.DiaChi)) hoaDon.DiaChi = model.DiaChi;
            if (!string.IsNullOrEmpty(model.CachThanhToan)) hoaDon.CachThanhToan = model.CachThanhToan;
            if (!string.IsNullOrEmpty(model.CachVanChuyen)) hoaDon.CachVanChuyen = model.CachVanChuyen;
            hoaDon.PhiVanChuyen = model.PhiVanChuyen;
            hoaDon.MaTrangThai = model.MaTrangThai;
            if (!string.IsNullOrEmpty(model.MaNv)) hoaDon.MaNv = model.MaNv;
            if (!string.IsNullOrEmpty(model.GhiChu)) hoaDon.GhiChu = model.GhiChu;

            _context.Update(hoaDon);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<HoaDonDto>.Ok(new HoaDonDto
            {
                MaHd = hoaDon.MaHd,
                MaKh = hoaDon.MaKh,
                NgayDat = hoaDon.NgayDat,
                HoTen = hoaDon.HoTen,
                DiaChi = hoaDon.DiaChi,
                CachThanhToan = hoaDon.CachThanhToan,
                CachVanChuyen = hoaDon.CachVanChuyen,
                PhiVanChuyen = hoaDon.PhiVanChuyen,
                MaTrangThai = hoaDon.MaTrangThai,
                GhiChu = hoaDon.GhiChu
            }, "Cập nhật đơn hàng thành công!"));
        }

        // DELETE: api/v1/DonHangs/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> DeleteConfirmed(int id)
        {
            var hoaDon = await _context.HoaDons.Include(h => h.ChiTietHds).FirstOrDefaultAsync(h => h.MaHd == id);
            if (hoaDon == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy đơn hàng để xóa."));
            }

            _context.ChiTietHds.RemoveRange(hoaDon.ChiTietHds);
            _context.HoaDons.Remove(hoaDon);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResult("Xóa đơn hàng thành công!"));
        }
    }
}
