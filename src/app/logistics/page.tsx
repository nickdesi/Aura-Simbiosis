"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Car,
    Package,
    AlertTriangle,
    MapPin,
    Clock,
    Users,
    Navigation,
    Leaf
} from "lucide-react";
import styles from "./page.module.css";
import { searchAddress, AddressFeature } from "@/lib/addressService";
import { LogisticsMapProps } from "@/components/map/LogisticsMap";

// Dynamic import for Leaflet (SSR issue)
const MapWithNoSSR = dynamic<LogisticsMapProps>(() => import("@/components/map/LogisticsMap"), {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder}>Chargement de la carte...</div>,
});

type TabType = "covoiturage" | "colisage" | "zfe";

interface ZFEResult {
    allowed: boolean;
    crit: string;
}

const mockCarpools = [
    {
        id: 1,
        driver: "Marie D.",
        from: "Clermont-Ferrand",
        to: "Vichy",
        departure: "07:30",
        seats: 2,
        price: "5€",
    },
    {
        id: 2,
        driver: "Thomas L.",
        from: "Riom",
        to: "Clermont-Ferrand",
        departure: "08:00",
        seats: 3,
        price: "3€",
    },
    {
        id: 3,
        driver: "Sophie M.",
        from: "Vichy",
        to: "Clermont-Ferrand",
        departure: "08:15",
        seats: 1,
        price: "6€",
    },
];

