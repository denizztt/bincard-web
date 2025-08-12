import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeApi } from '../services/apiService';
import { stationApi } from '../services/apiService';
import { Loader } from '@googlemaps/js-api-loader';
import { 
  ROUTE_TYPES, 
  ROUTE_TYPE_LABELS, 
  TIME_SLOTS, 
  formatTimeSlot,
  ROUTE_COLORS 
} from '../constants/routeTypes';
import '../styles/RouteCreate.css';

const RouteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);

  // Google Maps için gerekli state ve referanslar
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStations, setSelectedStations] = useState([]);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Form state
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    description: '',
    routeType: 'CITY_BUS',
    color: ROUTE_COLORS[0],
    startStationId: '',
    endStationId: '',
    estimatedDurationMinutes: '',
    totalDistanceKm: '',
    weekdayHours: [],
    weekendHours: [],
    outgoingStations: [],
    returnStations: []
  });

  // Harita başlangıç konumu (Türkiye merkezli)
  const [mapCenter, setMapCenter] = useState({ lat: 39.1667, lng: 35.6667 });

  // Durak node state
  const [newOutgoingNode, setNewOutgoingNode] = useState({
    fromStationId: '',
    toStationId: '',
    estimatedTravelTimeMinutes: '',
    distanceKm: '',
    notes: ''
  });

  // İstasyonları yükle
  const loadStations = async () => {
    try {
      const response = await stationApi.getAllStations();
      if (response.success) {
        setStations(response.data.content || response.data);
      }
    } catch (error) {
      console.error('Stations loading error:', error);
    }
  };

  // Google Maps API'yi yükle
  const loadGoogleMapsAPI = useCallback(async () => {
    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();
      return google;
    } catch (error) {
      console.error('Google Maps API loading error:', error);
      setError('Google Haritalar yüklenemedi!');
      return null;
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Haritayı başlat
  const initMap = useCallback(async () => {
    try {
      const google = await loadGoogleMapsAPI();
      if (!google || !mapRef.current) return;

      // Durakların merkez noktasını hesapla (daha iyi bir görüntü için)
      let centerLat = mapCenter.lat;
      let centerLng = mapCenter.lng;
      let bounds = new google.maps.LatLngBounds();
      let validCoordinates = 0;

      stations.forEach(station => {
        if (station.latitude && station.longitude) {
          const lat = parseFloat(station.latitude);
          const lng = parseFloat(station.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend(new google.maps.LatLng(lat, lng));
            validCoordinates++;
          }
        }
      });

      // Duraklar varsa, görünümü onlara göre ayarla
      if (validCoordinates > 0) {
        centerLat = bounds.getCenter().lat();
        centerLng = bounds.getCenter().lng();
      }

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: validCoordinates > 0 ? 12 : 6, // Duraklar varsa daha yakın başla
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'transit.station',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Sınırları ayarla (duraklar çok dağınıksa)
      if (validCoordinates > 1) {
        map.fitBounds(bounds);
      }

      googleMapRef.current = map;
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: formData.color,
          strokeWeight: 5
        }
      });
      directionsRendererRef.current.setMap(map);

      // Durakları haritada göster
      if (stations.length > 0) {
        showStationsOnMap(google, map);
      }

      // Durak arama kutusu ekle
      const searchBox = document.getElementById('station-search');
      if (searchBox) {
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBox);
        searchBox.style.display = 'block';

        // Arama kutusuna odaklanıldığında klavye olaylarını durdur
        searchBox.addEventListener('focus', () => {
          map.setOptions({ keyboardShortcuts: false });
        });

        searchBox.addEventListener('blur', () => {
          map.setOptions({ keyboardShortcuts: true });
        });
      }

      setMapLoaded(true);
    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Harita başlatılamadı!');
    }
  }, [mapCenter, formData.color, stations, loadGoogleMapsAPI]);

  // Durakları haritada göster
  const showStationsOnMap = useCallback((google, map) => {
    // Önce tüm markerları temizle
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // İnfo penceresi oluştur
    const infoWindow = new google.maps.InfoWindow();

    stations.forEach(station => {
      if (station.latitude && station.longitude) {
        const position = {
          lat: parseFloat(station.latitude),
          lng: parseFloat(station.longitude)
        };

        // Durak daha önce seçilmiş mi kontrol et
        const isSelected = selectedStations.some(s => s.id === station.id);
        const stationIndex = selectedStations.findIndex(s => s.id === station.id);

        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: station.name,
          animation: isSelected ? google.maps.Animation.BOUNCE : null,
          icon: {
            url: isSelected 
              ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          },
          label: isSelected ? {
            text: (stationIndex + 1).toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          } : null
        });

        marker.stationData = station; // Durak bilgilerini marker'a ekle

        // 1 saniye sonra animasyonu durdur
        if (isSelected) {
          setTimeout(() => {
            marker.setAnimation(null);
          }, 1000);
        }

        // Tıklama olayı
        marker.addListener('click', () => {
          handleStationSelect(station, marker, google);
        });

        // Üzerine gelme olayı
        marker.addListener('mouseover', () => {
          const contentString = `
            <div class="info-window">
              <h3>${station.name}</h3>
              <p>${station.city || ''} ${station.district ? '/ ' + station.district : ''}</p>
              <p><strong>Durak Kodu:</strong> ${station.code || 'Belirtilmemiş'}</p>
              ${isSelected ? `<p><strong>Rota Sırası:</strong> ${stationIndex + 1}</p>` : ''}
              <p class="info-action">${isSelected ? 'Bu durağı kaldırmak için tıklayın' : 'Bu durağı rotaya eklemek için tıklayın'}</p>
            </div>
          `;
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        // Üzerinden ayrılma olayı
        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        markersRef.current.push(marker);
      }
    });
  }, [stations, selectedStations]);

  // Durak ara
  const searchStation = (searchText) => {
    if (!searchText || searchText.length < 2) return;

    const searchLower = searchText.toLowerCase();
    const foundStations = stations.filter(station => 
      station.name?.toLowerCase().includes(searchLower) ||
      station.code?.toLowerCase().includes(searchLower) ||
      station.city?.toLowerCase().includes(searchLower)
    );

    if (foundStations.length > 0) {
      // İlk bulunan durağa odaklan
      const firstMatch = foundStations[0];
      if (firstMatch.latitude && firstMatch.longitude) {
        const position = {
          lat: parseFloat(firstMatch.latitude),
          lng: parseFloat(firstMatch.longitude)
        };

        googleMapRef.current.setCenter(position);
        googleMapRef.current.setZoom(15);

        // Marker'ı bul ve vurgula
        const marker = markersRef.current.find(m => m.stationData?.id === firstMatch.id);
        if (marker) {
          // Geçici vurgulama animasyonu
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => {
            marker.setAnimation(null);
          }, 2000);
        }
      }
    }
  };

  // En yakın istasyonu bul
  const findNearestStation = (lat, lng) => {
    if (stations.length === 0) return null;

    let nearestStation = null;
    let minDistance = Infinity;

    stations.forEach(station => {
      if (station.latitude && station.longitude) {
        const distance = calculateDistance(
          lat, lng, 
          parseFloat(station.latitude), 
          parseFloat(station.longitude)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = station;
        }
      }
    });

    return nearestStation;
  };

  // İki nokta arasındaki mesafeyi hesapla (Haversine formülü - km cinsinden)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km cinsinden
  };

  // Form input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Rota rengi değiştiğinde polyline rengini güncelle
    if (name === 'color' && directionsRendererRef.current) {
      directionsRendererRef.current.setOptions({
        polylineOptions: {
          strokeColor: value,
          strokeWeight: 5
        }
      });
      updateRoute();
    }
  };

  // Çoklu seçim için (time slots)
  const handleTimeSlotChange = (timeSlot, dayType) => {
    setFormData(prev => {
      const currentSlots = prev[dayType];
      const newSlots = currentSlots.includes(timeSlot)
        ? currentSlots.filter(slot => slot !== timeSlot)
        : [...currentSlots, timeSlot];
      
      return {
        ...prev,
        [dayType]: newSlots
      };
    });
  };

  // Durak seçme işlemi
  const handleStationSelect = (station, marker, google) => {
    // Eğer durak zaten seçiliyse, seçimi kaldır
    const isAlreadySelected = selectedStations.some(s => s.id === station.id);

    if (isAlreadySelected) {
      // Seçimi kaldır
      const stationIndex = selectedStations.findIndex(s => s.id === station.id);
      setSelectedStations(prev => prev.filter(s => s.id !== station.id));

      // Marker görünümünü güncelle
      marker.setIcon({
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      });
      marker.setLabel(null);

      // Başlangıç veya bitiş durağı kaldırıldıysa form verilerini güncelle
      if (stationIndex === 0 || stationIndex === selectedStations.length - 1) {
        updateStartEndStations(selectedStations.filter(s => s.id !== station.id));
      }

      // Kullanıcıya bildirim göster
      showToast(`${station.name} durağı rotadan çıkarıldı`);

    } else {
      // Yeni durak seç
      const newSelectedStations = [...selectedStations, station];
      setSelectedStations(newSelectedStations);

      // Marker görünümünü güncelle ve numara ekle
      marker.setIcon({
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      });
      marker.setLabel({
        text: newSelectedStations.length.toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      });

      // Marker'a geçici animasyon ekle
      if (google) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 1000);
      }

      // İlk ve son durakları otomatik güncelle
      updateStartEndStations(newSelectedStations);

      // Kullanıcıya bildirim göster
      showToast(`${station.name} durağı rotaya eklendi`);
    }

    // Rota güzergahını güncelle
    setTimeout(() => updateRoute(), 100);
  };

  // Başlangıç ve bitiş duraklarını güncelle
  const updateStartEndStations = (stationsArray) => {
    if (stationsArray.length > 0) {
      const firstStation = stationsArray[0];
      const lastStation = stationsArray[stationsArray.length - 1];

      setFormData(prev => ({
        ...prev,
        startStationId: firstStation.id.toString(),
        endStationId: lastStation ? lastStation.id.toString() : firstStation.id.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        startStationId: '',
        endStationId: ''
      }));
    }
  };

  // Bildirim göster
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animasyon ekle
    setTimeout(() => {
      toast.classList.add('show');

      // 3 saniye sonra kaldır
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }, 10);
  };

  // Durak sırasını değiştir
  const moveStation = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === selectedStations.length - 1)) {
      return; // Sınırları aşan hareketlere izin verme
    }

    const newSelectedStations = [...selectedStations];
    const temp = newSelectedStations[index];
    newSelectedStations[index] = newSelectedStations[index + direction];
    newSelectedStations[index + direction] = temp;

    setSelectedStations(newSelectedStations);

    // Rota güzergahını güncelle
    setTimeout(() => updateRoute(), 100);
  };

  // Durak kaldır (seçim listesinden)
  const removeStation = (index) => {
    const stationToRemove = selectedStations[index];

    // Marker'ı güncelle
    const markerToUpdate = markersRef.current.find(marker => marker.stationData?.id === stationToRemove.id);
    if (markerToUpdate) {
      markerToUpdate.setIcon({
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      });
    }

    // Seçili durakları güncelle
    setSelectedStations(prev => prev.filter((_, i) => i !== index));

    // Rota güzergahını güncelle
    setTimeout(() => updateRoute(), 100);
  };

  // Rotayı güncelle (duraklar arası çizgi)
  const updateRoute = useCallback(() => {
    if (!googleMapRef.current || !directionsServiceRef.current || !directionsRendererRef.current) {
      return;
    }

    // Seçili durak yoksa veya tek durak varsa direksiyonları temizle
    if (selectedStations.length < 2) {
      directionsRendererRef.current.setDirections({ routes: [] });

      setFormData(prev => ({
        ...prev,
        totalDistanceKm: '',
        estimatedDurationMinutes: '',
        outgoingStations: []
      }));

      return;
    }

    // Yükleniyor göstergesi ekle
    setLoading(true);

    // Tüm durakları waypoint olarak ekle (ilk ve son hariç)
    const waypoints = selectedStations.slice(1, -1).map(station => ({
      location: new google.maps.LatLng(parseFloat(station.latitude), parseFloat(station.longitude)),
      stopover: true
    }));

    const origin = new google.maps.LatLng(
      parseFloat(selectedStations[0].latitude),
      parseFloat(selectedStations[0].longitude)
    );

    const destination = new google.maps.LatLng(
      parseFloat(selectedStations[selectedStations.length - 1].latitude),
      parseFloat(selectedStations[selectedStations.length - 1].longitude)
    );

    // Google Maps API'nin rota sınırlamaları (waypoint sayısı)
    const MAX_WAYPOINTS = 23; // Google API sınırı 25 noktadır (başlangıç + bitiş + 23 waypoint)

    if (waypoints.length > MAX_WAYPOINTS) {
      // Çok fazla durak varsa, kullanıcıya uyarı göster ve sınırı uygula
      setError(`Google Haritalar API'si en fazla ${MAX_WAYPOINTS + 2} nokta arası rota hesaplayabilir. İlk ${MAX_WAYPOINTS + 2} durak için rota çizilecek.`);
      waypoints.splice(MAX_WAYPOINTS);
    } else {
      setError('');
    }

    directionsServiceRef.current.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: false, // Sıralamayı korumak için false
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    }, (response, status) => {
      setLoading(false);

      if (status === 'OK') {
        directionsRendererRef.current.setDirections(response);

        // Toplam mesafe ve süreyi hesapla
        let totalDistance = 0;
        let totalDuration = 0;

        const legs = response.routes[0].legs;
        legs.forEach(leg => {
          totalDistance += leg.distance.value; // metre cinsinden
          totalDuration += leg.duration.value; // saniye cinsinden
        });

        // Kilometre ve dakikaya çevir
        totalDistance = (totalDistance / 1000).toFixed(1); // km
        totalDuration = Math.ceil(totalDuration / 60); // dakika

        // Form verilerini güncelle
        setFormData(prev => ({
          ...prev,
          totalDistanceKm: totalDistance,
          estimatedDurationMinutes: totalDuration
        }));

        // Rota arası durak bilgilerini güncelle
        const outgoingStations = [];

        // Duraklar arasındaki rotaları hesapla
        const visibleStations = selectedStations.slice(0, waypoints.length + 2);
        for (let i = 0; i < visibleStations.length - 1; i++) {
          const fromStation = visibleStations[i];
          const toStation = visibleStations[i + 1];
          const leg = legs[i];

          outgoingStations.push({
            fromStationId: fromStation.id.toString(),
            toStationId: toStation.id.toString(),
            estimatedTravelTimeMinutes: Math.ceil(leg.duration.value / 60),
            distanceKm: (leg.distance.value / 1000).toFixed(1),
            notes: ''
          });
        }

        // Eğer bazı duraklar gösterilmiyorsa, direkt bağlantıları ekle
        if (selectedStations.length > visibleStations.length) {
          for (let i = visibleStations.length - 1; i < selectedStations.length - 1; i++) {
            const fromStation = selectedStations[i];
            const toStation = selectedStations[i + 1];

            // Düz çizgi mesafesi hesapla
            const distanceKm = calculateDistance(
              parseFloat(fromStation.latitude), 
              parseFloat(fromStation.longitude), 
              parseFloat(toStation.latitude), 
              parseFloat(toStation.longitude)
            ).toFixed(1);

            // Ortalama 40 km/saat hız varsayımıyla süre hesapla
            const estimatedMinutes = Math.ceil(parseFloat(distanceKm) * 1.5);

            outgoingStations.push({
              fromStationId: fromStation.id.toString(),
              toStationId: toStation.id.toString(),
              estimatedTravelTimeMinutes: estimatedMinutes,
              distanceKm: distanceKm,
              notes: 'Tahmini mesafe'
            });
          }
        }

        setFormData(prev => ({
          ...prev,
          outgoingStations: outgoingStations
        }));

        // Haritayı rotaya sığdır
        const bounds = new google.maps.LatLngBounds();
        response.routes[0].overview_path.forEach(path => {
          bounds.extend(path);
        });
        googleMapRef.current.fitBounds(bounds);

      } else {
        console.error('Directions request failed due to', status);

        // Kullanıcı dostu hata mesajları
        let errorMessage = '';
        switch(status) {
          case 'ZERO_RESULTS':
            errorMessage = 'Seçilen duraklar arasında sürülebilir bir yol bulunamadı.';
            break;
          case 'MAX_WAYPOINTS_EXCEEDED':
            errorMessage = 'Çok fazla durak seçildi. Lütfen daha az durak seçin.';
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = 'Çok fazla istek yapıldı. Lütfen biraz bekleyin ve tekrar deneyin.';
            break;
          case 'REQUEST_DENIED':
            errorMessage = 'Rota isteği reddedildi. API anahtarınızı kontrol edin.';
            break;
          case 'INVALID_REQUEST':
            errorMessage = 'Geçersiz rota isteği. Lütfen durak koordinatlarını kontrol edin.';
            break;
          case 'UNKNOWN_ERROR':
            errorMessage = 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
            break;
          default:
            errorMessage = `Rota hesaplanamadı: ${status}`;
        }

        setError(errorMessage);

        // Alternatif: Düz çizgilerle göster
        showFallbackRoute();
      }
    });
  }, [selectedStations, calculateDistance]);

  // Yedek rota gösterimi (API hata verirse düz çizgilerle göster)
  const showFallbackRoute = useCallback(() => {
    if (selectedStations.length < 2 || !googleMapRef.current) return;

    // Mevcut polyline'ı temizle
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Duraklar arasında düz çizgiler çiz
    const path = selectedStations.map(station => ({
      lat: parseFloat(station.latitude),
      lng: parseFloat(station.longitude)
    }));

    polylineRef.current = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: formData.color,
      strokeOpacity: 0.7,
      strokeWeight: 3,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3
        },
        repeat: '100px'
      }]
    });

    polylineRef.current.setMap(googleMapRef.current);

    // Haritayı tüm noktalara sığdır
    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    googleMapRef.current.fitBounds(bounds);

    // Tahmini mesafe ve süre hesapla (düz çizgi)
    let totalDistance = 0;
    for (let i = 0; i < selectedStations.length - 1; i++) {
      totalDistance += calculateDistance(
        parseFloat(selectedStations[i].latitude),
        parseFloat(selectedStations[i].longitude),
        parseFloat(selectedStations[i+1].latitude),
        parseFloat(selectedStations[i+1].longitude)
      );
    }

    // Ortalama 40km/saat hızla süre hesapla
    const totalDuration = Math.ceil(totalDistance * 1.5); // yaklaşık değer

    // Form verilerini güncelle
    setFormData(prev => ({
      ...prev,
      totalDistanceKm: totalDistance.toFixed(1),
      estimatedDurationMinutes: totalDuration
    }));

    // Rota arası durak bilgilerini güncelle
    const outgoingStations = [];

    for (let i = 0; i < selectedStations.length - 1; i++) {
      const fromStation = selectedStations[i];
      const toStation = selectedStations[i + 1];
      const distanceKm = calculateDistance(
        parseFloat(fromStation.latitude),
        parseFloat(fromStation.longitude),
        parseFloat(toStation.latitude),
        parseFloat(toStation.longitude)
      );

      // Ortalama 40 km/saat hız varsayımıyla süre hesapla
      const estimatedMinutes = Math.ceil(distanceKm * 1.5);

      outgoingStations.push({
        fromStationId: fromStation.id.toString(),
        toStationId: toStation.id.toString(),
        estimatedTravelTimeMinutes: estimatedMinutes,
        distanceKm: distanceKm.toFixed(1),
        notes: 'Tahmini mesafe (düz çizgi)'
      });
    }

    setFormData(prev => ({
      ...prev,
      outgoingStations: outgoingStations
    }));
  }, [selectedStations, formData.color, calculateDistance]);

  // Gidiş node ekleme (eski stil - artık kullanılmıyor)
  const addOutgoingNode = () => {
    // Bu fonksiyon artık haritadan durak seçme ile değiştirildi
    // Eskiden olan manuel durak ekleme kodu burada kalabilir, 
    // ancak yeni UI'da kullanıcıya gösterilmeyecek
  };

  // Node silme (eski stil - artık kullanılmıyor)
  const removeOutgoingNode = (index) => {
    // Bu fonksiyon artık haritadan durak seçme ile değiştirildi
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.routeName || !formData.routeCode) {
      setError('Lütfen rota adı ve kodunu doldurun');
      return;
    }

    if (selectedStations.length < 2) {
      setError('En az iki durak seçmelisiniz');
      return;
    }

    // Başlangıç ve bitiş duraklarını otomatik ayarla
    const startStationId = selectedStations[0].id.toString();
    const endStationId = selectedStations[selectedStations.length - 1].id.toString();

    setFormData(prev => ({
      ...prev,
      startStationId: startStationId,
      endStationId: endStationId
    }));

    if (formData.outgoingStations.length === 0) {
      setError('Duraklar arası rota bilgileri oluşturulamadı. Lütfen rotayı güncelleyin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        routeName: formData.routeName,
        routeCode: formData.routeCode,
        description: formData.description,
        routeType: formData.routeType,
        color: formData.color,
        startStationId: parseInt(startStationId),
        endStationId: parseInt(endStationId),
        estimatedDurationMinutes: formData.estimatedDurationMinutes ? parseInt(formData.estimatedDurationMinutes) : null,
        totalDistanceKm: formData.totalDistanceKm ? parseFloat(formData.totalDistanceKm) : null,
        weekdayHours: formData.weekdayHours,
        weekendHours: formData.weekendHours,
        outgoingStations: formData.outgoingStations.map(node => ({
          fromStationId: parseInt(node.fromStationId),
          toStationId: parseInt(node.toStationId),
          estimatedTravelTimeMinutes: node.estimatedTravelTimeMinutes ? parseInt(node.estimatedTravelTimeMinutes) : null,
          distanceKm: node.distanceKm ? parseFloat(node.distanceKm) : null,
          notes: node.notes
        })),
        returnStations: [] // Otomatik ters sıra oluşturulacak
      };

      const response = await routeApi.createBidirectionalRoute(requestData);
      
      if (response.success) {
        alert('Rota başarıyla oluşturuldu!');
        navigate('/routes');
      } else {
        setError('Rota oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Route creation error:', error);
      setError('Rota oluşturulurken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  // Haritayı başlat
  useEffect(() => {
    if (stations.length > 0) {
      initMap();
    }
  }, [stations, initMap]);

  // Rota rengi değiştiğinde güncelle
  useEffect(() => {
    if (mapLoaded && directionsRendererRef.current) {
      directionsRendererRef.current.setOptions({
        polylineOptions: {
          strokeColor: formData.color,
          strokeWeight: 5
        }
      });
      updateRoute();
    }
  }, [formData.color, mapLoaded, updateRoute]);

  return (
    <div className="route-create-container">
      {/* Header */}
      <div className="route-create-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/routes')}
            className="btn btn-back"
          >
            ← Geri
          </button>
          <h1>🚌 Yeni Rota Oluştur</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="route-create-form">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Harita Görünümü */}
        <div className="form-section map-section">
          <h3>🗺️ Rota Haritası</h3>
          <p className="map-instruction">Rotanızı oluşturmak için haritadan durakları seçin. Durakları sıralamak için sürükleyebilir veya ok tuşlarını kullanabilirsiniz.</p>

          {/* Durak arama kutusu */}
          <div id="station-search" className="station-search">
            <input 
              type="text" 
              placeholder="Durak ara... (Ad, kod veya şehir)" 
              onChange={(e) => searchStation(e.target.value)}
              className="search-input"
            />
            <button type="button" className="search-button">
              🔍
            </button>
          </div>

          <div className="map-container">
            <div ref={mapRef} className="google-map"></div>

            {/* Seçili duraklar listesi */}
            <div className="selected-stations-container">
              <div className="selected-stations-header">
                <h4>📍 Seçili Duraklar ({selectedStations.length})</h4>
                {selectedStations.length > 0 && (
                  <div className="station-actions-header">
                    <button 
                      type="button" 
                      onClick={() => setSelectedStations([])} 
                      className="btn-clear-all" 
                      title="Tüm durakları temizle"
                    >
                      🗑️ Tümünü Temizle
                    </button>
                  </div>
                )}
              </div>

              <div className="selected-stations">
                {selectedStations.length === 0 ? (
                  <div className="no-stations">
                    <p>Henüz durak seçilmedi.</p>
                    <div className="instruction-steps">
                      <div className="instruction-step"><span>1</span> Haritadan durakları seçin</div>
                      <div className="instruction-step"><span>2</span> Sıralamayı değiştirmek için sürükleyin</div>
                      <div className="instruction-step"><span>3</span> Duraklar arasında en kısa yol otomatik hesaplanır</div>
                    </div>
                  </div>
                ) : (
                  <ul className="stations-list">
                    {selectedStations.map((station, index) => (
                      <li 
                        key={station.id} 
                        className="station-item"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', index.toString());
                          e.currentTarget.classList.add('dragging');
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('dragging');
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('drag-over');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('drag-over');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('drag-over');
                          const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          const targetIndex = index;

                          if (sourceIndex !== targetIndex) {
                            const newStations = [...selectedStations];
                            const [movedItem] = newStations.splice(sourceIndex, 1);
                            newStations.splice(targetIndex, 0, movedItem);
                            setSelectedStations(newStations);
                            setTimeout(() => updateRoute(), 100);
                          }
                        }}
                      >
                        <div className="station-drag-handle" title="Sürükle ve bırak">::</div>
                        <div className="station-index" title="Durak sırası">{index + 1}</div>
                        <div className="station-info">
                          <span className="station-name">{station.name}</span>
                          <span className="station-city">{station.city || ''} {station.district ? `/ ${station.district}` : ''}</span>
                          {station.code && <span className="station-code">Kod: {station.code}</span>}
                        </div>
                        <div className="station-actions">
                          {index > 0 && (
                            <button 
                              type="button" 
                              onClick={() => moveStation(index, -1)} 
                              className="btn-move"
                              title="Yukarı taşı"
                            >
                              ↑
                            </button>
                          )}
                          {index < selectedStations.length - 1 && (
                            <button 
                              type="button" 
                              onClick={() => moveStation(index, 1)} 
                              className="btn-move"
                              title="Aşağı taşı"
                            >
                              ↓
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeStation(index)} 
                            className="btn-remove"
                            title="Durağı kaldır"
                          >
                            ❌
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedStations.length > 1 && (
                  <div className="route-summary">
                    <div className="summary-item">
                      <span>Toplam Mesafe:</span>
                      <strong>{formData.totalDistanceKm ? `${formData.totalDistanceKm} km` : 'Hesaplanıyor...'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Tahmini Süre:</span>
                      <strong>{formData.estimatedDurationMinutes ? `${formData.estimatedDurationMinutes} dakika` : 'Hesaplanıyor...'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Durak Sayısı:</span>
                      <strong>{selectedStations.length}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Rota hesaplanıyor...</p>
            </div>
          )}
        </div>

        {/* Temel Bilgiler */}
        <div className="form-section">
          <h3>📋 Temel Bilgiler</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="routeName">Rota Adı *</label>
              <input
                type="text"
                id="routeName"
                name="routeName"
                value={formData.routeName}
                onChange={handleInputChange}
                placeholder="Örn: Kadıköy - Taksim"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="routeCode">Rota Kodu *</label>
              <input
                type="text"
                id="routeCode"
                name="routeCode"
                value={formData.routeCode}
                onChange={handleInputChange}
                placeholder="Örn: 34A"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="routeType">Rota Tipi</label>
              <select
                id="routeType"
                name="routeType"
                value={formData.routeType}
                onChange={handleInputChange}
              >
                {Object.entries(ROUTE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="color">Rota Rengi</label>
              <div className="color-picker">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
                <div className="color-presets">
                  {ROUTE_COLORS.slice(0, 8).map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Rota hakkında ek bilgiler..."
              rows="3"
            />
          </div>
        </div>

        {/* Durak Bilgileri */}
        <div className="form-section">
          <h3>🚏 Durak Bilgileri</h3>
          <p className="section-info">Durak bilgileri haritadan seçtiğiniz duraklara göre otomatik olarak doldurulur.</p>

          <div className="form-row">
            <div className="form-group">
              <label>Başlangıç Durağı</label>
              <div className="info-display">
                {selectedStations.length > 0 ? (
                  <span>
                    {stations.find(s => s.id.toString() === selectedStations[0].id.toString())?.name || 'Seçilmedi'} 
                    ({stations.find(s => s.id.toString() === selectedStations[0].id.toString())?.city || ''})
                  </span>
                ) : (
                  <span className="placeholder">Haritadan başlangıç durağı seçin</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Bitiş Durağı</label>
              <div className="info-display">
                {selectedStations.length > 1 ? (
                  <span>
                    {stations.find(s => s.id.toString() === selectedStations[selectedStations.length - 1].id.toString())?.name || 'Seçilmedi'} 
                    ({stations.find(s => s.id.toString() === selectedStations[selectedStations.length - 1].id.toString())?.city || ''})
                  </span>
                ) : (
                  <span className="placeholder">Haritadan bitiş durağı seçin</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tahmini Süre (dakika)</label>
              <div className="info-display">
                {formData.estimatedDurationMinutes ? (
                  <span>{formData.estimatedDurationMinutes} dakika</span>
                ) : (
                  <span className="placeholder">Duraklar seçildiğinde otomatik hesaplanır</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Toplam Mesafe (km)</label>
              <div className="info-display">
                {formData.totalDistanceKm ? (
                  <span>{formData.totalDistanceKm} km</span>
                ) : (
                  <span className="placeholder">Duraklar seçildiğinde otomatik hesaplanır</span>
                )}
              </div>
            </div>
          </div>
        </div>

                  {/* Çalışma Saatleri */}
                  <div className="form-section">
          <h3>⏰ Çalışma Saatleri</h3>

          {/* Mevcut duraklar */}
          {formData.outgoingStations.length > 0 && (
            <div className="stations-list">
              <h4>Eklenen Duraklar:</h4>
              {formData.outgoingStations.map((node, index) => {
                const fromStation = stations.find(s => s.id == node.fromStationId);
                const toStation = stations.find(s => s.id == node.toStationId);
                return (
                  <div key={index} className="station-node">
                    <span className="station-path">
                      {fromStation?.name} → {toStation?.name}
                    </span>
                    <span className="station-details">
                      {node.estimatedTravelTimeMinutes}dk, {node.distanceKm}km
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOutgoingNode(index)}
                      className="btn btn-remove"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Çalışma Saatleri */}
        <div className="form-section">
          <h3>⏰ Çalışma Saatleri</h3>
          
          <div className="schedule-section">
            <h4>Hafta İçi Saatleri</h4>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <label key={`weekday-${slot}`} className="time-slot">
                  <input
                    type="checkbox"
                    checked={formData.weekdayHours.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot, 'weekdayHours')}
                  />
                  {formatTimeSlot(slot)}
                </label>
              ))}
            </div>
          </div>

          <div className="schedule-section">
            <h4>Hafta Sonu Saatleri</h4>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <label key={`weekend-${slot}`} className="time-slot">
                  <input
                    type="checkbox"
                    checked={formData.weekendHours.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot, 'weekendHours')}
                  />
                  {formatTimeSlot(slot)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="btn btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ Oluşturuluyor...' : '✅ Rotayı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RouteCreate;
