export interface AddressFeature {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
    properties: {
        label: string;
        score: number;
        housenumber?: string;
        id: string;
        name: string;
        postcode: string;
        citycode: string;
        x: number;
        y: number;
        city: string;
        context: string;
        type: string;
        importance: number;
        street?: string;
    };
}

export interface AddressResponse {
    type: "FeatureCollection";
    version: string;
    features: AddressFeature[];
    attribution: string;
    license: string;
    query: string;
    limit: number;
}

export const searchAddress = async (query: string): Promise<AddressFeature[]> => {
    if (!query || query.length < 3) return [];
    try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`);
        const data: AddressResponse = await response.json();
        return data.features;
    } catch (error) {
        console.error("Error searching address:", error);
        return [];
    }
};
