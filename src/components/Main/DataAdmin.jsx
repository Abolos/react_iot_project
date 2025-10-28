import React, { useState, useEffect } from "react";
import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import { API_DATAS_ADMIN } from "../Services/common";
import { API_TEMPLETES_ADMIN } from "../Services/common";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

function DataAdmin() {
  const [apiResponse, setApiResponse] = useState({
    status: "",
    message: "",
    datas: [],
    pages: {},
  });
  const [apiUrl, setApiUrl] = useState(API_DATAS_ADMIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [templetes, setTempletes] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setApiResponse(result);
      } catch (error) {
        setError(error.message);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(API_TEMPLETES_ADMIN);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const result = await response.json();
  
          // Kiểm tra xem kết quả có phải là một mảng hay không
          if (result && result.datas && Array.isArray(result.datas)) {
            setTempletes(result.datas); // Lấy mảng từ thuộc tính data
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
    }, [apiUrl]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) {
      try {
        const response = await fetch(`${API_DATAS_ADMIN}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        toast.success(`${result.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        // Cập nhật lại danh sách dữ liệu sau khi xóa
        setApiResponse((prev) => ({
          ...prev,
          datas: prev.datas.filter((data) => data._id !== id),
        }));
      } catch (error) {
        setError(error.message);
        toast.error("Có lỗi xảy ra khi xóa dữ liệu");
        console.error("Error deleting data:", error);
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setApiUrl(`${API_DATAS_ADMIN}?page=${pageNumber}`);
  };

  const handleTempleteChange = (templeteId) => {
    if(templeteId){
      setApiUrl(`${API_DATAS_ADMIN}?templeteName_id=${templeteId}`);
    }
  }

  const DateDisplay = (datetime) => {
    try {
      const date = parseISO(datetime);
      return format(date, "dd/MM/yyyy, HH:mm:ss");
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="row">
          <div className="col-lg-2 col-md-2 navbar-dashboard">
            <Navbar />
          </div>
          <div className="col-lg-10 col-md-10 main d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="row">
          <div className="col-lg-2 col-md-2 navbar-dashboard">
            <Navbar />
          </div>
          <div className="col-lg-10 col-md-10 main d-flex justify-content-center align-items-center">
            <div className="alert alert-danger" role="alert">
              Lỗi: {error}
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link
              className="btn btn-primary d-flex align-items-center justify-content-center"
              to={"/datas/admin/store"}
              style={{
                padding: "0 10px",
                color: "white",
                borderRadius: "50px",
                background: "#17a2b8",
                width: "60px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bolder",
              }}
            >
              +
            </Link>
            <div id="select-model" className="w-25">
              <select
                name="templeteName_id"
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1a202c",
                  outline: "none",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 12px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 2px 6px 0 rgba(59, 130, 246, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
                }}
                onChange={(e) => handleTempleteChange(e.target.value)}
              >
                <option>Lọc theo mẫu</option>
                {templetes.map((templete, index)=> {
                  return (
                    <option key={index} value={templete._id}>{templete.templeteName}</option>
                  )
                })}
              </select>
            </div>
          </div>

          {apiResponse.datas && apiResponse.datas.length > 0 ? (
            <>
              <table className="table table-light table-striped table-hover">
                <thead>
                  <tr style={{ background: "#80EDE4" }}>
                    <th scope="col">STT</th>
                    <th scope="col">Tên mẫu</th>
                    <th scope="col">Tên cây</th>
                    <th scope="col">Nhiệt độ</th>
                    <th scope="col">Độ ẩm</th>
                    <th scope="col">Độ ẩm đất</th>
                    <th scope="col">Ngày tạo</th>
                    <th scope="col">Cập nhật</th>
                    <th scope="col">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {apiResponse.datas.map((data, index) => (
                    <tr key={data._id}>
                      <th scope="row">{index + 1}</th>
                      <td>{data.templeteName_id?.templeteName || "N/A"}</td>
                      <td>{data.templeteName_id?.treeName || "N/A"}</td>
                      <td>{data.tempreature} °C</td>
                      <td>{data.humidity} %</td>
                      <td>{data.soilMoisture} %</td>
                      <td>{DateDisplay(data.createdAt)}</td>
                      <td>
                        <Link
                          className="text-warning"
                          to={`/datas/admin/update/${data._id}`}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </Link>
                      </td>
                      <td>
                        <button
                          className="text-danger btn btn-link p-0"
                          onClick={() => handleDelete(data._id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phân trang */}
              {apiResponse.pages && apiResponse.pages.totalPages > 1 && (
                <div id="pagination" className="d-flex mt-4">
                  <nav aria-label="Page navigation">
                    <ul className="pagination">
                      <li
                        className={`page-item ${
                          !apiResponse.pages?.hasPrev ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            apiResponse.pages?.hasPrev &&
                            handlePageChange(apiResponse.pages.prev)
                          }
                          disabled={!apiResponse.pages?.hasPrev}
                        >
                          Trước
                        </button>
                      </li>

                      {[...Array(apiResponse.pages.totalPages)].map(
                        (_, index) => (
                          <li
                            key={index + 1}
                            className={`page-item ${
                              apiResponse.pages.page === index + 1
                                ? "active"
                                : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        )
                      )}

                      <li
                        className={`page-item ${
                          !apiResponse.pages?.hasNext ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            apiResponse.pages?.hasNext &&
                            handlePageChange(apiResponse.pages.next)
                          }
                          disabled={!apiResponse.pages?.hasNext}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-info text-center" role="alert">
              Không có dữ liệu nào được tìm thấy.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DataAdmin;
