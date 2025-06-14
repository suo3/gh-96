
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

// Common US cities and locations for typeahead
const commonLocations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "El Paso, TX",
  "Nashville, TN",
  "Detroit, MI",
  "Oklahoma City, OK",
  "Portland, OR",
  "Las Vegas, NV",
  "Memphis, TN",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Mesa, AZ",
  "Sacramento, CA",
  "Atlanta, GA",
  "Kansas City, MO",
  "Colorado Springs, CO",
  "Miami, FL",
  "Raleigh, NC",
  "Omaha, NE",
  "Long Beach, CA",
  "Virginia Beach, VA",
  "Oakland, CA",
  "Minneapolis, MN",
  "Tulsa, OK",
  "Arlington, TX",
  "Tampa, FL"
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
