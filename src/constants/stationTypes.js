// Backend StationType enum'ına uygun durak türleri
export const STATION_TYPES = [
  { value: 'ALL', label: 'Tüm Türler', icon: '📍' },
  { value: 'METRO', label: 'Metro Durağı', icon: '🚇' },
  { value: 'TRAMVAY', label: 'Tramvay Durağı', icon: '🚋' },
  { value: 'OTOBUS', label: 'Otobüs Durağı', icon: '🚌' },
  { value: 'METROBUS', label: 'Metrobüs Durağı', icon: '🚌' },
  { value: 'TREN', label: 'Tren İstasyonu', icon: '🚆' },
  { value: 'VAPUR', label: 'Vapur İskelesi', icon: '⛴️' },
  { value: 'TELEFERIK', label: 'Teleferik İstasyonu', icon: '🚠' },
  { value: 'DOLMUS', label: 'Dolmuş Durağı', icon: '🚐' },
  { value: 'MINIBUS', label: 'Minibüs Durağı', icon: '🚌' },
  { value: 'HAVARAY', label: 'Havaray İstasyonu', icon: '🚟' },
  { value: 'FERIBOT', label: 'Feribot Terminali', icon: '⛴️' },
  { value: 'HIZLI_TREN', label: 'Hızlı Tren İstasyonu', icon: '🚄' },
  { value: 'BISIKLET', label: 'Bisiklet Paylaşım Noktası', icon: '🚲' },
  { value: 'SCOOTER', label: 'E-Scooter Park Noktası', icon: '🛴' },
  { value: 'PARK_YERI', label: 'Park et Devam Et', icon: '🅿️' },
  { value: 'AKILLI_DURAK', label: 'Akıllı Durak', icon: '📱' },
  { value: 'TERMINAL', label: 'Otobüs Terminali', icon: '🏢' },
  { value: 'ULAŞIM_AKTARMA', label: 'Aktarma Merkezi', icon: '🔄' },
  { value: 'DIGER', label: 'Diğer', icon: '📍' }
];

export const getStationTypeLabel = (type) => {
  const stationType = STATION_TYPES.find(t => t.value === type);
  return stationType ? stationType.label : type;
};

export const getStationTypeIcon = (type) => {
  const stationType = STATION_TYPES.find(t => t.value === type);
  return stationType ? stationType.icon : '📍';
};
