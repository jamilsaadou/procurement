import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer toutes les données nécessaires
    const [conventions, mandats, lignesBudgetaires, paiements] = await Promise.all([
      prisma.convention.findMany({
        include: {
          mandat: true,
          ligneBudgetaire: true,
          partenaire: true,
          paiements: true
        }
      }),
      prisma.mandat.findMany({
        include: {
          conventions: {
            include: {
              ligneBudgetaire: true
            }
          }
        }
      }),
      prisma.ligneBudgetaire.findMany({
        include: {
          conventions: true
        }
      }),
      prisma.paiement.findMany({
        include: {
          convention: true
        }
      })
    ]);

    const currentDate = new Date();

    // 1. Conventions en retard
    const conventionsEnRetard = conventions.filter(convention => {
      const dateFin = new Date(convention.dateFin);
      return dateFin < currentDate && convention.statut !== 'terminee';
    });

    // 2. Calcul de la consommation de budget
    const consommationBudget = lignesBudgetaires.map(ligne => {
      const montantConsomme = ligne.conventions.reduce((sum, conv) => sum + conv.montantTotal, 0);
      const tauxConsommation = ligne.montantInitial > 0 ? (montantConsomme / ligne.montantInitial) * 100 : 0;
      
      return {
        id: ligne.id,
        numero: ligne.numero,
        libelle: ligne.libelle,
        montantInitial: ligne.montantInitial,
        montantConsomme: montantConsomme,
        montantRestant: ligne.montantInitial - montantConsomme,
        tauxConsommation: Math.round(tauxConsommation * 100) / 100
      };
    });

    // 3. Répartition des budgets par mandat
    const repartitionBudgetParMandat = mandats.map(mandat => {
      const budgetTotal = mandat.conventions.reduce((sum, conv) => sum + conv.montantTotal, 0);
      const nombreConventions = mandat.conventions.length;
      
      // Grouper par ligne budgétaire
      const budgetParLigne = {};
      mandat.conventions.forEach(conv => {
        const ligneId = conv.ligneBudgetaireId;
        const ligneLibelle = conv.ligneBudgetaire.libelle;
        
        if (!budgetParLigne[ligneId]) {
          budgetParLigne[ligneId] = {
            ligneId: ligneId,
            libelle: ligneLibelle,
            montant: 0,
            nombreConventions: 0
          };
        }
        
        budgetParLigne[ligneId].montant += conv.montantTotal;
        budgetParLigne[ligneId].nombreConventions += 1;
      });

      return {
        id: mandat.id,
        numero: mandat.numero,
        nom: mandat.nom,
        budgetTotal: budgetTotal,
        nombreConventions: nombreConventions,
        budgetParLigne: Object.values(budgetParLigne)
      };
    });

    // 4. Statistiques générales
    const stats = {
      totalConventions: conventions.length,
      conventionsActives: conventions.filter(c => c.statut === 'active').length,
      conventionsEnCours: conventions.filter(c => c.statut === 'en_cours').length,
      conventionsTerminees: conventions.filter(c => c.statut === 'terminee').length,
      conventionsEnRetard: conventionsEnRetard.length,
      
      totalMandats: mandats.length,
      mandatsActifs: mandats.filter(m => m.statut === 'Actif').length,
      
      budgetTotal: lignesBudgetaires.reduce((sum, ligne) => sum + ligne.montantInitial, 0),
      budgetConsomme: consommationBudget.reduce((sum, ligne) => sum + ligne.montantConsomme, 0),
      budgetRestant: consommationBudget.reduce((sum, ligne) => sum + ligne.montantRestant, 0),
      
      montantTotalConventions: conventions.reduce((sum, c) => sum + c.montantTotal, 0),
      montantTotalPaiements: paiements.reduce((sum, p) => sum + p.montant, 0)
    };

    // 5. Données pour les graphiques
    const chartData = {
      // Consommation budget par ligne budgétaire (pour graphique en barres)
      consommationParLigne: consommationBudget.map(ligne => ({
        name: ligne.libelle,
        initial: ligne.montantInitial,
        consomme: ligne.montantConsomme,
        restant: ligne.montantRestant,
        pourcentage: ligne.tauxConsommation
      })),
      
      // Répartition budget par mandat (pour graphique en secteurs)
      repartitionParMandat: repartitionBudgetParMandat
        .filter(mandat => mandat.budgetTotal > 0)
        .map(mandat => ({
          name: mandat.nom,
          value: mandat.budgetTotal,
          nombreConventions: mandat.nombreConventions
        })),
      
      // Évolution des conventions par mois (pour graphique linéaire)
      evolutionConventions: getEvolutionConventions(conventions),
      
      // Statut des conventions (pour graphique en secteurs)
      statutConventions: [
        { name: 'Actives', value: stats.conventionsActives, color: '#10B981' },
        { name: 'En cours', value: stats.conventionsEnCours, color: '#3B82F6' },
        { name: 'Terminées', value: stats.conventionsTerminees, color: '#6B7280' },
        { name: 'En retard', value: stats.conventionsEnRetard, color: '#EF4444' }
      ]
    };

    return NextResponse.json({
      stats,
      conventionsEnRetard: conventionsEnRetard.map(conv => ({
        id: conv.id,
        numero: conv.numero,
        objet: conv.objet,
        dateFin: conv.dateFin,
        joursRetard: Math.ceil((currentDate - new Date(conv.dateFin)) / (1000 * 60 * 60 * 24)),
        partenaire: conv.partenaire.nom,
        montantTotal: conv.montantTotal,
        statut: conv.statut
      })),
      consommationBudget,
      repartitionBudgetParMandat,
      chartData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour calculer l'évolution des conventions par mois
function getEvolutionConventions(conventions) {
  const monthlyData = {};
  
  conventions.forEach(convention => {
    const date = new Date(convention.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        count: 0,
        montant: 0
      };
    }
    
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].montant += convention.montantTotal;
  });
  
  return Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Derniers 12 mois
}
