
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Common Ghana cities and locations for typeahead
const commonLocations = [
  "Accra, Greater Accra",
  "Kumasi, Ashanti",
  "Tamale, Northern",
  "Cape Coast, Central",
  "Sekondi-Takoradi, Western",
  "Tema, Greater Accra",
  "Ho, Volta",
  "Sunyani, Bono",
  "Koforidua, Eastern",
  "Wa, Upper West",
  "Bolgatanga, Upper East",
  "Tarkwa, Western",
  "Obuasi, Ashanti",
  "Techiman, Bono East",
  "Nkawkaw, Eastern",
  "Yendi, Northern",
  "Kintampo, Bono East",
  "Winneba, Central",
  "Axim, Western",
  "Elmina, Central",
  "Keta, Volta",
  "Bawku, Upper East",
  "Navrongo, Upper East",
  "Salaga, Savannah",
  "Damongo, Savannah",
  "Goaso, Ahafo",
  "Berekum, Bono",
  "Dormaa Ahenkro, Bono",
  "Elubo, Western",
  "Wiawso, Western North",
  "Dunkwa, Central",
  "Prestea, Western",
  "Nsawam, Eastern",
  "Mpraeso, Eastern",
  "Oda, Eastern",
  "Akim Oda, Eastern",
  "Konongo, Ashanti",
  "Mampong, Ashanti",
  "Ejura, Ashanti",
  "Bibiani, Western North",
  "Sefwi Wiawso, Western North",
  "Wenchi, Bono",
  "Kpandae, North East",
  "Bole, Savannah",
  "Lawra, Upper West",
  "Jirapa, Upper West",
  "Tumu, Upper West"
];

export const LocationInput = ({ value, onChange, placeholder = "Enter your location", disabled, className }: LocationInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

  useEffect(() => {
    if (searchValue.length > 0) {
      const filtered = commonLocations.filter(location =>
        location.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredLocations([]);
    }
  }, [searchValue]);

  const handleSelect = (location: string) => {
    onChange(location);
    setOpen(false);
    setSearchValue("");
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setSearchValue(inputValue);
    setOpen(inputValue.length > 0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-8", className)}
            onFocus={() => {
              if (value.length > 0) {
                setSearchValue(value);
                setOpen(true);
              }
            }}
          />
          <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search locations..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={() => handleSelect(location)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {location}
                  </div>
                  {value === location && (
                    <Check className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
