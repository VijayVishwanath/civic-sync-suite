/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

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

  useEffect(() => {
    // Load Google Maps JavaScript API
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" }, // Restrict to India
      fields: ["formatted_address", "geometry", "name"],
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
        />
      </div>
      {!isLoaded && (
        <p className="text-xs text-muted-foreground mt-1">Loading Google Maps...</p>
      )}
    </div>
  );
}
