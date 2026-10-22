/**
 * Trả về URL hình ảnh hợp lệ (hỗ trợ cả ảnh Cloudinary và ảnh nội bộ hệ thống)
 */
export const getProductImageUrl = (hinh?: string | null): string => {
  if (!hinh || hinh.trim() === '') {
    return '/img/logo2.png';
  }
  if (hinh.startsWith('http://') || hinh.startsWith('https://')) {
    return hinh;
  }
  return `/img/Hinh/${hinh}`;
};
