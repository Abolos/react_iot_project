import React, { useEffect, useState } from "react";
import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import { API_DATAS_REPORT } from "../Services/common";
function ReportAmin() {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_DATAS_REPORT);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();

        // Kiểm tra xem kết quả có phải là một mảng hay không
        if (result && result.report && Array.isArray(result.report)) {
          setDatas(result.report); // Lấy mảng từ thuộc tính data
        } else {
          throw new Error("Received data is not an array");
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(datas);
  return (
    <>
      <Header />
      <div className="row">
        <div className="col-lg-2 col-md-2 navbar-dashboard">
          <Navbar />
        </div>
        <div className="col-lg-10 col-md-10 main">
          <table className="table table-light table-striped table-hover mt-2">
            <thead>
              <tr style={{ background: "#80EDE4" }}>
                <th scope="col">STT</th>
                <th scope="col">Tên mẫu</th>
                <th scope="col">Tên cây</th>
                <th scope="col">Nhiệt độ trung bình</th>
                <th scope="col">Độ ẩm không khí trung bình</th>
                <th scope="col">Độ ẩm đất trung bình</th>
                <th scope="col">Tổng data</th>
                <th scope="col">Năng xuất</th>
              </tr>
            </thead>
            <tbody>
              {datas.map((data, index) => {
                return (
                  <tr key={index}>
                    <th scope="row">{index + 1 }</th>
                    <td>{data.template?.templeteName} </td>
                    <td>{data.template?.treeName}</td>
                    <td>{data.statistics?.averageTempreature} &deg;C</td>
                    <td>{data.statistics?.averageHumidity} %</td>
                    <td>{data.statistics?.averageSoilMoisture} %</td>
                    <td>{data.statistics?.totalData}</td>
                    <td>{data.template?.production}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReportAmin;
