using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WebActionResultHDPE.Models;

namespace WebActionResultHDPE.Helpers
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateAccessToken(KhachHang kh)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var keyString = jwtSettings["Key"] ?? "HDPE_Shop_Super_Secret_Jwt_Security_Key_2024_Token";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var role = kh.VaiTro == 1 ? "Admin" : "Customer";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, kh.HoTen ?? kh.MaKh),
                new Claim("CustomerID", kh.MaKh),
                new Claim(ClaimTypes.NameIdentifier, kh.MaKh),
                new Claim(ClaimTypes.Email, kh.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, role),
                new Claim("Role", role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            int expireMinutes = int.TryParse(jwtSettings["AccessTokenExpireMinutes"], out var minutes) ? minutes : 60;

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "HDPE_API",
                audience: jwtSettings["Audience"] ?? "HDPE_Client",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateToken(KhachHang kh)
        {
            return GenerateAccessToken(kh);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public int GetAccessTokenExpirySeconds()
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            int expireMinutes = int.TryParse(jwtSettings["AccessTokenExpireMinutes"], out var minutes) ? minutes : 60;
            return expireMinutes * 60;
        }
    }
}
