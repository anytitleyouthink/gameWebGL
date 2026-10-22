using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Helpers;
using WebActionResultHDPE.Models;
using WebActionResultHDPE.ViewModels;

namespace WebActionResultHDPE.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HangHoasController : ControllerBase
    {
        private readonly Hshop2023Context _context;
        private readonly ICloudinaryService _cloudinaryService;

        public HangHoasController(Hshop2023Context context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // GET: api/v1/HangHoas
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResult<HangHoaDto>>>> Index(
            [FromQuery] int? loai,
            [FromQuery] int? page,
            [FromQuery] int pageSize = 8,
            [FromQuery] string? keyword = null)
        {
            if (pageSize <= 0) pageSize = 8;
            int pageNumber = page ?? 1;
            if (pageNumber <= 0) pageNumber = 1;

            var query = _context.HangHoas
                .Include(h => h.MaLoaiNavigation)
                .Include(h => h.MaNccNavigation)
                .AsQueryable();

            string? tenLoai = null;
            if (loai.HasValue)
            {
                query = query.Where(h => h.MaLoai == loai.Value);
                var loaiSp = await _context.Loais.FindAsync(loai.Value);
                tenLoai = loaiSp?.TenLoai;
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var cleanKeyword = keyword.Trim();
                query = query.Where(h =>
                    h.TenHh.Contains(cleanKeyword) ||
                    (h.TenAlias != null && h.TenAlias.Contains(cleanKeyword))
                );
            }

            int totalItems = await query.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
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

            var result = new PagedResult<HangHoaDto>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                MaLoai = loai,
                TenLoai = tenLoai,
                Keyword = keyword
            };

            return Ok(ApiResponse<PagedResult<HangHoaDto>>.Ok(result));
        }

        // GET: api/v1/HangHoas/Search?keyword=...
        [HttpGet("Search")]
        public async Task<ActionResult<ApiResponse<List<HangHoaSearchDto>>>> Search([FromQuery] string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return Ok(ApiResponse<List<HangHoaSearchDto>>.Ok(new List<HangHoaSearchDto>()));
            }

            var cleanKeyword = keyword.Trim();

            var products = await _context.HangHoas
                .Where(h =>
                    h.TenHh.Contains(cleanKeyword) ||
                    (h.TenAlias != null && h.TenAlias.Contains(cleanKeyword))
                )
                .OrderByDescending(h => h.SoLanXem)
                .Take(5)
                .Select(h => new HangHoaSearchDto
                {
                    Id = h.MaHh,
                    Name = h.TenHh,
                    Price = h.DonGia,
                    Image = h.Hinh,
                    CategoryId = h.MaLoai
                })
                .ToListAsync();

            return Ok(ApiResponse<List<HangHoaSearchDto>>.Ok(products));
        }

        // GET: api/v1/HangHoas/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<HangHoaDto>>> Details(int id)
        {
            var h = await _context.HangHoas
                .Include(x => x.MaLoaiNavigation)
                .Include(x => x.MaNccNavigation)
                .FirstOrDefaultAsync(m => m.MaHh == id);

            if (h == null)
            {
                return NotFound(ApiResponse<HangHoaDto>.Fail("Không tìm thấy hàng hóa."));
            }

            // Tăng số lần xem khi xem chi tiết
            h.SoLanXem += 1;
            await _context.SaveChangesAsync();

            var dto = new HangHoaDto
            {
                MaHh = h.MaHh,
                TenHh = h.TenHh,
                TenAlias = h.TenAlias,
                MaLoai = h.MaLoai,
                TenLoai = h.MaLoaiNavigation?.TenLoai,
                MoTaDonVi = h.MoTaDonVi,
                DonGia = h.DonGia,
                Hinh = h.Hinh,
                NgaySx = h.NgaySx,
                GiamGia = h.GiamGia,
                SoLanXem = h.SoLanXem,
                MoTa = h.MoTa,
                MaNcc = h.MaNcc,
                TenNcc = h.MaNccNavigation?.TenCongTy
            };

            return Ok(ApiResponse<HangHoaDto>.Ok(dto));
        }

        // GET: api/v1/HangHoas/Loai
        [HttpGet("Loai")]
        public async Task<ActionResult<ApiResponse<List<MenuLoaiVM>>>> GetLoai()
        {
            var data = await _context.Loais
                .Select(lo => new MenuLoaiVM
                {
                    MaLoai = lo.MaLoai,
                    TenLoai = lo.TenLoai,
                    Hinh = lo.Hinh,
                    SoLuong = lo.HangHoas.Count(),
                    MoTa = lo.MoTa
                })
                .OrderBy(p => p.TenLoai)
                .ToListAsync();

            return Ok(ApiResponse<List<MenuLoaiVM>>.Ok(data));
        }

        // POST: api/v1/HangHoas/upload-image (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost("upload-image")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse<object>>> UploadImage([FromForm] UploadImageDto model)
        {
            var file = model?.File ?? (Request.HasFormContentType && Request.Form.Files.Count > 0 ? Request.Form.Files["file"] ?? Request.Form.Files[0] : null);
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn file hình ảnh hợp lệ."));
            }

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse<object>.Fail("Định dạng file không được hỗ trợ. Chỉ chấp nhận jpg, jpeg, png, webp, gif."));
            }

            // Giới hạn 10MB
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(ApiResponse<object>.Fail("Kích thước file ảnh không được vượt quá 10MB."));
            }

            try
            {
                var imageUrl = await _cloudinaryService.UploadImageAsync(file, "hdpe_products");
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return StatusCode(500, ApiResponse<object>.Fail("Tải ảnh lên Cloudinary không thành công."));
                }

                return Ok(ApiResponse<object>.Ok(new { url = imageUrl, secureUrl = imageUrl }, "Tải ảnh lên Cloudinary thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Lỗi khi upload Cloudinary: " + ex.Message));
            }
        }

        // POST: api/v1/HangHoas (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<HangHoaDto>>> Create([FromBody] HangHoaUpsertDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<HangHoaDto>.Fail("Dữ liệu không hợp lệ", ModelState));
            }

            // Kiểm tra NCC hợp lệ, nếu không có lấy NCC đầu tiên
            var ncc = await _context.NhaCungCaps.FirstOrDefaultAsync(n => n.MaNcc == model.MaNcc);
            var defaultNcc = ncc?.MaNcc ?? (await _context.NhaCungCaps.Select(n => n.MaNcc).FirstOrDefaultAsync()) ?? "AP";

            var hangHoa = new HangHoa
            {
                TenHh = model.TenHh,
                TenAlias = string.IsNullOrWhiteSpace(model.TenAlias) ? model.TenHh.ToLower().Replace(" ", "-") : model.TenAlias,
                MaLoai = model.MaLoai,
                MoTaDonVi = model.MoTaDonVi ?? "Cái",
                DonGia = model.DonGia ?? 0,
                Hinh = model.Hinh ?? "Photo.gif",
                NgaySx = model.NgaySx == default ? DateTime.Now : model.NgaySx,
                GiamGia = model.GiamGia,
                SoLanXem = model.SoLanXem,
                MoTa = model.MoTa,
                MaNcc = defaultNcc
            };

            _context.HangHoas.Add(hangHoa);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Details), new { id = hangHoa.MaHh },
                ApiResponse<HangHoaDto>.Ok(new HangHoaDto
                {
                    MaHh = hangHoa.MaHh,
                    TenHh = hangHoa.TenHh,
                    TenAlias = hangHoa.TenAlias,
                    MaLoai = hangHoa.MaLoai,
                    MoTaDonVi = hangHoa.MoTaDonVi,
                    DonGia = hangHoa.DonGia,
                    Hinh = hangHoa.Hinh,
                    NgaySx = hangHoa.NgaySx,
                    GiamGia = hangHoa.GiamGia,
                    SoLanXem = hangHoa.SoLanXem,
                    MoTa = hangHoa.MoTa,
                    MaNcc = hangHoa.MaNcc
                }, "Thêm hàng hóa thành công!"));
        }

        // PUT: api/v1/HangHoas/{id} (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<HangHoaDto>>> Edit(int id, [FromBody] HangHoaUpsertDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<HangHoaDto>.Fail("Dữ liệu không hợp lệ", ModelState));
            }

            var hangHoa = await _context.HangHoas.FindAsync(id);
            if (hangHoa == null)
            {
                return NotFound(ApiResponse<HangHoaDto>.Fail("Không tìm thấy hàng hóa cần sửa."));
            }

            hangHoa.TenHh = model.TenHh;
            hangHoa.TenAlias = string.IsNullOrWhiteSpace(model.TenAlias) ? model.TenHh.ToLower().Replace(" ", "-") : model.TenAlias;
            hangHoa.MaLoai = model.MaLoai;
            hangHoa.MoTaDonVi = model.MoTaDonVi;
            hangHoa.DonGia = model.DonGia;
            if (!string.IsNullOrWhiteSpace(model.Hinh))
            {
                hangHoa.Hinh = model.Hinh;
            }
            hangHoa.NgaySx = model.NgaySx == default ? hangHoa.NgaySx : model.NgaySx;
            hangHoa.GiamGia = model.GiamGia;
            hangHoa.SoLanXem = model.SoLanXem;
            hangHoa.MoTa = model.MoTa;
            if (!string.IsNullOrWhiteSpace(model.MaNcc))
            {
                hangHoa.MaNcc = model.MaNcc;
            }

            _context.Update(hangHoa);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<HangHoaDto>.Ok(new HangHoaDto
            {
                MaHh = hangHoa.MaHh,
                TenHh = hangHoa.TenHh,
                TenAlias = hangHoa.TenAlias,
                MaLoai = hangHoa.MaLoai,
                MoTaDonVi = hangHoa.MoTaDonVi,
                DonGia = hangHoa.DonGia,
                Hinh = hangHoa.Hinh,
                NgaySx = hangHoa.NgaySx,
                GiamGia = hangHoa.GiamGia,
                SoLanXem = hangHoa.SoLanXem,
                MoTa = hangHoa.MoTa,
                MaNcc = hangHoa.MaNcc
            }, "Cập nhật hàng hóa thành công!"));
        }

        // DELETE: api/v1/HangHoas/{id} (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> DeleteConfirmed(int id)
        {
            var hangHoa = await _context.HangHoas.FindAsync(id);
            if (hangHoa == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy hàng hóa để xóa."));
            }

            _context.HangHoas.Remove(hangHoa);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResult("Xóa hàng hóa thành công!"));
        }
    }
}
