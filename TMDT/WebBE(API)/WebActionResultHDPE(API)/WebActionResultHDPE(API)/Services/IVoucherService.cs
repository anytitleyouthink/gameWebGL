using WebActionResultHDPE.DTOs;

namespace WebActionResultHDPE.Services
{
    public interface IVoucherService
    {
        Task<List<ShopVoucherDto>> GetShopVouchersAsync();
        Task<List<UserVoucherDto>> GetUserVouchersAsync(string maKh);
        Task<PurchaseVoucherResponse> PurchaseVoucherAsync(string maKh, int voucherId);
        Task<UseGameVoucherResponse> UseVoucherAsync(string maKh, UseGameVoucherRequest request);
        Task<SpinWheelResponse> SpinWheelAsync(string maKh);
    }
}
