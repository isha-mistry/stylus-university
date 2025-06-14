import { connectDB } from "@/config/connectDB";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse, NextRequest } from "next/server";
import { io } from "socket.io-client";
import { BASE_URL, SOCKET_BASE_URL } from "@/config/constants";
import {
  formatSlotDateAndTime,
  getDisplayNameOrAddr,
} from "@/utils/NotificationUtils";
import { imageCIDs } from "@/config/staticDataUtils";
import { SessionInterface } from "@/types/MeetingTypes";
import { cacheWrapper } from "@/utils/cacheWrapper";

function getRandomElementFromArray(arr: any[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export async function POST(req: NextRequest) {
  const {
    host_address,
    attendees,
    slot_time,
    meetingId,
    meeting_status,
    host_joined_status,
    booking_status,
    title,
    description,
    thumbnail_image,
    session_type,
  }: SessionInterface = await req.json();

  try {
    const client = await connectDB();

    const db = client.db();
    const collection = db.collection("sessions");

    const randomImage = getRandomElementFromArray(imageCIDs);

    const result = await collection.insertOne({
      host_address,
      attendees,
      slot_time,
      meetingId,
      meeting_status,
      host_joined_status,
      booking_status,
      title,
      description,
      thumbnail_image: randomImage,
      session_type,
    });

    if (result.insertedId) {
      const insertedDocument = await collection.findOne({
        _id: result.insertedId,
      });

      const delegateCollection = db.collection("users");

      const localSlotTime = await formatSlotDateAndTime({
        dateInput: slot_time,
      });

      if (session_type === "session") {
        const guestAddress = attendees[0].attendee_address;
        const userENSNameOrAddress = await getDisplayNameOrAddr(guestAddress);
        const hostENSNameOrAddress = await getDisplayNameOrAddr(host_address);
        const notificationToHost = {
          receiver_address: host_address,
          content: `Great news! 🎉 ${userENSNameOrAddress} has just booked a session with you. The session is scheduled on ${localSlotTime} UTC and will focus on ${title}.`,
          createdAt: Date.now(),
          read_status: false,
          notification_name: "newBookingForHost",
          notification_title: "Session Booking",
          notification_type: "newBooking",
        };

        const notificationToGuest = {
          receiver_address: guestAddress,
          content: `Congratulations! 🎉 Your session titled "${title}" has been successfully booked with ${hostENSNameOrAddress}. The session will take place on ${localSlotTime} UTC.`,
          createdAt: Date.now(),
          read_status: false,
          notification_name: "newBookingForGuest",
          notification_title: "Session Booking",
          notification_type: "newBooking",
        };

        const notificationCollection = db.collection("notifications");

        const notificationResults = await notificationCollection.insertMany([
          notificationToHost,
          notificationToGuest,
        ]);

        if (notificationResults.insertedCount === 2) {
          const insertedNotifications = await notificationCollection
            .find({
              _id: { $in: Object.values(notificationResults.insertedIds) },
            })
            .toArray();
        }
        const dataToSendHost = {
          ...notificationToHost,
          _id: notificationResults.insertedIds[0],
        };
        const dataToSendGuest = {
          ...notificationToGuest,
          _id: notificationResults.insertedIds[1],
        };

        const attendee_address = guestAddress;

        const socket = io(`${SOCKET_BASE_URL}`, {
          withCredentials: true,
        });
        socket.on("connect", () => {
          console.log("Connected to WebSocket server from API");
          socket.emit("new_session", {
            host_address,
            dataToSendHost,
            attendee_address,
            dataToSendGuest,
          });
          console.log("Message sent from API to socket server");
          socket.disconnect();
        });

        socket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err);
        });

        socket.on("error", (err) => {
          console.error("WebSocket error:", err);
        });
      }

      client.close();
      // console.log("Inserted document retrieved");
      return NextResponse.json(
        { success: true, result: insertedDocument },
        { status: 200 }
      );
    } else {
      client.close();
      return NextResponse.json(
        { error: "Failed to retrieve inserted document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error storing meeting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
