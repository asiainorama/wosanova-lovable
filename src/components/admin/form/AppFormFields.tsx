
import React from "react";
import { AppData } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categories } from "@/data/apps";
import { Loader2 } from "lucide-react";

interface FormFieldProps {
  formData: AppData;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
  isAutofilling: boolean;
}

export const NameField = ({ formData, errors, handleChange }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="name">Nombre</Label>
    <Input
      id="name"
      name="name"
      value={formData.name}
      onChange={handleChange}
      placeholder="Nombre de la aplicación"
    />
    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
  </div>
);

export const UrlField = ({ formData, errors, handleChange, isAutofilling }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="url">URL</Label>
    <div className="relative">
      <Input
        id="url"
        name="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="https://ejemplo.com"
        className={isAutofilling ? "pr-10" : ""}
      />
      {isAutofilling && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
    {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
    <p className="text-xs text-muted-foreground">
      Al introducir una URL, se intentarán autocompletar los demás campos.
    </p>
  </div>
);

export const IconField = ({ formData, errors, handleChange }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="icon">URL del Icono</Label>
    <Input
      id="icon"
      name="icon"
      value={formData.icon}
      onChange={handleChange}
      placeholder="https://ejemplo.com/icon.png"
    />
    {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
    {formData.icon && (
      <div className="mt-2 flex items-center space-x-2">
        <img 
          src={formData.icon} 
          alt="Icono de vista previa" 
          className="w-8 h-8 object-contain rounded border"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")} 
        />
        <span className="text-xs text-muted-foreground">Vista previa</span>
      </div>
    )}
  </div>
);

export const CategoryField = ({ formData, handleChange }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="category">Categoría</Label>
    <select
      id="category"
      name="category"
      value={formData.category}
      onChange={handleChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {categories.sort().map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
);

export const SubcategoryField = ({ formData, handleChange }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="subcategory">Subcategoría</Label>
    <Input
      id="subcategory"
      name="subcategory"
      value={formData.subcategory || ""}
      onChange={handleChange}
      placeholder="Subcategoría (opcional)"
    />
  </div>
);

export const AIToggleField = ({ formData, handleSwitchChange }: FormFieldProps) => (
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
);

export const DescriptionField = ({ formData, errors, handleChange }: FormFieldProps) => (
  <div className="space-y-2 md:col-span-2">
    <Label htmlFor="description">Descripción</Label>
    <Textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Descripción de la aplicación"
      rows={3}
    />
    {errors.description && (
      <p className="text-sm text-red-500">{errors.description}</p>
    )}
  </div>
);
