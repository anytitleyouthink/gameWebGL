using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebActionResultHDPE.Models
{
    [Table("PuzzleGames")]
    public class PuzzleGame
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GameId { get; set; }

        [Required]
        [StringLength(50)]
        public string GameCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string GameName { get; set; } = string.Empty;

        public int DailyLevelLimit { get; set; } = 5;

        public int DailyPlayLimit { get; set; } = 10;

        public int InitialTickets { get; set; } = 3;

        public bool IsActive { get; set; } = true;

        public virtual ICollection<PuzzleLevel> Levels { get; set; } = new List<PuzzleLevel>();
    }

    [Table("PuzzleLevels")]
    public class PuzzleLevel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LevelId { get; set; }

        public int GameId { get; set; }

        public int LevelNumber { get; set; }

        public int Rows { get; set; } = 3;

        public int Columns { get; set; } = 3;

        public int TimeLimitSeconds { get; set; } = 60;

        [StringLength(255)]
        public string? BackgroundImage { get; set; }

        public int MinPieces { get; set; } = 9;

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("PuzzleRewardRules")]
    public class PuzzleRewardRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleId { get; set; }

        public int GameId { get; set; }

        public int LevelNumber { get; set; }

        public int WinCoins { get; set; }

        public int LoseCoins { get; set; }

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("PuzzleDailyProgress")]
    public class PuzzleDailyProgress
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DailyProgressId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        public int GameId { get; set; }

        [Column(TypeName = "date")]
        public DateOnly PlayDate { get; set; }

        public int CurrentLevel { get; set; } = 1;

        public int CompletedLevels { get; set; } = 0;

        public int PlayCount { get; set; } = 0;

        public int Tickets { get; set; } = 3;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Playing"; // Playing, Completed, Locked

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("PuzzleGameSessions")]
    public class PuzzleGameSession
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SessionId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        public int GameId { get; set; }

        public int LevelNumber { get; set; }

        public int ImageIndex { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Started"; // Started, Win, Lose

        public DateTime StartTime { get; set; } = DateTime.Now;

        public DateTime? EndTime { get; set; }

        public int RewardCoins { get; set; } = 0;

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("PuzzleProductViewRules")]
    public class PuzzleProductViewRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleId { get; set; }

        public int GameId { get; set; }

        public int RequiredViewDurationSeconds { get; set; } = 10;

        public int DailyMaxClaimableTickets { get; set; } = 3;

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("PuzzleProductViews")]
    public class PuzzleProductView
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductViewId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        public int GameId { get; set; }

        public int ProductId { get; set; }

        public DateTime StartTime { get; set; } = DateTime.Now;

        public DateTime? EndTime { get; set; }

        public int DurationSeconds { get; set; } = 0;

        public bool IsQualified { get; set; } = false;

        public bool IsClaimed { get; set; } = false;

        [ForeignKey("GameId")]
        public virtual PuzzleGame? Game { get; set; }
    }

    [Table("CoinTransactions")]
    public class CoinTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        public int Amount { get; set; }

        public int BalanceAfter { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // PuzzleReward, PurchaseVoucher, SpinReward, SpinCost

        [StringLength(255)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    [Table("Vouchers")]
    public class Voucher
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoucherId { get; set; }

        [Required]
        [StringLength(50)]
        public string VoucherCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string VoucherName { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Description { get; set; }

        [Required]
        [StringLength(20)]
        public string DiscountType { get; set; } = "Fixed"; // Fixed, Percent

        public double DiscountValue { get; set; }

        public double MinOrderAmount { get; set; }

        public double? MaxDiscountAmount { get; set; }

        public int CoinPrice { get; set; }

        public int TotalQuantity { get; set; }

        public int RemainingQuantity { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime StartDate { get; set; } = DateTime.Now;

        public DateTime EndDate { get; set; } = DateTime.Now.AddDays(30);
    }

    [Table("UserVouchers")]
    public class UserVoucher
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserVoucherId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        public int VoucherId { get; set; }

        [Required]
        [StringLength(50)]
        public string VoucherCode { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string DiscountType { get; set; } = "Fixed";

        public double DiscountValue { get; set; }

        public double MinOrderAmount { get; set; }

        public double? MaxDiscountAmount { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime? UsedAt { get; set; }

        public DateTime ExpiryDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }
    }

    [Table("VoucherTransactions")]
    public class VoucherTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoucherTransactionId { get; set; }

        public int VoucherId { get; set; }

        public int? UserVoucherId { get; set; }

        [Required]
        [StringLength(50)]
        public string MaKh { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // Purchase, Spin, Use

        public double Amount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }

        [ForeignKey("UserVoucherId")]
        public virtual UserVoucher? UserVoucher { get; set; }
    }
}
