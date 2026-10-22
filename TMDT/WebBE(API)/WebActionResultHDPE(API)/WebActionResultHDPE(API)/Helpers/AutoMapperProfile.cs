using AutoMapper;
using WebActionResultHDPE.Models;
using WebActionResultHDPE.ViewModels;

namespace WebActionResultHDPE.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Cấu hình ánh xạ từ RegisterVM sang Model KhachHang
            CreateMap<RegisterVM, KhachHang>()
                // Nếu tên thuộc tính trong RegisterVM là MaKh nhưng trong KhachHang là MaKh (giống nhau) thì không cần .ForMember
                // Nhưng nếu sau này bạn đổi tên trường, hãy dùng cấu trúc dưới đây:
                // .ForMember(dest => dest.MaKh, opt => opt.MapFrom(src => src.MaKh))
                .ReverseMap(); // Cho phép ánh xạ ngược lại nếu cần
        }
    }
}