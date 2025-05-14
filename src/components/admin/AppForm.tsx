
import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { validateAppForm, ensureValidId } from "@/utils/formValidation";
import useAppFormAutofill from "@/hooks/useAppFormAutofill";
import { 
  NameField, 
  UrlField, 
  IconField, 
  CategoryField, 
  SubcategoryField, 
  AIToggleField, 
  DescriptionField 
} from "./form/AppFormFields";
import AppFormActions from "./form/AppFormActions";

interface AppFormProps {
  app: AppData | null;
  onSave: (app: AppData) => void;
  onCancel: () => void;
}

const AppForm = ({ app, onSave, onCancel }: AppFormProps) => {
  const initialFormState: AppData = {
    id: "",
    name: "",
    icon: "",
    url: "",
    category: "Utilidades",
    subcategory: "",
    description: "",
    isAI: false,
  };
  
  const [formData, setFormData] = useState<AppData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!app;
  const { isAutofilling, handleAutofill } = useAppFormAutofill(formData, setFormData, isEditing);

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
      const updatedFormData = ensureValidId({ ...formData, name: value }, isEditing);
      setFormData(updatedFormData);
    }
    
    // Try to autofill fields based on URL or name
    await handleAutofill(name, value);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAI: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors = validateAppForm(formData);
    
    // Generate ID from name if empty (ensure valid ID)
    const updatedFormData = ensureValidId(formData, isEditing);
    setFormData(updatedFormData);
    
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
        {/* Hidden ID field since it's auto-generated */}
        <input
          type="hidden"
          name="id"
          value={formData.id}
        />

        <NameField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />

        <UrlField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling} 
        />

        <IconField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />

        <CategoryField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />

        <SubcategoryField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />

        <AIToggleField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />

        <DescriptionField 
          formData={formData} 
          errors={errors} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          isAutofilling={isAutofilling}
        />
      </div>

      <AppFormActions onCancel={onCancel} isLoading={isLoading} />
    </form>
  );
};

export default AppForm;
