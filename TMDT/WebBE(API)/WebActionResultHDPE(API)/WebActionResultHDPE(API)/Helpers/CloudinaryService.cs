using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace WebActionResultHDPE.Helpers
{
    public interface ICloudinaryService
    {
        Task<string?> UploadImageAsync(IFormFile file, string folder = "hdpe_products");
        Task<bool> DeleteImageAsync(string publicId);
    }

    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration configuration)
        {
            var section = configuration.GetSection("Cloudinary");
            var cloudName = section["CloudName"] ?? "drmlhwutz";
            var apiKey = section["ApiKey"] ?? "623281975146158";
            var apiSecret = section["ApiSecret"] ?? "v2NUhosA5lPTaTqAv6QXdMCR7VM";

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<string?> UploadImageAsync(IFormFile file, string folder = "hdpe_products")
        {
            if (file == null || file.Length == 0) return null;

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl?.ToString();
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId)) return false;
            var delParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(delParams);
            return result.Result == "ok";
        }
    }
}
