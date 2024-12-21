import { ActivityIndicator, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useDriverStore, useLocationStore } from "@/store";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { Driver, MarkerData } from "@/types/type";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [region, setRegion] = useState(null);

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (userLatitude && userLongitude) {
      const calculatedRegion = calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      });
      setRegion(calculatedRegion);
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers]);

  if (!region) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error:{error}</Text>
      </View>
    );
  }

  return (
    <View className="w-full h-full rounded-2xl overflow-hidden">
      <MapView
        provider={PROVIDER_DEFAULT}
        tintColor="black"
        mapType="standard"
        showsPointsOfInterest={false}
        initialRegion={region}
        showsUserLocation={true}
        userInterfaceStyle="light"
        style={{ width: "100%", height: "100%" }}
        onMapReady={() => setMarkers((prev) => [...prev])}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={
              selectedDriver === marker.id ? icons.selectedMarker : icons.marker
            }
          />
        ))}
      </MapView>
    </View>
  );
};

export default Map;
