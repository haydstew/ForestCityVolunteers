import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../Firebase.js";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import emailjs from "emailjs-com";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./LibrarianDashboard.scss";
import LibrarianHeader from "../../components/LibrarianHeader/LibrarianHeader.js";
import Footer from "../../components/Footer/Footer.js";

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("librarian")) {
      console.warn("No librarian session found. Redirecting to login...");
      navigate("/librarian-login");
      return;
    }

    const fetchRoomsAndBookings = async () => {
      try {
        const roomsSnapshot = await getDocs(collection(db, "rooms"));
        const roomsList = roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsList);

        // Fetch all bookings in parallel
        const bookingsPromises = roomsList.map(async (room) => {
          const bookingsRef = collection(db, "rooms", room.id, "bookings");
          const bookingsSnapshot = await getDocs(bookingsRef);

          return bookingsSnapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            roomId: room.id, // Ensure roomId is set here
            ...bookingDoc.data(),
            room: room.name, // Assuming the room has a name field
          }));
        });

        // Wait for all the bookings to be fetched in parallel
        const allBookings = await Promise.all(bookingsPromises);

        // Flatten the array of arrays into one array
        const flattenedBookings = allBookings.flat();
        setReservations(flattenedBookings);
      } catch (error) {
        console.error("Error fetching rooms or bookings:", error);
      }
    };

    fetchRoomsAndBookings();
  }, [navigate]);

  const handleApprove = async (reservation) => {
    if (!reservation.roomId) {
      console.error("Error: Room ID is missing for this reservation");
      alert("Invalid reservation. Room ID is missing.");
      return;
    }

    try {
      const updatedReservation = { ...reservation, status: "Approved" };

      // Optimistically update the status in the local state
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.id === reservation.id ? updatedReservation : res
        )
      );

      // Correct path to update the booking status in Firestore
      const bookingRef = doc(
        db,
        "rooms",
        reservation.roomId,
        "bookings",
        reservation.id
      );
      await updateDoc(bookingRef, {
        status: "Approved",
      });

      // Send approval email to patron
      const emailParams = {
        user_email: reservation.email,
        room_name: reservation.room,
        room_location: reservation.location,
        booking_date: reservation.date,
        booking_time: reservation.time,
        status: "Approved",
      };

      await emailjs.send(
        "service_p7qb2fi",
        "template_whfon5g",
        emailParams,
        "q6N2whZUsNxvfV7sr"
      );

      alert(`Reservation approved.`);
    } catch (error) {
      console.error("Error approving reservation:", error);
      alert("Failed to approve the reservation. Please try again later.");
    }
  };

  const handleDeny = async (reservation) => {
    const reason = prompt("Please enter a reason for denial:");

    if (!reason) {
      alert("Denial reason is required.");
      return;
    }

    try {
      const updatedReservation = { ...reservation, status: "Denied", reason };

      // Optimistically update the status in the local state
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.id === reservation.id ? updatedReservation : res
        )
      );

      // Correct path to update the booking status in Firestore
      const bookingRef = doc(
        db,
        "rooms",
        reservation.roomId,
        "bookings",
        reservation.id
      );

      // Update the status to "Denied" rather than deleting the booking
      await updateDoc(bookingRef, {
        status: "Denied",
        reason: reason,
      });

      // Send email to patron about denial
      const emailParams = {
        user_email: reservation.email,
        room_name: reservation.room,
        room_location: reservation.location,
        booking_date: reservation.date,
        booking_time: reservation.time,
        status: "Denied",
        reason: reason,
      };

      await emailjs.send(
        "service_p7qb2fi",
        "template_whfon5g",
        emailParams,
        "q6N2whZUsNxvfV7sr"
      );

      // Fetch reminders for this room (matching roomId, date, and time)
      const remindersQuery = query(
        collection(db, "reminders"),
        where("roomId", "==", reservation.roomId),
        where("date", "==", reservation.date),
        where("time", "==", reservation.time)
      );

      const remindersSnapshot = await getDocs(remindersQuery);

      if (!remindersSnapshot.empty) {
        // Send email notifications to each user who set a reminder
        for (const reminderDoc of remindersSnapshot.docs) {
          const reminder = reminderDoc.data();
          const notifyEmailParams = {
            user_email: reminder.email,
            room_name: reservation.roomName,
            room_location: reservation.location,
            booking_date: reservation.date,
            booking_time: reservation.time,
          };

          // Send notification email to each user
          await emailjs.send(
            "service_p7qb2fi",
            "template_fwti4vi",
            notifyEmailParams,
            "q6N2whZUsNxvfV7sr"
          );

          // After notification, delete this reminder from the notifications collection
          const reminderRef = doc(db, "reminders", reminderDoc.id);
          await deleteDoc(reminderRef); // Remove the reminder record
        }
      }

      alert(`Reservation denied.`);
    } catch (error) {
      console.error("Error denying reservation:", error);
      alert("Failed to deny the reservation. Please try again later.");
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Librarian Dashboard Report", 14, 15);

    // Reservations Table
    doc.setFontSize(14);
    doc.text("Reservations", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Patron Email", "Room", "Location", "Date", "Time", "Status"]],
      body: reservations.map((res) => [
        res.email,
        res.room,
        res.location,
        res.date,
        res.time,
        res.status,
      ]),
    });

    // Save PDF
    doc.save("Librarian_Dashboard_Report.pdf");
  };

  return (
    <>
      <LibrarianHeader />
      <div className="dashboard-container">
        <h2>Librarian Dashboard</h2>
        <div className="dashboard-content">
          {/* Overview Panel */}
          <div className="overview">
            <h3>Overview</h3>
            <p>
              <strong>Total Reservations:</strong> {reservations.length}
            </p>
            <p>
              <strong>Pending Requests:</strong>{" "}
              {reservations.filter((r) => r.status === "Pending").length}
            </p>
          </div>

          {/* Reservation Management */}
          <div className="reservations">
            <h3>Reservation Management</h3>
            {reservations.map((res) => (
              <div key={res.id} className="reservation-card">
                <p>
                  <b>Patron Email:</b> {res.email}
                </p>
                <p>
                  <b>Room:</b> {res.room}
                </p>
                <p>
                  <b>Location:</b> {res.location} {/* Display Location */}
                </p>
                <p>
                  <b>Date:</b> {res.date} {/* Display Date */}
                </p>
                <p>
                  <b>Time:</b> {res.time} {/* Display Time */}
                </p>
                <p>
                  <b>Status:</b> {res.status}
                </p>
                {res.status === "Pending" && (
                  <div>
                    <button onClick={() => handleApprove(res)}>Approve</button>
                    <button onClick={() => handleDeny(res)}>Deny</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Generate Report Button */}
          <button className="generate-report-btn" onClick={generateReport}>
            Generate Report
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibrarianDashboard;
