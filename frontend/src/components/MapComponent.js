import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Cần import L để fix lỗi icon

// Fix lỗi icon marker bị hỏng của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Định nghĩa màu sắc
const colors = {
  node: '#007bff',
  start: '#28a745',
  goal: '#dc3545',
  path: '#ffc107',
};

const MapComponent = ({ nodes, startId, goalId, pathCoordinates, onNodeClick }) => {
  // Vị trí trung tâm bản đồ (bạn nên thay đổi)
  // Lấy node đầu tiên làm trung tâm, hoặc Hà Nội
  const center = [21.0076, 105.8601];
  const zoom = 15;

  // Hàm để lấy màu cho marker
  const getNodeColor = (nodeId) => {
    if (nodeId === startId) return colors.start;
    if (nodeId === goalId) return colors.goal;
    return colors.node;
  };

  return (
    <MapContainer center={center} zoom={zoom}>
      {/* Lớp bản đồ nền (OpenStreetMap) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* 1. Vẽ tất cả các node (Marker) */}
      {nodes.slice(0, 500).map((node) => (
        <Marker
          key={node.id}
          position={[node.lat, node.lon]} // Leaflet dùng [lat, lon]
          eventHandlers={{
            click: () => onNodeClick(node.id),
          }}
        >
          {/* Custom Circle Marker (hiệu năng tốt hơn icon) */}
          <L.CircleMarker
            center={[node.lat, node.lon]}
            radius={5}
            fillOpacity={0.8}
            color={getNodeColor(node.id)}
            fillColor={getNodeColor(node.id)}
          />
          <Popup>Node ID: {node.id}</Popup>
        </Marker>
      ))}

      {/* 2. Vẽ đường đi (Polyline) */}
      {pathCoordinates.length > 0 && (
        <Polyline
          positions={pathCoordinates}
          color={colors.path}
          weight={5}
          opacity={0.8}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;