import React, { useState, useEffect } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/Header";
import "./CreateUser.css";
import { useNavigate } from "react-router-dom";
import { API_USERS_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function CreateUser() {
  const navigate = useNavigate();
  const backUserAdmin = () => {
    return navigate("/users/admin");
  };

  const [user, setUser] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_USERS_ADMIN}/store`, {
        method: "POST",
        headers:  {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if(!response.ok){
        throw new Error("Network response was not ok")
      }   
      const result = await response.json();
      toast.success(`${result.message}`, {
              position: "top-right",
              autoClose: 5000,
            });
      backUserAdmin();
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
            <h1>Create Users Admin</h1>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="fullName">Fullname</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="fullName"
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="password">Password</label>
                  </th>
                  <td>
                    <input
                      type="password"
                      name="password"
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="email">Email</label>
                  </th>
                  <td>
                    <input
                      type="email"
                      name="email"
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="role">Role</label>
                  </th>
                  <td>
                    <select name="role" required onChange={handleChange} defaultValue="admin">
                      <option >...</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
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
                onClick={backUserAdmin}
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

export default CreateUser;
