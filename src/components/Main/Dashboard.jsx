import React, { useState, useRef, useEffect } from "react";
import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";
import { API_DATAS_ADMIN } from "../Services/common";
import { toast } from "react-toastify";

// Biến toàn cục để quản lý interval
let globalInterval = null;
let isGlobalIntervalRunning = false;

function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    air_humidity: 0,
    soil_humidity: 0,
    soil_analog: 0,
    device_mode: "Offline",
    error_code: 0,
    pump_state: 0,
    last_pump_action: "Không có",
    control_mode: "Auto",
  });

  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(true);

  // State cho ngưỡng bơm
  const [pumpThresholds, setPumpThresholds] = useState({
    lower: 16,   // Ngưỡng bật bơm (%)
    upper: 32    // Ngưỡng tắt bơm (%)
  });

  // ThingSpeak Configuration
  const THINGSPEAK_CHANNEL_ID = "3147158";
  const THINGSPEAK_READ_API_KEY = "KJUWWQ7XIZ0K40QV";
  const THINGSPEAK_WRITE_API_KEY = "EDYLP733EV41CFH0";
  
  const THINGSPEAK_API_BASE = "https://api.thingspeak.com";
  const THINGSPEAK_FEED_URL = `${THINGSPEAK_API_BASE}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`;
  const THINGSPEAK_UPDATE_URL = `${THINGSPEAK_API_BASE}/update`;

  // Hàm tạo data
  const createData = async (source = "component") => {
    try {
      const newData = {
        templeteName_id: "68fba0eda371a92173941a1e",
        tempreature: sensorData.temperature,
        humidity: sensorData.air_humidity,
        soilMoisture: sensorData.soil_humidity,
      };

      console.log(`📊 [${source}] Đang tạo data...`, newData);

      const response = await fetch(`${API_DATAS_ADMIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();

      if (source === "component") {
        toast.success(`${result.message}`, { position: "top-right", autoClose: 5000 });
      }

      console.log(`✅ [${source}] Tạo data thành công:`, result.message);
      setData(newData);
    } catch (error) {
      console.error(`❌ [${source}] Lỗi khi tạo data:`, error);
      setError(error);
      if (source === "component") {
        toast.error("Lỗi khi tạo dữ liệu!", { position: "top-right", autoClose: 5000 });
      }
    }
  };

  // Khởi động global interval
  const startGlobalInterval = () => {
    if (!globalInterval && autoCreateEnabled) {
      console.log("🔄 Khởi động global interval (1 giờ)");
      globalInterval = setInterval(async () => {
        let currentSensorData = sensorData;
        try {
          const storedData = localStorage.getItem("currentSensorData");
          if (storedData) currentSensorData = JSON.parse(storedData);
        } catch (e) {
          console.log("Không thể lấy sensorData từ localStorage");
        }

        const backgroundData = {
          templeteName_id: "68fba0eda371a92173941a1e",
          tempreature: currentSensorData.temperature,
          humidity: currentSensorData.air_humidity,
          soilMoisture: currentSensorData.soil_humidity,
        };

        try {
          const response = await fetch(`${API_DATAS_ADMIN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(backgroundData),
          });
          if (response.ok) {
            const result = await response.json();
            console.log("✅ [Background] Data created:", result.message);
          }
        } catch (error) {
          console.error("❌ [Background] Error:", error);
        }
      }, 3600000);
      isGlobalIntervalRunning = true;
    }
  };

  // Dừng global interval
  const stopGlobalInterval = () => {
    if (globalInterval) {
      console.log("🛑 Dừng global interval");
      clearInterval(globalInterval);
      globalInterval = null;
      isGlobalIntervalRunning = false;
    }
  };

  // Toggle auto create
  const toggleAutoCreate = () => {
    if (autoCreateEnabled) {
      stopGlobalInterval();
      setAutoCreateEnabled(false);
      toast.info("🛑 Đã tắt tự động tạo dữ liệu", { position: "top-right", autoClose: 3000 });
    } else {
      setAutoCreateEnabled(true);
      startGlobalInterval();
      toast.info("🔄 Đã bật tự động tạo dữ liệu", { position: "top-right", autoClose: 3000 });
    }
  };

  // Fetch data từ ThingSpeak
  const fetchSensorData = async () => {
    try {
      console.log("🔄 Đang kết nối đến ThingSpeak...");
      
      const url = `${THINGSPEAK_FEED_URL}?api_key=${THINGSPEAK_READ_API_KEY}&results=10`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Dữ liệu nhận được từ ThingSpeak:", data);

      if (data.feeds && data.feeds.length > 0) {
        const latestFeedWithData = data.feeds.find(feed => 
          feed.field1 !== null && 
          feed.field2 !== null && 
          feed.field3 !== null
        );

        if (latestFeedWithData) {
          console.log("📊 Feed có dữ liệu:", latestFeedWithData);
          
          const newSensorData = {
            temperature: parseFloat(latestFeedWithData.field1) || 0,
            air_humidity: parseFloat(latestFeedWithData.field2) || 0,
            soil_humidity: parseFloat(latestFeedWithData.field3) || 0,
            soil_analog: parseInt(latestFeedWithData.field4) || 0,
            device_mode: parseInt(latestFeedWithData.field7) === 1 ? "Online" : "Offline",
            error_code: 0,
            pump_state: parseInt(latestFeedWithData.field5) || 0,
            last_pump_action: "ThingSpeak - " + (latestFeedWithData.created_at || "Không có"),
            control_mode: parseInt(latestFeedWithData.field6) === 1 ? "Auto" : "Manual",
          };

          setSensorData(newSensorData);
          localStorage.setItem("currentSensorData", JSON.stringify(newSensorData));
          
          // Cập nhật ngưỡng bơm từ Field 9 (Command Response)
          if (latestFeedWithData.field9) {
            const thresholdData = latestFeedWithData.field9;
            if (thresholdData.startsWith('thresholds:')) {
              const parts = thresholdData.split(':');
              if (parts.length === 3) {
                setPumpThresholds({
                  lower: parseFloat(parts[1]) || 16,
                  upper: parseFloat(parts[2]) || 32
                });
              }
            }
          }
          
          setLastUpdate(new Date());
        } else {
          console.log("⚠️ Không tìm thấy feed có dữ liệu");
        }
      } else {
        throw new Error("Không có dữ liệu từ ThingSpeak");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu từ ThingSpeak:", error);
      setSensorData((prev) => ({
        ...prev,
        device_mode: "Offline",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gửi ngưỡng bơm đến ThingSpeak
  const sendPumpThresholds = async () => {
    try {
      // Kiểm tra tính hợp lệ của ngưỡng
      if (pumpThresholds.lower >= pumpThresholds.upper) {
        toast.error("❌ Ngưỡng bật phải nhỏ hơn ngưỡng tắt!", {
          position: "top-right", autoClose: 5000,
        });
        return;
      }

      if (pumpThresholds.lower < 0 || pumpThresholds.upper > 100) {
        toast.error("❌ Ngưỡng phải nằm trong khoảng 0-100%!", {
          position: "top-right", autoClose: 5000,
        });
        return;
      }

      // Gửi ngưỡng bơm qua Field 8 với format: "threshold:lower:upper"
      const commandValue = `threshold:${pumpThresholds.lower}:${pumpThresholds.upper}`;
      const url = `${THINGSPEAK_UPDATE_URL}?api_key=${THINGSPEAK_WRITE_API_KEY}&field8=${encodeURIComponent(commandValue)}`;
      
      console.log(`🔄 Gửi ngưỡng bơm đến ThingSpeak: ${url}`);
      const response = await fetch(url);

      if (response.ok) {
        toast.success(`✅ Đã cập nhật ngưỡng bơm: Bật < ${pumpThresholds.lower}%, Tắt > ${pumpThresholds.upper}%`, {
          position: "top-right", autoClose: 3000,
        });
        
        // Đợi 5 giây rồi cập nhật lại dữ liệu
        setTimeout(fetchSensorData, 5000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi ngưỡng bơm:", error);
      toast.error("❌ Không thể cập nhật ngưỡng bơm", {
        position: "top-right", autoClose: 5000,
      });
    }
  };

  // Gửi lệnh điều khiển bơm
  const sendPumpCommand = async (command) => {
    try {
      const commandValue = command === "on" ? 3 : 4;
      const url = `${THINGSPEAK_UPDATE_URL}?api_key=${THINGSPEAK_WRITE_API_KEY}&field8=${commandValue}`;
      
      console.log(`🔄 Gửi lệnh đến ThingSpeak: ${url}`);
      const response = await fetch(url);

      if (response.ok) {
        const result = await response.text();
        console.log(`✅ Phản hồi từ ThingSpeak: ${result}`);
        
        toast.success(`✅ Đã gửi lệnh ${command} đến thiết bị`, {
          position: "top-right", autoClose: 3000,
        });
        
        setTimeout(fetchSensorData, 5000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi lệnh:", error);
      toast.error("❌ Không thể gửi lệnh đến thiết bị", {
        position: "top-right", autoClose: 5000,
      });
    }
  };

  // Chuyển chế độ
  const changeControlMode = async (mode) => {
    try {
      const commandValue = mode === "auto" ? 1 : 2;
      const url = `${THINGSPEAK_UPDATE_URL}?api_key=${THINGSPEAK_WRITE_API_KEY}&field8=${commandValue}`;
      
      console.log(`🔄 Chuyển chế độ qua ThingSpeak: ${url}`);
      const response = await fetch(url);

      if (response.ok) {
        const result = await response.text();
        console.log(`✅ Phản hồi từ ThingSpeak: ${result}`);
        
        toast.success(`✅ Đã chuyển sang chế độ ${mode === "auto" ? "TỰ ĐỘNG" : "THỦ CÔNG"}`, {
          position: "top-right", autoClose: 3000,
        });
        
        setTimeout(fetchSensorData, 5000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi chuyển chế độ:", error);
      toast.error("❌ Không thể chuyển chế độ", {
        position: "top-right", autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    fetchSensorData();
    startGlobalInterval();
    const sensorInterval = setInterval(fetchSensorData, 20000);
    return () => clearInterval(sensorInterval);
  }, []);

  // Các hàm render
  const renderErrorStatus = () => {
    switch (sensorData.error_code) {
      case 1:
        return (
          <div className="alert alert-warning">⚠️ Cảm biến DHT11 bị lỗi</div>
        );
      case 2:
        return (
          <div className="alert alert-warning">
            ⚠️ Cảm biến độ ẩm đất bị lỗi
          </div>
        );
      case 3:
        return (
          <div className="alert alert-danger">
            ❌ Hệ thống gặp lỗi nghiêm trọng
          </div>
        );
      default:
        return (
          <div className="alert alert-success">
            ✅ Hệ thống hoạt động bình thường
          </div>
        );
    }
  };

  const renderConnectionStatus = () => {
    const isOnline = sensorData.device_mode === "Online";
    return (
      <div className={`alert ${isOnline ? "alert-success" : "alert-warning"}`}>
        {isOnline ? "🟢 Online" : "🟡 Offline"} | ThingSpeak Channel: {THINGSPEAK_CHANNEL_ID}
      </div>
    );
  };

  const renderControlMode = () => {
    const isAuto = sensorData.control_mode === "Auto";
    return (
      <div className={`alert ${isAuto ? "alert-info" : "alert-warning"}`}>
        Chế độ: {isAuto ? "🤖 Tự động" : "👨‍💻 Thủ công"}
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="row">
          <div className="col-lg-2 col-md-2 navbar-dashboard">
            <Navbar />
          </div>
          <div className="col-lg-10 col-md-10 main">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Đang kết nối đến ThingSpeak...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="row">
        <div className="col-lg-2 col-md-2 navbar-dashboard">
          <Navbar />
        </div>
        <div className="col-lg-10 col-md-10 main">
          {/* Status Cards */}
          <div className="row m-3 mt-5">
            <div className="col-md-3">{renderConnectionStatus()}</div>
            <div className="col-md-3">{renderControlMode()}</div>
            <div className="col-md-3">{renderErrorStatus()}</div>
            <div className="col-md-3">
              <div
                className={`alert ${
                  sensorData.pump_state === 1
                    ? "alert-danger"
                    : "alert-secondary"
                }`}
              >
                Máy bơm:{" "}
                {sensorData.pump_state === 1 ? "🚰 Đang BẬT" : "⏹️ Đang TẮT"}
              </div>
            </div>
          </div>

          {/* ThingSpeak Info Card */}
          <div className="row m-3">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">☁️ ThingSpeak Cloud Platform</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Status:</strong> <span className="text-success">✅ Đang hoạt động</span></p>
                      <p><strong>Channel:</strong> {THINGSPEAK_CHANNEL_ID}</p>
                    </div>
                    <div className="col-md-6">
                      <a 
                        href={`https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        📊 Mở ThingSpeak Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Điều chỉnh ngưỡng bơm */}
          <div className="row m-3">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">🎯 Điều chỉnh ngưỡng bơm tự động</h5>
                  <div className="row">
                    <div className="col-md-5">
                      <div className="mb-3">
                        <label className="form-label">
                          Ngưỡng BẬT bơm (khi độ ẩm dưới %):
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={pumpThresholds.lower}
                          onChange={(e) => setPumpThresholds(prev => ({
                            ...prev,
                            lower: parseInt(e.target.value) || 0
                          }))}
                        />
                        <small className="text-muted">
                          Máy bơm sẽ tự động BẬT khi độ ẩm đất dưới ngưỡng này
                        </small>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="mb-3">
                        <label className="form-label">
                          Ngưỡng TẮT bơm (khi độ ẩm trên %):
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={pumpThresholds.upper}
                          onChange={(e) => setPumpThresholds(prev => ({
                            ...prev,
                            upper: parseInt(e.target.value) || 0
                          }))}
                        />
                        <small className="text-muted">
                          Máy bơm sẽ tự động TẮT khi độ ẩm đất trên ngưỡng này
                        </small>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={sendPumpThresholds}
                        disabled={sensorData.device_mode !== "Online"}
                      >
                        💾 Lưu ngưỡng
                      </button>
                    </div>
                  </div>
                  <div className="alert alert-info mt-2">
                    <small>
                      <strong>Ngưỡng hiện tại:</strong> BẬT bơm khi độ ẩm &lt; {pumpThresholds.lower}% 
                      | TẮT bơm khi độ ẩm &gt; {pumpThresholds.upper}%
                      {sensorData.device_mode !== "Online" && 
                        " - ⚠️ Chỉ có thể thay đổi khi thiết bị Online"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Data Creation Control */}
          <div className="row m-3">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">📊 Tự động tạo dữ liệu</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span
                        className={
                          autoCreateEnabled ? "text-success" : "text-secondary"
                        }
                      >
                        {autoCreateEnabled ? "🟢 Đang chạy" : "🔴 Đã dừng"} -
                        Tạo dữ liệu mỗi 1 giờ
                      </span>
                      <br />
                      <small className="text-muted">
                        {autoCreateEnabled
                          ? "Dữ liệu sẽ tiếp tục được tạo ngay cả khi bạn rời trang"
                          : "Tính năng tự động tạo đã bị tắt"}
                      </small>
                    </div>
                    <div className="btn-group">
                      <button
                        type="button"
                        className={`btn ${
                          autoCreateEnabled ? "btn-warning" : "btn-success"
                        }`}
                        onClick={toggleAutoCreate}
                      >
                        {autoCreateEnabled
                          ? "🛑 Dừng tự động"
                          : "🔄 Bật tự động"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => createData("manual")}
                      >
                        📨 Tạo ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Data Cards */}
          <div id="data-dashboard" className="row m-3 mt-2">
            <div className="col-md-4 mb-3">
              <div className="card w-100 shadow text-center p-4">
                <div className="temperature">
                  <p className="shadow">
                    {sensorData.temperature.toFixed(1)} <span>&deg;C</span>
                  </p>
                </div>
                <h4 className="temperature-h4">Nhiệt độ</h4>
                <small className="text-muted">
                  Cập nhật: {lastUpdate.toLocaleTimeString()}
                </small>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card w-100 shadow text-center p-4">
                <div className="air-persent">
                  <p className="shadow">
                    {sensorData.air_humidity.toFixed(1)} <span>%</span>
                  </p>
                </div>
                <h4 className="air-persent-h4">Độ ẩm không khí</h4>
                <small className="text-muted">
                  Cập nhật: {lastUpdate.toLocaleTimeString()}
                </small>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card w-100 shadow text-center p-4">
                <div className="ground-persent">
                  <p className="shadow">
                    {sensorData.soil_humidity.toFixed(1)} <span>%</span>
                  </p>
                </div>
                <h4 className="ground-persent-h4">Độ ẩm đất</h4>
                <small className="text-muted">
                  Giá trị Analog: {sensorData.soil_analog}
                </small>
                <div className="mt-2">
                  <small
                    className={`badge ${
                      sensorData.soil_humidity < pumpThresholds.lower
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  >
                    {sensorData.soil_humidity < pumpThresholds.lower
                      ? "🌵 Cần tưới nước"
                      : "💧 Đủ độ ẩm"}
                  </small>
                </div>
                <div className="mt-1">
                  <small className="text-info">
                    Lần bơm cuối: {sensorData.last_pump_action}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="row m-3">
            <div className="col-md-6 mb-3">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">🔄 Chế độ điều khiển</h5>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${
                        sensorData.control_mode === "Auto"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => changeControlMode("auto")}
                      disabled={sensorData.device_mode !== "Online"}
                    >
                      🤖 Tự động
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        sensorData.control_mode === "Manual"
                          ? "btn-warning"
                          : "btn-outline-warning"
                      }`}
                      onClick={() => changeControlMode("manual")}
                      disabled={sensorData.device_mode !== "Online"}
                    >
                      👨‍💻 Thủ công
                    </button>
                  </div>
                  <small className="text-muted mt-2">
                    * Gửi lệnh qua ThingSpeak Field 8
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">
                    🎮 Điều khiển bơm{" "}
                    {sensorData.control_mode === "Manual" && "(Thủ công)"}
                  </h5>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => sendPumpCommand("on")}
                      disabled={
                        sensorData.device_mode !== "Online" ||
                        sensorData.control_mode !== "Manual"
                      }
                    >
                      🚰 Bật bơm
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => sendPumpCommand("off")}
                      disabled={
                        sensorData.device_mode !== "Online" ||
                        sensorData.control_mode !== "Manual"
                      }
                    >
                      ⏹️ Tắt bơm
                    </button>
                  </div>
                  {sensorData.control_mode !== "Manual" && (
                    <div className="mt-2">
                      <small className="text-info">
                        * Chuyển sang chế độ Thủ công để điều khiển
                      </small>
                    </div>
                  )}
                  <small className="text-muted mt-2">
                    * Gửi lệnh qua ThingSpeak Field 8
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="row m-3">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  ThingSpeak Channel: {THINGSPEAK_CHANNEL_ID} | Cập nhật:{" "}
                  {lastUpdate.toLocaleTimeString()} | Auto-data:{" "}
                  {autoCreateEnabled ? "🟢 ON" : "🔴 OFF"} | Ngưỡng bơm: {pumpThresholds.lower}%-{pumpThresholds.upper}%
                </small>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={fetchSensorData}
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;