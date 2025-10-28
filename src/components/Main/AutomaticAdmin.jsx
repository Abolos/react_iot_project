import React, { useState } from "react";
import Header from "../Layout/header";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";
function AutomaticAdmin() {
  const [onOff, setOnOff] = useState(false);
  const handelOnOff = () => {
    if(onOff){
      setOnOff(false);
    }else {
      setOnOff(true);
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
          <div className="row m-3 mt-5">
            <div className="col">
              <div
                style={{
                  width: "100px",
                  backgroundColor: "#fff",
                  float: "right",
                  borderRadius: "50px",
                }}
                className ={onOff ? "shadow text-right": "shadow text-left"}
              >
                <button onClick={handelOnOff} style={{borderRadius: "50px"}} className="btn font-weight-bold shadow ">{onOff ? "On": "OFF"}</button>
              </div>
            </div>
          </div>
          <div id="data-dashboard" className="row m-3 mt-5">
            <div className="col">
              <div className="card w-100 shadow text-center p-4">
                <div className="temperature">
                  <p className="shadow">
                    33 <span>&deg;C</span>
                  </p>
                </div>
                <h4 className="temperature-h4">Nhiệt độ</h4>
              </div>
            </div>
            <div className="col">
              <div className="card w-100 shadow text-center p-4">
                <div className="air-persent">
                  <p className="shadow">
                    75 <span>%</span>
                  </p>
                </div>
                <h4 className="air-persent-h4">Độ ẩm không khí</h4>
              </div>
            </div>
            <div className="col">
              <div className="card w-100 shadow text-center p-4">
                <div className="ground-persent">
                  <p className="shadow">
                    50 <span>%</span>
                  </p>
                </div>
                <h4 className="ground-persent-h4">Độ ẩm đất</h4>
              </div>
            </div>
          </div>
          <div className="row m-3 mt-5">
            <div className="col">
              <div className="text-left">
                <button className={onOff ? "btn btn-danger font-weight-bold shadow d-none": "btn btn-danger font-weight-bold shadow"}>
                  Water pump
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default AutomaticAdmin;
