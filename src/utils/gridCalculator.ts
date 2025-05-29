
/**
 * Calculate the minimum cell height based on viewport dimensions and grid configuration
 */
export function calculateMinCellHeight(rows: number): string {
  const viewportHeight = window.innerHeight;
  const headerHeight = 120; // Header + padding
  const paginationHeight = 60; // Space for pagination dots
  const containerPadding = 40; // Container padding top/bottom
  const availableHeight = viewportHeight - headerHeight - paginationHeight - containerPadding;
  
  return `${Math.floor(availableHeight / rows)}px`;
}

/**
 * Calculate optimal grid configuration based on available space
 */
export function calculateOptimalGrid(smallerIcons: boolean = false) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  
  // Calculate available height
  const headerHeight = 120;
  const paginationHeight = 60;
  const paddingBuffer = 40;
  const availableHeight = height - headerHeight - paginationHeight - paddingBuffer;
  
  // Base cell height estimates
  const baseCellHeight = smallerIcons ? 85 : 100;
  const maxRows = Math.floor(availableHeight / baseCellHeight);
  
  // Return configuration based on screen size
  if (width >= 768 && width <= 1024) {
    const rows = Math.min(maxRows, isLandscape ? 4 : 5);
    return isLandscape ? { cols: 6, rows } : { cols: 5, rows };
  }
  
  if (width > 1024 && width <= 1440) {
    const rows = Math.min(maxRows, 5);
    return { cols: 6, rows };
  }
  
  if (width > 1440) {
    const rows = Math.min(maxRows, 6);
    return { cols: 6, rows };
  }
  
  // Mobile - optimizado para horizontal con 2 filas máximo
  const mobileRows = Math.min(maxRows, isLandscape ? 2 : 5);
  return isLandscape ? { cols: 6, rows: mobileRows } : { cols: 4, rows: mobileRows };
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
