const Node = require('../models/nodeModel');
const Edge = require('../models/edgeModel');

class GraphLoader {
    constructor (){
        this.graph = new Map(); // Map<NodeId, Map<NeighborId, EdgeData>>
        this.nodes = new Map(); // Map<NodeId, NodeObject>
    }

    async loadAll(){
        console.log('🔄 Loading Graph into RAM...');
        // 1. Tải nodes và edges từ MongoDB
        const [nodes, edges] = await Promise.all([
            Node.find({}).lean(),
            Edge.find({}).lean()
        ]);

        // 2. Tải nodes vào RAM
        for (const n of nodes) { this.nodes.set(n.id, n); }
        
        // 3. Xây dựng đồ thị (Adjacency Map)
        for (const e of edges) {
            if (!this.graph.has(e.from)) {
                this.graph.set(e.from, new Map()); // Khởi tạo Map cho các cạnh đi ra
            }
            // ✅ SỬA CẤU TRÚC: Lưu toàn bộ object Edge (e)
            this.graph.get(e.from).set(e.to, e); 
        }

        console.log(`Graph loaded: ${this.nodes.size} nodes, ${edges.length} edges.`);
        console.log('✓ Graph is ready.');
    }

    isLoaded() {
        return this.graph.size > 0;
    }

    async getGraph() {
        return {
            nodes: this.nodes,
            graph: this.graph
        };
    }
}

module.exports = new GraphLoader();