using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Services;

namespace WebActionResultHDPE.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst("CustomerID")?.Value 
                     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(claim))
            {
                return claim;
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var headerVal) && !string.IsNullOrEmpty(headerVal.FirstOrDefault()))
            {
                return headerVal.First()!;
            }

            return "admin"; // Default fallback
        }

        /// <summary>
        /// GET api/v1/vouchers
        /// Lấy danh sách voucher đang mở bán trong Voucher Shop.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ShopVoucherDto>>> GetShopVouchers()
        {
            var vouchers = await _voucherService.GetShopVouchersAsync();
            return Ok(vouchers);
        }

        /// <summary>
        /// GET api/v1/vouchers/my
        /// Lấy danh sách voucher mà User đang sở hữu.
        /// </summary>
        [HttpGet("my")]
        public async Task<ActionResult<List<UserVoucherDto>>> GetMyVouchers()
        {
            string userId = GetUserId();
            var userVouchers = await _voucherService.GetUserVouchersAsync(userId);
            return Ok(userVouchers);
        }

        /// <summary>
        /// POST api/v1/vouchers/{voucherId}/purchase
        /// Dùng Coin đổi lấy Voucher.
        /// </summary>
        [HttpPost("{voucherId:int}/purchase")]
        public async Task<ActionResult<PurchaseVoucherResponse>> PurchaseVoucher(int voucherId)
        {
            string userId = GetUserId();
            var result = await _voucherService.PurchaseVoucherAsync(userId, voucherId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/vouchers/use
        /// Áp dụng / sử dụng Voucher code cho đơn hàng.
        /// </summary>
        [HttpPost("use")]
        public async Task<ActionResult<UseGameVoucherResponse>> UseVoucher([FromBody] UseGameVoucherRequest request)
        {
            string userId = GetUserId();
            var result = await _voucherService.UseVoucherAsync(userId, request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/vouchers/spin
        /// Quay vòng quay may mắn đổi Voucher (Tỷ lệ 30% trúng từ Random 1-100).
        /// </summary>
        [HttpPost("spin")]
        public async Task<ActionResult<SpinWheelResponse>> SpinWheel()
        {
            string userId = GetUserId();
            var result = await _voucherService.SpinWheelAsync(userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
