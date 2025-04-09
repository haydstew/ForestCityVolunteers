import React, { useState } from "react";
import "./FAQ.scss";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const FAQ = () => {
  // This is sample FAQ data, we will change this in sprint 3 if needed
  const faqs = [
    {
      question: "How do I book a room?",
      answer:
        "To book a room, go to the homepage and login as a library patron. Click on a room to view more details, then click reserve now to book the room.",
    },
    {
      question: "How can I check my past and upcoming reservations?",
      answer:
        "You can view all your past and upcoming reservations in your profile page under 'Profile'.",
    },
    {
      question: "Can I cancel a reservation?",
      answer:
        "Yes, you can cancel a reservation by going to 'Profile' and selecting 'Cancel' next to the booking you wish to cancel.",
    },
    {
      question: "How do I know if a room is available?",
      answer:
        "Use filters in the booking page to check room availability based on date and features.",
    },
    {
      question: "Can a librarian deny my booking request?",
      answer:
        "Yes, librarians have the ability to approve or deny room requests. You will receive a notification if your request is denied.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <Header />
      <div className="faq-content">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.question}
                <span>{openIndex === index ? "▲" : "▼"}</span>
              </button>
              {openIndex === index && (
                <p className="faq-answer">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