const mockParcels = [
    {
        id: 1,
        type: "Pièces détachées",
        from: "ZA Brézet",
        to: "ZI Montpertuis",
        weight: "2kg",
        reward: "8€",
    },
    {
        id: 2,
        type: "Documents",
        from: "Clermont Centre",
        to: "Vichy Thermes",
        weight: "0.5kg",
        reward: "5€",
    },
];

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("covoiturage");
    const [plateNumber, setPlateNumber] = useState("");
    const [zfeResult, setZfeResult] = useState<ZFEResult | null>(null);

    // Co-Colisage State with Real Address Search
    const [parcelOrigin, setParcelOrigin] = useState("");
    const [parcelDest, setParcelDest] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<AddressFeature[]>([]);
    const [activeInput, setActiveInput] = useState<"origin" | "dest" | null>(null);

    const handleAddressSearch = async (query: string, field: "origin" | "dest") => {
        if (field === "origin") setParcelOrigin(query);
        else setParcelDest(query);
        setActiveInput(field);

        if (query.length > 3) {
            const results = await searchAddress(query);
            setAddressSuggestions(results);
        } else {
            setAddressSuggestions([]);
        }
    };

    const selectAddress = (addr: AddressFeature) => {
        if (activeInput === "origin") setParcelOrigin(addr.properties.label);
        else setParcelDest(addr.properties.label);
        setAddressSuggestions([]);
        setActiveInput(null);
    };

    const checkZFE = () => {
        // Mock ZFE check - in reality would call Crit'Air API
        const critAirLevels = ["Crit'Air 1", "Crit'Air 2", "Crit'Air 3", "Crit'Air 4", "Crit'Air 5"];
        const randomCrit = critAirLevels[Math.floor(Math.random() * critAirLevels.length)];
        const allowed = ["Crit'Air 1", "Crit'Air 2"].includes(randomCrit);
        setZfeResult({ allowed, crit: randomCrit });
    };

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className={styles.title}>Aura-Logistics</h1>
                    <p className={styles.subtitle}>Mobilité & Fret Partagé</p>
                </div>
            </header>

            {/* Tabs */}
            <nav className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "covoiturage" ? styles.active : ""}`}
                    onClick={() => setActiveTab("covoiturage")}
                >
                    <Car size={18} />
                    <span>Covoiturage</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "colisage" ? styles.active : ""}`}
                    onClick={() => setActiveTab("colisage")}
                >
                    <Package size={18} />
                    <span>Co-Colisage</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "zfe" ? styles.active : ""}`}
                    onClick={() => setActiveTab("zfe")}
                >
                    <AlertTriangle size={18} />
                    <span>ZFE</span>
                </button>
            </nav>

            {/* Map */}
            <section className={styles.mapSection}>
                <MapWithNoSSR activeTab={activeTab} />
            </section>

            {/* Content */}
            <section className={styles.content}>
                {activeTab === "covoiturage" && (
                    <div className={styles.list}>
                        <h2 className={styles.sectionTitle}>Trajets disponibles</h2>
                        {mockCarpools.map((ride) => (
                            <div key={ride.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>{ride.driver.charAt(0)}</div>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.driverName}>{ride.driver}</span>
                                        <span className={styles.route}>
                                            <MapPin size={14} /> {ride.from} → {ride.to}
                                        </span>
                                    </div>
                                    <span className={styles.price}>{ride.price}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span><Clock size={14} /> {ride.departure}</span>
                                    <span><Users size={14} /> {ride.seats} places</span>
                                    <button className={styles.btnReserve}>Réserver</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "colisage" && (
                    <div className={styles.colisageContent}>
                        <div className={styles.filterRow}>
                            <h2 className={styles.sectionTitle}>Transport de colis</h2>
                            <button className={styles.btnNew}>
                                <Package size={16} /> Proposer un trajet
                            </button>
                        </div>

                        {/* Address Search Bar */}
                        <div className={styles.searchBar}>
                            <div className={styles.inputGroup}>
                                <MapPin size={16} />
                                <input
                                    type="text"
                                    placeholder="Départ..."
                                    value={parcelOrigin}
                                    onChange={(e) => handleAddressSearch(e.target.value, "origin")}
                                    className={styles.input}
                                />
                                {activeInput === "origin" && addressSuggestions.length > 0 && (
                                    <ul className={styles.suggestions}>
                                        {addressSuggestions.map((addr) => (
                                            <li key={addr.properties.id} onClick={() => selectAddress(addr)}>
                                                {addr.properties.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className={styles.inputGroup}>
                                <MapPin size={16} />
                                <input
                                    type="text"
                                    placeholder="Destination..."
                                    value={parcelDest}
                                    onChange={(e) => handleAddressSearch(e.target.value, "dest")}
                                    className={styles.input}
                                />
                                {activeInput === "dest" && addressSuggestions.length > 0 && (
                                    <ul className={styles.suggestions}>
                                        {addressSuggestions.map((addr) => (
                                            <li key={addr.properties.id} onClick={() => selectAddress(addr)}>
                                                {addr.properties.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className={styles.list}>
                            <h2 className={styles.sectionTitle}>Colis à transporter</h2>
                            {mockParcels.map((parcel) => (
                                <div key={parcel.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.iconBox}>
                                            <Package size={20} />
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <span className={styles.driverName}>{parcel.type}</span>
                                            <span className={styles.route}>
                                                <Navigation size={14} /> {parcel.from} → {parcel.to}
                                            </span>
                                        </div>
                                        <span className={styles.reward}>+{parcel.reward}</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span>Poids: {parcel.weight}</span>
                                        <button className={styles.btnReserve}>Prendre</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "zfe" && (
                    <div className={styles.zfeSection}>
                        <h2 className={styles.sectionTitle}>Vérification ZFE Clermont</h2>
                        <p className={styles.zfeInfo}>
                            <AlertTriangle size={16} />
                            La Zone à Faibles Émissions de Clermont-Ferrand interdit certains véhicules selon leur vignette Crit&apos;Air.
                        </p>
                        <div className={styles.zfeForm}>
                            <input
                                type="text"
                                placeholder="Immatriculation (ex: AB-123-CD)"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                                className={styles.input}
                            />
                            <button onClick={checkZFE} className={styles.btnCheck}>
                                Vérifier
                            </button>
                        </div>
                        {zfeResult && (
                            <div className={`${styles.zfeResult} ${zfeResult.allowed ? styles.allowed : styles.denied}`}>
                                <Leaf size={20} />
                                <div>
                                    <strong>{zfeResult.crit}</strong>
                                    <p>{zfeResult.allowed ? "Véhicule autorisé dans la ZFE" : "Véhicule interdit - Utilisez un P+R"}</p>
                                </div>
                            </div>
                        )}
                        {zfeResult && !zfeResult.allowed && (
                            <div className={styles.alternatives}>
                                <h3>Alternatives recommandées</h3>
                                <div className={styles.altCard}>
                                    <MapPin size={18} />
                                    <div>
                                        <strong>P+R Pardieu</strong>
                                        <p>Gratuit + Tram T2C vers centre-ville</p>
                                    </div>
                                </div>
                                <div className={styles.altCard}>
                                    <MapPin size={18} />
                                    <div>
                                        <strong>P+R Les Vergnes</strong>
                                        <p>Gratuit + Bus vers Jaude</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
