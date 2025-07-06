// Gestion des données avec localStorage

// Clés de stockage
const STORAGE_KEYS = {
  CONVENTIONS: 'procurement_conventions',
  MANDATS: 'procurement_mandats',
  PARTENAIRES: 'procurement_partenaires',
  SETTINGS: 'procurement_settings'
};

// Utilitaires de stockage
function getFromStorage(key) {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture du localStorage:', error);
    return [];
  }
}

function saveToStorage(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
}

// Gestion des conventions
export const conventionsAPI = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.CONVENTIONS);
  },

  getById(id) {
    const conventions = this.getAll();
    return conventions.find(conv => conv.id === id);
  },

  create(convention) {
    const conventions = this.getAll();
    const newConvention = {
      ...convention,
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    conventions.push(newConvention);
    saveToStorage(STORAGE_KEYS.CONVENTIONS, conventions);
    return newConvention;
  },

  update(id, updates) {
    const conventions = this.getAll();
    const index = conventions.findIndex(conv => conv.id === id);
    if (index !== -1) {
      conventions[index] = {
        ...conventions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.CONVENTIONS, conventions);
      return conventions[index];
    }
    return null;
  },

  delete(id) {
    const conventions = this.getAll();
    const filtered = conventions.filter(conv => conv.id !== id);
    saveToStorage(STORAGE_KEYS.CONVENTIONS, filtered);
    return true;
  },

  getStats() {
    const conventions = this.getAll();
    const total = conventions.length;
    const active = conventions.filter(c => c.statut === 'active').length;
    const enCours = conventions.filter(c => c.statut === 'en_cours').length;
    const terminee = conventions.filter(c => c.statut === 'terminee').length;
    
    const montantTotal = conventions.reduce((sum, c) => sum + (c.montantTotal || 0), 0);
    const montantPaye = conventions.reduce((sum, c) => sum + (c.montantPaye || 0), 0);
    const soldeTotal = montantTotal - montantPaye;

    return {
      total,
      active,
      enCours,
      terminee,
      montantTotal,
      montantPaye,
      soldeTotal
    };
  }
};

