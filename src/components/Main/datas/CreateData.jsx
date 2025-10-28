import React, { useState, useEffect } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/Header";
import "./StyleData.css";
import { useNavigate } from "react-router-dom";
import { API_TEMPLETES_ADMIN } from "../../Services/common";
import { API_DATAS_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function CreateData() {
  const navigate = useNavigate();
  const backDataAdmin = () => {
    return navigate("/datas/admin");
  };

  const [templetes, setTempletes] = useState([]);
  const [data, setData] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_DATAS_ADMIN}`, {
        method: "POST",
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
      console.log(error);
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
            <h1>Create Datas Admin</h1>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="templeteName_id">Templete name</label>
                  </th>
                  <td>
                    <select name="templeteName_id" required onChange={handleChange} >
                        <option value="">...</option>
                      {templetes.map((templete, index) => {
                        return (
                            <option value={templete._id}>{templete.templeteName}</option>
                        )
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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

export default CreateData;
