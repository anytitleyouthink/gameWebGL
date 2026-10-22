import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { productApi } from '../api/services';
import { HangHoaDto, MenuLoaiVM } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const loaiParam = searchParams.get('loai');
  const pageParam = searchParams.get('page');
  const keywordParam = searchParams.get('keyword');

  const [products, setProducts] = useState<HangHoaDto[]>([]);
  const [categories, setCategories] = useState<MenuLoaiVM[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [selectedLoai, setSelectedLoai] = useState<number | undefined>(loaiParam ? parseInt(loaiParam) : undefined);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showCartSuccess, showError } = useToast();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const page = pageParam ? parseInt(pageParam) : 1;
    const loai = loaiParam ? parseInt(loaiParam) : undefined;
    setCurrentPage(page);
    setSelectedLoai(loai);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({
          page,
          pageSize: 8,
          loai,
          keyword: keywordParam || undefined,
        });

        if (res.success && res.data) {
          setProducts(res.data.items);
          setTotalItems(res.data.totalItems);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleLoaiSelect = (loaiId?: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (loaiId !== undefined) {
      params.set('loai', loaiId.toString());
    } else {
      params.delete('loai');
    }
    setSearchParams(params);
  };

  const handleAdd = async (id: number) => {
    setAddingId(id);
    const prod = products.find((p) => p.maHh === id);
    const ok = await addToCart(id, 1);
    if (ok) {
      showCartSuccess(prod?.tenHh || 'Sản phẩm', 1, prod?.hinh);
    } else {
      showError('Thêm vào giỏ hàng', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
    }
    setAddingId(null);
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Sản phẩm</li>
          {keywordParam && <li className="breadcrumb-item active">Tìm kiếm: "{keywordParam}"</li>}
        </ol>
      </nav>

      <div className="row g-4">
        {/* Sidebar Categories */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold d-flex align-items-center mb-3">
              <Filter size={16} className="text-success me-2" /> Danh mục sản phẩm
            </h6>
            <div className="list-group list-group-flush small">
              <button
                onClick={() => handleLoaiSelect(undefined)}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded-3 mb-1 ${
                  selectedLoai === undefined ? 'bg-success text-white fw-bold' : ''
                }`}
              >
                <span>Tất cả sản phẩm</span>
                <span className={`badge ${selectedLoai === undefined ? 'bg-white text-success' : 'bg-light text-muted'}`}>
                  {categories.reduce((acc, c) => acc + c.soLuong, 0)}
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.maLoai}
                  onClick={() => handleLoaiSelect(cat.maLoai)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded-3 mb-1 ${
                    selectedLoai === cat.maLoai ? 'bg-success text-white fw-bold' : ''
                  }`}
                >
                  <span>{cat.tenLoai}</span>
                  <span className={`badge ${selectedLoai === cat.maLoai ? 'bg-white text-success' : 'bg-light text-muted'}`}>
                    {cat.soLuong}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-4 shadow-sm">
            <div>
              <span className="text-muted small">Hiển thị kết quả: <strong>{totalItems}</strong> sản phẩm</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5">
              <ShoppingBag size={48} className="text-muted mb-3" />
              <h5>Không tìm thấy sản phẩm nào!</h5>
              <p className="text-muted small">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc danh mục.</p>
              <button onClick={() => handleLoaiSelect(undefined)} className="btn btn-outline-success btn-sm rounded-pill px-4">
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {products.map((prod) => (
                  <div key={prod.maHh} className="col-lg-4 col-md-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card position-relative bg-white">
                      {prod.giamGia > 0 && (
                        <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-1">
                          -{Math.round(prod.giamGia * 100)}%
                        </span>
                      )}

                      <Link to={`/products/${prod.maHh}`} className="text-decoration-none">
                        <div className="product-img-wrapper p-3 bg-light text-center" style={{ height: '200px' }}>
                          <img
                            src={prod.hinh?.startsWith('http') ? prod.hinh : (prod.hinh ? `/img/Hinh/${prod.hinh}` : '/img/logo2.png')}
                            alt={prod.tenHh}
                            className="img-fluid h-100 object-fit-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/img/logo2.png';
                            }}
                          />
                        </div>
                      </Link>

                      <div className="card-body d-flex flex-column p-3">
                        <small className="text-muted mb-1">{prod.tenLoai || 'Công nghệ'}</small>
                        <h6 className="card-title fw-semibold text-truncate mb-2" title={prod.tenHh}>
                          <Link to={`/products/${prod.maHh}`} className="text-dark text-decoration-none">
                            {prod.tenHh}
                          </Link>
                        </h6>
                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                          <span className="text-danger fw-bold fs-5">${prod.donGia ?? 0}</span>
                          <button
                            onClick={() => handleAdd(prod.maHh)}
                            disabled={addingId === prod.maHh}
                            className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center"
                          >
                            <ShoppingBag size={14} className="me-1" />
                            {addingId === prod.maHh ? 'Thêm...' : 'Mua'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                          <ChevronLeft size={16} />
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(p)}>
                            {p}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                          <ChevronRight size={16} />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
