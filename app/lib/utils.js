import { clsx } from 'clsx';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Utility pour combiner les classes CSS
export function cn(...inputs) {
  return clsx(inputs);
}

// Formatage des dates
export function formatDate(date, formatStr = 'dd/MM/yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
}

// Formatage des montants
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' CFA';
}

// Calcul de la durée entre deux dates
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
}

// Génération d'un numéro de convention
export function generateConventionNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CONV-${year}-${random}`;
}

// Génération d'un numéro de mandat
export function generateMandatNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MAND-${year}-${random}`;
}

// Calcul du solde
export function calculateSolde(montantTotal, montantPaye) {
  return (montantTotal || 0) - (montantPaye || 0);
}

// Validation d'email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation de téléphone
export function isValidPhone(phone) {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Obtenir la couleur d'un statut
export function getStatusColor(status, type = 'convention') {
  const colors = {
    convention: {
      brouillon: 'bg-gray-100 text-gray-800',
      en_cours: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspendue: 'bg-yellow-100 text-yellow-800',
      terminee: 'bg-gray-100 text-gray-800',
      resiliee: 'bg-red-100 text-red-800'
    },
    mandat: {
      brouillon: 'bg-gray-100 text-gray-800',
      valide: 'bg-green-100 text-green-800',
      paye: 'bg-blue-100 text-blue-800',
      annule: 'bg-red-100 text-red-800'
    }
  };
  
  return colors[type]?.[status] || 'bg-gray-100 text-gray-800';
}

// Filtrer et trier les données
export function filterAndSort(data, filters, sortBy, sortOrder = 'asc') {
  let filtered = [...data];
  
  // Appliquer les filtres
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '') {
      filtered = filtered.filter(item => {
        if (typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    }
  });
  
  // Appliquer le tri
  if (sortBy) {
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Gestion des dates
      if (sortBy.includes('date') || sortBy.includes('Date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // Gestion des nombres
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Gestion des chaînes
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'fr')
          : bVal.localeCompare(aVal, 'fr');
      }
      
      // Gestion des dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }
  
  return filtered;
}

// Pagination
export function paginate(data, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    data: data.slice(startIndex, endIndex),
    totalPages: Math.ceil(data.length / itemsPerPage),
    currentPage: page,
    totalItems: data.length
  };
}
