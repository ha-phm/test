// src/pages/Home.js
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import MapComponent from '../components/MapComponent';
import ControlSider from '../components/ControlSider';
import { getAllNodes, findPath, getAlgorithms } from '../api/apiService';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// Định nghĩa chiều cao của Header
const HEADER_HEIGHT = 64;

const Home = () => {
  // === STATE (Giữ nguyên) ===
  const [allNodes, setAllNodes] = useState([]);
  const [nodeMap, setNodeMap] = useState(new Map());
  const [startId, setStartId] = useState(null);
  const [goalId, setGoalId] = useState(null);
  const [availableAlgos, setAvailableAlgos] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('astar');
  const [apiPath, setApiPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // === DATA LOADING (Giữ nguyên) ===
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true);
        const nodes = await getAllNodes();
        setAllNodes(nodes);
        const map = new Map();
        nodes.forEach((node) => map.set(node.id, node));
        setNodeMap(map);
      } catch (err) {
        setError('Không thể tải dữ liệu node từ server.');
      } finally {
        setLoading(false);
      }
    };
    const fetchAlgos = async () => {
      try {
        const data = await getAlgorithms();
        setAvailableAlgos(data.availableAlgorithms || []);
      } catch (err) {
        console.warn('Không thể tải danh sách thuật toán');
      }
    };
    fetchNodes();
    fetchAlgos();
  }, []);

  // === LOGIC (Giữ nguyên) ===
  const pathCoordinates = useMemo(() => {
    if (apiPath.length === 0 || nodeMap.size === 0) return [];
    return apiPath
      .map((id) => {
        const node = nodeMap.get(id);
        return node ? [node.lat, node.lon] : null;
      })
      .filter(Boolean);
  }, [apiPath, nodeMap]);

  const handleNodeClick = (nodeId) => {
    if (loading) return;
    if (!startId) {
      setStartId(nodeId);
      setGoalId(null);
      setApiPath([]);
    } else if (!goalId) {
      setGoalId(nodeId);
    } else {
      setStartId(nodeId);
      setGoalId(null);
      setApiPath([]);
    }
  };

  const handleFindPath = async () => {
    if (!startId || !goalId) {
      setError('Vui lòng chọn điểm bắt đầu và điểm kết thúc.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await findPath(startId, goalId, selectedAlgo);
      setApiPath(result.path || []);
    } catch (err) {
      setError('Không tìm thấy đường đi khả thi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartId(null);
    setGoalId(null);
    setApiPath([]);
    setError(null);
  };

  // === RENDER (Mới) ===
  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      {/* 1. Header của Ant Design */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: HEADER_HEIGHT,
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Tìm đường (A*, Dijkstra, BFS)
        </Title>
        <a href="https://github.com/ha-phm/pathfinding-project" target="_blank" rel="noopener noreferrer">
          <GithubOutlined style={{ color: 'white', fontSize: '24px' }} />
        </a>
      </Header>

      {/* 2. Layout chính (Sider + Content) */}
      <Layout style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        
        {/* Thanh Sider bên trái */}
        <Sider width={300} style={{ background: '#fff', overflow: 'auto' }}>
          <ControlSider
            startId={startId}
            goalId={goalId}
            availableAlgos={availableAlgos}
            selectedAlgo={selectedAlgo}
            loading={loading}
            error={error}
            onAlgoChange={setSelectedAlgo}
            onFindPath={handleFindPath}
            onReset={handleReset}
          />
        </Sider>

        {/* Nội dung chính (Bản đồ) */}
        <Content>
          <MapComponent
            nodes={allNodes}
            startId={startId}
            goalId={goalId}
            pathCoordinates={pathCoordinates}
            onNodeClick={handleNodeClick}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;