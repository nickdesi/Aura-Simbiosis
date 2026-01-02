"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LogisticsMap.module.css";

// Fix Leaflet default icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface LogisticsMapProps {
    activeTab: string;
}

// Key locations on Clermont-Vichy axis
const locations = {
    clermontCenter: { lat: 45.7772, lng: 3.0870, name: "Clermont-Ferrand Centre" },
    vichy: { lat: 46.1277, lng: 3.4260, name: "Vichy" },
    riom: { lat: 45.8939, lng: 3.1147, name: "Riom" },
    brezet: { lat: 45.7850, lng: 3.1150, name: "ZA Brézet" },
    cataroux: { lat: 45.7650, lng: 3.0950, name: "Cataroux (Michelin)" },
    montpertuis: { lat: 45.7900, lng: 3.1400, name: "ZI Montpertuis" },
    prPardieu: { lat: 45.7600, lng: 3.1300, name: "P+R Pardieu" },
    prVergnes: { lat: 45.7950, lng: 3.0750, name: "P+R Les Vergnes" },
};

export default function LogisticsMap({ activeTab }: LogisticsMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize map centered between Clermont and Vichy
        mapRef.current = L.map(containerRef.current, {
            center: [45.9, 3.25],
            zoom: 10,
            zoomControl: false,
            attributionControl: false,
        });

        // Dark tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
        }).addTo(mapRef.current);

        // Add zoom control to bottom right
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                mapRef.current?.removeLayer(layer);
            }
        });

        // Add markers based on active tab
        if (activeTab === "covoiturage") {
            // Show main cities on the axis
            [locations.clermontCenter, locations.vichy, locations.riom].forEach((loc) => {
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 8,
                    fillColor: "#00d9ff",
                    color: "#00d9ff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6,
                })
                    .bindPopup(`<b>${loc.name}</b>`)
                    .addTo(mapRef.current!);
            });
        } else if (activeTab === "colisage") {
            // Show industrial zones
            [locations.brezet, locations.cataroux, locations.montpertuis].forEach((loc) => {
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 10,
                    fillColor: "#22c55e",
                    color: "#22c55e",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6,
                })
                    .bindPopup(`<b>${loc.name}</b><br/>Zone industrielle`)
                    .addTo(mapRef.current!);
            });
        } else if (activeTab === "zfe") {
            // Show ZFE zone (approximate circle around Clermont center)
            L.circle([locations.clermontCenter.lat, locations.clermontCenter.lng], {
                radius: 5000,
                fillColor: "#f97316",
                color: "#f97316",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.15,
            })
                .bindPopup("<b>Zone ZFE Clermont-Ferrand</b>")
                .addTo(mapRef.current!);

            // Show P+R
            [locations.prPardieu, locations.prVergnes].forEach((loc) => {
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 8,
                    fillColor: "#22c55e",
                    color: "#22c55e",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                })
                    .bindPopup(`<b>${loc.name}</b><br/>Parking Relais Gratuit`)
                    .addTo(mapRef.current!);
            });
        }
    }, [activeTab]);

    return <div ref={containerRef} className={styles.map} />;
}
