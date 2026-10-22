using Microsoft.EntityFrameworkCore;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(Hshop2023Context context, ILogger logger)
        {
            try
            {
                // 1. Tạo bảng RefreshToken nếu chưa tồn tại
                var createRefreshTokenTableSql = @"
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RefreshToken' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[RefreshToken] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Token] VARCHAR(256) NOT NULL,
        [MaKh] VARCHAR(50) NOT NULL,
        [ExpiresAt] DATETIME2 NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL,
        [IsRevoked] BIT NOT NULL DEFAULT 0,
        [RevokedAt] DATETIME2 NULL,
        [ReplacedByToken] VARCHAR(256) NULL
    );
    CREATE INDEX [IX_RefreshToken_Token] ON [dbo].[RefreshToken] ([Token]);
    CREATE INDEX [IX_RefreshToken_MaKh] ON [dbo].[RefreshToken] ([MaKh]);
END";

                await context.Database.ExecuteSqlRawAsync(createRefreshTokenTableSql);

                // 2. Tăng độ dài cột Hinh của bảng HangHoa để hỗ trợ URL Cloudinary
                try
                {
                    var alterHinhSql = @"
BEGIN TRY
    ALTER TABLE [dbo].[HangHoa] ALTER COLUMN [Hinh] NVARCHAR(500) NULL;
END TRY
BEGIN CATCH
    -- Bỏ qua nếu cột đã được cập nhật hoặc không cho phép thay đổi
END CATCH";
                    await context.Database.ExecuteSqlRawAsync(alterHinhSql);
                }
                catch (Exception ex)
                {
                    logger.LogWarning("Không thể tự động cập nhật kích thước cột Hinh bảng HangHoa: {Msg}", ex.Message);
                }

                // 3. Tự động seed tài khoản Admin mặc định (username/email: 'admin', pass: '123')
                var existingAdmin = await context.KhachHangs.FirstOrDefaultAsync(k => k.MaKh == "admin" || k.Email == "admin@hdpe.com");

                if (existingAdmin == null)
                {
                    var newAdmin = new KhachHang
                    {
                        MaKh = "admin",
                        HoTen = "Quản trị viên HDPE",
                        Email = "admin@hdpe.com",
                        MatKhau = BCrypt.Net.BCrypt.HashPassword("123"),
                        HieuLuc = true,
                        VaiTro = 1, // Vai trò Admin
                        GioiTinh = true,
                        NgaySinh = DateTime.UtcNow,
                        DiaChi = "Hà Nội, Việt Nam",
                        DienThoai = "0988888888",
                        Hinh = "Photo.gif",
                        RandomKey = Guid.NewGuid().ToString("N")[..8]
                    };

                    await context.KhachHangs.AddAsync(newAdmin);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Đã khởi tạo thành công tài khoản Admin mặc định: admin / 123");
                }
                else
                {
                    bool updated = false;

                    if (existingAdmin.VaiTro != 1)
                    {
                        existingAdmin.VaiTro = 1;
                        updated = true;
                    }

                    if (!existingAdmin.HieuLuc)
                    {
                        existingAdmin.HieuLuc = true;
                        updated = true;
                    }

                    if (string.IsNullOrEmpty(existingAdmin.MatKhau) || !BCrypt.Net.BCrypt.Verify("123", existingAdmin.MatKhau))
                    {
                        existingAdmin.MatKhau = BCrypt.Net.BCrypt.HashPassword("123");
                        updated = true;
                    }

                    if (updated)
                    {
                        context.KhachHangs.Update(existingAdmin);
                        await context.SaveChangesAsync();
                        logger.LogInformation("Đã cập nhật lại quyền Admin và mật khẩu cho tài khoản admin: admin / 123");
                    }
                }

                // 4. Seed TrangThai đơn hàng nếu chưa có
                if (!await context.TrangThais.AnyAsync())
                {
                    var trangThais = new List<TrangThai>
                    {
                        new() { MaTrangThai = 0, TenTrangThai = "Mới đặt hàng", MoTa = "Đơn hàng mới tạo, chờ xác nhận" },
                        new() { MaTrangThai = 1, TenTrangThai = "Đang xử lý", MoTa = "Đang chuẩn bị hàng đóng gói" },
                        new() { MaTrangThai = 2, TenTrangThai = "Đang giao hàng", MoTa = "Đang trên đường vận chuyển tới khách hàng" },
                        new() { MaTrangThai = 3, TenTrangThai = "Đã hoàn thành", MoTa = "Đơn hàng đã được giao thành công và thanh toán" },
                        new() { MaTrangThai = -1, TenTrangThai = "Đã hủy", MoTa = "Đơn hàng đã bị hủy" }
                    };
                    await context.TrangThais.AddRangeAsync(trangThais);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Đã seed thành công 5 Trạng thái đơn hàng vào bảng TrangThai.");
                }

                // 5. Seed Nhà Cung Cấp mẫu nếu chưa có
                if (!await context.NhaCungCaps.AnyAsync())
                {
                    var nccs = new List<NhaCungCap>
                    {
                        new() { MaNcc = "AP", TenCongTy = "Apple Inc.", Logo = "apple_logo.png", NguoiLienLac = "Tim Cook", Email = "contact@apple.com", DienThoai = "0123456789", DiaChi = "Cupertino, California, USA" },
                        new() { MaNcc = "SS", TenCongTy = "Samsung Electronics", Logo = "samsung_logo.png", NguoiLienLac = "JH Han", Email = "contact@samsung.com", DienThoai = "0123456788", DiaChi = "Suwon, South Korea" },
                        new() { MaNcc = "XM", TenCongTy = "Xiaomi Corporation", Logo = "xiaomi_logo.png", NguoiLienLac = "Lei Jun", Email = "contact@xiaomi.com", DienThoai = "0123456787", DiaChi = "Beijing, China" }
                    };
                    await context.NhaCungCaps.AddRangeAsync(nccs);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Đã seed thành công 3 Nhà cung cấp mẫu.");
                }

                // 5. Seed Loại sản phẩm (Categories) nếu chưa có
                if (!await context.Loais.AnyAsync())
                {
                    var categories = new List<Loai>
                    {
                        new() { TenLoai = "Điện Thoại iPhone", TenLoaiAlias = "dien-thoai-iphone", MoTa = "Các dòng iPhone chính hãng cao cấp từ Apple", Hinh = "iphone_cat.png" },
                        new() { TenLoai = "Điện Thoại Samsung", TenLoaiAlias = "dien-thoai-samsung", MoTa = "Điện thoại thông minh Galaxy hàng đầu thế giới", Hinh = "samsung_cat.png" },
                        new() { TenLoai = "Điện Thoại Xiaomi", TenLoaiAlias = "dien-thoai-xiaomi", MoTa = "Smartphone hiệu năng đỉnh cao, camera Leica", Hinh = "xiaomi_cat.png" },
                        new() { TenLoai = "Máy Tính Bảng & iPad", TenLoaiAlias = "may-tinh-bang-ipad", MoTa = "Thiết bị giải trí và làm việc di động", Hinh = "tablet_cat.png" },
                        new() { TenLoai = "Phụ Kiện Công Nghệ", TenLoaiAlias = "phu-kien-cong-nghe", MoTa = "Cáp sạc, tai nghe, ốp lưng chính hãng chất lượng cao", Hinh = "accessories_cat.png" }
                    };
                    await context.Loais.AddRangeAsync(categories);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Đã seed thành công 5 Danh mục sản phẩm mẫu.");
                }

                // 6. Seed Hàng Hóa (Sản phẩm) nếu chưa có
                if (!await context.HangHoas.AnyAsync())
                {
                    var catIphone = await context.Loais.FirstOrDefaultAsync(l => l.TenLoai.Contains("iPhone"));
                    var catSamsung = await context.Loais.FirstOrDefaultAsync(l => l.TenLoai.Contains("Samsung"));
                    var catXiaomi = await context.Loais.FirstOrDefaultAsync(l => l.TenLoai.Contains("Xiaomi"));
                    var catTablet = await context.Loais.FirstOrDefaultAsync(l => l.TenLoai.Contains("iPad"));
                    var catAccessory = await context.Loais.FirstOrDefaultAsync(l => l.TenLoai.Contains("Phụ Kiện"));

                    int idIphone = catIphone?.MaLoai ?? 1;
                    int idSamsung = catSamsung?.MaLoai ?? idIphone;
                    int idXiaomi = catXiaomi?.MaLoai ?? idIphone;
                    int idTablet = catTablet?.MaLoai ?? idIphone;
                    int idAccessory = catAccessory?.MaLoai ?? idIphone;

                    var products = new List<HangHoa>
                    {
                        new()
                        {
                            TenHh = "iPhone 16 Pro Max 256GB Desert Titanium",
                            TenAlias = "iphone-16-pro-max-256gb",
                            MaLoai = idIphone,
                            MoTaDonVi = "Chiếc",
                            DonGia = 1399,
                            Hinh = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddDays(-15),
                            GiamGia = 5,
                            SoLanXem = 120,
                            MoTa = "Siêu phẩm cao cấp nhất của Apple với chip A18 Pro, khung viền Titan sa mạc đẳng cấp và cụm camera 48MP Fusion sắc nét.",
                            MaNcc = "AP"
                        },
                        new()
                        {
                            TenHh = "iPhone 15 Pro 128GB Titan Tự Nhiên",
                            TenAlias = "iphone-15-pro-128gb",
                            MaLoai = idIphone,
                            MoTaDonVi = "Chiếc",
                            DonGia = 1099,
                            Hinh = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-3),
                            GiamGia = 8,
                            SoLanXem = 240,
                            MoTa = "Chip A17 Pro mạnh mẽ, nút Action Button thông minh, cổng kết nối Type-C chuẩn Thunderbolt tốc độ cao.",
                            MaNcc = "AP"
                        },
                        new()
                        {
                            TenHh = "Samsung Galaxy S24 Ultra 5G 256GB",
                            TenAlias = "samsung-galaxy-s24-ultra-5g",
                            MaLoai = idSamsung,
                            MoTaDonVi = "Chiếc",
                            DonGia = 1249,
                            Hinh = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-2),
                            GiamGia = 10,
                            SoLanXem = 195,
                            MoTa = "Quyền năng Galaxy AI đỉnh cao, màn hình phẳng Dynamic AMOLED 2X 120Hz, camera Zoom quang học 100x và bút S-Pen tích hợp.",
                            MaNcc = "SS"
                        },
                        new()
                        {
                            TenHh = "Samsung Galaxy Z Fold5 512GB",
                            TenAlias = "samsung-galaxy-z-fold5",
                            MaLoai = idSamsung,
                            MoTaDonVi = "Chiếc",
                            DonGia = 1599,
                            Hinh = "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-4),
                            GiamGia = 12,
                            SoLanXem = 160,
                            MoTa = "Thiết kế gập không khe hở Flex Hinge tiên tiến, trải nghiệm đa nhiệm đỉnh cao với màn hình lớn 7.6 inch rực rỡ.",
                            MaNcc = "SS"
                        },
                        new()
                        {
                            TenHh = "Xiaomi 14 Ultra 5G Leica Summilux",
                            TenAlias = "xiaomi-14-ultra-5g",
                            MaLoai = idXiaomi,
                            MoTaDonVi = "Chiếc",
                            DonGia = 1199,
                            Hinh = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-1),
                            GiamGia = 5,
                            SoLanXem = 145,
                            MoTa = "Hệ thống ống kính Leica 1 inch hàng đầu, chip Snapdragon 8 Gen 3 và sạc siêu nhanh 90W HyperCharge.",
                            MaNcc = "XM"
                        },
                        new()
                        {
                            TenHh = "iPad Pro M4 11 inch 256GB Wi-Fi",
                            TenAlias = "ipad-pro-m4-11-inch",
                            MaLoai = idTablet,
                            MoTaDonVi = "Chiếc",
                            DonGia = 999,
                            Hinh = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-2),
                            GiamGia = 0,
                            SoLanXem = 180,
                            MoTa = "Độ mỏng kỷ lục 5.3mm, màn hình Ultra Retina XDR OLED kép siêu sáng cùng sức mạnh chip Apple M4 thế hệ mới.",
                            MaNcc = "AP"
                        },
                        new()
                        {
                            TenHh = "Tai nghe Apple AirPods Pro 2 USB-C",
                            TenAlias = "airpods-pro-2-usb-c",
                            MaLoai = idAccessory,
                            MoTaDonVi = "Bộ",
                            DonGia = 249,
                            Hinh = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-5),
                            GiamGia = 15,
                            SoLanXem = 310,
                            MoTa = "Chống ồn chủ động gấp 2 lần, âm thanh không gian cá nhân hóa và hộp sạc MagSafe trang bị chuẩn cắm USB-C.",
                            MaNcc = "AP"
                        },
                        new()
                        {
                            TenHh = "Củ sạc nhanh Anker Prime 67W GaN",
                            TenAlias = "sac-nhanh-anker-prime-67w",
                            MaLoai = idAccessory,
                            MoTaDonVi = "Cái",
                            DonGia = 49,
                            Hinh = "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
                            NgaySx = DateTime.Now.AddMonths(-1),
                            GiamGia = 10,
                            SoLanXem = 85,
                            MoTa = "Công nghệ GaNPrime thế hệ mới, tích hợp 3 cổng sạc đồng thời (2 USB-C + 1 USB-A) an toàn, nhỏ gọn.",
                            MaNcc = "AP"
                        }
                    };

                    await context.HangHoas.AddRangeAsync(products);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Đã seed thành công 8 Sản phẩm công nghệ mẫu vào bảng HangHoa.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi khởi chạy DbInitializer");
            }
        }
    }
}
