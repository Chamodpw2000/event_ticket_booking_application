import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import PDFDocument from "pdfkit";

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/+$/, "");

const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

// Helper to generate PDF in memory and return a Buffer
const createPdfBuffer = async (ticketData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Design the ticket
    doc.fontSize(25).text("Event Ticket", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Ticket Code: ${ticketData.ticketCode}`);
    doc.text(`Event ID: ${ticketData.eventId}`);
    doc.text(`Ticket Type ID: ${ticketData.ticketTypeId}`);
    doc.text(`Booking ID: ${ticketData.bookingId}`);
    doc.text(`User ID: ${ticketData.userId}`);
    doc.moveDown();
    doc.fontSize(10).text("Thank you for your purchase!", { align: "center" });
    
    doc.end();
  });
};

export const handler = async (event) => {
  console.log("Received SQS event:", JSON.stringify(event));

  const bookingServiceUrl = normalizeBaseUrl(requireEnv("BOOKING_SERVICE_URL"));
  const userServiceUrl = normalizeBaseUrl(requireEnv("USER_SERVICE_URL"));
  const bucketName = requireEnv("S3_TICKET_BUCKET_NAME");
  const senderEmail = requireEnv("SES_SENDER_EMAIL");

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      const { bookingId, userId } = payload;

      if (!bookingId || !userId) {
        throw new Error("Missing bookingId or userId in payload");
      }

      // 1. Fetch User Details
      const userRes = await fetch(`${userServiceUrl}/users/${userId}`);
      if (!userRes.ok) throw new Error(`Failed to fetch user: ${userRes.status}`);
      const userData = await userRes.json();
      const userEmail = userData.email;

      // 2. Fetch Booking Details (with items)
      const bookingRes = await fetch(`${bookingServiceUrl}/bookings/${bookingId}/details`);
      if (!bookingRes.ok) throw new Error(`Failed to fetch booking details: ${bookingRes.status}`);
      const { booking } = await bookingRes.json();

      if (!booking || !booking.items) {
        throw new Error("Invalid booking data or missing items");
      }

      const ticketsToCreate = [];
      const s3Urls = [];

      // 3. Generate Tickets
      for (const item of booking.items) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketCode = `TKT-${bookingId}-${item.ticketTypeId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          const ticketData = {
            bookingId,
            userId,
            eventId: booking.eventId,
            ticketCode,
            ticketTypeId: item.ticketTypeId,
          };

          // Generate PDF Buffer
          const pdfBuffer = await createPdfBuffer(ticketData);

          // Upload to S3
          const s3Key = `tickets/booking-${bookingId}/${ticketCode}.pdf`;
          await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: "application/pdf",
          }));

          const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
          s3Urls.push(s3Url);

          ticketsToCreate.push({
            ...ticketData,
            s3Url,
          });
        }
      }

      // 4. Save Tickets to Database
      const createTicketsRes = await fetch(`${bookingServiceUrl}/bookings/${bookingId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: ticketsToCreate }),
      });

      if (!createTicketsRes.ok) {
        const errText = await createTicketsRes.text();
        throw new Error(`Failed to save tickets in DB: ${createTicketsRes.status} - ${errText}`);
      }

      // 5. Send Email
      let emailBody = `Hello,\n\nYour booking (ID: ${bookingId}) is confirmed! Here are your ticket links:\n\n`;
      s3Urls.forEach((url, index) => {
        emailBody += `Ticket ${index + 1}: ${url}\n`;
      });
      emailBody += `\nEnjoy the event!`;

      await sesClient.send(new SendEmailCommand({
        Source: senderEmail,
        Destination: { ToAddresses: [userEmail] },
        Message: {
          Subject: { Data: `Your Tickets for Booking #${bookingId}` },
          Body: {
            Text: { Data: emailBody }
          }
        }
      }));

      console.log(`Successfully processed ticket generation for booking ${bookingId}`);

    } catch (error) {
      console.error("Error processing record:", error);
      throw error; // Throwing ensures SQS retries or moves to DLQ
    }
  }

  return { status: "Success" };
};
