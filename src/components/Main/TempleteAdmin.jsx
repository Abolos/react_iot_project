import React, {useState, useEffect} from "react";
import Header from "../Layout/header";
import Navbar from "../Layout/Navbar";
import { API_TEMPLETES_ADMIN } from "../Services/common";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
function TempleteAdmin() {
  const [templetes, setTempletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [templetes]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this templete?")) {
      try {
        const response = await fetch(`${API_TEMPLETES_ADMIN}/${id}`, {
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
        // Cập nhật lại danh sách người dùng sau khi xóa
        setTempletes(templetes.filter((templete) => templete._id !== id));
      } catch (error) {
        setError(error);
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="row">
        <div className="col-lg-2 col-md-2 navbar-dashboard">
          <Navbar />
        </div>
        <div className="col-lg-10 col-md-10 main">
          <div
            className="bg-info mt-2"
            style={{
              padding: "0 10px",
              color: "white",
              borderRadius: "50px",
              background: "red",
              width: "60px",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bolder",
            }}
          >
            <Link className="text-light" to={"/templetes/admin/store"}>
              +
            </Link>
          </div>
          <table className="table table-light table-striped table-hover mt-2">
            <thead>
              <tr style={{ background: "#80EDE4" }}>
                <th scope="col">STT</th>
                <th scope="col">Templete name</th>
                <th scope="col">Tree name</th>
                <th scope="col">Production</th>
                <th scope="col">Update</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              {templetes.map((template, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{template.templeteName}</td>
                  <td>{template.treeName}</td>
                  <td>{template.production}</td>
                  <td>
                    <Link
                      className="text-warning"
                      to={`/templetes/admin/update/${template._id}`}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="text-danger"
                      onClick={() => handleDelete(template._id)}
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
        </div>
      </div>
    </>
  );
}


export default TempleteAdmin;
