import { useState } from "react";
import { Input, Button, Card, Collapse, Table, message as antdMsg, Row, Col } from "antd";
import axios from "axios";
import "antd/dist/reset.css";
import { CopyOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Panel } = Collapse;

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const letterColumns = [
    { title: "Char", dataIndex: "char", key: "char", width: 80 },
    { title: "Bits", dataIndex: "bits", key: "bits" },
  ];

  function getUniqueLetters(letters = []) {
    const seen = new Set();
    return letters.filter(({ char }) => {
      if (seen.has(char)) return false;
      seen.add(char);
      return true;
    });
  }

  async function handleHash() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/hash", {
        message: text,
      });
      setResult(data);
    } catch (err) {
      antdMsg.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '80%', margin: "40px auto", padding: 16 }}>
      <Card title="SHA-512 Hasher" bordered>
        <TextArea
          autoSize={{ minRows: 3 }}
          placeholder="Type something…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          loading={loading}
          onClick={handleHash}
        >
          Hash it
        </Button>
      </Card>
      <Row>
        {result && (
          <>
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Hex Digest</span>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(result.hash);
                        antdMsg.success("Copied hash to clipboard");
                      }}
                    />
                  </div>
                }
                style={{ marginTop: 24, wordBreak: "break-all" }}
                bodyStyle={{ fontFamily: "monospace" }}
              >
                {result.hash}
              </Card>
            </Col>
            <Col>
              <Collapse style={{ marginTop: 16 }}>
                <Panel
                  header="Full Padded Bit-string (click to expand)"
                  key="1"
                >
                  <div
                    style={{ wordBreak: "break-all", fontFamily: "monospace" }}
                  >
                    {result.paddedBits}
                  </div>
                </Panel>
              </Collapse>
            </Col>
            <Col span={24}>
              <Card title="Unique Letters → Bits" style={{ marginTop: 24 }}>
                <Table
                  dataSource={getUniqueLetters(result.letters).map((r, i) => ({
                    ...r,
                    key: i,
                  }))}
                  columns={letterColumns}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
