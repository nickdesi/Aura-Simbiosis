"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Heart,
    Wind,
    Activity,
    MapPin,
    Clock,
    Footprints,
    ThermometerSun,
    ChevronRight,
    Play,
    CheckCircle
} from "lucide-react";
import styles from "./page.module.css";
import { ThermaMapProps } from "@/components/map/ThermaMap";

const MapWithNoSSR = dynamic<ThermaMapProps>(() => import("@/components/map/ThermaMap"), {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder}>Chargement de la carte...</div>,
});

type TabType = "airpur" | "parcours" | "coaching";

interface AirQuality {
    index: number;
    label: string;
    color: string;
    no2: number;
    pm10: number;
    pm25: number;
    o3: number;
}

interface Parcours {
    id: number;
    name: string;
    difficulty: "facile" | "modéré" | "sportif";
    distance: string;
    duration: string;
    elevation: string;
    airQuality: "excellent" | "bon" | "moyen";
    description: string;
    pathology: string[];
}

// Mock air quality data (would come from Atmo API)
const mockAirQuality: AirQuality = {
    index: 3,
    label: "Bon",
    color: "#22c55e",
    no2: 18,
    pm10: 22,
    pm25: 8,
    o3: 45,
};

// Parcours Parcoura data
const parcoursList: Parcours[] = [
    {
        id: 1,
        name: "Boucle des Sources",
        difficulty: "facile",
        distance: "2.5 km",
        duration: "35 min",
        elevation: "+15m",
        airQuality: "excellent",
        description: "Parcours plat longeant l'Allier, idéal pour la reprise d'activité.",
        pathology: ["cardio", "diabète", "seniors"],
    },
    {
        id: 2,
        name: "Chemin du Parc",
        difficulty: "facile",
        distance: "3.2 km",
        duration: "45 min",
        elevation: "+25m",
        airQuality: "excellent",
        description: "À travers le Parc des Sources et les jardins historiques.",
        pathology: ["rhumatisme", "obésité"],
    },
    {
        id: 3,
        name: "Montée Célestins",
        difficulty: "modéré",
        distance: "4.1 km",
        duration: "55 min",
        elevation: "+85m",
        airQuality: "bon",
        description: "Vue panoramique sur Vichy depuis les hauteurs.",
        pathology: ["cardio", "renforcement"],
    },
    {
        id: 4,
        name: "Tour du Lac",
        difficulty: "modéré",
        distance: "5.0 km",
        duration: "1h10",
        elevation: "+40m",
        airQuality: "excellent",
        description: "Contour complet du lac d'Allier, espaces verts continus.",
        pathology: ["diabète", "endurance"],
    },
];

const coachingProgram = [
    { week: 1, sessions: 3, duration: "20 min", intensity: "Légère", completed: true },
    { week: 2, sessions: 3, duration: "25 min", intensity: "Légère", completed: true },
    { week: 3, sessions: 4, duration: "30 min", intensity: "Modérée", completed: false },
    { week: 4, sessions: 4, duration: "35 min", intensity: "Modérée", completed: false },
];

const difficultyColors = {
    facile: "#22c55e",
    modéré: "#f97316",
    sportif: "#ef4444",
};

const airQualityColors = {
    excellent: "#22c55e",
    bon: "#84cc16",
    moyen: "#f97316",
};

