
import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categories } from "@/data/apps";

interface AppFormProps {
  app: AppData | null;
  onSave: (app: AppData) => void;
  onCancel: () => void;
}

const AppForm = ({ app, onSave, onCancel }: AppFormProps) => {
  const [formData, setFormData] = useState<AppData>({
    id: "",
    name: "",
    icon: "",
    url: "",
    category: "Utilidades",
    description: "",
    isAI: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!app;

  useEffect(() => {
    if (app) {
      setFormData(app);
    }
  }, [app]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAI: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.icon.trim()) newErrors.icon = "La URL del icono es obligatoria";
    if (!formData.url.trim()) newErrors.url = "La URL de la aplicación es obligatoria";
    if (!formData.description.trim()) 
      newErrors.description = "La descripción es obligatoria";
    
    // ID validation
    if (!formData.id.trim()) {
      // Generate ID from name if empty
      if (formData.name.trim()) {
        formData.id = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      } else {
        newErrors.id = "El ID es obligatorio";
      }
    }

    // URL validation
    if (formData.url.trim() && !formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = "La URL debe comenzar con http:// o https://";
    }

    // Icon URL validation
    if (formData.icon.trim() && !formData.icon.match(/^https?:\/\/.+/)) {
      newErrors.icon = "La URL del icono debe comenzar con http:// o https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Editar Aplicación" : "Añadir Nueva Aplicación"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="id">ID</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="app-id"
            disabled={isEditing}
          />
          {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
          {isEditing && (
            <p className="text-sm text-muted-foreground">
              El ID no se puede modificar una vez creado.
            </p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://ejemplo.com"
          />
          {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
        </div>

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
        </div>

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
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

export default AppForm;
