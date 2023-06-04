<?php

// Include the necessary libraries
require 'vendor/autoload.php'; // Composer autoloader for libraries

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Function to generate a unique ID
function generateUniqueID()
{
    // Generate a unique ID using a combination of timestamp and a random number
    $uniqueID = time() . mt_rand(10000, 99999);
    return $uniqueID;
}

// Function to generate a QR code
function generateQRCode($data)
{
    // Generate a QR code using a QR code library
    // Example: PHP QR Code - https://github.com/t0k4rt/phpqrcode
    QRcode::png($data, 'path/to/qrcode.png'); // Save the QR code image to a file
}

// Function to send the email with the ticket
function sendTicketEmail($participant)
{
    // Create a new PHPMailer instance
    $mailer = new PHPMailer(true);

    try {
        // SMTP configuration
        $mailer->isSMTP();
        $mailer->Host = 'smtp.example.com';
        $mailer->SMTPAuth = true;
        $mailer->Username = 'your-email@example.com';
        $mailer->Password = 'your-email-password';
        $mailer->SMTPSecure = 'tls';
        $mailer->Port = 587;

        // Set the email details
        $mailer->setFrom('your-email@example.com', 'Your Name');
        $mailer->addAddress($participant['email'], $participant['first_name']);
        $mailer->isHTML(true);
        $mailer->Subject = 'Your Event Ticket';
        
        // Generate the ticket content
        $ticketContent = '
            <h1>Event Ticket</h1>
            <p>Dear ' . $participant['first_name'] . ',</p>
            <p>Thank you for registering for the event! Below are your ticket details:</p>
            <ul>
                <li>Name: ' . $participant['first_name'] . ' ' . $participant['last_name'] . '</li>
                <li>Age: ' . $participant['age'] . '</li>
                <li>Gender: ' . $participant['gender'] . '</li>
                <li>Email: ' . $participant['email'] . '</li>
                <li>Phone Number: ' . $participant['phone_number'] . '</li>
                <li>Unique ID: ' . $participant['unique_id'] . '</li>
            </ul>
            <p>Please present this ticket during check-in at the event.</p>
            <p>Best regards,</p>
            <p>Your Organization</p>';

        // Set the email content
        $mailer->Body = $ticketContent;

        // Add the QR code as an attachment (optional)
        // $mailer->addAttachment('path/to/qrcode.png', 'qrcode.png');

        // Send the email
        $mailer->send();

        // Return true if the email was sent successfully
        return true;
    } catch (Exception $e) {
        // Return false if there was an error sending the email
        return false;
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve form data
    $firstName = $_POST['first_name'];
    $lastName = $_POST['last_name'];
    $email = $_POST['email'];
    $phoneNumber = $_POST['phone_number'];
    $age = $_POST['age'];
    $gender = $_POST['gender'];

    // Generate unique ID and QR code
    $uniqueID = generateUniqueID();
    $participantData = [
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'phone_number' => $phoneNumber,
        'age' => $age,
        'gender' => $gender,
        'unique_id' => $uniqueID
    ];
    generateQRCode(json_encode($participantData));

    // Save participant data to the database (PostgreSQL)
    $connectionString = 'pgsql:host=localhost;dbname=your-database-name;user=your-username;password=your-password';
    try {
        $db = new PDO($connectionString);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $db->prepare('INSERT INTO participants (first_name, last_name, email, phone_number, age, gender, unique_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$firstName, $lastName, $email, $phoneNumber, $age, $gender, $uniqueID]);

        // Send the ticket email
        $emailSent = sendTicketEmail($participantData);

        // Display success message or handle any additional logic
        if ($emailSent) {
            echo 'Registration successful! An email with your ticket has been sent to your email address.';
        } else {
            echo 'Registration successful! Failed to send the email with your ticket. Please contact the event organizers for assistance.';
        }

        // Close the database connection
        $db = null;
    } catch (PDOException $e) {
        // Handle database connection or query errors
        echo 'An error occurred: ' . $e->getMessage();
    }
}
?>
