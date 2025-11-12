import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeMap, createStartMarker, createEndMarker, drawRoute, fitBounds } from '../services/mapService';

/**
 * Custom hook để quản lý bản đồ Leaflet
 */
export const useMap = (mapContainerRef) => {
  const [map, setMap] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState(null);

  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null); // Ref để lưu lớp (layer) của đường đi

  // === Hook 1: Chỉ khởi tạo bản đồ (chạy 1 lần) ===
  useEffect(() => {
    if (!mapContainerRef.current) return; // Chờ ref sẵn sàng

    try {
      const mapInstance = initializeMap(mapContainerRef.current);
      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, [mapContainerRef]);


  // === Hook 2: Xử lý click (chạy lại khi 'map' hoặc 'selectingPoint' thay đổi) ===
  useEffect(() => {
    if (!map) return; // Chờ bản đồ sẵn sàng

    // Định nghĩa hàm click
    const handleMapClick = (e) => {
      if (selectingPoint === 'start') {
        setStartPoint([e.latlng.lat, e.latlng.lng]);
        setSelectingPoint(null);
      } else if (selectingPoint === 'end') {
        setEndPoint([e.latlng.lat, e.latlng.lng]);
        setSelectingPoint(null);
      }
    };

    // Gắn listener
    map.on('click', handleMapClick);

    // Cleanup: Gỡ listener cũ đi
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, selectingPoint]);


  // === Hook 3: Cập nhật marker khi chọn điểm ===
  useEffect(() => {
    if (!map) return;

    // Marker điểm bắt đầu
    if (startPoint) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng(startPoint);
      } else {
        startMarkerRef.current = createStartMarker(startPoint);
        startMarkerRef.current.addTo(map);
      }
    }

    // Marker điểm kết thúc
    if (endPoint) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng(endPoint);
      } else {
        endMarkerRef.current = createEndMarker(endPoint);
        endMarkerRef.current.addTo(map);
      }
    }
  }, [map, startPoint, endPoint]);


  // === HÀM VẼ ROUTE (ĐÃ SỬA ĐẦY ĐỦ) ===
  const displayRoute = useCallback((routeData) => {
    if (!map || !routeData || !routeData.coordinates) return;

    // Xóa route cũ nếu có
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    // Vẽ route mới
    routeLayerRef.current = drawRoute(map, routeData.coordinates);

    // Fit bản đồ
    if (startPoint && endPoint) {
      fitBounds(map, startPoint, endPoint);
    }
  }, [map, startPoint, endPoint]); // Dependencies này bây giờ đã chính xác


  // === HÀM RESET MAP (ĐÃ SỬA ĐẦY ĐỦ) ===
  const resetMap = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setSelectingPoint(null);

    // Xóa marker
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }

    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }

    // Xóa route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
  }, [map]); // Dependency 'map' bây giờ đã chính xác

  // Trả về các hàm và state cho component App
  return {
    map,
    startPoint,
    endPoint,
    selectingPoint,
    setSelectingPoint,
    displayRoute,
    resetMap
  };
};