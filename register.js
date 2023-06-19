const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@thewebguyy123!',
  database: 'Teenspray', // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Jehoshaphatministries@gmail.com',
    pass: 'Jehoshaphat16',
  },
});

// Function to send the email with the ticket
async function sendTicketEmail(participant) {
  try {
    // Set the email content
    const ticketContent = `
      <h1>Event Ticket</h1>
      <p>Dear ${participant.firstName},</p>
      <p>Thank you for registering for the event! Below are your ticket details:</p>
      <ul>
        <li>Name: ${participant.firstName} ${participant.lastName}</li>
        <li>Age: ${participant.age}</li>
        <li>Gender: ${participant.gender}</li>
        <li>Email: ${participant.email}</li>
        <li>Phone Number: ${participant.phoneNumber}</li>
        <li>Unique ID: ${participant.uniqueID}</li>
      </ul>
      <p>Please present this ticket during check-in at the event.</p>
      <p>Best regards,</p>
      <p>Teens Pray!</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: 'Jehoshaphatministries@gmail.com',
      to: participant.email,
      subject: 'Your Event Ticket',
      html: ticketContent,
    });

    // Return true if the email was sent successfully
    return true;
  } catch (error) {
    // Return false if there was an error sending the email
    return false;
  }
}

// Handle form submission
app.post('/register', async (req, res) => {
  // Retrieve form data
  const { firstName, lastName, email, phoneNumber, age, gender } = req.body;

  // Generate a unique ID
  const uniqueID = generateUniqueID();

  // Prepare the participant data for the email
  const participant = {
    firstName,
    lastName,
    email,
    phoneNumber,
    age,
    gender,
    uniqueID,
  };

  // Insert participant data into the database
  const query = 'INSERT INTO registrations (name, email, phone, gender, age) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [`${firstName} ${lastName}`, email, phoneNumber, gender, age], (err) => {
    if (err) {
      console.error('Error inserting participant data into the database:', err);
      res.send('Registration failed. Please try again later.');
    } else {
      // Send the ticket email
      sendTicketEmail(participant)
        .then(() => {
          res.send('Registration successful. Please check your email for the ticket.');
        })
        .catch(() => {
          res.send('Registration successful, but there was an error sending the ticket email.');
        });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
