const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.post(
  '/register',
  [
    check('first_name').notEmpty().withMessage('First name is required'),
    check('last_name').notEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email'),
    check('phone_number').notEmpty().withMessage('Phone number is required'),
    check('age').notEmpty().withMessage('Age is required'),
    check('gender').notEmpty().withMessage('Gender is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name,
      last_name,
      email,
      phone_number,
      age,
      gender
    } = req.body;

    // Generate a unique ID
    const uniqueID = generateUniqueID();

    // Store participant data in the database

    // Send the ticket email
    const participant = {
      first_name,
      last_name,
      email,
      phone_number,
      age,
      gender,
      uniqueID
    };

    sendTicketEmail(participant)
      .then(() => {
        res.status(200).json({ message: 'Registration successful. Please check your email for the ticket.' });
      })
      .catch(() => {
        res.status(500).json({ message: 'Registration successful, but there was an error sending the ticket email.' });
      });
  }
);

// Function to generate a unique ID
function generateUniqueID() {
  // Logic to generate a unique ID, e.g., using a timestamp or a random string
  // Example: Generating a unique ID based on current timestamp
  const timestamp = new Date().getTime();
  const uniqueID = `ID-${timestamp}`;
  return uniqueID;
}

// Function to send the email with the ticket
async function sendTicketEmail(participant) {
  try {
    // Create a SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'Jehoshaphatministries@gmail.com',
        pass: 'Jehoshaphat16'
      }
    });

    // Email content
    const ticketContent = `
      <h1>Event Ticket</h1>
      <p>Dear ${participant.first_name},</p>
      <p>Thank you for registering for the event! Below are your ticket details:</p>
      <ul>
        <li>Name: ${participant.first_name} ${participant.last_name}</li>
        <li>Age: ${participant.age}</li>
        <li>Gender: ${participant.gender}</li>
        <li>Email: ${participant.email}</li>
        <li>Phone Number: ${participant.phone_number}</li>
        <li>Unique ID: ${participant.uniqueID}</li>
      </ul>
      <p>Please present this ticket during check-in at the event.</p>
      <p>Best regards,</p>
      <p>Teens Pray!</p>
    `;

    // Send email
    await transporter.sendMail({
      from: 'Jehoshaphatministries@gmail.com',
      to: participant.email,
      subject: 'Your Event Ticket',
      html: ticketContent
    });

    // Return true if the email was sent successfully
    return true;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    // Return false if there was an error sending the email
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
