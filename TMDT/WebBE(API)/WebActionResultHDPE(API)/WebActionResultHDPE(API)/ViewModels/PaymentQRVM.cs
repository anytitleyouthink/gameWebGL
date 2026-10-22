namespace WebActionResultHDPE.ViewModels
{
    public class PaymentQRVM
    {
        public int MaHd { get; set; }
        public double TongTien { get; set; }
        public double SoTienQuyDoi { get; set; }
        public string QrCodeUrl { get; set; }
        public string BankId { get; set; }
        public string AccountNo { get; set; }
        public string AccountName { get; set; }
        public string NoiDungChuyenKhoan { get; set; }
        public string HoTen { get; set; }
        public string DiaChi { get; set; }
    }
}
