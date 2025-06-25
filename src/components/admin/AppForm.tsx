
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppData } from "@/data/types";
import { useAppFormAutofill } from "@/hooks/useAppFormAutofill";
import { mainCategories } from "@/data/mainCategories";
import AppFormFields from "./form/AppFormFields";
import AppFormActions from "./form/AppFormActions";

interface AppFormProps {
  app?: AppData | null;
  onSave: (app: AppData) => void;
  onCancel: () => void;
}

const AppForm: React.FC<AppFormProps> = ({ app, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AppData>({
    id: app?.id || "",
    name: app?.name || "",
    description: app?.description || "",
    url: app?.url || "",
    icon: app?.icon || "",
    category: app?.category || mainCategories[0] || "",
    subcategory: app?.subcategory || "",
    isAI: app?.isAI || false,
    created_at: app?.created_at || new Date().toISOString(),
    updated_at: app?.updated_at || new Date().toISOString(),
  });

  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const { isAutofilling, handleAutofill } = useAppFormAutofill(formData, setFormData, !!app);

  useEffect(() => {
    if (app) {
      setFormData(app);
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        url: "",
        icon: "",
        category: mainCategories[0] || "",
        subcategory: "",
        isAI: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [app]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Trigger autofill for name and url changes
    if (name === 'name' || name === 'url') {
      handleAutofill(name, value);
    }
  };

  const handleSave = () => {
    // Validate form data before saving
    if (!formData.name || !formData.description || !formData.url || !formData.category) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    onSave(formData);
  };

  const handleUrlBlur = async () => {
    if (formData.url && !formData.icon) {
      setIsLoadingInfo(true);
      try {
        await handleAutofill('url', formData.url);
      } catch (error) {
        console.error("Error fetching app info:", error);
      } finally {
        setIsLoadingInfo(false);
      }
    }
  };

  const handleIconError = () => {
    setFormData((prev) => ({ ...prev, icon: "" }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{app ? "Editar Aplicación" : "Nueva Aplicación"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AppFormFields
          formData={formData}
          onChange={handleChange}
          onUrlBlur={handleUrlBlur}
          onIconError={handleIconError}
          categories={mainCategories}
          isLoadingInfo={isLoadingInfo || isAutofilling}
        />
        <AppFormActions onSave={handleSave} onCancel={onCancel} />
      </CardContent>
    </Card>
  );
};

export default AppForm;
