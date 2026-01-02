export interface Company {
    siren: string;
    nom_complet: string;
    nom_raison_sociale: string | null;
    siege: {
        adresse: string;
        code_postal: string;
        libelle_commune: string;
        latitude: string;
        longitude: string;
        activite_principale: string;
    };
    activite_principale: string; // Code NAF
}

export interface CompanyResponse {
    results: Company[];
    total_results: number;
    page: number;
    per_page: number;
}

export const searchCompanies = async (query: string, location?: { lat: number, lng: number }): Promise<Company[]> => {
    try {
        let url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=20`;

        // Prioritize companies near Clermont/Vichy if no location provided
        const lat = location?.lat || 45.7772; // Clermont
        const lng = location?.lng || 3.0870;

        // Add geo filtering if needed, but the basic API primarily searches by text.
        // We'll search specifically in the region by adding city names to query if generic
        if (!query.toLowerCase().includes("clermont") && !query.toLowerCase().includes("vichy")) {
            // url += " near..."; // The API doesn't support "near" directly in query easily without postal code
            // We can filter by department 63 (Puy-de-Dôme) and 03 (Allier)
            url += "&departement=63,03";
        }

        const response = await fetch(url);
        const data: CompanyResponse = await response.json();

        // Filter out companies without coordinates as we need them for the map
        return data.results.filter(c => c.siege.latitude && c.siege.longitude);
    } catch (error) {
        console.error("Error searching companies:", error);
        return [];
    }
};
