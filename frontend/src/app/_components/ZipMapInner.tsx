"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

type ZipMapInnerProps = {
  selectedZip: string | null; // e.g. "02119"
};

export default function ZipMapInner({ selectedZip }: ZipMapInnerProps) {
  const [geoData, setGeoData] = useState<any | null>(null);

  // Change this to match your GeoJSON's ZIP field name, e.g. "ZIP5" or "ZCTA5CE10"
  const ZIP_PROP = "ZIP5";

  useEffect(() => {
    fetch("/boston_zipcodes.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => {
        console.error("Failed to load GeoJSON", err);
      });
  }, []);

  const style = (feature: any) => {
    const zip = feature.properties[ZIP_PROP];
    const isSelected = selectedZip && zip === selectedZip;

    return {
      fillColor: isSelected ? "red" : "lightgray",
      color: "#000",
      weight: isSelected ? 2 : 1,
      fillOpacity: isSelected ? 0.6 : 0.15,
    };
  };

  return (
    <MapContainer
    // @ts-ignore
      center={[42.3601, -71.0589]} // Boston
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* @ts-ignore */}
      {geoData && <GeoJSON data={geoData} style={style} />}
    </MapContainer>
  );
}
