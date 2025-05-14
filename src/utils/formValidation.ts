
import { AppData } from "@/data/types";
import { generateIdFromName } from "@/services/AppInfoService";
import { toast } from "sonner";

export const validateAppForm = (formData: AppData): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  // Required fields
  if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
  if (!formData.icon.trim()) newErrors.icon = "La URL del icono es obligatoria";
  if (!formData.url.trim()) newErrors.url = "La URL de la aplicación es obligatoria";
  if (!formData.description.trim()) 
    newErrors.description = "La descripción es obligatoria";
  
  // URL validation
  if (formData.url.trim() && !formData.url.match(/^https?:\/\/.+/)) {
    newErrors.url = "La URL debe comenzar con http:// o https://";
  }

  // Icon URL validation
  if (formData.icon.trim() && !formData.icon.match(/^https?:\/\/.+/)) {
    newErrors.icon = "La URL del icono debe comenzar con http:// o https://";
  }

  return newErrors;
};

// Function to manage form ID generation
export const ensureValidId = (formData: AppData, isEditing: boolean): AppData => {
  const updatedFormData = { ...formData };
  
  // ID validation
  if (!updatedFormData.id.trim()) {
    // Generate ID from name if empty
    if (updatedFormData.name.trim() && !isEditing) {
      updatedFormData.id = generateIdFromName(updatedFormData.name);
      toast.info("Se generó un ID basado en el nombre");
    }
  }
  
  return updatedFormData;
};
