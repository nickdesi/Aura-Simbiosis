export interface AirQualityData {
    latitude: number;
    longitude: number;
    current: {
        time: string;
        us_aqi: number;
        pm10: number;
        pm2_5: number;
        nitrogen_dioxide: number;
        ozone: number;
    };
}

export const fetchAirQuality = async (lat: number, lng: number): Promise<AirQualityData | null> => {
    try {
        const response = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=Europe%2FBerlin`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching air quality:", error);
        return null;
    }
};

export const getAirQualityLabel = (aqi: number) => {
    if (aqi <= 50) return { label: "Excellent", color: "#22c55e", index: 1 };
    if (aqi <= 100) return { label: "Bon", color: "#84cc16", index: 2 };
    if (aqi <= 150) return { label: "Moyen", color: "#f97316", index: 3 };
    if (aqi <= 200) return { label: "Mauvais", color: "#ef4444", index: 4 };
    return { label: "Très Mauvais", color: "#7f1d1d", index: 5 };
};
