"use client";

import Link from "next/link";
import { Truck, Factory, Heart, ArrowRight, Zap, MapPin, Users } from "lucide-react";
import styles from "./page.module.css";

const modules = [
  {
    id: "logistics",
    title: "Aura-Logistics",
    subtitle: "Mobilité & Fret Partagé",
    description: "Covoiturage, co-colisage et calculateur ZFE pour optimiser vos trajets.",
    icon: Truck,
    color: "cyan",
    href: "/logistics",
    stats: [
      { icon: Users, label: "79% autosolisme à réduire" },
      { icon: MapPin, label: "Axe Clermont-Vichy" },
    ],
  },
  {
    id: "ecoflux",
    title: "Eco-Flux B2B",
    subtitle: "Industrie Circulaire",
    description: "Bourse aux déchets et synergies industrielles géolocalisées.",
    icon: Factory,
    color: "green",
    href: "/ecoflux",
    stats: [
      { icon: Zap, label: "Valorisation chaleur fatale" },
      { icon: MapPin, label: "Zones Cataroux, Brézet" },
    ],
  },
  {
    id: "thermatrack",
    title: "Therma-Track 360",
    subtitle: "Santé & Environnement",
    description: "Itinéraires 'Air Pur' et coaching post-cure personnalisé.",
    icon: Heart,
    color: "purple",
    href: "/thermatrack",
    stats: [
      { icon: Heart, label: "Parcours Parcoura" },
      { icon: MapPin, label: "Vichy Santé" },
    ],
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Zap size={14} />
            <span>Métabolisme Territorial 2026</span>
          </div>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Aura</span>-Symbiosis
          </h1>
          <p className={styles.subtitle}>
            Connectez les flux invisibles du territoire Clermont-Vichy.
            Mobilité, industrie et santé réunis sur une seule plateforme.
          </p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className={styles.modules}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nos 3 Modules</h2>
          <div className={styles.grid}>
            {modules.map((module, index) => (
              <Link
                key={module.id}
                href={module.href}
                className={`${styles.card} ${styles[module.color]}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <module.icon size={28} />
                  </div>
                  <ArrowRight className={styles.arrow} size={20} />
                </div>
                <h3 className={styles.cardTitle}>{module.title}</h3>
                <p className={styles.cardSubtitle}>{module.subtitle}</p>
                <p className={styles.cardDescription}>{module.description}</p>
                <div className={styles.cardStats}>
                  {module.stats.map((stat, i) => (
                    <div key={i} className={styles.stat}>
                      <stat.icon size={14} />
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Pôle Métropolitain Clermont-Vichy • 2026</p>
      </footer>
    </main>
  );
}
