import React, { useEffect, useState } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/header";
import { useNavigate, useParams } from "react-router-dom";
import "./StyleTemplete.css";
import { API_TEMPLETES_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function UpdateTemplete() {
  const navigate = useNavigate();
  const backTempleteAdmin = () => {
    return navigate("/templetes/admin");
  };

  const [templete, setTemplete] = useState({});
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_TEMPLETES_ADMIN}/${id}`);
        if (!response.ok) {
          throw new Error("Networl respons was not ok");
        }
        const result = await response.json();
        if (result && result.data) {
          setTemplete(result.data);
        }
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [id]);

  const handelChange = (e) => {
    const { name, value } = e.target;
    setTemplete((prevTemplete) => ({
      ...prevTemplete,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_TEMPLETES_ADMIN}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templete),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      toast.success(`${result.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      backTempleteAdmin();
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
            <h1>Update Templetes Admin</h1>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="_id">Id</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="_id"
                      value={templete._id}
                      readOnly
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="templeteName">Templete name</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="templeteName"
                      value={templete.templeteName}
                      onChange={handelChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="treeName">Tree name</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="treeName"
                      value={templete.treeName}
                      onChange={handelChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="production">Production</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="production"
                      value={templete.production}
                      onChange={handelChange}
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
                onClick={backTempleteAdmin}
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

export default UpdateTemplete;