// Gestion des mandats
export const mandatsAPI = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.MANDATS);
  },

  getById(id) {
    const mandats = this.getAll();
    return mandats.find(mandat => mandat.id === id);
  },

  getByConventionId(conventionId) {
    const mandats = this.getAll();
    return mandats.filter(mandat => mandat.conventionId === conventionId);
  },

  create(mandat) {
    const mandats = this.getAll();
    const newMandat = {
      ...mandat,
      id: `mandat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mandats.push(newMandat);
    saveToStorage(STORAGE_KEYS.MANDATS, mandats);
    return newMandat;
  },

  update(id, updates) {
    const mandats = this.getAll();
    const index = mandats.findIndex(mandat => mandat.id === id);
    if (index !== -1) {
      mandats[index] = {
        ...mandats[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.MANDATS, mandats);
      return mandats[index];
    }
    return null;
  },

  delete(id) {
    const mandats = this.getAll();
    const filtered = mandats.filter(mandat => mandat.id !== id);
    saveToStorage(STORAGE_KEYS.MANDATS, filtered);
    return true;
  },

  getStats() {
    const mandats = this.getAll();
    const total = mandats.length;
    const valide = mandats.filter(m => m.statut === 'valide').length;
    const paye = mandats.filter(m => m.statut === 'paye').length;
    const brouillon = mandats.filter(m => m.statut === 'brouillon').length;
    
    const montantTotal = mandats.reduce((sum, m) => sum + (m.montant || 0), 0);
    const montantPaye = mandats.filter(m => m.statut === 'paye')
      .reduce((sum, m) => sum + (m.montant || 0), 0);

    return {
      total,
      valide,
      paye,
      brouillon,
      montantTotal,
      montantPaye
    };
  }
};

// Gestion des partenaires
export const partenairesAPI = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.PARTENAIRES);
  },

  getById(id) {
    const partenaires = this.getAll();
    return partenaires.find(partenaire => partenaire.id === id);
  },

  create(partenaire) {
    const partenaires = this.getAll();
    const newPartenaire = {
      ...partenaire,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    partenaires.push(newPartenaire);
    saveToStorage(STORAGE_KEYS.PARTENAIRES, partenaires);
    return newPartenaire;
  },

  update(id, updates) {
    const partenaires = this.getAll();
    const index = partenaires.findIndex(partenaire => partenaire.id === id);
    if (index !== -1) {
      partenaires[index] = {
        ...partenaires[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.PARTENAIRES, partenaires);
      return partenaires[index];
    }
    return null;
  },

  delete(id) {
    const partenaires = this.getAll();
    const filtered = partenaires.filter(partenaire => partenaire.id !== id);
    saveToStorage(STORAGE_KEYS.PARTENAIRES, filtered);
    return true;
  }
};

// Gestion des lignes budgétaires
export const lignesBudgetairesAPI = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.LIGNES_BUDGETAIRES || 'procurement_lignes_budgetaires');
  },

  getById(id) {
    const lignes = this.getAll();
    return lignes.find(ligne => ligne.id === id);
  },

  create(ligne) {
    const lignes = this.getAll();
    const newLigne = {
      ...ligne,
      id: `ligne_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    lignes.push(newLigne);
    saveToStorage(STORAGE_KEYS.LIGNES_BUDGETAIRES || 'procurement_lignes_budgetaires', lignes);
    return newLigne;
  },

  update(id, updates) {
    const lignes = this.getAll();
    const index = lignes.findIndex(ligne => ligne.id === id);
    if (index !== -1) {
      lignes[index] = {
        ...lignes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.LIGNES_BUDGETAIRES || 'procurement_lignes_budgetaires', lignes);
      return lignes[index];
    }
    return null;
  },

  delete(id) {
    const lignes = this.getAll();
    const filtered = lignes.filter(ligne => ligne.id !== id);
    saveToStorage(STORAGE_KEYS.LIGNES_BUDGETAIRES || 'procurement_lignes_budgetaires', filtered);
    return true;
  }
};

