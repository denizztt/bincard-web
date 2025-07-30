import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MapPin,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  Phone,
  Clock,
  CreditCard,
  Filter,
  Download
} from 'lucide-react';
import { paymentPointApi } from '../services/apiService';

const PaymentPointList = () => {
  const navigate = useNavigate();
  const [paymentPoints, setPaymentPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    paymentMethod: 'all'
  });

  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Kredi Kartı' },
    { value: 'DEBIT_CARD', label: 'Banka Kartı' },
    { value: 'CASH', label: 'Nakit' },
    { value: 'QR_CODE', label: 'QR Kod' },
    { value: 'NFC', label: 'NFC/Temassız' },
    { value: 'BANK_TRANSFER', label: 'Banka Transferi' }
  ];

  useEffect(() => {
    loadPaymentPoints();
  }, [currentPage, pageSize, sortBy]);

  const loadPaymentPoints = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await paymentPointApi.getAllPaymentPoints(currentPage, pageSize, sortBy);
      
      if (response.isSuccess || response.success) {
        const data = response.data;
        
        if (data.content) {
          // Backend returns PagedResponse format
          setPaymentPoints(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else if (Array.isArray(data)) {
          // Fallback for simple array response
          setPaymentPoints(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setPaymentPoints([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        throw new Error(response.message || 'Ödeme noktaları yüklenemedi');
      }
    } catch (error) {
      console.error('Ödeme noktaları yükleme hatası:', error);
      setError('Ödeme noktaları yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      
      // Show some sample data in case of error for demo purposes
      setPaymentPoints([
        {
          id: 1,
          name: 'Merkez Ödeme Noktası',
          address: {
            fullAddress: 'Atatürk Cad. No:123 Merkez/İSTANBUL',
            city: 'İstanbul',
            district: 'Merkez'
          },
          contactNumber: '0212 555 12 34',
          workingHours: '09:00 - 18:00',
          paymentMethods: ['CREDIT_CARD', 'CASH'],
          active: true,
          createdAt: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          name: 'AVM Ödeme Noktası',
          address: {
            fullAddress: 'Mall of İstanbul AVM Kat:2',
            city: 'İstanbul',
            district: 'Başakşehir'
          },
          contactNumber: '0212 555 67 89',
          workingHours: '10:00 - 22:00',
          paymentMethods: ['CREDIT_CARD', 'DEBIT_CARD', 'QR_CODE'],
          active: true,
          createdAt: '2024-01-16T14:20:00'
        }
      ]);
      setTotalPages(1);
      setTotalElements(2);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await paymentPointApi.togglePaymentPointStatus(id, !currentStatus);
      
      if (response.isSuccess || response.success) {
        // Update the status in local state
        setPaymentPoints(prev => 
          prev.map(point => 
            point.id === id 
              ? { ...point, active: !currentStatus }
              : point
          )
        );
        alert(`Ödeme noktası ${!currentStatus ? 'aktif hale getirildi' : 'pasif hale getirildi'}!`);
      } else {
        throw new Error(response.message || 'Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ödeme noktasını silmek istediğinizden emin misiniz?`)) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await paymentPointApi.deletePaymentPoint(id);
      
      if (response.isSuccess || response.success) {
        // Remove from local state
        setPaymentPoints(prev => prev.filter(point => point.id !== id));
        setTotalElements(prev => prev - 1);
        alert('Ödeme noktası başarıyla silindi!');
      } else {
        throw new Error(response.message || 'Ödeme noktası silinemedi');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Ödeme noktası silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  const filteredPoints = paymentPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (point.address?.fullAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && point.active) ||
      (filters.status === 'inactive' && !point.active);
    
    const matchesPaymentMethod = filters.paymentMethod === 'all' ||
      (point.paymentMethods && point.paymentMethods.includes(filters.paymentMethod));
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getPaymentMethodLabel = (method) => {
    const option = paymentMethodOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Ödeme noktaları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>💳 Ödeme Noktaları</h1>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                Toplam {totalElements} ödeme noktası ({filteredPoints.length} gösteriliyor)
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={loadPaymentPoints}
              style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} />
              Yenile
            </button>
            <button 
              onClick={() => navigate('/payment-point/add')}
              style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Yeni Nokta Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
          <strong>Uyarı:</strong> {error}
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Arama
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Ödeme noktası ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Durum
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Ödeme Yöntemi
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              <option value="all">Tümü</option>
              {paymentMethodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              <option value="name">Ad (A-Z)</option>
              <option value="createdAt">Oluşturma Tarihi</option>
              <option value="active">Durum</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Sayfa Boyutu
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '200px' }}>Nokta Adı</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '250px' }}>Adres</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '150px' }}>İletişim</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '200px' }}>Ödeme Yöntemleri</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '100px' }}>Durum</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '150px' }}>Oluşturma</th>
                <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600', color: '#2c3e50', minWidth: '180px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.length > 0 ? (
                filteredPoints.map((point) => (
                  <tr key={point.id} style={{ borderBottom: '1px solid #f1f3f4', '&:hover': { background: '#f8f9fa' } }}>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} style={{ color: point.active ? '#28a745' : '#6c757d' }} />
                        <div>
                          <div style={{ fontWeight: '600', color: '#2c3e50' }}>{point.name}</div>
                          {point.workingHours && (
                            <div style={{ fontSize: '12px', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Clock size={12} />
                              {point.workingHours}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ color: '#6c757d', fontSize: '14px' }}>
                        {point.address?.fullAddress || 'Adres bilgisi yok'}
                        {point.address?.city && point.address?.district && (
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                            {point.address.district}, {point.address.city}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      {point.contactNumber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6c757d' }}>
                          <Phone size={12} />
                          {point.contactNumber}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>Belirtilmemiş</span>
                      )}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                        {point.paymentMethods && point.paymentMethods.length > 0 ? (
                          point.paymentMethods.slice(0, 2).map((method, index) => (
                            <span key={index} style={{ 
                              background: '#e3f2fd', 
                              color: '#1976d2', 
                              padding: '2px 6px', 
                              borderRadius: '8px', 
                              fontSize: '10px', 
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              <CreditCard size={10} />
                              {getPaymentMethodLabel(method)}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Belirtilmemiş</span>
                        )}
                        {point.paymentMethods && point.paymentMethods.length > 2 && (
                          <span style={{ 
                            background: '#f1f3f4', 
                            color: '#6c757d', 
                            padding: '2px 6px', 
                            borderRadius: '8px', 
                            fontSize: '10px', 
                            fontWeight: '600' 
                          }}>
                            +{point.paymentMethods.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleStatus(point.id, point.active)}
                          disabled={actionLoading[point.id]}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: actionLoading[point.id] ? 'not-allowed' : 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={point.active ? 'Pasif hale getir' : 'Aktif hale getir'}
                        >
                          {actionLoading[point.id] ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          ) : point.active ? (
                            <ToggleRight size={20} style={{ color: '#28a745' }} />
                          ) : (
                            <ToggleLeft size={20} style={{ color: '#6c757d' }} />
                          )}
                        </button>
                        <span style={{ 
                          background: point.active ? '#d4edda' : '#f8d7da', 
                          color: point.active ? '#155724' : '#721c24', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600' 
                        }}>
                          {point.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px', color: '#6c757d', fontSize: '14px' }}>
                      {formatDate(point.createdAt)}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => navigate(`/payment-point/detail/${point.id}`)}
                          style={{ 
                            background: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="Detayları Görüntüle"
                        >
                          <Eye size={12} />
                          Detay
                        </button>
                        <button 
                          onClick={() => navigate(`/payment-point/edit/${point.id}`)}
                          style={{ 
                            background: '#ffc107', 
                            color: '#212529', 
                            border: 'none', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="Düzenle"
                        >
                          <Edit size={12} />
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDelete(point.id, point.name)}
                          disabled={actionLoading[point.id]}
                          style={{ 
                            background: actionLoading[point.id] ? '#95a5a6' : '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: actionLoading[point.id] ? 'not-allowed' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="Sil"
                        >
                          {actionLoading[point.id] ? (
                            <div style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <MapPin size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                    <p style={{ color: '#6c757d', fontSize: '16px', margin: 0 }}>
                      {searchTerm || filters.status !== 'all' || filters.paymentMethod !== 'all' 
                        ? 'Filtrelere uygun ödeme noktası bulunamadı' 
                        : 'Henüz ödeme noktası eklenmemiş'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f3f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6c757d', fontSize: '14px' }}>
              Sayfa {currentPage + 1} / {totalPages} - Toplam {totalElements} kayıt
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                İlk
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Önceki
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #dee2e6',
                      background: currentPage === pageNum ? '#007bff' : 'white',
                      color: currentPage === pageNum ? 'white' : '#007bff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNum ? '600' : '400'
                    }}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage === totalPages - 1 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Sonraki
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage === totalPages - 1 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Son
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          table tbody tr:hover {
            background-color: #f8f9fa !important;
          }
        `}
      </style>
    </div>
  );
};

export default PaymentPointList; 