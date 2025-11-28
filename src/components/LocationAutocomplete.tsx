/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle } from "lucide-react";

interface LocationAutocompleteProps {
  onLocationSelect: (place: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ 
  onLocationSelect, 
  placeholder = "Enter a location" 
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    // Load Google Maps JavaScript API
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=IN`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // India bounds for faster, more relevant results
    const indiaBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(8.4, 68.7), // Southwest corner
      new google.maps.LatLng(35.5, 97.25) // Northeast corner
    );

    // Initialize Google Places Autocomplete with India-specific settings
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      bounds: indiaBounds,
      strictBounds: true,
      componentRestrictions: { country: "in" },
      fields: ["formatted_address", "geometry", "name", "address_components"],
      types: ["geocode", "establishment"],
    });

    // Handle place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || "";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setInputValue(address);
        onLocationSelect({ address, lat, lng });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onLocationSelect]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          disabled={!isLoaded || !!error}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      {!isLoaded && !error && (
        <p className="text-xs text-muted-foreground mt-1">Loading India map...</p>
      )}
      {isLoaded && !error && (
        <p className="text-xs text-muted-foreground mt-1">Type to search locations in India</p>
      )}
    </div>
  );
}
