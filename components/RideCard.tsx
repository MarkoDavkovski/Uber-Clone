import { View, Text, Image } from "react-native";
import React, { useMemo } from "react";
import { Ride } from "@/types/type";
import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";

const InfoRow = ({
  label,
  value,
  highlightValue = false,
}: {
  label: string;
  value: number | string;
  highlightValue?: boolean;
}) => (
  <View className="flex flex-row items-center w-full justify-between mb-5">
    <Text className="text-md font-JakartaMedium text-gray-500">{label}</Text>
    <Text
      className={`text-md font-JakartaMedium ${
        highlightValue
          ? value === "paid"
            ? "text-green-500"
            : "text-red-500"
          : "text-gray-500"
      } ${highlightValue ? "capitalize" : ""}`}>
      {value}
    </Text>
  </View>
);

const RideCard = ({
  ride: {
    destination_longitude,
    destination_latitude,
    origin_address,
    destination_address,
    created_at,
    ride_time,
    driver,
    payment_status,
  },
}: {
  ride: Ride;
}) => {
  const mapImageUrl = useMemo(
    () =>
      `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${destination_longitude},${destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
    [destination_longitude, destination_latitude]
  );

  const safeDriverFirstName = driver?.first_name || "Unknown";
  const safeDriverLastName = driver?.last_name || "";
  const safeCarSeats = driver?.car_seats ?? 0;

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: mapImageUrl,
            }}
            className="w-[80px] h-[90px] rounded-lg"
            accessibilityLabel={`Map for ride to ${destination_address}`}
            accessible={true}
          />
          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text
                className="text-md font-JakartaMedium"
                numberOfLines={1}
                accessibilityLabel={`Origin address: ${origin_address}`}>
                {origin_address}
              </Text>
            </View>
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {destination_address}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <InfoRow
            label="Date & Time"
            value={`${formatDate(created_at)} ${formatTime(ride_time)}`}
          />
          <InfoRow
            label="Driver"
            value={`${safeDriverFirstName} ${safeDriverLastName}`}
          />
          <InfoRow label="Car Seats" value={safeCarSeats} />
          <InfoRow
            label="Payment Status"
            value={payment_status}
            highlightValue
          />
        </View>
      </View>
    </View>
  );
};

export default RideCard;
