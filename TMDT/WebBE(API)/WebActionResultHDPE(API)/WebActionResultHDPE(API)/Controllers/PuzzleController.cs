using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Services;

namespace WebActionResultHDPE.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PuzzleController : ControllerBase
    {
        private readonly IPuzzleService _puzzleService;

        public PuzzleController(IPuzzleService puzzleService)
        {
            _puzzleService = puzzleService;
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

            return "admin"; // Fallback user for guest/test
        }

        /// <summary>
        /// GET api/v1/puzzle/status
        /// Lấy trạng thái game Puzzle của user hôm nay.
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult<PuzzleStatusDto>> GetStatus()
        {
            string userId = GetUserId();
            var status = await _puzzleService.GetStatusAsync(userId);
            return Ok(status);
        }

        /// <summary>
        /// POST api/v1/puzzle/start
        /// Bắt đầu lượt chơi level hiện tại.
        /// </summary>
        [HttpPost("start")]
        public async Task<ActionResult<StartPuzzleResponse>> StartPuzzle()
        {
            string userId = GetUserId();
            var result = await _puzzleService.StartPuzzleAsync(userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/puzzle/complete
        /// Hoàn thành lượt chơi (Win/Lose).
        /// </summary>
        [HttpPost("complete")]
        public async Task<ActionResult<CompletePuzzleResponse>> CompletePuzzle([FromBody] CompletePuzzleDto dto)
        {
            string userId = GetUserId();
            var result = await _puzzleService.CompletePuzzleAsync(userId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/puzzle/product-view/start
        /// Bắt đầu xem sản phẩm để tích lũy nhận ticket.
        /// </summary>
        [HttpPost("product-view/start")]
        public async Task<ActionResult<ProductViewStartResponse>> StartProductView([FromBody] ProductViewStartRequest request)
        {
            string userId = GetUserId();
            var result = await _puzzleService.StartProductViewAsync(userId, request.ProductId);
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/puzzle/product-view/complete
        /// Hoàn thành thời gian xem sản phẩm.
        /// </summary>
        [HttpPost("product-view/complete")]
        public async Task<ActionResult<ProductViewCompleteResponse>> CompleteProductView([FromBody] ProductViewCompleteRequest request)
        {
            string userId = GetUserId();
            var result = await _puzzleService.CompleteProductViewAsync(userId, request.ProductViewId);
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/puzzle/claim-ticket
        /// Claim ticket thưởng sau khi xem sản phẩm đủ điều kiện.
        /// </summary>
        [HttpPost("claim-ticket")]
        public async Task<ActionResult<ClaimTicketResponse>> ClaimTicket([FromBody] ClaimTicketRequest request)
        {
            string userId = GetUserId();
            var result = await _puzzleService.ClaimTicketAsync(userId, request.ProductViewId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// POST api/v1/puzzle/lock
        /// User chọn "Kết thúc hôm nay".
        /// </summary>
        [HttpPost("lock")]
        public async Task<ActionResult<LockResponse>> LockDailyProgress()
        {
            string userId = GetUserId();
            var result = await _puzzleService.LockDailyProgressAsync(userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
