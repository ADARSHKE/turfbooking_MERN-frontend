import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedTurf, date, time } = location.state || {};

  if (!selectedTurf) {
    return <h2>Invalid Payment Access</h2>;
  }

  const handlePayment = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const allBookings =
      JSON.parse(localStorage.getItem("allBookings")) || [];

    const newBooking = {
      id: Date.now(),
      userId: user.email,
      turfId: selectedTurf.id,
      turfName: selectedTurf.name,
      date,
      time,
      paymentStatus: "Paid"
    };

    localStorage.setItem(
      "allBookings",
      JSON.stringify([...allBookings, newBooking])
    );

    alert("✅ Payment Successful & Booking Confirmed!");
    navigate("/home");
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Payment Details</h2>

        <p><strong>Turf:</strong> {selectedTurf.name}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Amount:</strong> {selectedTurf.price}</p>

        <button className="pay-btn" onClick={handlePayment}>
          Pay Now
        </button>

        <button
          className="cancel-btn"
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Payment;