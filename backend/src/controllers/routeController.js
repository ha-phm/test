// controllers/routeController.js
const algorithmManager = require('../services/algorithmManager');
const graphLoader = require('../services/graphLoader');

/**
 * POST /api/route
 * Body: { startId, goalId, algorithm }
 */
exports.findRoute = async (req, res) => {
  try {
    const { startId, goalId, algorithm } = req.body;

    // 1️⃣ Kiểm tra đầu vào
    if (!startId || !goalId) {
      return res.status(400).json({ error: 'Thiếu startId hoặc goalId' });
    }

    // 2️⃣ Đảm bảo graph đã load vào RAM
    if (!graphLoader.isLoaded()) {
      await graphLoader.loadAll();
    }

    // 3️⃣ Kiểm tra tồn tại node trong graph
    const { nodes, graph } = await graphLoader.getGraph();
    if (!nodes.has(startId) || !nodes.has(goalId)) {
      return res.status(404).json({ error: 'Không tìm thấy node tương ứng trong graph' });
    }

    // 4️⃣ Lấy thuật toán (mặc định A*)
    const algo = algorithm || 'astar';
    const routeFinder = algorithmManager.get(algo);
    if (!routeFinder) {
      return res.status(400).json({ error: `Thuật toán '${algo}' không tồn tại` });
    }

    // 5️⃣ Chạy thuật toán tìm đường
    const result = await algorithmManager.run(algo, { nodes, graph, startId, goalId });

    // 6️⃣ Trả kết quả về client
    if (!result || !result.path) {
      return res.status(404).json({ error: 'Không tìm thấy đường đi khả thi' });
    }

    return res.status(200).json({
      algorithm: algo,
      path: result.path,
      steps: result.steps,
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