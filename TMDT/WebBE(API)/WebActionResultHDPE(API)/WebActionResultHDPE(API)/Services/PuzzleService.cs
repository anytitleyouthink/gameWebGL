using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Services
{
    public class PuzzleService : IPuzzleService
    {
        private readonly Hshop2023Context _db;
        private static readonly Random _random = new Random();

        public PuzzleService(Hshop2023Context db)
        {
            _db = db;
        }

        private async Task<KhachHang> EnsureUserAsync(string maKh)
        {
            var user = await _db.KhachHangs.FirstOrDefaultAsync(k => k.MaKh == maKh);
            if (user == null)
            {
                user = new KhachHang
                {
                    MaKh = maKh,
                    HoTen = maKh,
                    Email = $"{maKh}@shop.local",
                    Coins = 100,
                    HieuLuc = true,
                    VaiTro = 0,
                    NgaySinh = DateTime.Now
                };
                _db.KhachHangs.Add(user);
                await _db.SaveChangesAsync();
            }
            return user;
        }

        private async Task<PuzzleGame> GetActiveGameAsync()
        {
            var game = await _db.PuzzleGames.FirstOrDefaultAsync(g => g.IsActive)
                       ?? await _db.PuzzleGames.FirstOrDefaultAsync(g => g.GameId == 1);

            if (game == null)
            {
                game = new PuzzleGame
                {
                    GameCode = "PUZZLE_CLASSIC",
                    GameName = "Game Xếp Hình Ghép Tranh",
                    DailyLevelLimit = 5,
                    DailyPlayLimit = 10,
                    InitialTickets = 3,
                    IsActive = true
                };
                _db.PuzzleGames.Add(game);
                await _db.SaveChangesAsync();
            }

            return game;
        }

        public async Task<PuzzleStatusDto> GetStatusAsync(string maKh)
        {
            var user = await EnsureUserAsync(maKh);
            var game = await GetActiveGameAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var progress = await _db.PuzzleDailyProgresses
                .FirstOrDefaultAsync(p => p.MaKh == maKh && p.GameId == game.GameId && p.PlayDate == today);

            if (progress == null)
            {
                progress = new PuzzleDailyProgress
                {
                    MaKh = maKh,
                    GameId = game.GameId,
                    PlayDate = today,
                    CurrentLevel = 1,
                    CompletedLevels = 0,
                    PlayCount = 0,
                    Tickets = game.InitialTickets,
                    Status = "Playing",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _db.PuzzleDailyProgresses.Add(progress);
                await _db.SaveChangesAsync();
            }

            var rule = await _db.PuzzleProductViewRules
                .FirstOrDefaultAsync(r => r.GameId == game.GameId);
            int dailyClaimLimit = rule?.DailyMaxClaimableTickets ?? 3;

            var todayStart = DateTime.Today;
            int todayClaimed = await _db.PuzzleProductViews
                .CountAsync(v => v.MaKh == maKh && v.GameId == game.GameId && v.IsClaimed && v.StartTime >= todayStart);

            bool canPlay = progress.Status == "Playing"
                && progress.Tickets > 0
                && progress.CompletedLevels < game.DailyLevelLimit
                && progress.PlayCount < game.DailyPlayLimit;

            bool canClaimProductTicket = progress.Status == "Playing" && (todayClaimed < dailyClaimLimit);

            return new PuzzleStatusDto
            {
                GameId = game.GameId,
                CurrentLevel = progress.CurrentLevel,
                CompletedLevels = progress.CompletedLevels,
                Tickets = progress.Tickets,
                PlayCount = progress.PlayCount,
                DailyLevelLimit = game.DailyLevelLimit,
                Status = progress.Status,
                CurrentCoins = user.Coins,
                CanPlay = canPlay,
                CanClaimProductTicket = canClaimProductTicket
            };
        }

        public async Task<StartPuzzleResponse> StartPuzzleAsync(string maKh)
        {
            var user = await EnsureUserAsync(maKh);
            var game = await GetActiveGameAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var progress = await _db.PuzzleDailyProgresses
                .FirstOrDefaultAsync(p => p.MaKh == maKh && p.GameId == game.GameId && p.PlayDate == today);

            if (progress == null || progress.Status != "Playing")
            {
                return new StartPuzzleResponse { Success = false, Message = "Lượt chơi hôm nay đã bị khóa hoặc chưa khởi tạo." };
            }

            if (progress.Tickets <= 0)
            {
                return new StartPuzzleResponse { Success = false, Message = "Bạn đã hết vé chơi hôm nay. Hãy xem sản phẩm để nhận thêm vé!" };
            }

            if (progress.CompletedLevels >= game.DailyLevelLimit)
            {
                return new StartPuzzleResponse { Success = false, Message = "Bạn đã hoàn thành toàn bộ màn chơi của hôm nay!" };
            }

            if (progress.PlayCount >= game.DailyPlayLimit)
            {
                return new StartPuzzleResponse { Success = false, Message = "Bạn đã đạt giới hạn số lượt chơi trong ngày." };
            }

            progress.Tickets -= 1;
            progress.PlayCount += 1;
            progress.UpdatedAt = DateTime.Now;

            int imageIndex = _random.Next(1, 51);

            var session = new PuzzleGameSession
            {
                MaKh = maKh,
                GameId = game.GameId,
                LevelNumber = progress.CurrentLevel,
                ImageIndex = imageIndex,
                Status = "Started",
                StartTime = DateTime.Now
            };

            _db.PuzzleGameSessions.Add(session);
            await _db.SaveChangesAsync();

            return new StartPuzzleResponse
            {
                Success = true,
                SessionId = session.SessionId,
                LevelNumber = session.LevelNumber,
                ImageIndex = imageIndex,
                Tickets = progress.Tickets,
                CurrentCoins = user.Coins
            };
        }

        public async Task<CompletePuzzleResponse> CompletePuzzleAsync(string maKh, CompletePuzzleDto dto)
        {
            var user = await EnsureUserAsync(maKh);
            var game = await GetActiveGameAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var session = await _db.PuzzleGameSessions
                .FirstOrDefaultAsync(s => s.SessionId == dto.SessionId && s.MaKh == maKh);

            if (session == null || session.Status != "Started")
            {
                return new CompletePuzzleResponse { Success = false, Message = "Phiên chơi không hợp lệ hoặc đã hoàn thành trước đó." };
            }

            var progress = await _db.PuzzleDailyProgresses
                .FirstOrDefaultAsync(p => p.MaKh == maKh && p.GameId == game.GameId && p.PlayDate == today);

            if (progress == null)
            {
                return new CompletePuzzleResponse { Success = false, Message = "Không tìm thấy tiến trình chơi hôm nay." };
            }

            bool isWin = string.Equals(dto.Result, "Win", StringComparison.OrdinalIgnoreCase);
            session.Status = isWin ? "Win" : "Lose";
            session.EndTime = DateTime.Now;

            // Tra cứu số coin thưởng từ PuzzleRewardRules
            var rewardRule = await _db.PuzzleRewardRules
                .FirstOrDefaultAsync(r => r.GameId == game.GameId && r.LevelNumber == session.LevelNumber);

            int rewardCoins = 0;
            if (rewardRule != null)
            {
                rewardCoins = isWin ? rewardRule.WinCoins : rewardRule.LoseCoins;
            }
            else
            {
                rewardCoins = isWin ? 50 : 5;
            }

            session.RewardCoins = rewardCoins;
            user.Coins += rewardCoins;

            var coinTxn = new CoinTransaction
            {
                MaKh = maKh,
                Amount = rewardCoins,
                BalanceAfter = user.Coins,
                Type = isWin ? "PuzzleWinReward" : "PuzzleLoseReward",
                Description = $"Thưởng {(isWin ? "thắng" : "hoàn thành")} màn {session.LevelNumber}",
                CreatedAt = DateTime.Now
            };
            _db.CoinTransactions.Add(coinTxn);

            if (isWin)
            {
                progress.CompletedLevels += 1;
                if (progress.CurrentLevel < game.DailyLevelLimit)
                {
                    progress.CurrentLevel += 1;
                }

                if (progress.CompletedLevels >= game.DailyLevelLimit)
                {
                    progress.Status = "Completed";
                }
            }

            progress.UpdatedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            bool canContinue = progress.Status == "Playing"
                && progress.Tickets > 0
                && progress.CompletedLevels < game.DailyLevelLimit
                && progress.PlayCount < game.DailyPlayLimit;

            return new CompletePuzzleResponse
            {
                Success = true,
                Result = session.Status,
                RewardCoins = rewardCoins,
                CurrentCoins = user.Coins,
                CurrentLevel = progress.CurrentLevel,
                CompletedLevels = progress.CompletedLevels,
                Tickets = progress.Tickets,
                Status = progress.Status,
                CanContinue = canContinue,
                Message = isWin ? $"Chúc mừng bạn đã vượt qua màn {session.LevelNumber}!" : "Rất tiếc bạn chưa hoàn thành màn chơi kịp thời gian."
            };
        }

        public async Task<ProductViewStartResponse> StartProductViewAsync(string maKh, int productId)
        {
            var game = await GetActiveGameAsync();
            var view = new PuzzleProductView
            {
                MaKh = maKh,
                GameId = game.GameId,
                ProductId = productId,
                StartTime = DateTime.Now,
                IsQualified = false,
                IsClaimed = false
            };

            _db.PuzzleProductViews.Add(view);
            await _db.SaveChangesAsync();

            return new ProductViewStartResponse { ProductViewId = view.ProductViewId };
        }

        public async Task<ProductViewCompleteResponse> CompleteProductViewAsync(string maKh, long productViewId)
        {
            var game = await GetActiveGameAsync();
            var view = await _db.PuzzleProductViews
                .FirstOrDefaultAsync(v => v.ProductViewId == productViewId && v.MaKh == maKh);

            if (view == null)
            {
                return new ProductViewCompleteResponse { ProductViewId = productViewId, IsQualified = false, Message = "Không tìm thấy phiên xem sản phẩm." };
            }

            var rule = await _db.PuzzleProductViewRules
                .FirstOrDefaultAsync(r => r.GameId == game.GameId);
            int requiredDuration = rule?.RequiredViewDurationSeconds ?? 10;

            view.EndTime = DateTime.Now;
            int seconds = (int)(view.EndTime.Value - view.StartTime).TotalSeconds;
            view.DurationSeconds = seconds;
            view.IsQualified = seconds >= requiredDuration;

            await _db.SaveChangesAsync();

            return new ProductViewCompleteResponse
            {
                ProductViewId = view.ProductViewId,
                DurationSeconds = seconds,
                IsQualified = view.IsQualified,
                Message = view.IsQualified ? $"Đủ điều kiện nhận vé! Đã xem {seconds}s (yêu cầu {requiredDuration}s)." : $"Chưa đủ điều kiện. Đã xem {seconds}s / {requiredDuration}s."
            };
        }

        public async Task<ClaimTicketResponse> ClaimTicketAsync(string maKh, long productViewId)
        {
            var game = await GetActiveGameAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var view = await _db.PuzzleProductViews
                .FirstOrDefaultAsync(v => v.ProductViewId == productViewId && v.MaKh == maKh);

            if (view == null || !view.IsQualified)
            {
                return new ClaimTicketResponse { Success = false, Message = "Phiên xem sản phẩm chưa đạt yêu cầu để nhận vé." };
            }

            if (view.IsClaimed)
            {
                return new ClaimTicketResponse { Success = false, Message = "Vé của phiên xem này đã được nhận trước đó." };
            }

            var rule = await _db.PuzzleProductViewRules
                .FirstOrDefaultAsync(r => r.GameId == game.GameId);
            int dailyClaimLimit = rule?.DailyMaxClaimableTickets ?? 3;

            var todayStart = DateTime.Today;
            int todayClaimed = await _db.PuzzleProductViews
                .CountAsync(v => v.MaKh == maKh && v.GameId == game.GameId && v.IsClaimed && v.StartTime >= todayStart);

            if (todayClaimed >= dailyClaimLimit)
            {
                return new ClaimTicketResponse { Success = false, Message = "Bạn đã đạt tối đa số vé nhận từ xem sản phẩm trong ngày." };
            }

            var progress = await _db.PuzzleDailyProgresses
                .FirstOrDefaultAsync(p => p.MaKh == maKh && p.GameId == game.GameId && p.PlayDate == today);

            if (progress == null)
            {
                return new ClaimTicketResponse { Success = false, Message = "Không tìm thấy tiến trình chơi của ngày hôm nay." };
            }

            view.IsClaimed = true;
            progress.Tickets += 1;
            progress.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();

            int remainingClaims = Math.Max(0, dailyClaimLimit - (todayClaimed + 1));

            return new ClaimTicketResponse
            {
                Success = true,
                Tickets = progress.Tickets,
                RemainingClaims = remainingClaims,
                Message = "Nhận vé thành công! Bạn có thể tiếp tục chơi xếp hình."
            };
        }

        public async Task<LockResponse> LockDailyProgressAsync(string maKh)
        {
            var game = await GetActiveGameAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var progress = await _db.PuzzleDailyProgresses
                .FirstOrDefaultAsync(p => p.MaKh == maKh && p.GameId == game.GameId && p.PlayDate == today);

            if (progress == null)
            {
                return new LockResponse { Success = false, Message = "Chưa có tiến trình chơi hôm nay." };
            }

            progress.Status = "Locked";
            progress.UpdatedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            return new LockResponse
            {
                Success = true,
                Status = "Locked",
                Message = "Bạn đã chọn kết thúc chuỗi chơi hôm nay. Hẹn gặp lại bạn vào ngày mai!"
            };
        }
    }
}
