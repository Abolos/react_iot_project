import React, { useState, useRef, useEffect } from "react";
import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";
import { API_DATAS_ADMIN } from "../Services/common";
import { toast } from "react-toastify";

// Biến toàn cục để quản lý interval - sẽ tiếp tục chạy ngay cả khi component unmount
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
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(true); // State để theo dõi trạng thái

  const API_BASE = "http://10.20.42.178";

  // Hàm tạo data - được sử dụng bởi cả component và global interval
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      
      // Chỉ hiển thị toast khi gọi từ component (tránh spam khi ở background)
      if (source === "component") {
        toast.success(`${result.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      
      console.log(`✅ [${source}] Tạo data thành công:`, result.message);
      setData(newData);
      
    } catch (error) {
      console.error(`❌ [${source}] Lỗi khi tạo data:`, error);
      setError(error);
      
      if (source === "component") {
        toast.error("Lỗi khi tạo dữ liệu!", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  // Khởi động global interval
  const startGlobalInterval = () => {
    if (!globalInterval && autoCreateEnabled) {
      console.log("🔄 Khởi động global interval (30s)");
      
      globalInterval = setInterval(async () => {
        // Lấy sensorData từ localStorage nếu component unmount
        let currentSensorData = sensorData;
        try {
          const storedData = localStorage.getItem('currentSensorData');
          if (storedData) {
            currentSensorData = JSON.parse(storedData);
          }
        } catch (e) {
          console.log("Không thể lấy sensorData từ localStorage");
        }

        // Tạo data với sensorData hiện tại
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
            console.log('✅ [Background] Data created:', result.message);
          }
        } catch (error) {
          console.error('❌ [Background] Error:', error);
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
      toast.info("🛑 Đã tắt tự động tạo dữ liệu", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      setAutoCreateEnabled(true);
      startGlobalInterval();
      toast.info("🔄 Đã bật tự động tạo dữ liệu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Fetch data từ ESP8266
  const fetchSensorData = async () => {
    try {
      console.log("🔄 Đang kết nối đến ESP...");

      const response = await fetch(`${API_BASE}/data`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Dữ liệu nhận được:", data);

      const newSensorData = {
        temperature: data.temperature || 0,
        air_humidity: data.air_humidity || 0,
        soil_humidity: data.soil_humidity || 0,
        soil_analog: data.soil_analog || 0,
        device_mode: data.device_mode || "Offline",
        error_code: data.error_code || 0,
        pump_state: data.pump_state || 0,
        last_pump_action: data.last_pump_action || "Không có",
        control_mode: data.control_mode || "Auto",
      };

      setSensorData(newSensorData);
      
      // Lưu sensorData vào localStorage để background task sử dụng
      localStorage.setItem('currentSensorData', JSON.stringify(newSensorData));
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
      setSensorData((prev) => ({
        ...prev,
        device_mode: "Offline",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lệnh điều khiển bơm
  const sendPumpCommand = async (command) => {
    try {
      const response = await fetch(`${API_BASE}/control?pump=${command}`);

      if (response.ok) {
        const result = await response.text();
        alert(`✅ ${result}`);
        setTimeout(fetchSensorData, 1000);
      } else {
        const errorText = await response.text();
        alert(`❌ ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi lệnh:", error);
      alert("❌ Không thể kết nối đến thiết bị");
    }
  };

  // Chuyển đổi chế độ điều khiển
  const changeControlMode = async (mode) => {
    try {
      const response = await fetch(`${API_BASE}/mode/${mode}`);

      if (response.ok) {
        const result = await response.text();
        alert(`✅ ${result}`);
        setTimeout(fetchSensorData, 1000);
      }
    } catch (error) {
      console.error("❌ Lỗi khi chuyển chế độ:", error);
      alert("❌ Không thể kết nối đến thiết bị");
    }
  };

  useEffect(() => {
    fetchSensorData();

    // Khởi động global interval khi component mount
    startGlobalInterval();

    // Interval để fetch sensor data (10 giây)
    const sensorInterval = setInterval(fetchSensorData, 10000);

    return () => {
      // Chỉ cleanup sensor interval, giữ nguyên global interval
      clearInterval(sensorInterval);
      console.log("🧹 Cleanup sensor interval, giữ background interval");
    };
  }, []);

  // Các hàm render giữ nguyên...
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
        {isOnline ? "🟢 Online" : "🟡 Offline"} | IP: 10.20.42.178
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
              <span className="ms-2">Đang kết nối đến ESP 10.20.42.178...</span>
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

          {/* Auto Data Creation Control */}
          <div className="row m-3">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">📊 Tự động tạo dữ liệu</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className={autoCreateEnabled ? "text-success" : "text-secondary"}>
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
                        className={`btn ${autoCreateEnabled ? "btn-warning" : "btn-success"}`}
                        onClick={toggleAutoCreate}
                      >
                        {autoCreateEnabled ? "🛑 Dừng tự động" : "🔄 Bật tự động"}
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

          {/* Sensor Data Cards - Giữ nguyên CSS của bạn */}
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
                      sensorData.soil_humidity < 35
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  >
                    {sensorData.soil_humidity < 35
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
                </div>
              </div>
            </div>
          </div>

          <div className="row m-3">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Địa chỉ ESP: 10.20.42.178 | Cập nhật:{" "}
                  {lastUpdate.toLocaleTimeString()} | 
                  Auto-data: {autoCreateEnabled ? "🟢 ON" : "🔴 OFF"}
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