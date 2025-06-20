
/**
 * Calculate the minimum cell height based on viewport dimensions and grid configuration
 */
export function calculateMinCellHeight(rows: number): string {
  const viewportHeight = window.innerHeight;
  const headerHeight = 120; // Header + padding
  const paginationHeight = 60; // Space for pagination dots
  const containerPadding = 40; // Container padding top/bottom
  const textSpace = 60; // Increased space for app names (was 40)
  const availableHeight = viewportHeight - headerHeight - paginationHeight - containerPadding;
  
  // Para móvil horizontal con 2 filas, dar mucho más espacio para los nombres
  if (rows === 2 && window.innerWidth > window.innerHeight) {
    const cellHeight = Math.floor((availableHeight - textSpace) / 2);
    // Asegurar altura mínima para móvil horizontal
    return `${Math.max(cellHeight, 140)}px`; // Increased minimum from 120 to 140
  }
  
  return `${Math.floor((availableHeight - textSpace) / rows)}px`;
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
  const textSpace = 50; // Increased space for text
  const availableHeight = height - headerHeight - paginationHeight - paddingBuffer - textSpace;
  
  // Base cell height estimates - más espacio para móvil horizontal
  const baseCellHeight = smallerIcons ? 100 : 120; // Increased base height
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
      // Móvil vertical: máximo 5 filas, 4 columnas
      const mobileRows = Math.min(maxRows, 4); // Reduced from 5 to 4
      const config = { cols: 4, rows: mobileRows };
      console.log("Mobile portrait config:", config);
      return config;
    }
  }
  
  // iPad (768px - 1024px) - solo si no es móvil
  if (width >= 768 && width <= 1024) {
    const rows = Math.min(maxRows, isLandscape ? 4 : 5);
    const config = isLandscape ? { cols: 6, rows } : { cols: 5, rows };
    console.log("iPad config:", config);
    return config;
  }
  
  // Laptop (1024px - 1440px)
  if (width > 1024 && width <= 1440) {
    const rows = Math.min(maxRows, 4); // Reduced from 5 to 4
    const config = { cols: 6, rows };
    console.log("Laptop config:", config);
    return config;
  }
  
  // Large screens (>1440px)
  if (width > 1440) {
    const rows = Math.min(maxRows, 5); // Reduced from 6 to 5
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
