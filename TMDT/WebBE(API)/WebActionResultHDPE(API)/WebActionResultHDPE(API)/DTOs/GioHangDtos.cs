using System.ComponentModel.DataAnnotations;

namespace WebActionResultHDPE.DTOs
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int MaHh { get; set; }
        public string? TenHh { get; set; }
        public string? Hinh { get; set; }
        public double DonGia { get; set; }
        public int SoLuong { get; set; }
        public double ThanhTien { get; set; }
    }

    public class CartSummaryDto
    {
        public List<CartItemDto> Items { get; set; } = new();
        public int TotalQuantity { get; set; }
        public double TotalPrice { get; set; }
    }

    public class AddToCartRequest
    {
        [Required]
        public int MaHh { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; } = 1;

        public string? SessionId { get; set; }
    }

    public class UpdateQuantityRequest
    {
        [Required]
        public int MaHh { get; set; }

        public int Delta { get; set; }

        public string? SessionId { get; set; }
    }

    public class DeleteCartItemRequest
    {
        public string? SessionId { get; set; }
    }

    public class UpdateCartResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int CurrentQty { get; set; }
        public double ItemTotal { get; set; }
        public double CartTotal { get; set; }
    }

    public class ApplyVoucherRequest
    {
        [Required(ErrorMessage = "Mã voucher không được để trống")]
        public string Code { get; set; } = null!;

        public string? SessionId { get; set; }
    }

    public class ApplyVoucherResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public double DiscountAmount { get; set; }
        public double FinalTotal { get; set; }
    }

    public class VoucherDto
    {
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public string Type { get; set; } = null!;
        public double Value { get; set; }
        public double MinOrder { get; set; }
    }

    public class CheckoutRequest
    {
        [Required(ErrorMessage = "Họ tên người nhận không được để trống")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        public string PhoneNumber { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Địa chỉ nhận hàng không được để trống")]
        public string Address { get; set; } = null!;

        public string? Note { get; set; }

        public string PaymentMethod { get; set; } = "COD";

        public string? VoucherCode { get; set; }

        public string? SessionId { get; set; }
    }

    public class CheckoutResponse
    {
        public int OrderId { get; set; }
        public double TotalAmount { get; set; }
        public double DiscountAmount { get; set; }
        public double FinalAmount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public PaymentQRResponse? QrInfo { get; set; }
        public string Message { get; set; } = null!;
    }

    public class PaymentQRResponse
    {
        public int MaHd { get; set; }
        public double TongTien { get; set; }
        public double SoTienQuyDoi { get; set; }
        public string QrCodeUrl { get; set; } = null!;
        public string BankId { get; set; } = null!;
        public string AccountNo { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string NoiDungChuyenKhoan { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string DiaChi { get; set; } = null!;
    }
}
