import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../Firebase.js";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import emailjs from "emailjs-com";
import "./PatronDashboard.scss";
import PatronHeader from "../../components/PatronHeader/PatronHeader.js";

const PatronDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    type: "",
    equipment: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00 - 10:00");
  const [isRecurring, setIsRecurring] = useState(false);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueText, setIssueText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("No patron session found. Redirecting to login...");
        navigate("/patron-login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsCollection = collection(db, "rooms");
        const roomSnapshot = await getDocs(roomsCollection);
        const roomList = roomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomList);

        const uniqueLocations = [
          ...new Set(roomList.map((room) => room.location)),
        ].sort();
        setLocations(uniqueLocations);

        const allEquipment = [
          ...new Set(roomList.flatMap((room) => room.equipment)),
        ].sort();
        setEquipmentOptions(allEquipment);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    setSelectedFilters((prev) => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, value]
        : prev.equipment.filter((eq) => eq !== value),
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({ location: "", type: "", equipment: [] });
  };

  const openReservationModal = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
    setSelectedDate("");
    setIsRecurring(false);
  };

  const closeReservationModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    setSelectedDate("");
    setSelectedTime("09:00 - 10:00");
    setIsRecurring(false);
  };

  const openIssueModal = () => {
    setIssueModalOpen(true);
    setIssueText("");
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
    setIssueText("");
  };

  const submitIssue = async () => {
    if (!issueText.trim()) {
      alert("Please enter a description of the issue.");
      return;
    }

    try {
      await addDoc(collection(db, "issues"), {
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        location: selectedRoom.location,
        issue: issueText,
        reportedBy: user.email,
        timestamp: new Date().toISOString(),
      });

      alert("Issue reported successfully.");
      closeIssueModal();
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert("Failed to submit the issue.");
    }
  };

  const addReminder = async (roomId, date, time) => {
    try {
      const remindersRef = collection(db, "reminders");
      await addDoc(remindersRef, { roomId, email: user.email, date, time });
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const handleReserve = async () => {
    if (!user || !selectedRoom || !selectedDate || !selectedTime) {
      alert("Please complete all required fields.");
      return;
    }

    const userEmail = user.email;
    const today = new Date();
    const minBookingDate = new Date(today);
    minBookingDate.setDate(today.getDate() + 6);
    const selectedDateObj = new Date(selectedDate);

    if (selectedDateObj < minBookingDate) {
      alert("You can only book a room 7 days or more in advance.");
      return;
    }

    try {
      const bookingDates = isRecurring
        ? Array.from({ length: 4 }, (_, i) => {
            const newDate = new Date(selectedDateObj);
            newDate.setDate(newDate.getDate() + i * 7);
            return newDate.toISOString().split("T")[0];
          })
        : [selectedDate];

      for (const bookingDate of bookingDates) {
        const bookingRef = collection(db, "rooms", selectedRoom.id, "bookings");
        const existingQuery = query(
          bookingRef,
          where("date", "==", bookingDate),
          where("time", "==", selectedTime)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
          if (!isRecurring) {
            const wantsNotification = window.confirm(
              "This time slot is already booked. Would you like to receive an email if it becomes available?"
            );
            if (wantsNotification) {
              await addReminder(selectedRoom.id, bookingDate, selectedTime);
              alert("You will be notified if it becomes available.");
            }
            return;
          } else {
            alert(`Could not book ${bookingDate} because it is already taken.`);
            continue;
          }
        }

        await addDoc(bookingRef, {
          roomName: selectedRoom.name,
          location: selectedRoom.location,
          date: bookingDate,
          time: selectedTime,
          email: userEmail,
          status: "Pending",
        });

        await emailjs.send(
          "service_p7qb2fi",
          "template_whfon5g",
          {
            user_email: userEmail,
            room_name: selectedRoom.name,
            room_location: selectedRoom.location,
            booking_date: bookingDate,
            booking_time: selectedTime,
            status: "Pending Approval",
          },
          "q6N2whZUsNxvfV7sr"
        );
      }

      alert("Booking(s) submitted successfully!");
      closeReservationModal();
    } catch (error) {
      console.error("Error reserving room:", error);
      alert("Failed to reserve room.");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      (!selectedFilters.location ||
        room.location === selectedFilters.location) &&
      (!selectedFilters.type || room.type === selectedFilters.type) &&
      (!selectedFilters.equipment.length ||
        selectedFilters.equipment.every((eq) => room.equipment.includes(eq)))
    );
  });

  return (
    <>
      <PatronHeader />
      <div className="patron-dashboard-container">
        <div className="filter-sidebar">
          <h3>Filters</h3>

          <label>Location:</label>
          <select
            name="location"
            value={selectedFilters.location}
            onChange={handleFilterChange}
          >
            <option value="">Any</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <label>Room Type:</label>
          <select
            name="type"
            value={selectedFilters.type}
            onChange={handleFilterChange}
          >
            <option value="">Any</option>
            <option value="Study Room">Study Room</option>
            <option value="Meeting Room">Meeting Room</option>
          </select>
          <label>Equipment:</label>
          <div className="equipment-filter">
            {equipmentOptions.map((eq, index) => (
              <div key={index} className="equipment-option">
                <input
                  type="checkbox"
                  value={eq}
                  checked={selectedFilters.equipment.includes(eq)}
                  onChange={handleEquipmentChange}
                />
                <label>{eq}</label>
              </div>
            ))}
          </div>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="main-content">
          <h2>Patron Dashboard</h2>
          <div className="room-grid">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <div key={room.id} className="room-card">
                  <h3>{room.name}</h3>
                  <p>
                    <b>Capacity:</b> {room.capacity} people
                  </p>
                  <p>
                    <b>Equipment:</b> {room.equipment.join(", ")}
                  </p>
                  <p>
                    <b>Location:</b> {room.location}
                  </p>
                  <button
                    type="button"
                    className="reserve-btn"
                    onClick={() => openReservationModal(room)}
                  >
                    Reserve Room
                  </button>
                </div>
              ))
            ) : (
              <p className="no-results">
                No rooms match your search or filters.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {modalOpen && selectedRoom && (
        <div className="modal-overlay" onClick={closeReservationModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeReservationModal}>
              &times;
            </button>
            <h3>{selectedRoom.name}</h3>
            <p>{selectedRoom.location}</p>
            <p>{selectedRoom.capacity} people</p>
            <p>Available Equipment: {selectedRoom.equipment.join(", ")}</p>

            <form>
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={
                  new Date(new Date().setDate(new Date().getDate() + 7))
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
              <label>Select Time:</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                {[...Array(8)].map((_, i) => {
                  const hour = 9 + i;
                  const start = `${String(hour).padStart(2, "0")}:00`;
                  const end = `${String(hour + 1).padStart(2, "0")}:00`;
                  return (
                    <option key={`${start}-${end}`} value={`${start}-${end}`}>
                      {start} - {end}
                    </option>
                  );
                })}
              </select>

              <label>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />{" "}
                Repeat this reservation weekly for 4 weeks
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="reserve-btn"
                  onClick={handleReserve}
                >
                  Reserve Now
                </button>
                <button
                  type="button"
                  className="reserve-btn"
                  onClick={openIssueModal}
                >
                  Report an Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModalOpen && (
        <div className="modal-overlay" onClick={closeIssueModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeIssueModal}>
              &times;
            </button>
            <h3>Report an Issue - {selectedRoom?.name}</h3>
            <textarea
              rows="5"
              placeholder="Describe the issue with this room..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <button className="reserve-btn" onClick={submitIssue}>
              Submit Issue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatronDashboard;
