
import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Search } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppsTableProps {
  apps: AppData[];
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
}

const AppsTable = ({ apps, onEdit, onDelete }: AppsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Cambiado de 10 a 5 apps por página
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = useState(false);

  // Effect to detect landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastApp = currentPage * itemsPerPage;
  const indexOfFirstApp = indexOfLastApp - itemsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Display condition for columns - mobile in portrait mode shows minimal columns
  const showDetails = !isMobile || isLandscape;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar aplicaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Logo</TableHead>
              <TableHead className="w-[220px]">Nombre</TableHead> {/* Aumentado de 180px a 220px */}
              {showDetails && (
                <>
                  <TableHead className="w-[300px]">Descripción</TableHead>
                  <TableHead className="w-[120px]">Categoría</TableHead>
                  <TableHead className="w-[150px]">URL</TableHead>
                </>
              )}
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showDetails ? 6 : 3} className="h-24 text-center">
                  No se encontraron aplicaciones.
                </TableCell>
              </TableRow>
            ) : (
              currentApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div 
                      className="w-10 h-10 overflow-hidden rounded-md cursor-pointer transition-all hover:opacity-80"
                      onClick={() => onEdit(app)}
                    >
                      <AspectRatio ratio={1 / 1}>
                        <img
                          src={app.icon}
                          alt={`${app.name} logo`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </AspectRatio>
                    </div>
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-primary transition-colors max-w-[220px] truncate"
                    onClick={() => onEdit(app)}
                  >
                    {app.name}
                  </TableCell>
                  
                  {showDetails && (
                    <>
                      <TableCell className="max-w-[300px] truncate">
                        {app.description}
                      </TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {app.url}
                        </a>
                      </TableCell>
                    </>
                  )}
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end">                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar {app.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La aplicación se eliminará permanentemente del catálogo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(app.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsTable;
