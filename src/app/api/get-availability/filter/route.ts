import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { DateTime } from "luxon";

interface Type {
  ensName: string;
  dao_name: string;
  userAddress: string;
  timeSlotSizeMinutes: number;
  allowedDates: string[];
  dateAndRanges: {
    date: string;
    timeRanges: [string, string, string, string][];
    formattedUTCTime_startTime: string;
    utcTime_startTime: string;
    formattedUTCTime_endTime: string;
    utcTime_endTime: string;
  }[];
}

export async function POST(req: NextRequest, res: NextResponse<Type[]>) {
  try {
    const { dao_name, date, startTime, endTime } = await req.json();

    const client = await connectDB();

    const db = client.db();
    const collection = db.collection("scheduling");
    const delegatesCollection = db.collection("users");
    const meetingsCollection = db.collection("sessions");

    // const newDate = new Date().toISOString().split("T")[0];

    const currentDate = new Date();
    let newDate = currentDate.toLocaleDateString();
    if (newDate.length !== 10 || !newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      newDate = `${year}-${month}-${day}`;
    }
    // console.log("currentDate", newDate);
    const startDateTime = startTime
      ? DateTime.fromFormat(
          `${date ? date : newDate} ${startTime}:00`,
          "yyyy-MM-dd HH:mm:ss"
        )
      : null;

    const endDateTime = endTime
      ? DateTime.fromFormat(
          `${date ? date : newDate} ${endTime}:00`,
          "yyyy-MM-dd HH:mm:ss"
        )
      : null;

    // Check if startDateTime and endDateTime are not null before calling toISO()
    const utcStartDateTime = startDateTime
      ? startDateTime.toUTC().toISO()
      : null;
    const utcEndDateTime = endDateTime ? endDateTime.toUTC().toISO() : null;

    let startTimeToSend;
    let endTimeToSend;

    // Check if utcStartDateTime and utcEndDateTime are not null before further processing
    if (utcStartDateTime && utcEndDateTime) {
      startTimeToSend = utcStartDateTime.split("T")[1].substring(0, 5);
      endTimeToSend = utcEndDateTime.split("T")[1].substring(0, 5);
    }

    let query: any = {
      "dateAndRanges.date": { $gte: newDate },
    };

    if (dao_name !== null) query.dao_name = dao_name;
    if (date !== null) query["dateAndRanges.date"] = date;

    const sessionData = await collection.find(query).toArray();

    sessionData.forEach((session: any) => {
      session.dateAndRanges = session.dateAndRanges.filter((dateRange: any) => {
        return new Date(dateRange.date) >= new Date(newDate);
      });
    });

    // Filter out sessions that have no dateAndRanges left
    let finalSessionData = sessionData.filter(
      (session) => session.dateAndRanges.length > 0
    );

    // If both startTime and endTime are provided, apply additional filtering
    if (startTime !== null && endTime !== null) {
      finalSessionData = finalSessionData.filter((session) => {
        return session.dateAndRanges.some((dateRange: any) => {
          return (
            new Date(dateRange.date) >= new Date(date ? date : newDate) &&
            dateRange.utcTime_startTime <= endTime! &&
            dateRange.utcTime_endTime >= startTime!
          );
        });
      });
    }

    if (startTime !== null && endTime === null) {
      finalSessionData = finalSessionData.filter((session) => {
        return session.dateAndRanges.some((dateRange: any) => {
          return (
            new Date(dateRange.date) >= new Date(date ? date : newDate) &&
            dateRange.utcTime_startTime <= startTime! &&
            dateRange.utcTime_endTime >= startTime!
          );
        });
      });
    }
    if (startTime === null && endTime !== null) {
      finalSessionData = finalSessionData.filter((session) => {
        return session.dateAndRanges.some((dateRange: any) => {
          return (
            new Date(dateRange.date) >= new Date(date ? date : newDate) &&
            dateRange.utcTime_startTime <= endTime! &&
            dateRange.utcTime_endTime >= endTime!
          );
        });
      });
    }

    // Iterate through each meeting document
    const mergedData = await Promise.all(
      finalSessionData.map(async (session) => {
        // Extract address and dao_name from the meeting
        const { userAddress, dao_name } = session;

        // Query delegates collection based on address and dao_name
        const userInfo = await delegatesCollection
          .find({
            address: userAddress,
          })
          .toArray();

        const meetingsData = await meetingsCollection
          .find({ host_address: userAddress })
          .toArray();

        // Aggregate counts for uid_host and onchain_host_uid
        const counts = await meetingsCollection
          .aggregate([
            { $match: { host_address: userAddress } },
            {
              $group: {
                _id: null,
                offChainCount: {
                  $sum: { $cond: [{ $ifNull: ["$uid_host", false] }, 1, 0] },
                },
                onChainCount: {
                  $sum: {
                    $cond: [{ $ifNull: ["$onchain_host_uid", false] }, 1, 0],
                  },
                },
              },
            },
          ])
          .toArray();

        // Combine meetingsData and counts
        const meetingsInfo = {
          meetingsData,
          counts: counts[0] || { offChainCount: 0, onChainCount: 0 },
        };

        // Return merged data
        return { session, userInfo, meetingsInfo };
      })
    );

    client.close();

    return NextResponse.json(
      { success: true, data: mergedData, fetchedData: sessionData },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error fetching filtered Session Data in availability:`,
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
