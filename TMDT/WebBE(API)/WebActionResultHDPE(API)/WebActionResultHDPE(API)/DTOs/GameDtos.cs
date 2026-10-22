namespace WebActionResultHDPE.DTOs
{
    // ==================== PUZZLE GAME DTOS ====================
    public class PuzzleStatusDto
    {
        public int GameId { get; set; }
        public int CurrentLevel { get; set; }
        public int CompletedLevels { get; set; }
        public int Tickets { get; set; }
        public int PlayCount { get; set; }
        public int DailyLevelLimit { get; set; }
        public string Status { get; set; } = "Playing";
        public int CurrentCoins { get; set; }
        public bool CanPlay { get; set; }
        public bool CanClaimProductTicket { get; set; }
    }

    public class StartPuzzleResponse
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public long SessionId { get; set; }
        public int LevelNumber { get; set; }
        public int ImageIndex { get; set; }
        public int Tickets { get; set; }
        public int CurrentCoins { get; set; }
    }

    public class CompletePuzzleDto
    {
        public long SessionId { get; set; }
        public string Result { get; set; } = "Win"; // "Win" hoặc "Lose"
    }

    public class CompletePuzzleRequest : CompletePuzzleDto { }

    public class CompletePuzzleResponse
    {
        public bool Success { get; set; }
        public string Result { get; set; } = string.Empty;
        public int RewardCoins { get; set; }
        public int CurrentCoins { get; set; }
        public int CurrentLevel { get; set; }
        public int CompletedLevels { get; set; }
        public int Tickets { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool CanContinue { get; set; }
        public string? Message { get; set; }
    }

    public class ProductViewStartRequest
    {
        public int ProductId { get; set; }
    }

    public class ProductViewStartResponse
    {
        public long ProductViewId { get; set; }
    }

    public class ProductViewCompleteRequest
    {
        public long ProductViewId { get; set; }
    }

    public class ProductViewCompleteResponse
    {
        public long ProductViewId { get; set; }
        public int DurationSeconds { get; set; }
        public bool IsQualified { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ClaimTicketRequest
    {
        public long ProductViewId { get; set; }
    }

    public class ClaimTicketResponse
    {
        public int Tickets { get; set; }
        public int RemainingClaims { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class LockResponse
    {
        public bool Success { get; set; }
        public string Status { get; set; } = "Locked";
        public string Message { get; set; } = string.Empty;
    }

    // ==================== VOUCHER & LUCKY WHEEL DTOS ====================
    public class ShopVoucherDto
    {
        public int VoucherId { get; set; }
        public string VoucherCode { get; set; } = string.Empty;
        public string VoucherName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = string.Empty;
        public double DiscountValue { get; set; }
        public double MinOrderAmount { get; set; }
        public double? MaxDiscountAmount { get; set; }
        public int CoinPrice { get; set; }
        public int RemainingQuantity { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class UserVoucherDto
    {
        public long UserVoucherId { get; set; }
        public string VoucherName { get; set; } = string.Empty;
        public string VoucherCode { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public double DiscountValue { get; set; }
        public double MinOrderAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PurchasedAt { get; set; }
        public DateTime ExpiredAt { get; set; }
    }

    public class PurchaseVoucherResponse
    {
        public bool Success { get; set; }
        public string? VoucherCode { get; set; }
        public string? VoucherName { get; set; }
        public int CoinSpent { get; set; }
        public int RemainingCoins { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class UseGameVoucherRequest
    {
        public string VoucherCode { get; set; } = string.Empty;
    }

    public class UseGameVoucherResponse
    {
        public bool Success { get; set; }
        public string? VoucherCode { get; set; }
        public string? VoucherName { get; set; }
        public string? DiscountType { get; set; }
        public double DiscountValue { get; set; }
        public double MinOrderAmount { get; set; }
        public double? MaxDiscountAmount { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class SpinWheelResponse
    {
        public bool Success { get; set; }
        public bool IsWin { get; set; }
        public int RollValue { get; set; }
        public int TargetSliceIndex { get; set; } // Index cho Vòng quay Canvas (0-5)
        public string? VoucherCode { get; set; }
        public string? VoucherName { get; set; }
        public double DiscountValue { get; set; }
        public int CoinSpent { get; set; } = 20;
        public int RemainingCoins { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
