import React, { useEffect, useState } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/header";
import { useNavigate, useParams } from "react-router-dom";
import "./StyleData.css";
import { API_TEMPLETES_ADMIN } from "../../Services/common";
import { API_DATAS_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function UpdateData() {
  const navigate = useNavigate();
  const backDataAdmin = () => {
    return navigate("/datas/admin");
  };
  const [templetes, setTempletes] = useState([]);
  const [data, setData] = useState({});
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
      }
    };

    fetchData();
  }, []);

  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_DATAS_ADMIN}/${id}`);
        if (!response.ok) {
          throw new Error("Networl respons was not ok");
        }
        const result = await response.json();
        if (result && result.data) {
          setData(result.data);
        }
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [id]);

  const handelChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_DATAS_ADMIN}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      toast.success(`${result.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      backDataAdmin();
    } catch (error) {
      setError(error);
      console.error("Error updating user:", error);
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
          <form id="form-add-user" onSubmit={handleSubmit}>
            <h1>Update Datas Admin</h1>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="templeteName_id">Templete name</label>
                  </th>
                  <td>
                    <select
                      name="templeteName_id"
                      value={data.templeteName_id?._id}
                      required
                      onChange={handelChange}
                    >
                      {templetes.map((templete, index) => {
                        return (
                          <option value={templete._id}>
                            {templete.templeteName}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="tempreature">Tempreature</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="tempreature"
                      value={data.tempreature || ""}
                      onChange={handelChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="humidity">Humidity</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="humidity"
                      value={data.humidity || ""}
                      onChange={handelChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="soilMoisture">SoilMoisture</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="soilMoisture"
                      onChange={handelChange}
                      value={data.soilMoisture || ""}
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
              <input
                className="btn btn-warning mr-2"
                type="submit"
                value="Submit"
              />
              <input
                className="btn btn-danger"
                onClick={backDataAdmin}
                type="button"
                value="Cancel"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateData;
