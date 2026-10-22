$connStr = "Server=localhost\MSSQLSERVER02;Database=Hshop2023;User Id=sa;Password=123456;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
UPDATE [dbo].[PuzzleGames] SET [GameName] = N'Game Xếp Hình Ghép Tranh' WHERE [GameId] = 1;

UPDATE [dbo].[Vouchers] SET [VoucherName] = N'Voucher Giảm 10%', [Description] = N'Giảm 10% tối đa $50 cho đơn hàng từ $100' WHERE [VoucherCode] = 'HDPE10';
UPDATE [dbo].[Vouchers] SET [VoucherName] = N'Voucher Giảm $20', [Description] = N'Giảm trực tiếp $20 cho đơn hàng từ $150' WHERE [VoucherCode] = 'HDPE20';
UPDATE [dbo].[Vouchers] SET [VoucherName] = N'Voucher VIP Giảm $50', [Description] = N'Giảm trực tiếp $50 cho đơn hàng từ $300' WHERE [VoucherCode] = 'HDPE50';
UPDATE [dbo].[Vouchers] SET [VoucherName] = N'Voucher May Mắn $100', [Description] = N'Voucher giải đặc biệt từ Vòng quay may mắn' WHERE [VoucherCode] = 'LUCKY100';

UPDATE [dbo].[MaGiamGia] SET [TenVoucher] = N'Voucher Giảm 10%', [MoTa] = N'Giảm 10% tối đa $50 cho đơn hàng từ $100' WHERE [MaVoucher] LIKE 'HDPE10%' OR [MaVoucher] LIKE 'SPIN%';
UPDATE [dbo].[MaGiamGia] SET [TenVoucher] = N'Voucher Giảm $20', [MoTa] = N'Giảm trực tiếp $20 cho đơn hàng từ $150' WHERE [MaVoucher] LIKE 'HDPE20%';
UPDATE [dbo].[MaGiamGia] SET [TenVoucher] = N'Voucher VIP Giảm $50', [MoTa] = N'Giảm trực tiếp $50 cho đơn hàng từ $300' WHERE [MaVoucher] LIKE 'HDPE50%';
UPDATE [dbo].[MaGiamGia] SET [TenVoucher] = N'Voucher May Mắn $100', [MoTa] = N'Voucher giải đặc biệt từ Vòng quay may mắn' WHERE [MaVoucher] LIKE 'LUCKY100%';
"@
$rows = $cmd.ExecuteNonQuery()
$conn.Close()
Write-Host "Updated rows count: $rows"
