import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categories } from "@/data/apps";
import { autofillFromUrl, autofillFromName, generateIdFromName } from "@/services/AppInfoService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const isEditing = !!app;

  useEffect(() => {
    if (app) {
      setFormData(app);
    }
  }, [app]);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Update form data with the new value
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Auto-generate ID from name
    if (name === 'name' && !isEditing && value && !formData.id) {
      const generatedId = generateIdFromName(value);
      setFormData(prev => ({ ...prev, id: generatedId }));
    }
    
    // Try to autofill fields based on URL or name
    if ((name === 'url' || name === 'name') && !isAutofilling && value.length > 3) {
      setIsAutofilling(true);
      
      try {
        if (name === 'url') {
          const result = await autofillFromUrl(value);
          if (Object.keys(result).length > 0) {
            const updates: Partial<AppData> = {};
            
            // Only autofill empty fields
            if (result.name && !formData.name) updates.name = result.name;
            if (result.icon && !formData.icon) updates.icon = result.icon;
            if (result.category && formData.category === "Utilidades") updates.category = result.category;
            
            // If we got a name and no ID yet, generate it
            if (result.name && !formData.id && !isEditing) {
              updates.id = generateIdFromName(result.name);
            }
            
            if (Object.keys(updates).length > 0) {
              setFormData(prev => ({ ...prev, ...updates }));
              toast.success("Algunos campos se han autocompletado");
            }
          }
        } else if (name === 'name' && !formData.icon) {
          const result = await autofillFromName(value);
          if (result.icon) {
            setFormData(prev => ({ ...prev, icon: result.icon }));
            toast.success("Se ha encontrado un posible icono");
          }
        }
      } catch (error) {
        console.error("Error autofilling:", error);
      } finally {
        setIsAutofilling(false);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onSave(formData);
      } finally {
        setIsLoading(false);
      }
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
        {/* Ocultamos el campo ID ya que se rellena automáticamente */}
        <input
          type="hidden"
          name="id"
          value={formData.id}
        />

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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AppForm;
