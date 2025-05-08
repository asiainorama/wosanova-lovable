
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Usar try/catch para manejar posibles errores de contexto
  let theme: string = 'system';
  try {
    const themeContext = useTheme();
    // Convertir nuestro modo de tema a lo que sonner espera
    theme = themeContext?.mode === 'dark' ? 'dark' : 
            themeContext?.mode === 'light' ? 'light' : 'system';
  } catch (error) {
    console.error("Error al obtener el modo del tema:", error);
    // Por defecto usar sistema si el contexto falla
    
    // Intentar detectar tema del sistema como fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      expand={true}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          loading:
            "group-[.toast]:text-primary group-[.toast]:border-primary",
        },
        duration: 5000
      }}
      {...props}
    />
  );
};

export { Toaster };
export { toast } from "sonner";