// Données d'exemple pour initialiser l'application
export function initializeSampleData() {
  // Vérifier si des données existent déjà
  if (conventionsAPI.getAll().length > 0) return;

  // Créer des lignes budgétaires d'exemple et récupérer les objets créés avec leurs IDs
  const lignesBudgetairesData = [
    {
      numero: 'LB-2025-001',
      libelle: 'Fonctionnement - Maintenance informatique',
      periode: '2025',
      montant: 120000,
      montantUtilise: 40000,
      solde: 80000
    },
    {
      numero: 'LB-2025-002',
      libelle: 'Équipement - Mobilier de bureau',
      periode: '2025',
      montant: 45000,
      montantUtilise: 45000,
      solde: 0
    },
    {
      numero: 'LB-2025-003',
      libelle: 'Conseil - Formation du personnel',
      periode: '2025',
      montant: 75000,
      montantUtilise: 25000,
      solde: 50000
    }
  ];

  const lignesBudgetaires = lignesBudgetairesData.map(ligne => lignesBudgetairesAPI.create(ligne));

  // Créer des mandats d'exemple et récupérer les objets créés avec leurs IDs
  const mandatsData = [
    {
      numero: 'MAN-2025-0001',
      nomPartenaire: 'Entreprise Alpha',
      representantLegal: 'Jean Dupont',
      dateSignature: '2024-12-15',
      typeMandat: 'prestation_service',
      statut: 'actif',
      adressePartenaire: '123 Rue de la République, 75001 Paris',
      emailPartenaire: 'contact@alpha.com',
      telephonePartenaire: '01 23 45 67 89',
      numeroSiret: '12345678901234',
      formeJuridique: 'SAS'
    },
    {
      numero: 'MAN-2025-0002',
      nomPartenaire: 'Beta Solutions',
      representantLegal: 'Marie Martin',
      dateSignature: '2025-01-20',
      typeMandat: 'fourniture',
      statut: 'termine',
      adressePartenaire: '456 Avenue des Champs, 69000 Lyon',
      emailPartenaire: 'info@beta-solutions.fr',
      telephonePartenaire: '01 98 76 54 32',
      numeroSiret: '98765432109876',
      formeJuridique: 'SARL'
    },
    {
      numero: 'MAN-2025-0003',
      nomPartenaire: 'Gamma Consulting',
      representantLegal: 'Pierre Durand',
      dateSignature: '2025-02-10',
      typeMandat: 'conseil',
      statut: 'actif',
      adressePartenaire: '789 Boulevard du Commerce, 13000 Marseille',
      emailPartenaire: 'contact@gamma-consulting.fr',
      telephonePartenaire: '04 56 78 90 12',
      numeroSiret: '11223344556677',
      formeJuridique: 'SAS'
    }
  ];

  const mandats = mandatsData.map(mandat => mandatsAPI.create(mandat));

  // Créer des conventions d'exemple avec les IDs corrects
  const conventionsData = [
    {
      numero: 'CONV-2025-0001',
      objet: 'Maintenance informatique annuelle',
      dateDebut: '2025-01-01',
      dateFin: '2025-12-31',
      duree: 365,
      typeConvention: 'prestation_service',
      modeSelection: 'appel_offres',
      statut: 'active',
      montantTotal: 120000,
      montantPaye: 40000,
      solde: 80000,
      periodicitePaiement: 'mensuel',
      echeancesPaiement: [
        { date: '2025-01-31', montant: 10000, statut: 'paye' },
        { date: '2025-02-28', montant: 10000, statut: 'paye' },
        { date: '2025-03-31', montant: 10000, statut: 'paye' },
        { date: '2025-04-30', montant: 10000, statut: 'paye' },
        { date: '2025-05-31', montant: 10000, statut: 'en_attente' }
      ],
      mandatId: mandats[0].id,
      ligneBudgetaireId: lignesBudgetaires[0].id
    },
    {
      numero: 'CONV-2025-0002',
      objet: 'Fourniture de matériel de bureau',
      dateDebut: '2025-02-01',
      dateFin: '2025-07-31',
      duree: 181,
      typeConvention: 'fourniture',
      modeSelection: 'procedure_negociee',
      statut: 'terminee',
      montantTotal: 45000,
      montantPaye: 45000,
      solde: 0,
      periodicitePaiement: 'unique',
      echeancesPaiement: [
        { date: '2025-02-15', montant: 45000, statut: 'paye' }
      ],
      mandatId: mandats[1].id,
      ligneBudgetaireId: lignesBudgetaires[1].id
    },
    {
      numero: 'CONV-2025-0003',
      objet: 'Conseil en organisation',
      dateDebut: '2025-03-01',
      dateFin: '2025-08-31',
      duree: 183,
      typeConvention: 'conseil',
      modeSelection: 'appel_offres_restreint',
      statut: 'en_cours',
      montantTotal: 75000,
      montantPaye: 25000,
      solde: 50000,
      periodicitePaiement: 'trimestriel',
      echeancesPaiement: [
        { date: '2025-03-31', montant: 25000, statut: 'paye' },
        { date: '2025-06-30', montant: 25000, statut: 'en_attente' },
        { date: '2025-09-30', montant: 25000, statut: 'en_attente' }
      ],
      mandatId: mandats[2].id,
      ligneBudgetaireId: lignesBudgetaires[2].id
    }
  ];

  conventionsData.forEach(convention => conventionsAPI.create(convention));

  console.log('Données d\'exemple initialisées avec la nouvelle structure');
}
