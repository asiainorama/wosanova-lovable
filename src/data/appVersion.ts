
// Información sobre la versión de la aplicación
// Este archivo se actualizará automáticamente cuando se publiquen actualizaciones

export const appVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  
  // Devuelve la versión en formato string: "1.0.0"
  toString: function() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
};

// La fecha de la última actualización
export const lastUpdateDate = new Date('2024-05-04');

