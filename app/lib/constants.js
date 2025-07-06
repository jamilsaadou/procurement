// Types de conventions
export const TYPES_CONVENTIONS = [
  { id: 'marche', label: 'Marché public' },
  { id: 'prestation', label: 'Prestation de service' },
  { id: 'fourniture', label: 'Fourniture' },
  { id: 'travaux', label: 'Travaux' },
  { id: 'consultation', label: 'Consultation' }
];

// Modes de sélection
export const MODES_SELECTION = [
  { id: 'appel_offres', label: 'Appel d\'offres ouvert' },
  { id: 'appel_offres_restreint', label: 'Appel d\'offres restreint' },
  { id: 'procedure_negociee', label: 'Procédure négociée' },
  { id: 'gre_a_gre', label: 'Gré à gré' },
  { id: 'concours', label: 'Concours' }
];

// Périodicités de paiement
export const PERIODICITES_PAIEMENT = [
  { id: 'mensuel', label: 'Mensuel' },
  { id: 'trimestriel', label: 'Trimestriel' },
  { id: 'semestriel', label: 'Semestriel' },
  { id: 'annuel', label: 'Annuel' },
  { id: 'unique', label: 'Paiement unique' },
  { id: 'sur_facture', label: 'Sur facture' }
];

// Statuts des conventions
export const STATUTS_CONVENTIONS = [
  { id: 'brouillon', label: 'Brouillon', color: 'gray' },
  { id: 'en_cours', label: 'En cours', color: 'blue' },
  { id: 'active', label: 'Active', color: 'green' },
  { id: 'suspendue', label: 'Suspendue', color: 'yellow' },
  { id: 'terminee', label: 'Terminée', color: 'gray' },
  { id: 'resiliee', label: 'Résiliée', color: 'red' }
];

// Statuts des mandats
export const STATUTS_MANDATS = [
  { id: 'brouillon', label: 'Brouillon', color: 'gray' },
  { id: 'valide', label: 'Validé', color: 'green' },
  { id: 'paye', label: 'Payé', color: 'blue' },
  { id: 'annule', label: 'Annulé', color: 'red' }
];

// Lignes budgétaires par défaut
export const LIGNES_BUDGETAIRES = [
  { id: 'fonctionnement', label: 'Fonctionnement' },
  { id: 'investissement', label: 'Investissement' },
  { id: 'personnel', label: 'Personnel' },
  { id: 'equipement', label: 'Équipement' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'formation', label: 'Formation' },
  { id: 'conseil', label: 'Conseil' }
];
