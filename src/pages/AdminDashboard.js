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

    const stored = localStorage.getItem("allBookings");
    if (stored) {
      setAllBookings(JSON.parse(stored));
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
        await API.put(`/turfs/${editId}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Turf updated successfully");
      } else {
        await API.post("/turfs", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
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
    const confirmDelete = window.confirm("Are you sure you want to delete this turf?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/turfs/${id}`);
      alert("Turf deleted successfully");
      fetchTurfs();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
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
          <button onClick={() => setShowBookings(true)} style={styles.bookingBtn}>
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
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={styles.input}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={styles.textarea}
            />

            <div style={styles.btnRow}>
              <button type="submit" style={styles.saveBtn}>
                {editId ? "Update Turf" : "Add Turf"}
              </button>

              {editId && (
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Cancel
                </button>
              )}
            </div>
          </form>
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
                    <button onClick={() => handleEdit(turf)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(turf._id)} style={styles.deleteBtn}>
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
                  <p><strong>User:</strong> {booking.userId}</p>
                  <p><strong>Date:</strong> {booking.date}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Payment:</strong> {booking.paymentStatus || "Pending"}</p>
                </div>
              ))
            )}

            <button onClick={() => setShowBookings(false)} style={styles.closeBtn}>
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
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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
    gap: "20px",
  },
  formCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  listCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    resize: "vertical",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
  },
  saveBtn: {
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  turfItem: {
    display: "flex",
    gap: "16px",
    border: "1px solid #e5e5e5",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  image: {
    width: "180px",
    height: "130px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  info: {
    flex: 1,
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  editBtn: {
    background: "#198754",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
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