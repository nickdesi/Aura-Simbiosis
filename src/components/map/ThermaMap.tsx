"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LogisticsMap.module.css";

export interface ThermaMapProps {
    activeTab: string;
    selectedParcoursId: number | null;
}

// Vichy area locations
const locations = {
    vichyCenter: { lat: 46.1277, lng: 3.4260 },
    parcSources: { lat: 46.1250, lng: 3.4200 },
    lacAllier: { lat: 46.1180, lng: 3.4280 },
    celestins: { lat: 46.1320, lng: 3.4180 },
    thermes: { lat: 46.1290, lng: 3.4230 },
    gare: { lat: 46.1240, lng: 3.4150 },
};

// Parcours paths (simplified)
const parcoursRoutes: Record<number, [number, number][]> = {
    1: [ // Boucle des Sources
        [46.1250, 3.4200],
        [46.1220, 3.4220],
        [46.1200, 3.4260],
        [46.1220, 3.4290],
        [46.1250, 3.4270],
        [46.1250, 3.4200],
    ],
    2: [ // Chemin du Parc
        [46.1260, 3.4180],
        [46.1250, 3.4200],
        [46.1230, 3.4230],
        [46.1250, 3.4260],
        [46.1280, 3.4240],
        [46.1260, 3.4180],
    ],
    3: [ // Montée Célestins
        [46.1277, 3.4260],
        [46.1290, 3.4230],
        [46.1310, 3.4200],
        [46.1330, 3.4180],
        [46.1350, 3.4150],
    ],
    4: [ // Tour du Lac
        [46.1277, 3.4260],
        [46.1220, 3.4280],
        [46.1180, 3.4280],
        [46.1150, 3.4260],
        [46.1140, 3.4220],
        [46.1160, 3.4180],
        [46.1200, 3.4170],
        [46.1250, 3.4200],
        [46.1277, 3.4260],
    ],
};

export default function ThermaMap({ activeTab, selectedParcoursId }: ThermaMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current, {
            center: [locations.vichyCenter.lat, locations.vichyCenter.lng],
            zoom: 14,
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

        // Clear existing layers (except tile layer)
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
                mapRef.current?.removeLayer(layer);
            }
        });

        if (activeTab === "airpur") {
            // Show air quality zones (green = good, yellow = moderate)
            L.circle([locations.parcSources.lat, locations.parcSources.lng], {
                radius: 400,
                fillColor: "#22c55e",
                color: "#22c55e",
                weight: 1,
                opacity: 0.6,
                fillOpacity: 0.2,
            })
                .bindPopup("<b>Parc des Sources</b><br/>Qualité de l'air: Excellente")
                .addTo(mapRef.current!);

            L.circle([locations.lacAllier.lat, locations.lacAllier.lng], {
                radius: 500,
                fillColor: "#22c55e",
                color: "#22c55e",
                weight: 1,
                opacity: 0.6,
                fillOpacity: 0.2,
            })
                .bindPopup("<b>Lac d'Allier</b><br/>Qualité de l'air: Excellente")
                .addTo(mapRef.current!);

            // Show key points
            [locations.gare, locations.thermes].forEach((loc, i) => {
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 8,
                    fillColor: "#a855f7",
                    color: "#a855f7",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                })
                    .bindPopup(i === 0 ? "<b>Gare de Vichy</b>" : "<b>Thermes Callou</b>")
                    .addTo(mapRef.current!);
            });
        } else if (activeTab === "parcours") {
            // Draw all parcours routes
            Object.entries(parcoursRoutes).forEach(([id, route]) => {
                const isSelected = parseInt(id) === selectedParcoursId;
                const color = isSelected ? "#a855f7" : "#64748b";

                L.polyline(route, {
                    color,
                    weight: isSelected ? 4 : 2,
                    opacity: isSelected ? 1 : 0.5,
                    dashArray: isSelected ? undefined : "5, 10",
                })
                    .addTo(mapRef.current!);

                // Add start marker for selected parcours
                if (isSelected && route.length > 0) {
                    L.circleMarker(route[0], {
                        radius: 10,
                        fillColor: "#a855f7",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1,
                    })
                        .bindPopup("<b>Départ</b>")
                        .addTo(mapRef.current!);
                }
            });
        } else if (activeTab === "coaching") {
            // Show today's session route (Boucle des Sources)
            const route = parcoursRoutes[1];
            L.polyline(route, {
                color: "#a855f7",
                weight: 4,
                opacity: 0.8,
            }).addTo(mapRef.current!);

            // Start point
            L.circleMarker(route[0], {
                radius: 10,
                fillColor: "#22c55e",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
            })
                .bindPopup("<b>Séance du jour</b><br/>Boucle des Sources")
                .addTo(mapRef.current!);
        }
    }, [activeTab, selectedParcoursId]);

    return <div ref={containerRef} className={styles.map} />;
}
