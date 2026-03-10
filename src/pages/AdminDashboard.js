import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showBookings, setShowBookings] = useState(false);

  const [allBookings, setAllBookings] = useState(() => {
    const stored = localStorage.getItem("allBookings");
    return stored ? JSON.parse(stored) : [];
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    const stored = localStorage.getItem("blockedSlots");
    return stored ? JSON.parse(stored) : [];
  });

  const [blockData, setBlockData] = useState({
    turfId: "",
    date: "",
    time: "",
  });

  const timeSlots = [
    "6 AM - 7 AM",
    "7 AM - 8 AM",
    "8 AM - 9 AM",
    "5 PM - 6 PM",
    "6 PM - 7 PM",
    "7 PM - 8 PM",
  ];

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    pricePerHour: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const fetchTurfs = async () => {
    try {
      const res = await API.get("/turfs");
      setTurfs(res.data);
    } catch (error) {
      alert("Failed to fetch turfs");
    }
  };

  useEffect(() => {
    fetchTurfs();

    const storedBookings = localStorage.getItem("allBookings");
    if (storedBookings) {
      setAllBookings(JSON.parse(storedBookings));
    }

    const storedBlockedSlots = localStorage.getItem("blockedSlots");
    if (storedBlockedSlots) {
      setBlockedSlots(JSON.parse(storedBlockedSlots));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      pricePerHour: "",
      description: "",
    });
    setImageFile(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("pricePerHour", formData.pricePerHour);
      data.append("description", formData.description);

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editId) {
        await API.put(`/turfs/${editId}`, data);
        alert("Turf updated successfully");
      } else {
        await API.post("/turfs", data);
        alert("Turf added successfully");
      }

      resetForm();
      fetchTurfs();
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  const handleEdit = (turf) => {
    setEditId(turf._id);

    setFormData({
      name: turf.name,
      location: turf.location,
      pricePerHour: turf.pricePerHour,
      description: turf.description || "",
    });

    setImageFile(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this turf?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/turfs/${id}`);
      alert("Deleted successfully");
      fetchTurfs();
    } catch {
      alert("Delete failed");
    }
  };

  const handleBlockChange = (e) => {
    setBlockData({
      ...blockData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlockSlot = () => {
    const { turfId, date, time } = blockData;

    if (!turfId || !date || !time) {
      return alert("Select turf, date and slot");
    }

    const alreadyBlocked = blockedSlots.find(
      (slot) =>
        String(slot.turfId) === String(turfId) &&
        slot.date === date &&
        slot.time === time
    );

    if (alreadyBlocked) {
      return alert("This slot is already blocked");
    }

    const alreadyBooked = allBookings.find(
      (booking) =>
        String(booking.turfId) === String(turfId) &&
        booking.date === date &&
        booking.time === time
    );

    if (alreadyBooked) {
      return alert("This slot is already booked by a user");
    }

    const newBlock = {
      id: Date.now(),
      turfId,
      date,
      time,
    };

    const updated = [...blockedSlots, newBlock];
    setBlockedSlots(updated);
    localStorage.setItem("blockedSlots", JSON.stringify(updated));

    alert("Slot blocked");

    setBlockData({
      turfId: "",
      date: "",
      time: "",
    });
  };

  const handleUnblock = (id) => {
    const updated = blockedSlots.filter((slot) => slot.id !== id);
    setBlockedSlots(updated);
    localStorage.setItem("blockedSlots", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Admin Dashboard</h2>

        <div style={styles.topBtns}>
          <button
            onClick={() => setShowBookings(true)}
            style={styles.bookingBtn}
          >
            View Bookings
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.formCard}>
          <h3>{editId ? "Edit Turf" : "Add Turf"}</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Turf name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="number"
              name="pricePerHour"
              placeholder="Price per hour"
              value={formData.pricePerHour}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={styles.input}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
            />

            <button type="submit" style={styles.saveBtn}>
              {editId ? "Update Turf" : "Add Turf"}
            </button>
          </form>

          <h3 style={{ marginTop: 20 }}>Block Slot</h3>

          <select
            name="turfId"
            value={blockData.turfId}
            onChange={handleBlockChange}
            style={styles.input}
          >
            <option value="">Select Turf</option>

            {turfs.map((turf) => (
              <option key={turf._id} value={turf._id}>
                {turf.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={blockData.date}
            onChange={handleBlockChange}
            style={styles.input}
          />

          <select
            name="time"
            value={blockData.time}
            onChange={handleBlockChange}
            style={styles.input}
          >
            <option value="">Select Slot</option>

            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <button onClick={handleBlockSlot} style={styles.saveBtn}>
            Block Slot
          </button>

          <h3 style={{ marginTop: 20 }}>Blocked Slots</h3>

          {blockedSlots.length === 0 ? (
            <p>No blocked slots</p>
          ) : (
            blockedSlots.map((slot) => {
              const turfName =
                turfs.find((t) => String(t._id) === String(slot.turfId))?.name ||
                "Unknown Turf";

              return (
                <div key={slot.id} style={styles.bookingCard}>
                  <p><strong>Turf:</strong> {turfName}</p>
                  <p><strong>Date:</strong> {slot.date}</p>
                  <p><strong>Time:</strong> {slot.time}</p>

                  <button
                    onClick={() => handleUnblock(slot.id)}
                    style={styles.deleteBtn}
                  >
                    Unblock
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={styles.listCard}>
          <h3>All Turfs</h3>

          {turfs.length === 0 ? (
            <p>No turfs found</p>
          ) : (
            turfs.map((turf) => (
              <div key={turf._id} style={styles.turfItem}>
                <img src={turf.image} alt={turf.name} style={styles.image} />

                <div style={styles.info}>
                  <h4>{turf.name}</h4>
                  <p><strong>Location:</strong> {turf.location}</p>
                  <p><strong>Price:</strong> ₹{turf.pricePerHour}</p>
                  <p><strong>Description:</strong> {turf.description}</p>

                  <div style={styles.actionRow}>
                    <button
                      onClick={() => handleEdit(turf)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(turf._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showBookings && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2>All Bookings</h2>

            {allBookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              allBookings.map((booking) => (
                <div key={booking.id} style={styles.bookingCard}>
                  <h3>{booking.turfName}</h3>
                  <p><strong>User:</strong> {booking.userId || "Unknown User"}</p>
                  <p><strong>Date:</strong> {booking.date}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Payment:</strong> {booking.paymentStatus || "Pending"}</p>
                </div>
              ))
            )}

            <button
              onClick={() => setShowBookings(false)}
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  topBtns: {
    display: "flex",
    gap: "10px",
  },
  bookingBtn: {
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 20,
  },
  formCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  listCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    minHeight: "90px",
    marginBottom: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  saveBtn: {
    background: "#0d6efd",
    color: "#fff",
    padding: 10,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  turfItem: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 12,
  },
  image: {
    width: 120,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  actionRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  editBtn: {
    background: "green",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "red",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 16,
  },
  modalBox: {
    width: "90%",
    maxWidth: "700px",
    maxHeight: "80vh",
    overflowY: "auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  bookingCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "12px",
    background: "#fafafa",
  },
  closeBtn: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default AdminDashboard;