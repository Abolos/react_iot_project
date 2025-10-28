import React, { useEffect, useState } from "react";
import Navbar from "../../Layout/Navbar";
import Header from "../../Layout/header";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateUser.css";
import { API_USERS_ADMIN } from "../../Services/common";
import { toast } from "react-toastify";

function UpdateUser() {
  const navigate = useNavigate();
  const backUserAdmin = () => {
    return navigate("/users/admin");
  };

  const [user, setUser] = useState({
    _id: "",
    fullName: "",
    password: "",
    email: "",
    role: "",
  });
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_USERS_ADMIN}/${id}`);
        if (!response.ok) {
          throw new Error("Networl respons was not ok");
        }
        const result = await response.json();
        if (result && result.data) {
          setUser(result.data);
        }
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [id]);

  const handelChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_USERS_ADMIN}/${id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      toast.success(`${result.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      backUserAdmin();
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
            <h1>Update Users Admin</h1>
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
                      value={user._id}
                      readOnly
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="fullName">Fullname</label>
                  </th>
                  <td>
                    <input
                      type="text"
                      name="fullName"
                      value={user.fullName}
                      onChange={handelChange}
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
                      value={user.password}
                      onChange={handelChange}
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
                      value={user.email}
                      onChange={handelChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="role">Role</label>
                  </th>
                  <td>
                    <select
                      name="role"
                      value={user.role}
                      onChange={handelChange}
                      required
                    >
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

export default UpdateUser;
