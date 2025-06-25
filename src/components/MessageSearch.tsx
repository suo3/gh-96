
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MessageSearch = ({ searchQuery, onSearchChange }: MessageSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search conversations, items, or messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-300"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-sm z-10 p-2">
          <p className="text-xs text-gray-500">
            Searching for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};
