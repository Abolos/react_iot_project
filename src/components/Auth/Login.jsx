import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN_API_URL } from "../Services/common";
import { toast } from "react-toastify";
import "./Login.css";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn không cho trang reload

    try {
      const response = await fetch(`${LOGIN_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();

         toast.warning(errorMessage.message, {
                    position: "top-right",
                    autoClose: 5000,
                })
      }

      const data = await response.json();
      toast.success(`${data.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                })
      // Điều hướng tới trang /dashboard
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div id="login">
      <form id="form-login" onSubmit={handleSubmit}>
        <div className="image-avatar">
          <i className="fa-solid fa-circle-user"></i>
        </div>
        <div className="input-group">
          <label htmlFor="email">
            <i className="fa-solid fa-user"></i>
          </label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email..."
            required
            value={email} // Gán giá trị từ state
            onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi người dùng nhập
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">
            <i className="fa-solid fa-lock"></i>
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password..."
            required
            value={password} // Gán giá trị từ state
            onChange={(e) => setPassword(e.target.value)} // Cập nhật state khi người dùng nhập
          />
        </div>
        <div className="remember-me">
          <p>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </p>
          <p>
            <a href="#" className="forgot-password">
              Forgot Password?
            </a>
          </p>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
