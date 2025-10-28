import React, { useEffect, useState } from "react";
import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import { API_USERS_ADMIN } from "../Services/common";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_USERS_ADMIN);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();

        // Kiểm tra xem kết quả có phải là một mảng hay không
        if (result && result.data && Array.isArray(result.data)) {
          setUsers(result.data); // Lấy mảng từ thuộc tính data
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
  }, [users]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_USERS_ADMIN}/${id}/delete`, {
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
        setUsers(users.filter((user) => user._id !== id));
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
            <Link className="text-light" to={"/users/admin/store"}>
              +
            </Link>
          </div>
          <table className="table table-light table-striped table-hover mt-2">
            <thead>
              <tr style={{ background: "#80EDE4" }}>
                <th scope="col">STT</th>
                <th scope="col">Fullname</th>
                <th scope="col">Email</th>
                <th scope="col">Password</th>
                <th scope="col">Role</th>
                <th scope="col">Update</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>********</td>
                  <td>{user.role}</td>
                  <td>
                    <Link
                      className="text-warning"
                      to={`/users/admin/update/${user._id}`}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="text-danger"
                      onClick={() => handleDelete(user._id)}
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

export default UserAdmin;
