import React, { useState, useEffect } from "react";
import { db } from "../../../Firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import emailjs from "emailjs-com";
import "./PatronProfile.scss";
import PatronHeader from "../../../components/PatronHeader/PatronHeader.js";

const PatronProfile = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modify Booking State
  const [modifyingBooking, setModifyingBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reservedTimes, setReservedTimes] = useState([]);
  const [timeError, setTimeError] = useState("");

  // All time slots
  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const email = localStorage.getItem("patron");
        if (!email) return;

        // Get all rooms and bookings for the patron
        const roomsSnapshot = await getDocs(collection(db, "rooms"));
        const rooms = roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];

        const bookingPromises = rooms.map(async (room) => {
          const bookingsQuery = query(
            collection(db, `rooms/${room.id}/bookings`),
            where("email", "==", email)
          );
          const snapshot = await getDocs(bookingsQuery);
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            roomId: room.id,
            roomName: room.name,
            location: room.location,
            status: doc.data().status,
            ...doc.data(),
          }));
        });

        const allBookings = (await Promise.all(bookingPromises)).flat();
        setUpcomingBookings(allBookings.filter((b) => b.date >= today));
        setPastBookings(allBookings.filter((b) => b.date < today));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId, roomId, bookingData) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await deleteDoc(doc(db, `rooms/${roomId}/bookings/${bookingId}`));

      const emailParams = {
        user_email: bookingData.email,
        room_name: bookingData.roomName,
        room_location: bookingData.location,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        status: "Cancelled",
      };

      await emailjs.send(
        "service_p7qb2fi",
        "template_whfon5g",
        emailParams,
        "q6N2whZUsNxvfV7sr"
      );

      const remindersQuery = query(
        collection(db, "reminders"),
        where("roomId", "==", roomId),
        where("date", "==", bookingData.date),
        where("time", "==", bookingData.time)
      );

      const snapshot = await getDocs(remindersQuery);
      snapshot.forEach(async (docSnap) => {
        await emailjs.send(
          "service_p7qb2fi",
          "template_fwti4vi",
          {
            user_email: docSnap.data().email,
            room_name: bookingData.roomName,
            room_location: bookingData.location,
            booking_date: bookingData.date,
            booking_time: bookingData.time,
          },
          "q6N2whZUsNxvfV7sr"
        );
        await deleteDoc(doc(db, "reminders", docSnap.id));
      });

      setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId));

      alert("Booking cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel the booking. Please try again.");
    }
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    if (!modifyingBooking || !newDate || !newTime) return;

    try {
      const bookingRef = doc(
        db,
        `rooms/${modifyingBooking.roomId}/bookings/${modifyingBooking.id}`
      );
      await updateDoc(bookingRef, { date: newDate, time: newTime });

      setUpcomingBookings((prev) =>
        prev.map((b) =>
          b.id === modifyingBooking.id
            ? { ...b, date: newDate, time: newTime }
            : b
        )
      );

      setModifyingBooking(null);
      alert("Booking updated successfully.");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update the booking.");
    }
  };

  const fetchReservedTimes = async (roomId, date) => {
    if (!roomId || !date) return;

    const bookingsRef = collection(db, `rooms/${roomId}/bookings`);
    const snapshot = await getDocs(
      query(bookingsRef, where("date", "==", date))
    );

    const times = snapshot.docs.map((doc) => doc.data().time);
    setReservedTimes(times);
  };

  useEffect(() => {
    if (modifyingBooking && newDate) {
      fetchReservedTimes(modifyingBooking.roomId, newDate);
    }
  }, [modifyingBooking, newDate]);

  return (
    <>
      <PatronHeader />
      <div className="patron-profile-container">
        <h2>My Bookings</h2>
        {loading ? (
          <p>Loading your bookings...</p>
        ) : (
          <>
            <div className="bookings-section">
              <h3>Upcoming Bookings</h3>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <h3>{booking.roomName}</h3>
                    <p>
                      <strong>Location:</strong> {booking.location}
                    </p>
                    <p>
                      <strong>Date:</strong> {booking.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.time}
                    </p>
                    <p>
                      <strong>Status:</strong> {booking.status}
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="cancel-btn"
                        onClick={() => setModifyingBooking(booking)}
                      >
                        Modify Booking
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() =>
                          handleCancelBooking(
                            booking.id,
                            booking.roomId,
                            booking
                          )
                        }
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No upcoming bookings.</p>
              )}
            </div>

            <div className="bookings-section">
              <h3>Past Bookings</h3>
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <h3>{booking.roomName}</h3>
                    <p>
                      <strong>Location:</strong> {booking.location}
                    </p>
                    <p>
                      <strong>Date:</strong> {booking.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.time}
                    </p>
                  </div>
                ))
              ) : (
                <p>No past bookings.</p>
              )}
            </div>
          </>
        )}
      </div>

      {modifyingBooking && (
        <div
          className="modal-overlay"
          onClick={() => setModifyingBooking(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setModifyingBooking(null)}
            >
              ✖
            </button>
            <h2>Modify Booking</h2>
            <form onSubmit={handleModifySubmit}>
              <label>New Date:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
              <label>New Time:</label>
              <select
                value={newTime}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (reservedTimes.includes(selected)) {
                    setTimeError("This time slot is unavailable.");
                    setNewTime("");
                  } else {
                    setTimeError("");
                    setNewTime(selected);
                  }
                }}
                required
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={reservedTimes.includes(slot)}
                  >
                    {slot}
                  </option>
                ))}
              </select>
              {timeError && <p className="error-text">{timeError}</p>}
              <button type="submit" className="cancel-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PatronProfile;
