const algorithmManager = require('../services/algorithmManager');
const graphLoader = require('../services/graphLoader');
// 1. MỚI: Import model Node của bạn
// (Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn)
const Node = require('../models/nodeModel');

/**
 * @desc MỚI: Hàm tìm node gần nhất từ tọa độ
 * @param {number} lng - Kinh độ
 * * @param {number} lat - Vĩ độ
 */
const findNearestNode = async (lng, lat) => {
  try {
    // MongoDB $near yêu cầu [lng, lat]
    const node = await Node.findOne({
      loc: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] 
          },
           // $maxDistance: 2000 // Tùy chọn: Giới hạn tìm trong 2km
        }
      }
    });
    return node;
  } catch (err) {
    console.error("Lỗi khi tìm node gần nhất:", err);
    return null;
  }
};

/**
 * @desc API tìm đường
 * @route POST /api/route
 * @body { startPoint: [lat, lng], endPoint: [lat, lng], algorithm: "name" }
 */
exports.findRoute = async (req, res) => {
  try {
    // 1. THAY ĐỔI: Đọc startPoint/endPoint (tọa độ)
    const { startPoint, endPoint, algorithm } = req.body;

    // 2. THAY ĐỔI: Kiểm tra tọa độ
    if (!startPoint || !endPoint) {
      return res.status(400).json({ error: 'Thiếu startPoint hoặc endPoint' });
    }

    // 3. MỚI: Tìm node ID gần nhất
    // Lưu ý: Leaflet dùng [lat, lng], MongoDB dùng [lng, lat]
    const startNode = await findNearestNode(startPoint[1], startPoint[0]); // [lng, lat]
    const goalNode = await findNearestNode(endPoint[1], endPoint[0]);   // [lng, lat]

    // 4. MỚI: Kiểm tra nếu không tìm thấy node
    if (!startNode || !goalNode) {
      return res.status(404).json({
        error: 'Không tìm thấy nút giao thông gần điểm bạn chọn. Vui lòng chọn điểm khác trong khu vực.'
      });
    }

    // 5. MỚI: Lấy ID từ node
    const startId = startNode.id;
    const goalId = goalNode.id;

    // 6. Đảm bảo graph đã load vào RAM
    if (!graphLoader.isLoaded()) {
      await graphLoader.loadAll();
    }

    // 7. Kiểm tra tồn tại node trong graph (Logic này vẫn giữ nguyên)
    const { nodes, graph } = await graphLoader.getGraph();
    if (!nodes.has(startId) || !nodes.has(goalId)) {
      return res.status(404).json({ error: 'Không tìm thấy node tương ứng trong graph (đã load)' });
    }

    // 8. Lấy thuật toán (mặc định A*)
    const algo = algorithm || 'astar';
    const routeFinder = algorithmManager.get(algo);
    if (!routeFinder) {
      return res.status(400).json({ error: `Thuật toán '${algo}' không tồn tại` });
    }

    // 9. Chạy thuật toán tìm đường
    const result = await algorithmManager.run(algo, { nodes, graph, startId, goalId });

    // 10. Trả kết quả về client
    if (!result || !result.path) {
      return res.status(404).json({ error: 'Không tìm thấy đường đi khả thi' });
    }

    // 11. MỚI: Gửi kèm tọa độ của node đã tìm thấy
    result.startPoint = { lat: startNode.lat, lon: startNode.lon };
    result.goalPoint = { lat: goalNode.lat, lon: goalNode.lon };

    return res.status(200).json({
      algorithm: algo,
      path: result.path,
      steps: result.steps,
      startPoint: result.startPoint, 
      goalPoint: result.goalPoint,
      distance: result.distance, // Thêm nếu thuật toán của bạn trả về
    });

  } catch (err) {
    console.error('findRoute error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};


/**
 * @desc API liệt kê các thuật toán đang hỗ trợ
 * @route GET /api/algorithms
 */
exports.listAlgorithms = (req, res) => {
  try {
    const list = algorithmManager.list();
    res.json({ availableAlgorithms: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc API reload lại dữ liệu graph (nếu dữ liệu MongoDB có thay đổi)
 * @route POST /api/reload
 */
exports.reloadGraph = async (req, res) => {
  try {
    await graphLoader.loadAll();
    res.json({ message: 'Graph reloaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc API lấy TẤT CẢ các node (để hiển thị trên bản đồ)
 * @route GET /api/nodes
 */
exports.getAllNodes = async (req, res) => {
  try {
    // 1. Đảm bảo graph đã load
    if (!graphLoader.isLoaded()) {
      await graphLoader.loadAll();
    }

    // 2. Lấy map 'nodes' từ graphLoader
    const { nodes } = await graphLoader.getGraph();

    // 3. Chuyển Map thành Array để gửi JSON
    const nodesArray = Array.from(nodes.values());

    res.status(200).json(nodesArray);
  } catch (err) {
    console.error('getAllNodes error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};