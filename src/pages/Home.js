import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./home.css";

import turf1 from "../assets/TURF1.jpg";
import turf2 from "../assets/TURF2.jpg";
import turf3 from "../assets/TURF3.jpg";
import turf4 from "../assets/ext.jpg";
import turf5 from "../assets/TURF5.jpg";
import turf6 from "../assets/TURF6.jpg";
import turf7 from "../assets/TURF7.jpg";
import turf8 from "../assets/TURF8.jpg";
import turf9 from "../assets/TURF9.jpg";

const fallbackTurfs = [
  {
    id: 1,
    name: "Green Field Turf",
    location: "Thrissur",
    pricePerHour: 1200,
    image: turf1,
    description: "",
  },
  {
    id: 2,
    name: "Elite Sports Arena",
    location: "Ernakulam",
    pricePerHour: 1500,
    image: turf2,
    description: "",
  },
  {
    id: 3,
    name: "Victory Turf",
    location: "Kochi",
    pricePerHour: 1000,
    image: turf3,
    description: "",
  },
  {
    id: 4,
    name: "Soccer Turf",
    location: "Vytilla",
    pricePerHour: 1000,
    image: turf4,
    description: "",
  },
  {
    id: 5,
    name: "CR7 Turf",
    location: "Kakkanad",
    pricePerHour: 1200,
    image: turf5,
    description: "",
  },
  {
    id: 6,
    name: "Star Sports Turf",
    location: "Tripunithura",
    pricePerHour: 1500,
    image: turf6,
    description: "",
  },
  {
    id: 7,
    name: "Lets Match Turf",
    location: "Vazhakkala",
    pricePerHour: 1000,
    image: turf7,
    description: "",
  },
  {
    id: 8,
    name: "Play Zone Turf",
    location: "Karingachira",
    pricePerHour: 1000,
    image: turf8,
    description: "",
  },
  {
    id: 9,
    name: "Kick Off Turf",
    location: "Kaloor",
    pricePerHour: 1000,
    image: turf9,
    description: "",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const [allBookings, setAllBookings] = useState(() => {
    const stored = localStorage.getItem("allBookings");
    return stored ? JSON.parse(stored) : [];
  });

  const [turfs, setTurfs] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const res = await API.get("/turfs");

        if (res.data && res.data.length > 0) {
          setTurfs(res.data);
        } else {
          setTurfs(fallbackTurfs);
        }
      } catch (error) {
        console.log("Failed to fetch turfs:", error);
        setTurfs(fallbackTurfs);
      } finally {
        setLoadingTurfs(false);
      }
    };

    fetchTurfs();
  }, []);

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.name.toLowerCase().includes(searchName.toLowerCase()) &&
      turf.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const timeSlots = [
    "6 AM - 7 AM",
    "7 AM - 8 AM",
    "8 AM - 9 AM",
    "5 PM - 6 PM",
    "6 PM - 7 PM",
    "7 PM - 8 PM",
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openModal = (turf) => {
    setSelectedTurf(turf);
    setShowModal(true);
    setDate("");
    setTime("");
  };

  const cancelBooking = (id) => {
    const updatedBookings = allBookings.filter((b) => b.id !== id);
    setAllBookings(updatedBookings);
    localStorage.setItem("allBookings", JSON.stringify(updatedBookings));
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const myBookings = allBookings.filter((b) => b.userId === currentUser?.email);

  return (
    <div className="home-container">
      <nav className="navbar">
        <h2 className="logo">⚽ Turf Booking</h2>
        <div className="nav-actions">
          <button className="my-bookings-btn" onClick={() => setShowBookings(true)}>
            My Bookings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="hero">
        <h1>Reserve Your Turf Slot</h1>
        <p>Fast • Secure • Real-time Availability</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Turf Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
      </div>

      <div className="turf-grid">
        {loadingTurfs ? (
          <p>Loading turfs...</p>
        ) : filteredTurfs.length === 0 ? (
          <p>No turfs found.</p>
        ) : (
          filteredTurfs.map((turf) => (
            <div key={turf._id || turf.id} className="turf-card">
              <img src={turf.image} alt={turf.name} />
              <div className="turf-info">
                <h3>{turf.name}</h3>
                <p>{turf.location}</p>
                <p className="price">₹{turf.pricePerHour} / hour</p>
                {turf.description && <p>{turf.description}</p>}
                <button className="book-btn" onClick={() => openModal(turf)}>
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{selectedTurf.name}</h2>

            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="slot-grid">
              {timeSlots.map((slot) => {
                const turfKey = selectedTurf._id || selectedTurf.id;

                const isBooked = allBookings.find(
                  (b) =>
                    String(b.turfId) === String(turfKey) &&
                    b.date === date &&
                    b.time === slot
                );

                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    className={`slot-btn ${time === slot ? "selected" : ""} ${
                      isBooked ? "booked" : ""
                    }`}
                    onClick={() => setTime(slot)}
                  >
                    {isBooked ? "Not Available" : slot}
                  </button>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                className="confirm-btn"
                onClick={() => {
                  if (!date || !time) return alert("Select date & slot");

                  navigate("/payment", {
                    state: {
                      selectedTurf: {
                        ...selectedTurf,
                        id: selectedTurf._id || selectedTurf.id,
                      },
                      date,
                      time,
                    },
                  });
                }}
              >
                Proceed to Payment
              </button>

              <button className="close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookings && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>My Bookings</h2>

            {myBookings.length === 0 ? (
              <p className="empty-msg">No bookings yet.</p>
            ) : (
              myBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div>
                    <h3>{booking.turfName}</h3>
                    <p>{booking.date}</p>
                    <p>{booking.time}</p>
                    {booking.paymentStatus && <p>{booking.paymentStatus}</p>}
                  </div>

                  <button
                    className="cancel-booking-btn"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}

            <button className="close-btn" onClick={() => setShowBookings(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;