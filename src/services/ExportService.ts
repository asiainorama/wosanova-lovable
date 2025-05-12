
import * as XLSX from 'xlsx';
import { AppData } from '@/data/types';

// Función para exportar aplicaciones a Excel
export const exportAppsToExcel = (apps: AppData[], filename: string = 'apps-export') => {
  try {
    // Preparar los datos para la exportación - sin id, created_at, updated_at
    const exportData = apps.map(app => ({
      name: app.name,
      description: app.description,
      url: app.url,
      icon_url: app.icon,
      category: app.category,
      subcategory: app.subcategory || '', // Incluimos subcategoría, con valor vacío si no existe
      is_ai: app.isAI ? 'Sí' : 'No'
    }));

    // Crear un libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Apps');

    // Guardar el archivo
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error al exportar aplicaciones a Excel:', error);
    return false;
  }
};

// Función para importar aplicaciones desde Excel
export const importAppsFromExcel = async (file: File): Promise<AppData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!e.target || !e.target.result) {
          reject('Error al leer el archivo');
          return;
        }

        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Convertir los datos importados al formato AppData
        const importedApps: AppData[] = jsonData.map((row: any) => ({
          id: crypto.randomUUID().toString(), // Generamos un nuevo ID
          name: row.name || 'Sin nombre',
          description: row.description || 'Sin descripción',
          url: row.url || '#',
          icon: row.icon_url || row.icon || 'https://via.placeholder.com/128',
          category: row.category || 'General',
          subcategory: row.subcategory || '', // Añadimos soporte para subcategoría
          isAI: row.is_ai === 'Sí' || row.is_ai === true,
          created_at: new Date().toISOString(), // Fecha actual para nuevos registros
          updated_at: new Date().toISOString()
        }));

        resolve(importedApps);
      } catch (error) {
        reject(`Error procesando el archivo Excel: ${error}`);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
