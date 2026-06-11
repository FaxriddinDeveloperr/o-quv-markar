"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
}

// Markaz markeri (binafsha pin)
const centerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#7c3aed,#a855f7);
    transform:rotate(-45deg);
    box-shadow:0 3px 8px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;">
    <div style="width:11px;height:11px;border-radius:50%;background:#fff;transform:rotate(45deg)"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Foydalanuvchi joylashuvi (ko'k nuqta)
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#3b82f6;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(59,130,246,.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({
  markers,
  user,
}: {
  markers: MapMarker[];
  user?: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = markers.map((m) => [m.lat, m.lng]);
    if (user) pts.push(user);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(pts).pad(0.2));
    }
  }, [map, markers, user]);
  return null;
}

export default function MapView({
  markers,
  userLocation,
  center,
  zoom = 12,
  height = "100%",
  fit = true,
  renderPopup,
}: {
  markers: MapMarker[];
  userLocation?: [number, number] | null;
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  fit?: boolean;
  renderPopup?: (m: MapMarker) => React.ReactNode;
}) {
  const initialCenter = useMemo<[number, number]>(
    () =>
      center ??
      userLocation ??
      (markers[0] ? [markers[0].lat, markers[0].lng] : [41.3111, 69.2797]),
    [center, userLocation, markers],
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
      scrollWheelZoom
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fit && <FitBounds markers={markers} user={userLocation} />}

      {userLocation && <Marker position={userLocation} icon={userIcon} />}

      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={centerIcon}>
          <Popup>
            {renderPopup ? (
              renderPopup(m)
            ) : (
              <div>
                <strong>{m.title}</strong>
                {m.subtitle && (
                  <div style={{ color: "#666" }}>{m.subtitle}</div>
                )}
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
