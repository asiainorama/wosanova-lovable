
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
import { Search, FileDown, FileUp, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppsTableProps {
  apps: AppData[];
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
}

const AppsTable = ({ apps, onEdit, onDelete }: AppsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  const itemsPerPage = 10;
  const isMobile = useIsMobile();

  // Detectar orientación horizontal en dispositivos móviles
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

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

  // Determinar qué columnas mostrar basado en el dispositivo y orientación
  const showDescription = !isMobile || (isMobile && isLandscape);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar aplicaciones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              {showDescription && <TableHead>Descripción</TableHead>}
              {!isMobile && <TableHead>Categoría</TableHead>}
              {!isMobile && <TableHead>URL</TableHead>}
              <TableHead>Logo</TableHead>
              {!isMobile && <TableHead className="w-[100px]">IA</TableHead>}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? (showDescription ? 3 : 2) : 7} className="h-24 text-center">
                  No se encontraron aplicaciones.
                </TableCell>
              </TableRow>
            ) : (
              paginatedApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-blue-600 text-blue-500 underline transition-colors"
                    onClick={() => onEdit(app)}
                  >
                    {app.name}
                  </TableCell>
                  {showDescription && <TableCell className="max-w-xs truncate">{app.description}</TableCell>}
                  {!isMobile && <TableCell>{app.category}</TableCell>}
                  {!isMobile && (
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {app.url}
                      </a>
                    </TableCell>
                  )}
                  <TableCell>
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="h-8 w-8 rounded"
                    />
                  </TableCell>
                  {!isMobile && <TableCell>{app.isAI ? "Sí" : "No"}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(app.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredApps.length)} de {filteredApps.length} aplicaciones
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <div className="flex items-center px-2">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
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
