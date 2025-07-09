import * as XLSX from 'xlsx';

export function exportConventionsToExcel(conventions) {
  // Préparer les données pour l'export
  const data = conventions.map((convention, index) => ({
    'N°': index + 1,
    'N° Convention': convention.numero,
    'Mandat': convention.mandat?.titre || 'N/A',
    'Partenaire': convention.partenaire?.nom || 'N/A',
    'Représentant': convention.partenaire?.representantLegal || 'N/A',
    'Ligne Budgétaire': convention.ligneBudgetaire?.libelle || 'N/A',
    'Type': convention.typeConvention,
    'Mode Sélection': convention.modeSelection,
    'Objet': convention.objet,
    'Date Début': new Date(convention.dateDebut).toLocaleDateString('fr-FR'),
    'Date Fin': new Date(convention.dateFin).toLocaleDateString('fr-FR'),
    'Durée (jours)': convention.duree,
    'Montant Total (FCFA)': convention.montantTotal.toLocaleString('fr-FR'),
    'Statut': convention.statut,
    'Solde (%)': convention.solde || 0,
    'Description': convention.description || ''
  }));

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();
  
  // Créer la feuille de calcul
  const ws = XLSX.utils.json_to_sheet(data);

  // Définir la largeur des colonnes
  const colWidths = [
    { wch: 5 },   // N°
    { wch: 15 },  // N° Convention
    { wch: 20 },  // Mandat
    { wch: 25 },  // Partenaire
    { wch: 20 },  // Représentant
    { wch: 25 },  // Ligne Budgétaire
    { wch: 12 },  // Type
    { wch: 15 },  // Mode Sélection
    { wch: 30 },  // Objet
    { wch: 12 },  // Date Début
    { wch: 12 },  // Date Fin
    { wch: 12 },  // Durée
    { wch: 18 },  // Montant Total
    { wch: 12 },  // Statut
    { wch: 10 },  // Solde
    { wch: 40 }   // Description
  ];
  
  ws['!cols'] = colWidths;

  // Ajouter des styles pour les en-têtes
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2563EB" } }, // Bleu
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  // Appliquer le style aux en-têtes (première ligne)
  const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1', 'N1', 'O1', 'P1'];
  headerCells.forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = headerStyle;
    }
  });

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'active':
      case 'en cours':
        return { rgb: "10B981" }; // Vert
      case 'terminée':
        return { rgb: "6B7280" }; // Gris
      case 'résiliée':
        return { rgb: "EF4444" }; // Rouge
      case 'brouillon':
        return { rgb: "F59E0B" }; // Orange
      default:
        return { rgb: "3B82F6" }; // Bleu par défaut
    }
  };

  // Appliquer des styles aux données
  data.forEach((row, rowIndex) => {
    const actualRowIndex = rowIndex + 2; // +2 car les en-têtes sont en ligne 1 et les données commencent en ligne 2
    
    // Style pour les lignes alternées
    const isEvenRow = rowIndex % 2 === 0;
    const rowFillColor = isEvenRow ? { rgb: "F9FAFB" } : { rgb: "FFFFFF" };
    
    // Appliquer le style à chaque cellule de la ligne
    headerCells.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: actualRowIndex - 1, c: colIndex });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          fill: { fgColor: rowFillColor },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } }
          },
          alignment: { vertical: "center" }
        };
        
        // Style spécial pour la colonne statut
        if (colIndex === 13) { // Colonne Statut
          ws[cellAddress].s.font = { 
            bold: true, 
            color: getStatusColor(row.Statut) 
          };
        }
        
        // Style spécial pour les montants
        if (colIndex === 12) { // Colonne Montant
          ws[cellAddress].s.font = { bold: true };
          ws[cellAddress].s.alignment = { horizontal: "right", vertical: "center" };
        }
        
        // Style spécial pour les dates
        if (colIndex === 9 || colIndex === 10) { // Colonnes dates
          ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
        }
      }
    });
  });

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, "Conventions");

  // Générer le nom du fichier avec la date
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const fileName = `conventions_export_${dateStr}.xlsx`;

  // Écrire et télécharger le fichier
  XLSX.writeFile(wb, fileName);
}

export function exportConventionsSummaryToExcel(conventions) {
  // Créer un résumé statistique
  const totalConventions = conventions.length;
  const totalMontant = conventions.reduce((sum, conv) => sum + conv.montantTotal, 0);
  
  const statutStats = conventions.reduce((acc, conv) => {
    acc[conv.statut] = (acc[conv.statut] || 0) + 1;
    return acc;
  }, {});

  const typeStats = conventions.reduce((acc, conv) => {
    acc[conv.typeConvention] = (acc[conv.typeConvention] || 0) + 1;
    return acc;
  }, {});

  // Préparer les données de résumé
  const summaryData = [
    { 'Indicateur': 'Total Conventions', 'Valeur': totalConventions },
    { 'Indicateur': 'Montant Total (FCFA)', 'Valeur': totalMontant.toLocaleString('fr-FR') },
    { 'Indicateur': '', 'Valeur': '' }, // Ligne vide
    { 'Indicateur': 'RÉPARTITION PAR STATUT', 'Valeur': '' },
    ...Object.entries(statutStats).map(([statut, count]) => ({
      'Indicateur': statut,
      'Valeur': count
    })),
    { 'Indicateur': '', 'Valeur': '' }, // Ligne vide
    { 'Indicateur': 'RÉPARTITION PAR TYPE', 'Valeur': '' },
    ...Object.entries(typeStats).map(([type, count]) => ({
      'Indicateur': type,
      'Valeur': count
    }))
  ];

  // Créer le workbook avec deux feuilles
  const wb = XLSX.utils.book_new();
  
  // Feuille de résumé
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
  
  // Feuille détaillée
  exportConventionsToExcel(conventions);
  
  XLSX.utils.book_append_sheet(wb, summaryWs, "Résumé");
  
  // Générer le nom du fichier
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const fileName = `conventions_resume_${dateStr}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
}
