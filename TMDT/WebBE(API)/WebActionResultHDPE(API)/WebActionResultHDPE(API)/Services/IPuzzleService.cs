using WebActionResultHDPE.DTOs;

namespace WebActionResultHDPE.Services
{
    public interface IPuzzleService
    {
        Task<PuzzleStatusDto> GetStatusAsync(string maKh);
        Task<StartPuzzleResponse> StartPuzzleAsync(string maKh);
        Task<CompletePuzzleResponse> CompletePuzzleAsync(string maKh, CompletePuzzleDto dto);
        Task<ProductViewStartResponse> StartProductViewAsync(string maKh, int productId);
        Task<ProductViewCompleteResponse> CompleteProductViewAsync(string maKh, long productViewId);
        Task<ClaimTicketResponse> ClaimTicketAsync(string maKh, long productViewId);
        Task<LockResponse> LockDailyProgressAsync(string maKh);
    }
}
