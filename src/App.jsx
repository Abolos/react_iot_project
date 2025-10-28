import { useState } from "react";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Main/Dashboard";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho toast
import UserAdmin from "./components/Main/UserAdmin";
import DataAdmin from "./components/Main/DataAdmin";
import ReportAmin from "./components/Main/ReportAdmin";
import AutomaticAdmin from "./components/Main/AutomaticAdmin";
import CreateUser from "./components/Main/users/CreateUser";
import UpdateUser from "./components/Main/users/UpdateUser";
import TempleteAdmin from "./components/Main/TempleteAdmin";
import CreateTemplete from "./components/Main/templetes/CreateTemplete";
import UpdateTemplete from "./components/Main/templetes/UpdateTemplete";
import CreateData from "./components/Main/datas/CreateData";
import UpdateData from "./components/Main/datas/UpdateData";

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/admin" element={<UserAdmin />} />
        <Route path="/users/admin/store" element={<CreateUser />} />
        <Route path="/users/admin/update/:id" element={<UpdateUser />} />
        <Route path="/datas/admin" element={<DataAdmin />} />
        <Route path="/datas/admin/store" element={<CreateData />} />
        <Route path="/datas/admin/update/:id" element={<UpdateData />} />
        <Route path="/reports/admin" element={<ReportAmin />} />
        <Route path="/Automatic/admin" element={<AutomaticAdmin />} />
        <Route path="/templetes/admin" element={<TempleteAdmin />} />
        <Route path="/templetes/admin/store" element={<CreateTemplete />} />
        <Route path="/templetes/admin/update/:id" element={<UpdateTemplete />} />
      </Routes>
    </div>
  );
}

export default App;
