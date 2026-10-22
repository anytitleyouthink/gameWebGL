using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Data;
using WebActionResultHDPE.DTOs;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly Hshop2023Context _db;

        public VoucherService(Hshop2023Context db)
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

        public async Task<List<ShopVoucherDto>> GetShopVouchersAsync()
        {
            var now = DateTime.Now;
            return await _db.Vouchers
                .Where(v => v.IsActive && v.StartDate <= now && v.EndDate >= now && v.RemainingQuantity > 0)
                .OrderBy(v => v.CoinPrice)
                .Select(v => new ShopVoucherDto
                {
                    VoucherId = v.VoucherId,
                    VoucherCode = v.VoucherCode,
                    VoucherName = v.VoucherName,
                    Description = v.Description,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MinOrderAmount = v.MinOrderAmount,
                    MaxDiscountAmount = v.MaxDiscountAmount,
                    CoinPrice = v.CoinPrice,
                    RemainingQuantity = v.RemainingQuantity,
                    EndDate = v.EndDate
                })
                .ToListAsync();
        }

        public async Task<List<UserVoucherDto>> GetUserVouchersAsync(string maKh)
        {
            return await _db.UserVouchers
                .Include(uv => uv.Voucher)
                .Where(uv => uv.MaKh == maKh)
                .OrderByDescending(uv => uv.CreatedAt)
                .Select(uv => new UserVoucherDto
                {
                    UserVoucherId = uv.UserVoucherId,
                    VoucherName = uv.Voucher != null ? uv.Voucher.VoucherName : "Voucher",
                    VoucherCode = uv.VoucherCode,
                    DiscountType = uv.DiscountType,
                    DiscountValue = uv.DiscountValue,
                    MinOrderAmount = uv.MinOrderAmount,
                    Status = uv.IsUsed ? "Used" : (DateTime.Now > uv.ExpiryDate ? "Expired" : "Available"),
                    PurchasedAt = uv.CreatedAt,
                    ExpiredAt = uv.ExpiryDate
                })
                .ToListAsync();
        }

        public async Task<PurchaseVoucherResponse> PurchaseVoucherAsync(string maKh, int voucherId)
        {
            var user = await EnsureUserAsync(maKh);
            var now = DateTime.Now;
            var voucher = await _db.Vouchers.FindAsync(voucherId);

            if (voucher == null || !voucher.IsActive)
            {
                return new PurchaseVoucherResponse { Success = false, Message = "Voucher không tồn tại hoặc đã ngừng áp dụng." };
            }

            if (now < voucher.StartDate || now > voucher.EndDate)
            {
                return new PurchaseVoucherResponse { Success = false, Message = "Chương trình ưu đãi này đã hết hạn." };
            }

            if (voucher.RemainingQuantity <= 0)
            {
                return new PurchaseVoucherResponse { Success = false, Message = "Voucher này đã hết lượt đổi trong kho quà." };
            }

            if (user.Coins < voucher.CoinPrice)
            {
                return new PurchaseVoucherResponse
                {
                    Success = false,
                    RemainingCoins = user.Coins,
                    Message = $"Bạn không đủ Xu để đổi voucher này (Cần {voucher.CoinPrice} Xu, bạn hiện có {user.Coins} Xu)."
                };
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                user.Coins -= voucher.CoinPrice;
                voucher.RemainingQuantity -= 1;

                string uniqueCode = await GenerateUniqueVoucherCodeAsync(voucher.VoucherCode, maKh);

                var coinTxn = new CoinTransaction
                {
                    MaKh = maKh,
                    Amount = -voucher.CoinPrice,
                    BalanceAfter = user.Coins,
                    Type = "PurchaseVoucher",
                    Description = $"Đổi voucher '{voucher.VoucherName}' (-{voucher.CoinPrice} Xu)",
                    CreatedAt = now
                };
                _db.CoinTransactions.Add(coinTxn);

                var userVoucher = new UserVoucher
                {
                    MaKh = maKh,
                    VoucherId = voucher.VoucherId,
                    VoucherCode = uniqueCode,
                    DiscountType = voucher.DiscountType,
                    DiscountValue = voucher.DiscountValue,
                    MinOrderAmount = voucher.MinOrderAmount,
                    MaxDiscountAmount = voucher.MaxDiscountAmount,
                    IsUsed = false,
                    ExpiryDate = voucher.EndDate,
                    CreatedAt = now
                };
                _db.UserVouchers.Add(userVoucher);
                await _db.SaveChangesAsync();

                var voucherTxn = new VoucherTransaction
                {
                    VoucherId = voucher.VoucherId,
                    UserVoucherId = userVoucher.UserVoucherId,
                    MaKh = maKh,
                    Type = "PurchaseVoucher",
                    Amount = voucher.CoinPrice,
                    CreatedAt = now
                };
                _db.VoucherTransactions.Add(voucherTxn);

                // Đồng bộ sang bảng MaGiamGia để giỏ hàng & checkout dùng được ngay
                _db.MaGiamGia.Add(new MaGiamGium
                {
                    MaVoucher = uniqueCode,
                    TenVoucher = voucher.VoucherName,
                    MoTa = voucher.Description,
                    LoaiGiamGia = voucher.DiscountType,
                    GiaTriGiam = voucher.DiscountValue,
                    GiamToiDa = voucher.MaxDiscountAmount,
                    DonHangToiThieu = voucher.MinOrderAmount,
                    SoLuongGiaiHan = 1,
                    SoLuongDaDung = 0,
                    NgayBatDau = now.AddDays(-1),
                    NgayHetHan = voucher.EndDate,
                    IsActive = true
                });

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return new PurchaseVoucherResponse
                {
                    Success = true,
                    VoucherCode = uniqueCode,
                    VoucherName = voucher.VoucherName,
                    CoinSpent = voucher.CoinPrice,
                    RemainingCoins = user.Coins,
                    ExpiredAt = userVoucher.ExpiryDate,
                    Message = "Đổi voucher thành công! Bạn có thể áp dụng mã này khi thanh toán đơn hàng."
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new PurchaseVoucherResponse { Success = false, Message = "Lỗi đổi voucher: " + ex.Message };
            }
        }

        public async Task<SpinWheelResponse> SpinWheelAsync(string maKh)
        {
            var user = await EnsureUserAsync(maKh);
            const int spinCost = 20;

            if (user.Coins < spinCost)
            {
                return new SpinWheelResponse
                {
                    Success = false,
                    RemainingCoins = user.Coins,
                    Message = $"Bạn không đủ Xu để quay (Cần {spinCost} Xu, bạn hiện có {user.Coins} Xu). Hãy chơi game xếp hình để kiếm thêm Xu!"
                };
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var now = DateTime.Now;
                user.Coins -= spinCost;

                var coinTxn = new CoinTransaction
                {
                    MaKh = maKh,
                    Amount = -spinCost,
                    BalanceAfter = user.Coins,
                    Type = "SpinCost",
                    Description = $"Quay Vòng Quay May Mắn (-{spinCost} Xu)",
                    CreatedAt = now
                };
                _db.CoinTransactions.Add(coinTxn);

                // Tỷ lệ trúng thưởng authoritative: 30% (Random 1..100 <= 30)
                int roll = Random.Shared.Next(1, 101);
                bool isWin = roll <= 30;

                int targetSliceIndex;
                string? voucherCode = null;
                Voucher? winningVoucher = null;

                if (isWin)
                {
                    int[] winSliceIndices = new int[] { 0, 2, 4 };
                    targetSliceIndex = winSliceIndices[Random.Shared.Next(winSliceIndices.Length)];

                    winningVoucher = await _db.Vouchers
                        .Where(v => v.IsActive && v.RemainingQuantity > 0)
                        .OrderBy(v => Guid.NewGuid())
                        .FirstOrDefaultAsync();

                    if (winningVoucher != null)
                    {
                        winningVoucher.RemainingQuantity -= 1;
                        voucherCode = await GenerateUniqueVoucherCodeAsync("SPIN", maKh);

                        var userVoucher = new UserVoucher
                        {
                            MaKh = maKh,
                            VoucherId = winningVoucher.VoucherId,
                            VoucherCode = voucherCode,
                            DiscountType = winningVoucher.DiscountType,
                            DiscountValue = winningVoucher.DiscountValue,
                            MinOrderAmount = winningVoucher.MinOrderAmount,
                            MaxDiscountAmount = winningVoucher.MaxDiscountAmount,
                            IsUsed = false,
                            ExpiryDate = now.AddDays(15),
                            CreatedAt = now
                        };
                        _db.UserVouchers.Add(userVoucher);
                        await _db.SaveChangesAsync();

                        var voucherTxn = new VoucherTransaction
                        {
                            VoucherId = winningVoucher.VoucherId,
                            UserVoucherId = userVoucher.UserVoucherId,
                            MaKh = maKh,
                            Type = "SpinWheelWin",
                            Amount = spinCost,
                            CreatedAt = now
                        };
                        _db.VoucherTransactions.Add(voucherTxn);

                        // Đồng bộ sang MaGiamGia
                        _db.MaGiamGia.Add(new MaGiamGium
                        {
                            MaVoucher = voucherCode,
                            TenVoucher = winningVoucher.VoucherName,
                            MoTa = winningVoucher.Description,
                            LoaiGiamGia = winningVoucher.DiscountType,
                            GiaTriGiam = winningVoucher.DiscountValue,
                            GiamToiDa = winningVoucher.MaxDiscountAmount,
                            DonHangToiThieu = winningVoucher.MinOrderAmount,
                            SoLuongGiaiHan = 1,
                            SoLuongDaDung = 0,
                            NgayBatDau = now.AddDays(-1),
                            NgayHetHan = now.AddDays(15),
                            IsActive = true
                        });
                    }
                }
                else
                {
                    int[] loseSliceIndices = new int[] { 1, 3, 5 };
                    targetSliceIndex = loseSliceIndices[Random.Shared.Next(loseSliceIndices.Length)];
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                string msg = isWin
                    ? $"🎉 BẠN ĐÃ TRÚNG VOUCHER! ({winningVoucher?.VoucherName ?? "Voucher Ưu Đãi"}) - Mã: {voucherCode}"
                    : $"😢 Chúc bạn may mắn lần sau! Tiếp tục tích xu và quay lại nhé!";

                return new SpinWheelResponse
                {
                    Success = true,
                    IsWin = isWin,
                    RollValue = roll,
                    TargetSliceIndex = targetSliceIndex,
                    VoucherCode = voucherCode,
                    VoucherName = winningVoucher?.VoucherName,
                    DiscountValue = winningVoucher?.DiscountValue ?? 0,
                    CoinSpent = spinCost,
                    RemainingCoins = user.Coins,
                    Message = msg
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new SpinWheelResponse { Success = false, Message = "Lỗi khi quay thưởng: " + ex.Message };
            }
        }

        public async Task<UseGameVoucherResponse> UseVoucherAsync(string maKh, UseGameVoucherRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.VoucherCode))
            {
                return new UseGameVoucherResponse { Success = false, Message = "Vui lòng nhập mã voucher." };
            }

            var userVoucher = await _db.UserVouchers
                .Include(uv => uv.Voucher)
                .FirstOrDefaultAsync(uv => uv.VoucherCode == request.VoucherCode.Trim());

            if (userVoucher == null)
            {
                return new UseGameVoucherResponse { Success = false, Message = "Mã voucher không tồn tại." };
            }

            if (userVoucher.MaKh != maKh)
            {
                return new UseGameVoucherResponse { Success = false, Message = "Voucher này không thuộc tài khoản của bạn." };
            }

            if (userVoucher.IsUsed)
            {
                return new UseGameVoucherResponse { Success = false, Message = "Voucher này đã được sử dụng." };
            }

            if (DateTime.Now > userVoucher.ExpiryDate)
            {
                return new UseGameVoucherResponse { Success = false, Message = "Voucher này đã hết hạn sử dụng." };
            }

            userVoucher.IsUsed = true;
            userVoucher.UsedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            return new UseGameVoucherResponse
            {
                Success = true,
                VoucherCode = userVoucher.VoucherCode,
                VoucherName = userVoucher.Voucher?.VoucherName ?? "Voucher",
                DiscountType = userVoucher.DiscountType,
                DiscountValue = userVoucher.DiscountValue,
                MinOrderAmount = userVoucher.MinOrderAmount,
                MaxDiscountAmount = userVoucher.MaxDiscountAmount,
                Message = "Sử dụng voucher thành công!"
            };
        }

        private async Task<string> GenerateUniqueVoucherCodeAsync(string prefix, string maKh)
        {
            string cleanPrefix = string.IsNullOrWhiteSpace(prefix) ? "SHOP" : prefix.Trim().ToUpper();
            string code;
            bool exists;

            do
            {
                string randomChars = GetRandomAlphanumeric(4);
                code = $"{cleanPrefix}-{randomChars}";
                exists = await _db.UserVouchers.AnyAsync(uv => uv.VoucherCode == code);
            } while (exists);

            return code;
        }

        private static string GetRandomAlphanumeric(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var bytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);

            char[] result = new char[length];
            for (int i = 0; i < length; i++)
            {
                result[i] = chars[bytes[i] % chars.Length];
            }
            return new string(result);
        }
    }
}
