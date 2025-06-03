import React, { useState, useEffect } from 'react';
import { X, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface UnitConverterProps {
  onClose?: () => void;
}

// Conversion types and their units
const conversionTypes = [
  {
    name: 'Longitud',
    units: [
      { value: 'mm', label: 'Milímetros (mm)' },
      { value: 'cm', label: 'Centímetros (cm)' },
      { value: 'm', label: 'Metros (m)' },
      { value: 'km', label: 'Kilómetros (km)' },
      { value: 'in', label: 'Pulgadas (in)' },
      { value: 'ft', label: 'Pies (ft)' },
      { value: 'yd', label: 'Yardas (yd)' },
      { value: 'mi', label: 'Millas (mi)' },
    ]
  },
  {
    name: 'Peso',
    units: [
      { value: 'mg', label: 'Miligramos (mg)' },
      { value: 'g', label: 'Gramos (g)' },
      { value: 'kg', label: 'Kilogramos (kg)' },
      { value: 'oz', label: 'Onzas (oz)' },
      { value: 'lb', label: 'Libras (lb)' },
      { value: 't', label: 'Toneladas (t)' },
    ]
  },
  {
    name: 'Temperatura',
    units: [
      { value: 'c', label: 'Celsius (°C)' },
      { value: 'f', label: 'Fahrenheit (°F)' },
      { value: 'k', label: 'Kelvin (K)' },
    ]
  },
  {
    name: 'Volumen',
    units: [
      { value: 'ml', label: 'Mililitros (ml)' },
      { value: 'l', label: 'Litros (l)' },
      { value: 'gal', label: 'Galones (gal)' },
      { value: 'floz', label: 'Onzas líquidas (fl oz)' },
    ]
  },
];

// Conversion factors (to base unit)
const conversionFactors: Record<string, Record<string, number>> = {
  // Length (base: meters)
  mm: { mm: 1, cm: 0.1, m: 0.001, km: 0.000001, in: 0.0393701, ft: 0.00328084, yd: 0.00109361, mi: 0.000000621371 },
  cm: { mm: 10, cm: 1, m: 0.01, km: 0.00001, in: 0.393701, ft: 0.0328084, yd: 0.0109361, mi: 0.00000621371 },
  m: { mm: 1000, cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
  km: { mm: 1000000, cm: 100000, m: 1000, km: 1, in: 39370.1, ft: 3280.84, yd: 1093.61, mi: 0.621371 },
  in: { mm: 25.4, cm: 2.54, m: 0.0254, km: 0.0000254, in: 1, ft: 0.0833333, yd: 0.0277778, mi: 0.0000157828 },
  ft: { mm: 304.8, cm: 30.48, m: 0.3048, km: 0.0003048, in: 12, ft: 1, yd: 0.333333, mi: 0.000189394 },
  yd: { mm: 914.4, cm: 91.44, m: 0.9144, km: 0.0009144, in: 36, ft: 3, yd: 1, mi: 0.000568182 },
  mi: { mm: 1609344, cm: 160934, m: 1609.34, km: 1.60934, in: 63360, ft: 5280, yd: 1760, mi: 1 },
  
  // Weight (base: grams)
  mg: { mg: 1, g: 0.001, kg: 0.000001, oz: 0.000035274, lb: 0.00000220462, t: 0.000000001 },
  g: { mg: 1000, g: 1, kg: 0.001, oz: 0.035274, lb: 0.00220462, t: 0.000001 },
  kg: { mg: 1000000, g: 1000, kg: 1, oz: 35.274, lb: 2.20462, t: 0.001 },
  oz: { mg: 28349.5, g: 28.3495, kg: 0.0283495, oz: 1, lb: 0.0625, t: 0.0000283495 },
  lb: { mg: 453592, g: 453.592, kg: 0.453592, oz: 16, lb: 1, t: 0.000453592 },
  t: { mg: 1000000000, g: 1000000, kg: 1000, oz: 35274, lb: 2204.62, t: 1 },
  
  // Volume (base: liters)
  ml: { ml: 1, l: 0.001, gal: 0.000264172, floz: 0.033814 },
  l: { ml: 1000, l: 1, gal: 0.264172, floz: 33.814 },
  gal: { ml: 3785.41, l: 3.78541, gal: 1, floz: 128 },
  floz: { ml: 29.5735, l: 0.0295735, gal: 0.0078125, floz: 1 },
};

const UnitConverter: React.FC<UnitConverterProps> = ({ onClose }) => {
  const isMobile = useIsMobile();
  const [conversionType, setConversionType] = useState<string>(conversionTypes[0].name);
  const [fromUnit, setFromUnit] = useState<string>(conversionTypes[0].units[0].value);
  const [toUnit, setToUnit] = useState<string>(conversionTypes[0].units[1].value);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  const [activeUnits, setActiveUnits] = useState(conversionTypes[0].units);

  useEffect(() => {
    // Update available units when conversion type changes
    const type = conversionTypes.find(t => t.name === conversionType);
    if (type) {
      setActiveUnits(type.units);
      setFromUnit(type.units[0].value);
      setToUnit(type.units[1].value);
      if (fromValue) {
        performConversion(fromValue, type.units[0].value, type.units[1].value);
      }
    }
  }, [conversionType]);

  useEffect(() => {
    if (fromValue) {
      performConversion(fromValue, fromUnit, toUnit);
    }
  }, [fromUnit, toUnit]);

  const performConversion = (value: string, from: string, to: string) => {
    if (!value || isNaN(parseFloat(value))) {
      setToValue('');
      return;
    }

    const inputValue = parseFloat(value);
    let result: number;

    // Special case for temperature conversions
    if (from === 'c' && to === 'f') {
      result = (inputValue * 9/5) + 32;
    } else if (from === 'c' && to === 'k') {
      result = inputValue + 273.15;
    } else if (from === 'f' && to === 'c') {
      result = (inputValue - 32) * 5/9;
    } else if (from === 'f' && to === 'k') {
      result = (inputValue - 32) * 5/9 + 273.15;
    } else if (from === 'k' && to === 'c') {
      result = inputValue - 273.15;
    } else if (from === 'k' && to === 'f') {
      result = (inputValue - 273.15) * 9/5 + 32;
    } else if (conversionFactors[from] && conversionFactors[from][to]) {
      // Standard conversion using factors
      result = inputValue * conversionFactors[from][to];
    } else {
      setToValue('Error');
      return;
    }

    // Format the result to avoid extremely small numbers in scientific notation
    let formattedResult: string;
    if (Math.abs(result) < 0.000001 && result !== 0) {
      formattedResult = result.toExponential(6);
    } else {
      formattedResult = result.toLocaleString('es-ES', {
        maximumFractionDigits: 6,
        useGrouping: true
      });
    }

    setToValue(formattedResult);
  };

  const handleFromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromValue(value);
    performConversion(value, fromUnit, toUnit);
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    performConversion(toValue, toUnit, fromUnit);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`bg-background flex flex-col rounded-lg ${isMobile ? 'h-screen w-screen' : 'h-full w-full'}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Conversor</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Conversion Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Tipo de conversión
          </label>
          <Select 
            value={conversionType} 
            onValueChange={(value) => setConversionType(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-[20000]">
              {conversionTypes.map((type) => (
                <SelectItem key={type.name} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* From Unit */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            De
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                value={fromValue}
                onChange={handleFromValueChange}
                className="w-full"
                inputMode="decimal"
              />
            </div>
            <div className="flex-1">
              <Select value={fromUnit} onValueChange={(value) => setFromUnit(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-[20000]">
                  {activeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSwapUnits}
            className="rounded-full h-10 w-10 bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
        
        {/* To Unit */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            A
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                value={toValue}
                readOnly
                className="w-full bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="flex-1">
              <Select value={toUnit} onValueChange={(value) => setToUnit(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-[20000]">
                  {activeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Los resultados son aproximados. Para conversiones de alta precisión, consulte fuentes especializadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
