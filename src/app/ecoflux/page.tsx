"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Recycle,
    Flame,
    Search,
    MapPin,
    Package,
    Zap,
    Building2,
    Leaf
} from "lucide-react";
import styles from "./page.module.css";
import { EcoFluxMapProps } from "@/components/map/EcoFluxMap";

const MapWithNoSSR = dynamic<EcoFluxMapProps>(() => import("@/components/map/EcoFluxMap"), {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder}>Chargement de la carte...</div>,
});

type ResourceType = "dechet" | "chaleur" | "materiau";

interface Resource {
    id: number;
    company: string;
    type: ResourceType;
    title: string;
    description: string;
    quantity: string;
    zone: string;
    naf: string;
    lat?: number;
    lng?: number;
}

const mockResources: Resource[] = [
    {
        id: 1,
        company: "Menuiserie Martin",
        type: "dechet",
        title: "Sciure et copeaux de bois",
        description: "Sciure propre, idéale pour litière animale ou compost",
        quantity: "50kg/semaine",
        zone: "ZA Brézet",
        naf: "16.10Z",
    },
    {
        id: 2,
        company: "Imprimerie Clermontoise",
        type: "materiau",
        title: "Chutes de papier cartonné",
        description: "Cartons et papiers qualité impression, non souillés",
        quantity: "200kg/mois",
        zone: "Cataroux",
        naf: "18.12Z",
    },
    {
        id: 3,
        company: "Fonderie Auverplate",
        type: "chaleur",
        title: "Chaleur fatale process",
        description: "Récupération possible sur circuit de refroidissement",
        quantity: "150 kW disponibles",
        zone: "ZI Montpertuis",
        naf: "24.51Z",
    },
    {
        id: 4,
        company: "Plastiques Auvergne",
        type: "materiau",
        title: "Chutes de plastique PP",
        description: "Polypropylène recyclable, couleurs variées",
        quantity: "100kg/semaine",
        zone: "ZA Brézet",
        naf: "22.29A",
    },
    {
        id: 5,
        company: "Boulangerie Industrielle Bio",
        type: "dechet",
        title: "Résidus de panification",
        description: "Pain invendu et croûtes, valorisables en alimentation animale",
        quantity: "30kg/jour",
        zone: "Cataroux",
        naf: "10.71C",
    },
];

const typeConfig = {
    dechet: { icon: Recycle, color: "green", label: "Déchet valorisable" },
    chaleur: { icon: Flame, color: "orange", label: "Chaleur fatale" },
    materiau: { icon: Package, color: "cyan", label: "Matériau réutilisable" },
};

export default function EcoFluxPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<ResourceType | "all">("all");
    const [resources, setResources] = useState<Resource[]>(mockResources); // Start with mocks, append real data
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Function to search real companies
    const handleSearch = async (term: string) => {
        if (term.length < 3) {
            setResources(mockResources); // Reset to only mock resources if search term is too short
            return;
        }
        setIsLoading(true);

        // Import dynamically to avoid server-side issues with event handlers if any
        const { searchCompanies } = await import("@/lib/companyService");
        const companies = await searchCompanies(term);

        // Convert companies to Resources (simulated assignment of resources to real companies)
        const newResources: Resource[] = companies.map((c, index) => {
            // Randomly assign a resource type for demo purposes since API doesn't have this
            const types: ResourceType[] = ["dechet", "chaleur", "materiau"];
            const randomType = types[Math.floor(Math.random() * types.length)];

            return {
                id: 1000 + index, // avoid conflict with mock IDs
                company: c.nom_complet,
                type: randomType,
                title: `Ressource ${c.activite_principale} à valoriser`,
                description: `Matériaux ou déchets issus de l'activité ${c.siege.activite_principale}.`,
                quantity: "Stock à vérifier",
                zone: c.siege.libelle_commune,
                naf: c.activite_principale,
                lat: parseFloat(c.siege.latitude),
                lng: parseFloat(c.siege.longitude),
            };
        });

        setResources([...mockResources, ...newResources]);
        setIsLoading(false);
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            } else {
                setResources(mockResources); // If search term is empty, show only mock resources
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const filteredResources = resources.filter((r) => {
        // Client-side filtering on the combined list
        const matchesType = filterType === "all" || r.type === filterType;
        // Search term is already handled by API for new results, but we filter displayed list too
        // to allow filtering the mixed mock/real list by text if user types and *then* changes filter
        const matchesSearch =
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.zone.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    return (
        <main className={styles.main}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className={styles.title}>Eco-Flux B2B</h1>
                    <p className={styles.subtitle}>Industrie Circulaire</p>
                </div>
            </header>

            {/* Search & Filters */}
            <section className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher entreprise (ex: Michelin, Bio...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {isLoading && <span className={styles.loader}>...</span>}
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
                        onClick={() => setFilterType("all")}
                    >
                        Tout
                    </button>
                    <button
                        className={`${styles.filterBtn} ${styles.green} ${filterType === "dechet" ? styles.active : ""}`}
                        onClick={() => setFilterType("dechet")}
                    >
                        <Recycle size={14} /> Déchets
                    </button>
                    <button
                        className={`${styles.filterBtn} ${styles.orange} ${filterType === "chaleur" ? styles.active : ""}`}
                        onClick={() => setFilterType("chaleur")}
                    >
                        <Flame size={14} /> Chaleur
                    </button>
                    <button
                        className={`${styles.filterBtn} ${styles.cyan} ${filterType === "materiau" ? styles.active : ""}`}
                        onClick={() => setFilterType("materiau")}
                    >
                        <Package size={14} /> Matériaux
                    </button>
                </div>
            </section>

            {/* Map */}
            <section className={styles.mapSection}>
                <MapWithNoSSR
                    resources={filteredResources}
                    selectedId={selectedResource?.id || null}
                    onSelect={(id: number) => setSelectedResource(resources.find(r => r.id === id) || null)}
                />
            </section>

            {/* Resources List */}
            <section className={styles.content}>
                <div className={styles.listHeader}>
                    <h2 className={styles.sectionTitle}>
                        Bourse aux ressources
                        <span className={styles.count}>{filteredResources.length}</span>
                    </h2>
                </div>
                <div className={styles.list}>
                    {filteredResources.map((resource) => {
                        const config = typeConfig[resource.type];
                        const Icon = config.icon;
                        return (
                            <div
                                key={resource.id}
                                className={`${styles.card} ${styles[config.color]} ${selectedResource?.id === resource.id ? styles.selected : ""}`}
                                onClick={() => setSelectedResource(resource)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.iconBox}>
                                        <Icon size={20} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.badge}>{config.label}</span>
                                        <span className={styles.resourceTitle}>{resource.title}</span>
                                        <span className={styles.company}>
                                            <Building2 size={12} /> {resource.company}
                                        </span>
                                    </div>
                                </div>
                                <p className={styles.description}>{resource.description}</p>
                                <div className={styles.cardFooter}>
                                    <span><MapPin size={14} /> {resource.zone}</span>
                                    <span><Zap size={14} /> {resource.quantity}</span>
                                    <button className={styles.btnContact}>Contacter</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <div className={styles.cta}>
                <button className={styles.btnAdd}>
                    <Leaf size={18} />
                    Proposer une ressource
                </button>
            </div>
        </main>
    );
}
