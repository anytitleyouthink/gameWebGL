-- 1. Add Coins to KhachHang if not exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'KhachHang' AND COLUMN_NAME = 'Coins')
BEGIN
    ALTER TABLE [dbo].[KhachHang] ADD [Coins] INT NOT NULL DEFAULT 100;
END
GO

-- Set default 100 coins for existing users if 0
UPDATE [dbo].[KhachHang] SET [Coins] = 100 WHERE [Coins] = 0;
GO

-- 2. PuzzleGames
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleGames' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleGames] (
        [GameId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [GameCode] NVARCHAR(50) NOT NULL,
        [GameName] NVARCHAR(100) NOT NULL,
        [DailyLevelLimit] INT NOT NULL DEFAULT 5,
        [DailyPlayLimit] INT NOT NULL DEFAULT 10,
        [InitialTickets] INT NOT NULL DEFAULT 3,
        [IsActive] BIT NOT NULL DEFAULT 1
    );
END
GO

-- 3. PuzzleLevels
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleLevels' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleLevels] (
        [LevelId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [LevelNumber] INT NOT NULL,
        [Rows] INT NOT NULL DEFAULT 3,
        [Columns] INT NOT NULL DEFAULT 3,
        [TimeLimitSeconds] INT NOT NULL DEFAULT 60,
        [BackgroundImage] NVARCHAR(255) NULL,
        [MinPieces] INT NOT NULL DEFAULT 9
    );
END
GO

-- 4. PuzzleRewardRules
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleRewardRules' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleRewardRules] (
        [RuleId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [LevelNumber] INT NOT NULL,
        [WinCoins] INT NOT NULL DEFAULT 50,
        [LoseCoins] INT NOT NULL DEFAULT 5
    );
END
GO

