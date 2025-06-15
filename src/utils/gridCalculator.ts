
/**
 * Calculate the minimum cell height based on viewport dimensions and grid configuration
 */
export function calculateMinCellHeight(rows: number): string {
  const viewportHeight = window.innerHeight;
  const headerHeight = 120; // Header + padding
  const paginationHeight = 60; // Space for pagination dots
  const containerPadding = 40; // Container padding top/bottom
  const textSpaceBuffer = 40; // Extra space for app names (increased)
  const availableHeight = viewportHeight - headerHeight - paginationHeight - containerPadding - textSpaceBuffer;
  
  // Para móvil horizontal con 2 filas, asegurar espacio suficiente para nombres
  if (rows === 2 && window.innerWidth > window.innerHeight) {
    const cellHeight = Math.floor(availableHeight / 2);
    return `${Math.max(cellHeight, 120)}px`; // Mínimo 120px por celda
  }
  
  const cellHeight = Math.floor(availableHeight / rows);
  return `${Math.max(cellHeight, 100)}px`; // Mínimo 100px por celda
}

/**
 * Calculate optimal grid configuration based on available space
 */
export function calculateOptimalGrid(smallerIcons: boolean = false) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  
  console.log("calculateOptimalGrid - Width:", width, "Height:", height, "IsLandscape:", isLandscape);
  
  // Calculate available height considering header, pagination, and text space
  const headerHeight = 120;
  const paginationHeight = 60;
  const paddingBuffer = 40;
  const textSpaceBuffer = 40; // Space for app names
  const availableHeight = height - headerHeight - paginationHeight - paddingBuffer - textSpaceBuffer;
  
  // Base cell height estimates - más conservador para asegurar espacio para texto
  const baseCellHeight = smallerIcons ? 100 : 120; // Increased base heights
  const maxRows = Math.floor(availableHeight / baseCellHeight);
  
  // MÓVIL: Detectar móvil primero, antes que tablet
  // Móvil se define como width < 768px O height < 768px (para cubrir móvil rotado)
  const isMobile = width < 768 || height < 768;
  
  if (isMobile) {
    if (isLandscape) {
      // Móvil horizontal: SIEMPRE 2 filas, 5 columnas
      const config = { cols: 5, rows: 2 };
      console.log("Mobile landscape config (forced 2 rows):", config);
      return config;
    } else {
      // Móvil vertical: máximo 4 filas, 4 columnas
      const mobileRows = Math.min(Math.max(maxRows, 3), 4); // Mínimo 3, máximo 4
      const config = { cols: 4, rows: mobileRows };
      console.log("Mobile portrait config:", config);
      return config;
    }
  }
  
  // iPad (768px - 1024px) - solo si no es móvil
  if (width >= 768 && width <= 1024) {
    const rows = Math.min(Math.max(maxRows, 3), isLandscape ? 4 : 5);
    const config = isLandscape ? { cols: 6, rows } : { cols: 5, rows };
    console.log("iPad config:", config);
    return config;
  }
  
  // Laptop (1024px - 1440px)
  if (width > 1024 && width <= 1440) {
    const rows = Math.min(Math.max(maxRows, 3), 4); // Máximo 4 filas para laptop
    const config = { cols: 6, rows };
    console.log("Laptop config:", config);
    return config;
  }
  
  // Large screens (>1440px)
  if (width > 1440) {
    const rows = Math.min(Math.max(maxRows, 3), 5); // Máximo 5 filas
    const config = { cols: 6, rows };
    console.log("Large screen config:", config);
    return config;
  }
  
  // Fallback (no debería llegar aquí)
  const config = { cols: 4, rows: 3 };
  console.log("Fallback config:", config);
  return config;
}

/**
 * Prepare app data for paginated grid display
 */
export function preparePaginatedApps(apps: any[], appsPerPage: number, totalPages: number) {
  return Array(totalPages).fill(null).map((_, pageIndex) => {
    const startIdx = pageIndex * appsPerPage;
    const pageItems = apps.slice(startIdx, startIdx + appsPerPage);
    
    // Fill with empty items to maintain structure
    if (pageItems.length < appsPerPage && pageIndex === totalPages - 1) {
      return [...pageItems, ...Array(appsPerPage - pageItems.length).fill(null)];
    }
    return pageItems;
  });
}
