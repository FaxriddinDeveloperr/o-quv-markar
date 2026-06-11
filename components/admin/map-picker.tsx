"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#7c3aed,#a855f7);
    transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;">
    <div style="width:10px;height:10px;border-radius:50%;background:#fff;transform:rotate(45deg)"></div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);
  return null;
}

// default export — dynamic import bilan ishlatiladi
export default function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [pos, setPos] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setPos([lat, lng]);
  }, [lat, lng]);

  const pick = (la: number, ln: number) => {
    setPos([la, ln]);
    onChange(la, ln);
  };

  return (
    <MapContainer
      center={pos}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={pick} />
      <Recenter lat={pos[0]} lng={pos[1]} />
      <Marker position={pos} icon={pinIcon} />
    </MapContainer>
  );
}
