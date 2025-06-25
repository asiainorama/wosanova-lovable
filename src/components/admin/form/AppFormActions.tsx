
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AppFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AppFormActions: React.FC<AppFormActionsProps> = ({ onSave, onCancel, isLoading = false }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </Button>
      <Button type="button" onClick={onSave} disabled={isLoading}>
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
  );
};

export default AppFormActions;
