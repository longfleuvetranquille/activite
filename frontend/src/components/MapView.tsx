"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/types";

interface MapViewProps {
  events: Event[];
}

// Default center on Nice, France
const NICE_CENTER: [number, number] = [43.7102, 7.262];
const DEFAULT_ZOOM = 13;

export default function MapView({ events }: MapViewProps) {
  const [mapReady, setMapReady] = useState(false);

  // Only render on client side (Leaflet requires window)
  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500">Chargement de la carte...</p>
      </div>
    );
  }

  return <MapContent events={events} />;
}

function MapContent({ events }: MapViewProps) {
  // Dynamic import for leaflet components (SSR-safe)
  const [LeafletComponents, setLeafletComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
    Tooltip: any;
  } | null>(null);

  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    async function loadLeaflet() {
      const L = await import("leaflet");
      const RL = await import("react-leaflet");

      // Fix default marker icon issue with webpack
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });

      setIcon(defaultIcon);
      setLeafletComponents({
        MapContainer: RL.MapContainer,
        TileLayer: RL.TileLayer,
        Marker: RL.Marker,
        Popup: RL.Popup,
        Tooltip: RL.Tooltip,
      });
    }

    loadLeaflet();
  }, []);

  if (!LeafletComponents || !icon) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500">Chargement de la carte...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Tooltip } =
    LeafletComponents;

  // Calculate center from events, or default to Nice
  const eventsWithCoords = events.filter((e) => e.latitude && e.longitude);
  const center: [number, number] =
    eventsWithCoords.length > 0
      ? [eventsWithCoords[0].latitude!, eventsWithCoords[0].longitude!]
      : NICE_CENTER;

  const zoom = eventsWithCoords.length === 1 ? 15 : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {eventsWithCoords.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude!, event.longitude!]}
          icon={icon}
        >
          <Tooltip direction="top" offset={[0, -35]}>
            <div className="text-center">
              <p className="font-semibold text-slate-900">{event.title}</p>
              {event.location_name && (
                <p className="text-xs text-slate-500">{event.location_name}</p>
              )}
            </div>
          </Tooltip>
          <Popup>
            <div className="max-w-[200px]">
              <p className="mb-1 font-semibold text-slate-900">{event.title}</p>
              {event.location_name && (
                <p className="mb-1 text-xs text-slate-600">
                  {event.location_name}
                </p>
              )}
              {event.location_address && (
                <p className="text-xs text-slate-500">
                  {event.location_address}
                </p>
              )}
              <a
                href={`/event/${event.id}`}
                className="mt-2 inline-block text-xs font-medium text-azur-600 hover:underline"
              >
                Voir les details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
