"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";

const ZIP_PROP = "ZIP5";

type ZipMapInnerProps = {
  selectedZip: string | null; // e.g. "02119"
};

export default function ZipMapInner({ selectedZip }: ZipMapInnerProps) {
  const [geoData, setGeoData] = useState<any | null>(null);

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
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* @ts-ignore */}
      {geoData && <GeoJSON data={geoData} style={style} />}
    </MapContainer>
  );
}

function ZoomableGeoJSON({ data, selectedZip }: { data: any; selectedZip: string | null }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  const style = (feature: any) => {
    const isSelected = selectedZip && feature.properties["ZIP5"] === selectedZip;

    return {
      fillColor: isSelected ? "red" : "lightgray",
      color: "#000",
      weight: isSelected ? 2 : 1,
      fillOpacity: isSelected ? 0.6 : 0.15,
    };
  };

  useEffect(() => {
    if (!layerRef.current || !selectedZip) return;

    const layer = layerRef.current;
    let selectedLayer: any = null;

    layer.eachLayer((l: any) => {
      if (l.feature?.properties?.[ZIP_PROP] === selectedZip) {
        selectedLayer = l;
      }
    });

    if (selectedLayer) {
      map.fitBounds(selectedLayer.getBounds(), {
        padding: [30, 30],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [selectedZip, map]);

  {/* @ts-ignore */}
  return <GeoJSON data={data} style={style} ref={layerRef} />;
}
