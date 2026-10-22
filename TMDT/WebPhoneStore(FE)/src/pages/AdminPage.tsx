import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Package,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { orderApi, productApi } from '../api/services';
import { HoaDonDto, HangHoaDto, MenuLoaiVM, HangHoaUpsertDto } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<HoaDonDto[]>([]);
  const [products, setProducts] = useState<HangHoaDto[]>([]);
  const [categories, setCategories] = useState<MenuLoaiVM[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoai, setSelectedLoai] = useState<number | 'all'>('all');

  // Alert message
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State (Thêm / Sửa)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [formData, setFormData] = useState<HangHoaUpsertDto>({
    tenHh: '',
    tenAlias: '',
    maLoai: 1001,
    moTaDonVi: 'Cái',
    donGia: 0,
    hinh: '',
    ngaySx: new Date().toISOString(),
    giamGia: 0,
    soLanXem: 0,
    moTa: '',
    maNcc: 'AP',
  });

  // Image Upload state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<HangHoaDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertInfo({ type, message });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes, catRes] = await Promise.all([
        orderApi.getAllOrders(),
        productApi.getProducts({ page: 1, pageSize: 100 }),
        productApi.getCategories(),
      ]);
      if (orderRes.success && orderRes.data) setOrders(orderRes.data);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data.items);
      if (catRes.success && catRes.data) setCategories(catRes.data);
    } catch {
      showAlert('Không thể tải dữ liệu từ máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mở modal thêm sản phẩm
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      tenHh: '',
      tenAlias: '',
      maLoai: categories[0]?.maLoai || 1001,
      moTaDonVi: 'Cái',
      donGia: 100,
      hinh: '',
      ngaySx: new Date().toISOString(),
      giamGia: 0,
      soLanXem: 0,
      moTa: '',
      maNcc: 'AP',
    });
    setImagePreview('');
    setUploadSuccess(false);
  };

  // Mở modal sửa sản phẩm
  const handleOpenEditModal = (product: HangHoaDto) => {
    setModalMode('edit');
    setEditingId(product.maHh);
    setFormData({
      tenHh: product.tenHh,
      tenAlias: product.tenAlias || '',
      maLoai: product.maLoai,
      moTaDonVi: product.moTaDonVi || 'Cái',
      donGia: product.donGia || 0,
      hinh: product.hinh || '',
      ngaySx: product.ngaySx || new Date().toISOString(),
      giamGia: product.giamGia || 0,
      soLanXem: product.soLanXem || 0,
      moTa: product.moTa || '',
      maNcc: product.maNcc || 'AP',
    });
    setImagePreview(product.hinh || '');
    setUploadSuccess(!!product.hinh?.startsWith('http'));
  };

  // Xử lý upload ảnh lên Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Xem trước cục bộ
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);
    setUploadSuccess(false);

    try {
      const res = await productApi.uploadImage(file);
      if (res.success && res.data) {
        const uploadedUrl = res.data.url || res.data.secureUrl;
        setFormData((prev) => ({ ...prev, hinh: uploadedUrl }));
        setImagePreview(uploadedUrl);
        setUploadSuccess(true);
        showAlert('Tải ảnh lên Cloudinary thành công!', 'success');
      } else {
        showAlert(res.message || 'Lỗi khi upload ảnh lên Cloudinary', 'error');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Không thể upload ảnh lên Cloudinary', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Lưu sản phẩm (Tạo mới hoặc Sửa)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenHh.trim()) {
      showAlert('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }

    try {
      if (modalMode === 'add') {
        const res = await productApi.createProduct(formData);
        if (res.success) {
          showAlert('Thêm sản phẩm mới thành công!', 'success');
          setModalMode(null);
          loadData();
        } else {
          showAlert(res.message || 'Thêm sản phẩm thất bại', 'error');
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await productApi.updateProduct(editingId, formData);
        if (res.success) {
          showAlert('Cập nhật sản phẩm thành công!', 'success');
          setModalMode(null);
          loadData();
        } else {
          showAlert(res.message || 'Cập nhật thất bại', 'error');
        }
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Lỗi xử lý sản phẩm', 'error');
    }
  };

  // Xóa sản phẩm
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await productApi.deleteProduct(deletingProduct.maHh);
      if (res.success) {
        showAlert(`Đã xóa sản phẩm #${deletingProduct.maHh} thành công!`, 'success');
        setDeletingProduct(null);
        loadData();
      } else {
        showAlert(res.message || 'Xóa sản phẩm thất bại', 'error');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (id: number, status: number) => {
    try {
      await orderApi.updateOrder(id, { maTrangThai: status });
      showAlert(`Đã cập nhật trạng thái đơn #${id}`, 'success');
      loadData();
    } catch {
      showAlert('Lỗi khi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  // Lọc sản phẩm
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.tenHh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.maHh.toString().includes(searchTerm);
    const matchesLoai = selectedLoai === 'all' || p.maLoai === selectedLoai;
    return matchesSearch && matchesLoai;
  });

  // Tính tổng tiền đơn hàng
  const totalRevenue = orders.reduce((acc, o) => acc + (o.tongTien || 0), 0);

  // Helper hàm hiển thị URL ảnh (Cloudinary hoặc ảnh mẫu local)
  const renderProductImage = (hinh?: string | null) => {
    if (!hinh) return '/img/logo2.png';
    if (hinh.startsWith('http://') || hinh.startsWith('https://')) {
      return hinh;
    }
    return `/img/Hinh/${hinh}`;
  };

  return (
    <div className="container-fluid px-lg-5 py-4 bg-light min-vh-100">
      {/* Toast Alert */}
      {alertInfo && (
        <div
          className={`position-fixed top-0 end-0 m-4 alert alert-${alertInfo.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show shadow-lg`}
          style={{ zIndex: 9999, minWidth: '320px' }}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {alertInfo.type === 'success' ? (
              <CheckCircle2 size={20} className="me-2" />
            ) : (
              <AlertCircle size={20} className="me-2" />
            )}
            <span>{alertInfo.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="card border-0 rounded-4 shadow-sm p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill small fw-bold">
                <Shield size={13} className="me-1 inline" /> Quản Trị Hệ Thống
              </span>
              <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small fw-bold">
                <Sparkles size={13} className="me-1 inline" /> Cloudinary Enabled
              </span>
            </div>
            <h2 className="fw-bolder mb-1 text-dark">Bảng Điều Khiển Quản Trị</h2>
            <p className="text-muted small mb-0">
              Xin chào <strong>{user?.hoTen || 'Admin'}</strong>! Quản lý sản phẩm, tải ảnh lên Cloudinary và theo dõi đơn hàng.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={loadData}
              className="btn btn-outline-secondary rounded-pill px-3 py-2 btn-sm d-flex align-items-center gap-1 shadow-sm"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <Link to="/" className="btn btn-outline-dark rounded-pill px-3 py-2 btn-sm d-flex align-items-center gap-1 shadow-sm">
              <ArrowLeft size={14} /> Về gian hàng
            </Link>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="row g-3 mt-3">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="p-3 rounded-4 bg-success-subtle text-success d-flex align-items-center justify-content-between">
              <div>
                <p className="small mb-1 fw-semibold text-uppercase text-muted">Kho Hàng Hóa</p>
                <h3 className="fw-bolder mb-0 text-success">{products.length}</h3>
              </div>
              <div className="bg-white p-3 rounded-circle shadow-sm">
                <Package size={26} className="text-success" />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <div className="p-3 rounded-4 bg-primary-subtle text-primary d-flex align-items-center justify-content-between">
              <div>
                <p className="small mb-1 fw-semibold text-uppercase text-muted">Đơn Đặt Hàng</p>
                <h3 className="fw-bolder mb-0 text-primary">{orders.length}</h3>
              </div>
              <div className="bg-white p-3 rounded-circle shadow-sm">
                <ShoppingCart size={26} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <div className="p-3 rounded-4 bg-warning-subtle text-warning d-flex align-items-center justify-content-between">
              <div>
                <p className="small mb-1 fw-semibold text-uppercase text-muted">Tổng Doanh Thu</p>
                <h3 className="fw-bolder mb-0 text-dark">${totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-3 rounded-circle shadow-sm">
                <TrendingUp size={26} className="text-warning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Chuyển đổi */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('products')}
            className={`nav-link rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'products' ? 'active bg-success text-white shadow' : 'bg-white text-dark shadow-sm'
            }`}
          >
            <Package size={18} /> Quản Lý Sản Phẩm ({filteredProducts.length}/{products.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('orders')}
            className={`nav-link rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
              activeTab === 'orders' ? 'active bg-success text-white shadow' : 'bg-white text-dark shadow-sm'
            }`}
          >
            <ShoppingCart size={18} /> Quản Lý Đơn Hàng ({orders.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="card border-0 rounded-4 p-5 text-center shadow-sm bg-white">
          <div className="spinner-border text-success mx-auto mb-3" role="status"></div>
          <p className="text-muted small mb-0">Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
      ) : activeTab === 'products' ? (
        /* ==================== TAB QUẢN LÝ SẢN PHẨM ==================== */
        <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
          {/* Thanh công cụ tìm kiếm và lọc */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: '600px' }}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Tìm theo tên sản phẩm hoặc mã HH..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-select w-auto"
                value={selectedLoai}
                onChange={(e) => setSelectedLoai(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">Tất cả danh mục ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.maLoai} value={c.maLoai}>
                    {c.tenLoai}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Thêm Sản Phẩm Mới
            </button>
          </div>

          {/* Bảng danh sách sản phẩm */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Mã</th>
                  <th style={{ width: '100px' }}>Ảnh</th>
                  <th>Tên Hàng Hóa</th>
                  <th>Danh Mục</th>
                  <th>Đơn Giá</th>
                  <th>Giảm Giá</th>
                  <th>Lượt Xem</th>
                  <th className="text-end" style={{ width: '140px' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isCloudinary = p.hinh?.includes('cloudinary');
                    return (
                      <tr key={p.maHh}>
                        <td>
                          <span className="badge bg-light text-dark fw-bold border">#{p.maHh}</span>
                        </td>
                        <td>
                          <div className="position-relative" style={{ width: '60px', height: '60px' }}>
                            <img
                              src={renderProductImage(p.hinh)}
                              alt={p.tenHh}
                              className="rounded-3 border object-fit-cover w-100 h-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/img/logo2.png';
                              }}
                            />
                            {isCloudinary && (
                              <span
                                className="position-absolute bottom-0 end-0 badge bg-primary p-1 rounded-circle"
                                title="Lưu trữ trên Cloudinary"
                              >
                                <UploadCloud size={10} className="text-white" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{p.tenHh}</div>
                          <div className="small text-muted">{p.moTaDonVi || 'Cái'} • NCC: {p.maNcc}</div>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">
                            {p.tenLoai || `Loại #${p.maLoai}`}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bolder text-danger">${p.donGia?.toLocaleString()}</span>
                        </td>
                        <td>{p.giamGia > 0 ? <span className="badge bg-warning text-dark">-{p.giamGia}%</span> : '—'}</td>
                        <td>
                          <span className="small text-muted d-flex align-items-center gap-1">
                            <Eye size={14} /> {p.soLanXem}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="btn btn-outline-primary rounded-start-pill px-3"
                              title="Chỉnh sửa sản phẩm"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="btn btn-outline-danger rounded-end-pill px-3"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== TAB QUẢN LÝ ĐƠN HÀNG ==================== */
        <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
          <h5 className="fw-bold mb-3">Toàn bộ đơn hàng trong hệ thống</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Cập nhật trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      Chưa có đơn hàng nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.maHd}>
                      <td>
                        <span className="badge bg-light text-dark border fw-bold">#{o.maHd}</span>
                      </td>
                      <td>
                        <div className="fw-bold">{o.hoTen || o.maKh}</div>
                        <div className="small text-muted">{o.diaChi}</div>
                      </td>
                      <td>{new Date(o.ngayDat).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className="fw-bolder text-danger">${o.tongTien?.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{o.cachThanhToan}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            o.maTrangThai === 3
                              ? 'bg-success'
                              : o.maTrangThai === 0
                              ? 'bg-warning text-dark'
                              : 'bg-primary'
                          }`}
                        >
                          {o.tenTrangThai || (o.maTrangThai === 0 ? 'Mới đặt' : o.maTrangThai === 3 ? 'Hoàn thành' : 'Đang xử lý')}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto rounded-pill"
                          value={o.maTrangThai}
                          onChange={(e) => handleUpdateOrderStatus(o.maHd, parseInt(e.target.value))}
                        >
                          <option value={0}>Mới đặt hàng</option>
                          <option value={1}>Đang chuẩn bị</option>
                          <option value={2}>Đang giao hàng</option>
                          <option value={3}>Đã hoàn thành</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL THÊM / SỬA SẢN PHẨM ==================== */}
      {modalMode && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3 my-md-4">
            <div className="modal-content rounded-4 border-0 shadow-lg p-2 p-md-3" style={{ maxHeight: '92vh' }}>
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success-subtle text-success p-2 rounded-circle">
                    {modalMode === 'add' ? <Plus size={20} /> : <Edit2 size={20} />}
                  </div>
                  <h4 className="modal-title fw-bold mb-0">
                    {modalMode === 'add' ? 'Thêm Sản Phẩm Mới' : `Chỉnh Sửa Sản Phẩm #${editingId}`}
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalMode(null)}
                  disabled={uploadingImage}
                ></button>
              </div>

              <form onSubmit={handleSubmitProduct} className="d-flex flex-column overflow-hidden">
                <div className="modal-body py-4 overflow-y-auto" style={{ maxHeight: '72vh' }}>
                  <div className="row g-3">
                    {/* Tên sản phẩm */}
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Tên hàng hóa / sản phẩm *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên sản phẩm (ví dụ: iPhone 15 Pro Max)..."
                        value={formData.tenHh}
                        onChange={(e) => setFormData({ ...formData, tenHh: e.target.value })}
                        required
                      />
                    </div>

                    {/* Danh mục */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Danh mục *</label>
                      <select
                        className="form-select"
                        value={formData.maLoai}
                        onChange={(e) => setFormData({ ...formData, maLoai: parseInt(e.target.value) })}
                      >
                        {categories.map((c) => (
                          <option key={c.maLoai} value={c.maLoai}>
                            {c.tenLoai}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Đơn giá */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Đơn giá ($) *</label>
                      <div className="input-group">
                        <span className="input-group-text"><DollarSign size={16} /></span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={formData.donGia ?? 0}
                          onChange={(e) => setFormData({ ...formData, donGia: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    {/* Giảm giá */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Giảm giá (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        value={formData.giamGia}
                        onChange={(e) => setFormData({ ...formData, giamGia: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Đơn vị tính */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Đơn vị tính</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Cái, Hộp, Bộ..."
                        value={formData.moTaDonVi || ''}
                        onChange={(e) => setFormData({ ...formData, moTaDonVi: e.target.value })}
                      />
                    </div>

                    {/* Nhà cung cấp */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Mã Nhà cung cấp</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="AP, SS, NK..."
                        value={formData.maNcc}
                        onChange={(e) => setFormData({ ...formData, maNcc: e.target.value })}
                        required
                      />
                    </div>

                    {/* Alias */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Tên Alias (SEO friendly)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="tu-dong-theo-ten"
                        value={formData.tenAlias || ''}
                        onChange={(e) => setFormData({ ...formData, tenAlias: e.target.value })}
                      />
                    </div>

                    {/* ================= CLOUDINARY UPLOAD SECTION ================= */}
                    <div className="col-12">
                      <div className="card border border-success-subtle bg-light rounded-4 p-3">
                        <label className="form-label small fw-bold text-success d-flex align-items-center gap-1 mb-2">
                          <UploadCloud size={18} /> Hình Ảnh Sản Phẩm (Tích Hợp Cloudinary)
                        </label>

                        <div className="row g-3 align-items-center">
                          <div className="col-auto">
                            <div
                              className="rounded-3 border border-2 bg-white d-flex align-items-center justify-content-center overflow-hidden position-relative shadow-sm"
                              style={{ width: '110px', height: '110px' }}
                            >
                              {imagePreview ? (
                                <img
                                  src={renderProductImage(imagePreview)}
                                  alt="Preview"
                                  className="w-100 h-100 object-fit-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/img/logo2.png';
                                  }}
                                />
                              ) : (
                                <div className="text-center text-muted p-2">
                                  <UploadCloud size={30} className="mb-1 text-secondary" />
                                  <div style={{ fontSize: '11px' }}>Chưa có ảnh</div>
                                </div>
                              )}

                              {uploadingImage && (
                                <div
                                  className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column align-items-center justify-content-center text-white"
                                  style={{ zIndex: 10 }}
                                >
                                  <div className="spinner-border spinner-border-sm mb-1" role="status"></div>
                                  <span style={{ fontSize: '10px' }}>Đang tải...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              className="d-none"
                              onChange={handleFileChange}
                            />
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                              >
                                <UploadCloud size={15} />
                                {uploadingImage ? 'Đang tải lên Cloudinary...' : 'Chọn file từ máy tính'}
                              </button>

                              {imagePreview && (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm rounded-pill px-2"
                                  onClick={() => {
                                    setImagePreview('');
                                    setFormData((prev) => ({ ...prev, hinh: '' }));
                                    setUploadSuccess(false);
                                  }}
                                  title="Gỡ ảnh"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>

                            {uploadSuccess && (
                              <div className="small text-success d-flex align-items-center gap-1 mb-2">
                                <CheckCircle2 size={14} /> Ảnh đã tải lên Cloudinary thành công!
                              </div>
                            )}

                            <div>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Hoặc dán URL ảnh trực tiếp (Cloudinary URL)..."
                                value={formData.hinh || ''}
                                onChange={(e) => {
                                  setFormData({ ...formData, hinh: e.target.value });
                                  setImagePreview(e.target.value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Mô tả sản phẩm</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Nhập thông tin giới thiệu, cấu hình, đặc điểm nổi bật..."
                        value={formData.moTa || ''}
                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setModalMode(null)}
                    disabled={uploadingImage}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                    disabled={uploadingImage}
                  >
                    {modalMode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL XÁC NHẬN XÓA ==================== */}
      {deletingProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content rounded-4 border-0 shadow-lg p-3 text-center">
              <div className="modal-body py-4">
                <div className="bg-danger-subtle text-danger d-inline-flex p-3 rounded-circle mb-3">
                  <Trash2 size={32} />
                </div>
                <h5 className="fw-bold mb-2">Xác Nhận Xóa Sản Phẩm?</h5>
                <p className="text-muted small mb-0">
                  Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct.tenHh}"</strong> (Mã: #{deletingProduct.maHh})?
                  Hành động này sẽ xóa dữ liệu vĩnh viễn khỏi hệ thống.
                </p>
              </div>

              <div className="modal-footer border-0 justify-content-center gap-2 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setDeletingProduct(null)}
                  disabled={isDeleting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa Ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
