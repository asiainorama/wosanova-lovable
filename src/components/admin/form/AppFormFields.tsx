
import React from "react";
import { AppData } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { mainCategories } from "@/data/mainCategories";
import { Loader2 } from "lucide-react";

interface AppFormFieldsProps {
  formData: AppData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onUrlBlur: () => void;
  onIconError: () => void;
  categories: string[];
  isLoadingInfo: boolean;
}

const AppFormFields: React.FC<AppFormFieldsProps> = ({
  formData,
  onChange,
  onUrlBlur,
  onIconError,
  categories,
  isLoadingInfo,
}) => {
  const handleSwitchChange = (checked: boolean) => {
    const event = {
      target: {
        name: 'isAI',
        value: checked,
        type: 'checkbox',
        checked: checked,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Nombre de la aplicación"
        />
      </div>

      {/* URL Field */}
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="relative">
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={onChange}
            onBlur={onUrlBlur}
            placeholder="https://ejemplo.com"
            className={isLoadingInfo ? "pr-10" : ""}
          />
          {isLoadingInfo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Al introducir una URL, se intentarán autocompletar los demás campos.
        </p>
      </div>

      {/* Icon Field */}
      <div className="space-y-2">
        <Label htmlFor="icon">URL del Icono</Label>
        <Input
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={onChange}
          placeholder="https://ejemplo.com/icon.png"
        />
        {formData.icon && (
          <div className="mt-2 flex items-center space-x-2">
            <img 
              src={formData.icon} 
              alt="Icono de vista previa" 
              className="w-8 h-8 object-contain rounded border"
              onError={onIconError}
            />
            <span className="text-xs text-muted-foreground">Vista previa</span>
          </div>
        )}
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Field */}
      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategoría</Label>
        <Input
          id="subcategory"
          name="subcategory"
          value={formData.subcategory || ""}
          onChange={onChange}
          placeholder="Subcategoría (opcional)"
        />
      </div>

      {/* AI Toggle Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="isAI">¿Es una Aplicación de IA?</Label>
          <Switch
            id="isAI"
            checked={formData.isAI}
            onCheckedChange={handleSwitchChange}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Descripción de la aplicación"
          rows={3}
        />
      </div>
    </div>
  );
};

export default AppFormFields;