export default function ThermaTrackPage() {
    const [activeTab, setActiveTab] = useState<TabType>("airpur");
    const [selectedParcours, setSelectedParcours] = useState<Parcours | null>(null);
    const [pathologyFilter, setPathologyFilter] = useState<string>("all");
    const [airQuality, setAirQuality] = useState<AirQuality>(mockAirQuality);

    // Fetch real air quality data
    useEffect(() => {
        const getAirQuality = async () => {
            // Import dynamically
            const { fetchAirQuality, getAirQualityLabel } = await import("@/lib/airQualityService");

            // Vichy coordinates
            const lat = 46.1277;
            const lng = 3.4260;

            const data = await fetchAirQuality(lat, lng);
            if (data && data.current) {
                const label = getAirQualityLabel(data.current.us_aqi);
                setAirQuality({
                    index: label.index,
                    label: label.label,
                    color: label.color,
                    no2: data.current.nitrogen_dioxide,
                    pm10: data.current.pm10,
                    pm25: data.current.pm2_5,
                    o3: data.current.ozone
                });
            }
        };

        getAirQuality();

        // Refresh every 30 mins
        const interval = setInterval(getAirQuality, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredParcours = parcoursList.filter((p) =>
        pathologyFilter === "all" || p.pathology.includes(pathologyFilter)
    );

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className={styles.title}>Therma-Track 360</h1>
                    <p className={styles.zfeInfo}>Qualité de l&apos;air en temps réel</p>
                </div>
            </header>

            {/* Tabs */}
            <nav className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "airpur" ? styles.active : ""}`}
                    onClick={() => setActiveTab("airpur")}
                >
                    <Wind size={18} />
                    <span>Air Pur</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "parcours" ? styles.active : ""}`}
                    onClick={() => setActiveTab("parcours")}
                >
                    <Footprints size={18} />
                    <span>Parcours</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "coaching" ? styles.active : ""}`}
                    onClick={() => setActiveTab("coaching")}
                >
                    <Activity size={18} />
                    <span>Coaching</span>
                </button>
            </nav>

            {/* Air Quality Banner */}
            {activeTab === "airpur" && (
                <section className={styles.airBanner}>
                    <div className={styles.airIndex} style={{ borderColor: airQuality.color }}>
                        <span className={styles.indexValue} style={{ color: airQuality.color }}>
                            {airQuality.index}
                        </span>
                        <span className={styles.indexLabel}>{airQuality.label}</span>
                    </div>
                    <div className={styles.airDetails}>
                        <div className={styles.pollutant}>
                            <span>NO₂</span>
                            <strong>{airQuality.no2} µg/m³</strong>
                        </div>
                        <div className={styles.pollutant}>
                            <span>PM10</span>
                            <strong>{airQuality.pm10} µg/m³</strong>
                        </div>
                        <div className={styles.pollutant}>
                            <span>PM2.5</span>
                            <strong>{airQuality.pm25} µg/m³</strong>
                        </div>
                        <div className={styles.pollutant}>
                            <span>O₃</span>
                            <strong>{airQuality.o3} µg/m³</strong>
                        </div>
                    </div>
                </section>
            )}

            {/* Map */}
            <section className={styles.mapSection}>
                <MapWithNoSSR
                    activeTab={activeTab}
                    selectedParcoursId={selectedParcours?.id || null}
                />
            </section>

            {/* Content */}
            <section className={styles.content}>
                {activeTab === "airpur" && (
                    <div className={styles.airPurContent}>
                        <h2 className={styles.sectionTitle}>Itinéraire Air Pur</h2>
                        <p className={styles.infoText}>
                            Calculez l&apos;itinéraire le moins pollué, pas le plus court.
                        </p>
                        <div className={styles.routeForm}>
                            <div className={styles.inputGroup}>
                                <MapPin size={16} />
                                <input type="text" placeholder="Départ (ex: Gare de Vichy)" className={styles.input} />
                            </div>
                            <div className={styles.inputGroup}>
                                <MapPin size={16} />
                                <input type="text" placeholder="Arrivée (ex: Thermes Callou)" className={styles.input} />
                            </div>
                            <button className={styles.btnCalculate}>
                                <Wind size={18} />
                                Calculer itinéraire Air Pur
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "parcours" && (
                    <div className={styles.parcoursContent}>
                        <div className={styles.filterRow}>
                            <h2 className={styles.sectionTitle}>Parcours Parcoura</h2>
                            <select
                                className={styles.select}
                                value={pathologyFilter}
                                onChange={(e) => setPathologyFilter(e.target.value)}
                            >
                                <option value="all">Toutes pathologies</option>
                                <option value="cardio">Cardio</option>
                                <option value="diabète">Diabète</option>
                                <option value="rhumatisme">Rhumatisme</option>
                                <option value="obésité">Obésité</option>
                            </select>
                        </div>
                        <div className={styles.list}>
                            {filteredParcours.map((parcours) => (
                                <div
                                    key={parcours.id}
                                    className={`${styles.card} ${selectedParcours?.id === parcours.id ? styles.selected : ""}`}
                                    onClick={() => setSelectedParcours(parcours)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardInfo}>
                                            <div className={styles.badges}>
                                                <span
                                                    className={styles.diffBadge}
                                                    style={{ color: difficultyColors[parcours.difficulty], borderColor: difficultyColors[parcours.difficulty] }}
                                                >
                                                    {parcours.difficulty}
                                                </span>
                                                <span
                                                    className={styles.airBadge}
                                                    style={{ color: airQualityColors[parcours.airQuality], borderColor: airQualityColors[parcours.airQuality] }}
                                                >
                                                    <Wind size={10} /> {parcours.airQuality}
                                                </span>
                                            </div>
                                            <span className={styles.parcoursName}>{parcours.name}</span>
                                        </div>
                                        <ChevronRight size={20} className={styles.chevron} />
                                    </div>
                                    <p className={styles.description}>{parcours.description}</p>
                                    <div className={styles.cardFooter}>
                                        <span><Footprints size={14} /> {parcours.distance}</span>
                                        <span><Clock size={14} /> {parcours.duration}</span>
                                        <span><ThermometerSun size={14} /> {parcours.elevation}</span>
                                    </div>
                                    <div className={styles.pathologyTags}>
                                        {parcours.pathology.map((p) => (
                                            <span key={p} className={styles.pathTag}>{p}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "coaching" && (
                    <div className={styles.coachingContent}>
                        <h2 className={styles.sectionTitle}>Programme Post-Cure APA</h2>
                        <p className={styles.infoText}>
                            Activité Physique Adaptée - Programme personnalisé sur 4 semaines
                        </p>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: "50%" }} />
                        </div>
                        <span className={styles.progressLabel}>Semaine 3 / 4</span>

                        <div className={styles.weekList}>
                            {coachingProgram.map((week) => (
                                <div
                                    key={week.week}
                                    className={`${styles.weekCard} ${week.completed ? styles.completed : ""}`}
                                >
                                    <div className={styles.weekHeader}>
                                        <div className={styles.weekInfo}>
                                            <span className={styles.weekNum}>Semaine {week.week}</span>
                                            <span className={styles.weekDetails}>
                                                {week.sessions} séances • {week.duration} • {week.intensity}
                                            </span>
                                        </div>
                                        {week.completed ? (
                                            <CheckCircle size={24} className={styles.checkIcon} />
                                        ) : (
                                            <button className={styles.btnStart}>
                                                <Play size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.todaySession}>
                            <Heart size={24} />
                            <div>
                                <strong>Séance du jour</strong>
                                <p>Marche active - Boucle des Sources - 30 min</p>
                            </div>
                            <button className={styles.btnGo}>Démarrer</button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
