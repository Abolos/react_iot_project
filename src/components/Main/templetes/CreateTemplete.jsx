import React, { useState, useEffect } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/header";
import "./StyleTemplete.css";
import { useNavigate } from "react-router-dom";
import { API_TEMPLETES_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function CreateTemplete() {
  const navigate = useNavigate();
  const backTempleteAdmin = () => {
    return navigate("/templetes/admin");
  };

  const [templete, setTemplete] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplete((prevTemplete) => ({
      ...prevTemplete,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${ API_TEMPLETES_ADMIN}`, {
        method: "POST",
        headers:  {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templete),
      });
      if(!response.ok){
        throw new Error("Network response was not ok")
      }   
      const result = await response.json();
      toast.success(`${result.message}`, {
              position: "top-right",
              autoClose: 5000,
            });
      backTempleteAdmin();
    } catch (error) {
      setError(error);
      console.log(error);      
    }
  }

  return (
    <>
      <Header />
      <div className="row">
        <div className="col-lg-2 col-md-2 navbar-dashboard">
          <Navbar />
        </div>
        <div className="col-lg-10 col-md-10 main">
          <form id="form-add-user" onSubmit={handleSubmit}>
            <h1>Create Templetes Admin</h1>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="fullName">Templete name</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="templeteName"
                      onChange={handleChange}
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
                      onChange={handleChange}
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

export default CreateTemplete;
