// src/components/ControlSider.js
import React from 'react';
import { Card, Button, Radio, Space, Typography, Spin } from 'antd';

const { Text } = Typography;

const ControlSider = ({
  startId,
  goalId,
  availableAlgos,
  selectedAlgo,
  loading,
  error,
  onAlgoChange,
  onFindPath,
  onReset,
}) => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Chọn điểm">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            <b>Bắt đầu:</b> {startId || 'Chưa chọn'}
          </Text>
          <Text>
            <b>Kết thúc:</b> {goalId || 'Chưa chọn'}
          </Text>
        </Space>
      </Card>

      <Card title="Chọn thuật toán" style={{ marginTop: 16 }}>
        <Radio.Group
          onChange={(e) => onAlgoChange(e.target.value)}
          value={selectedAlgo}
          disabled={loading}
        >
          <Space direction="vertical">
            {availableAlgos.length === 0 ? (
              <Spin />
            ) : (
              availableAlgos.map((algo) => (
                <Radio key={algo} value={algo}>
                  {algo.toUpperCase()}
                </Radio>
              ))
            )}
          </Space>
        </Radio.Group>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            onClick={onFindPath}
            disabled={!startId || !goalId || loading}
            loading={loading}
            block
          >
            Tìm đường ({selectedAlgo.toUpperCase()})
          </Button>
          <Button onClick={onReset} block>
            Reset
          </Button>
          {error && <Text type="danger">Lỗi: {error}</Text>}
        </Space>
      </Card>
    </div>
  );
};

export default ControlSider;