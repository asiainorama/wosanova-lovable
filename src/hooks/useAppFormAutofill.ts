
import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { autofillFromUrl, autofillFromName, generateIdFromName } from "@/services/AppInfoService";
import { toast } from "sonner";

export const useAppFormAutofill = (
  formData: AppData,
  setFormData: React.Dispatch<React.SetStateAction<AppData>>,
  isEditing: boolean
) => {
  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleAutofill = async (name: string, value: string) => {
    // Only autofill if the value is meaningful
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

  return {
    isAutofilling,
    handleAutofill,
  };
};

export default useAppFormAutofill;
