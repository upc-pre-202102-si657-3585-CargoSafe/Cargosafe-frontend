import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VehicleSearchProps {
  value: string;
  onChange: (value: string) => void;
}


const VehicleSearch: React.FC<VehicleSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar por modelo o placa..."
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default VehicleSearch; 