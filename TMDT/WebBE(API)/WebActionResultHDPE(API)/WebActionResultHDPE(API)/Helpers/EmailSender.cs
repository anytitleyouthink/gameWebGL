using System.Net.Mail;
using System.Net;

namespace WebActionResultHDPE.Helpers
{
    public class EmailSender
    {
        public static async Task<int> SendMail(string toMail, string subject, string message)
        {
            try
            {
                // Thông tin tài khoản gửi (Dùng email DNTU của bạn)
                string senderEmail = "1923031277@dntu.edu.vn";
                string appPassword = "eofwedhuebfpbvzg"; // ĐÃ XÓA DẤU CÁCH

                using (SmtpClient smtpClient = new SmtpClient("smtp.gmail.com"))
                {
                    smtpClient.Port = 587;
                    smtpClient.EnableSsl = true;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(senderEmail, appPassword);
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;

                    using (MailMessage mail = new MailMessage())
                    {
                        mail.From = new MailAddress(senderEmail, "HDPE Shop");
                        mail.To.Add(new MailAddress(toMail));
                        mail.IsBodyHtml = true;
                        mail.Subject = subject;
                        mail.Body = message;

                        await smtpClient.SendMailAsync(mail);
                    }
                }
                return 1; // Thành công
            }
            catch (Exception ex)
            {
                // Có thể đặt breakpoint ở đây để xem lỗi cụ thể trong biến ex
                return 0; // Thất bại
            }
        }
    }
}