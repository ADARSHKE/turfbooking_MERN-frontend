import { useEffect, useState } from "react";
import API from "../api";

function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    API.get("/booking/my")
      .then(res => setBookings(res.data))
      .catch(() => alert("Error"));
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.map(b => (
        <div key={b._id}>
          <h3>{b.turfId.name}</h3>
          <p>Date: {b.date}</p>
          <p>Time: {b.startTime} - {b.endTime}</p>
        </div>
      ))}
    </div>
  );
}

export default Bookings;