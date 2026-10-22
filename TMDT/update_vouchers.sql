USE Hshop2023;
GO

-- 1. Cap nhat bang Vouchers voi chu tieng Viet chuan Unicode
UPDATE Vouchers
SET VoucherName = N'Voucher Giảm 10%',
    Description = N'Giảm 10% tối đa $10 cho đơn hàng từ $100'
WHERE VoucherCode = 'HDPE10';

UPDATE Vouchers
SET VoucherName = N'Voucher Giảm $20',
    Description = N'Giảm trực tiếp $20 cho đơn hàng từ $150'
WHERE VoucherCode = 'HDPE20';

UPDATE Vouchers
SET VoucherName = N'Voucher VIP Giảm $50',
    Description = N'Giảm trực tiếp $50 cho đơn hàng từ $300'
WHERE VoucherCode = 'HDPE50';

UPDATE Vouchers
SET VoucherName = N'Voucher May Mắn $100',
    Description = N'Voucher giải đặc biệt từ Vòng quay may mắn cho đơn hàng từ $500'
WHERE VoucherCode = 'LUCKY100';

-- 2. Cap nhat bang MaGiamGia
UPDATE MaGiamGia
SET TenVoucher = N'Voucher Giảm 10%',
    MoTa = N'Giảm 10% tối đa $10 cho đơn hàng từ $100'
WHERE MaVoucher LIKE 'HDPE10%' OR MaVoucher LIKE 'SPIN%';

UPDATE MaGiamGia
SET TenVoucher = N'Voucher Giảm $20',
    MoTa = N'Giảm trực tiếp $20 cho đơn hàng từ $150'
WHERE MaVoucher LIKE 'HDPE20%';

UPDATE MaGiamGia
SET TenVoucher = N'Voucher VIP Giảm $50',
    MoTa = N'Giảm trực tiếp $50 cho đơn hàng từ $300'
WHERE MaVoucher LIKE 'HDPE50%';

UPDATE MaGiamGia
SET TenVoucher = N'Voucher May Mắn $100',
    MoTa = N'Voucher giải đặc biệt từ Vòng quay may mắn cho đơn hàng từ $500'
WHERE MaVoucher LIKE 'LUCKY100%';

-- 3. Cap nhat bang PuzzleGames
UPDATE PuzzleGames
SET GameName = N'HDPE Xếp Hình Thử Thách'
WHERE GameCode = 'PUZZLE_HDPE';

GO
