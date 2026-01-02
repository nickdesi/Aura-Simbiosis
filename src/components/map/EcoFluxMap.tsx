"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LogisticsMap.module.css";

interface Resource {
    id: number;
    company: string;
    type: "dechet" | "chaleur" | "materiau";
    title: string;
    zone: string;
    lat?: number;
    lng?: number;
}

export interface EcoFluxMapProps {
    resources: Resource[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

// Zone coordinates
const zones: Record<string, { lat: number; lng: number }> = {
    "ZA Brézet": { lat: 45.7850, lng: 3.1150 },
    "Cataroux": { lat: 45.7650, lng: 3.0950 },
    "ZI Montpertuis": { lat: 45.7900, lng: 3.1400 },
};

const typeColors = {
    dechet: "#22c55e",
    chaleur: "#f97316",
    materiau: "#00d9ff",
};

export default function EcoFluxMap({ resources, selectedId, onSelect }: EcoFluxMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.CircleMarker[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current, {
            center: [45.78, 3.10],
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
        }).addTo(mapRef.current);

        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add markers for each resource
        resources.forEach((resource) => {
            let lat, lng;

            if (resource.lat && resource.lng) {
                // Use real coordinates
                lat = resource.lat;
                lng = resource.lng;
            } else {
                // Fallback to zone coordinates with jitter
                const zoneCoords = zones[resource.zone];
                if (!zoneCoords) return;
                const jitter = () => (Math.random() - 0.5) * 0.008;
                lat = zoneCoords.lat + jitter();
                lng = zoneCoords.lng + jitter();
            }

            const color = typeColors[resource.type];
            const isSelected = resource.id === selectedId;

            const marker = L.circleMarker([lat, lng], {
                radius: isSelected ? 12 : 8,
                fillColor: color,
                color: color,
                weight: isSelected ? 3 : 2,
                opacity: 1,
                fillOpacity: isSelected ? 0.9 : 0.6,
            })
                .bindPopup(`<b>${resource.company}</b><br/>${resource.title}`)
                .on("click", () => onSelect(resource.id))
                .addTo(mapRef.current!);

            markersRef.current.push(marker);
        });
    }, [resources, selectedId, onSelect]);

    return <div ref={containerRef} className={styles.map} />;
}