-- 5. PuzzleDailyProgress
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleDailyProgress' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleDailyProgress] (
        [DailyProgressId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [MaKh] NVARCHAR(50) NOT NULL,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [PlayDate] DATE NOT NULL,
        [CurrentLevel] INT NOT NULL DEFAULT 1,
        [CompletedLevels] INT NOT NULL DEFAULT 0,
        [PlayCount] INT NOT NULL DEFAULT 0,
        [Tickets] INT NOT NULL DEFAULT 3,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Playing',
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX [IX_PuzzleDailyProgress_MaKh_Date] ON [dbo].[PuzzleDailyProgress] ([MaKh], [PlayDate]);
END
GO

-- 6. PuzzleGameSessions
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleGameSessions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleGameSessions] (
        [SessionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [MaKh] NVARCHAR(50) NOT NULL,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [LevelNumber] INT NOT NULL,
        [ImageIndex] INT NOT NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Started',
        [StartTime] DATETIME NOT NULL DEFAULT GETDATE(),
        [EndTime] DATETIME NULL,
        [RewardCoins] INT NOT NULL DEFAULT 0
    );
END
GO

-- 7. PuzzleProductViewRules
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleProductViewRules' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleProductViewRules] (
        [RuleId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [RequiredViewDurationSeconds] INT NOT NULL DEFAULT 10,
        [DailyMaxClaimableTickets] INT NOT NULL DEFAULT 3
    );
END
GO

-- 8. PuzzleProductViews
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PuzzleProductViews' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PuzzleProductViews] (
        [ProductViewId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [MaKh] NVARCHAR(50) NOT NULL,
        [GameId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PuzzleGames]([GameId]),
        [ProductId] INT NOT NULL,
        [StartTime] DATETIME NOT NULL DEFAULT GETDATE(),
        [EndTime] DATETIME NULL,
        [DurationSeconds] INT NOT NULL DEFAULT 0,
        [IsQualified] BIT NOT NULL DEFAULT 0,
        [IsClaimed] BIT NOT NULL DEFAULT 0
    );
END
GO

-- 9. CoinTransactions
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CoinTransactions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[CoinTransactions] (
        [TransactionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [MaKh] NVARCHAR(50) NOT NULL,
        [Amount] INT NOT NULL,
        [BalanceAfter] INT NOT NULL,
        [Type] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX [IX_CoinTransactions_MaKh] ON [dbo].[CoinTransactions] ([MaKh]);
END
GO

-- 10. Vouchers (Shop)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vouchers' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Vouchers] (
        [VoucherId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [VoucherCode] NVARCHAR(50) NOT NULL,
        [VoucherName] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(255) NULL,
        [DiscountType] NVARCHAR(20) NOT NULL DEFAULT 'Fixed', -- Fixed, Percent
        [DiscountValue] FLOAT NOT NULL DEFAULT 0,
        [MinOrderAmount] FLOAT NOT NULL DEFAULT 0,
        [MaxDiscountAmount] FLOAT NULL,
        [CoinPrice] INT NOT NULL DEFAULT 50,
        [TotalQuantity] INT NOT NULL DEFAULT 100,
        [RemainingQuantity] INT NOT NULL DEFAULT 100,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [StartDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [EndDate] DATETIME NOT NULL DEFAULT DATEADD(DAY, 30, GETDATE())
    );
END
GO

-- 11. UserVouchers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserVouchers' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[UserVouchers] (
        [UserVoucherId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [MaKh] NVARCHAR(50) NOT NULL,
        [VoucherId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Vouchers]([VoucherId]),
        [VoucherCode] NVARCHAR(50) NOT NULL,
        [DiscountType] NVARCHAR(20) NOT NULL,
        [DiscountValue] FLOAT NOT NULL,
        [MinOrderAmount] FLOAT NOT NULL,
        [MaxDiscountAmount] FLOAT NULL,
        [IsUsed] BIT NOT NULL DEFAULT 0,
        [UsedAt] DATETIME NULL,
        [ExpiryDate] DATETIME NOT NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX [IX_UserVouchers_MaKh] ON [dbo].[UserVouchers] ([MaKh]);
END
GO

-- 12. VoucherTransactions
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VoucherTransactions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[VoucherTransactions] (
        [VoucherTransactionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [VoucherId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Vouchers]([VoucherId]),
        [UserVoucherId] INT NULL FOREIGN KEY REFERENCES [dbo].[UserVouchers]([UserVoucherId]),
        [MaKh] NVARCHAR(50) NOT NULL,
        [Type] NVARCHAR(50) NOT NULL, -- Purchase, Spin, Use
        [Amount] FLOAT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- Seed initial game and levels if empty
IF NOT EXISTS (SELECT 1 FROM [dbo].[PuzzleGames] WHERE [GameId] = 1)
BEGIN
    SET IDENTITY_INSERT [dbo].[PuzzleGames] ON;
    INSERT INTO [dbo].[PuzzleGames] ([GameId], [GameCode], [GameName], [DailyLevelLimit], [DailyPlayLimit], [InitialTickets], [IsActive])
    VALUES (1, 'PUZZLE_CLASSIC', 'Game Xếp Hình Ghép Tranh', 5, 10, 3, 1);
    SET IDENTITY_INSERT [dbo].[PuzzleGames] OFF;

    INSERT INTO [dbo].[PuzzleLevels] ([GameId], [LevelNumber], [Rows], [Columns], [TimeLimitSeconds], [BackgroundImage], [MinPieces])
    VALUES 
    (1, 1, 2, 2, 60, 'bg_level1.png', 4),
    (1, 2, 2, 3, 75, 'bg_level2.png', 6),
    (1, 3, 3, 3, 90, 'bg_level3.png', 9),
    (1, 4, 3, 4, 120, 'bg_level4.png', 12),
    (1, 5, 4, 4, 150, 'bg_level5.png', 16);

    INSERT INTO [dbo].[PuzzleRewardRules] ([GameId], [LevelNumber], [WinCoins], [LoseCoins])
    VALUES
    (1, 1, 50, 5),
    (1, 2, 80, 8),
    (1, 3, 120, 10),
    (1, 4, 180, 15),
    (1, 5, 250, 20);

    INSERT INTO [dbo].[PuzzleProductViewRules] ([GameId], [RequiredViewDurationSeconds], [DailyMaxClaimableTickets])
    VALUES (1, 10, 3);
END
GO

-- Seed initial shop vouchers if empty
IF NOT EXISTS (SELECT 1 FROM [dbo].[Vouchers])
BEGIN
    INSERT INTO [dbo].[Vouchers] ([VoucherCode], [VoucherName], [Description], [DiscountType], [DiscountValue], [MinOrderAmount], [MaxDiscountAmount], [CoinPrice], [TotalQuantity], [RemainingQuantity], [IsActive], [StartDate], [EndDate])
    VALUES
    ('HDPE10', 'Voucher Giảm 10%', 'Giảm 10% tối đa $50 cho đơn hàng từ $100', 'Percent', 10, 100, 50, 50, 100, 100, 1, GETDATE(), DATEADD(DAY, 60, GETDATE())),
    ('HDPE20', 'Voucher Giảm $20', 'Giảm trực tiếp $20 cho đơn hàng từ $150', 'Fixed', 20, 150, 20, 80, 100, 100, 1, GETDATE(), DATEADD(DAY, 60, GETDATE())),
    ('HDPE50', 'Voucher VIP Giảm $50', 'Giảm trực tiếp $50 cho đơn hàng từ $300', 'Fixed', 50, 300, 50, 150, 50, 50, 1, GETDATE(), DATEADD(DAY, 60, GETDATE())),
    ('LUCKY100', 'Voucher May Mắn $100', 'Voucher giải đặc biệt từ Vòng quay may mắn', 'Fixed', 100, 500, 100, 300, 20, 20, 1, GETDATE(), DATEADD(DAY, 60, GETDATE()));
END
GO

-- Synchronize Vouchers with MaGiamGia for Cart checkout compatibility
INSERT INTO [dbo].[MaGiamGia] ([MaVoucher], [TenVoucher], [MoTa], [LoaiGiamGia], [GiaTriGiam], [GiamToiDa], [DonHangToiThieu], [SoLuongGiaiHan], [SoLuongDaDung], [NgayBatDau], [NgayHetHan], [IsActive])
SELECT 
    v.[VoucherCode], v.[VoucherName], v.[Description], v.[DiscountType], v.[DiscountValue], v.[MaxDiscountAmount], v.[MinOrderAmount], v.[TotalQuantity], 0, v.[StartDate], v.[EndDate], v.[IsActive]
FROM [dbo].[Vouchers] v
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[MaGiamGia] m WHERE m.[MaVoucher] = v.[VoucherCode]);
GO
