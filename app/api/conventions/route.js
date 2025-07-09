import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const conventions = await prisma.convention.findMany({
      include: {
        mandat: true,
        ligneBudgetaire: true,
        partenaire: true,
        paiements: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer le solde pour chaque convention
    const conventionsAvecSolde = conventions.map(convention => {
      const totalPourcentagePaye = convention.paiements.reduce(
        (sum, paiement) => sum + paiement.pourcentage, 0
      );
      const solde = 100 - totalPourcentagePaye;
      
      return {
        ...convention,
        solde: solde,
        totalPourcentagePaye: totalPourcentagePaye
      };
    });

    return NextResponse.json(conventionsAvecSolde);
  } catch (error) {
    console.error('Erreur lors de la récupération des conventions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conventions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('Received data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.numero || !data.mandatId || !data.ligneBudgetaireId || 
        !data.partenaireId || !data.objet || !data.dateDebut || !data.dateFin) {
      return NextResponse.json(
        { error: "Champs requis manquants (numero, mandatId, ligneBudgetaireId, partenaireId, objet, dateDebut, dateFin)" },
        { status: 400 }
      );
    }

    // Convert mandatId to integer if it's a string
    const mandatId = parseInt(data.mandatId);
    if (isNaN(mandatId)) {
      return NextResponse.json(
        { error: "Format mandatId invalide" },
        { status: 400 }
      );
    }

    // Check for duplicate numero
    const existingByNumero = await prisma.convention.findFirst({
      where: { numero: data.numero }
    });
    
    if (existingByNumero) {
      return NextResponse.json(
        { error: "le champs N° Convention* ne doit pas etre repete deux fois" },
        { status: 400 }
      );
    }


    // Verify mandat exists
    const mandatExists = await prisma.mandat.findUnique({
      where: { id: mandatId }
    });
    if (!mandatExists) {
      return NextResponse.json(
        { error: "Mandat non trouvé" },
        { status: 404 }
      );
    }

    // Verify ligneBudgetaire exists
    const ligneExists = await prisma.ligneBudgetaire.findUnique({
      where: { id: data.ligneBudgetaireId }
    });
    if (!ligneExists) {
      return NextResponse.json(
        { error: "Ligne budgétaire non trouvée" },
        { status: 404 }
      );
    }

    // Verify partenaire exists
    const partenaireExists = await prisma.partenaire.findUnique({
      where: { id: data.partenaireId }
    });
    if (!partenaireExists) {
      return NextResponse.json(
        { error: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    // Validate dates
    const dateDebut = new Date(data.dateDebut);
    const dateFin = new Date(data.dateFin);
    
    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
    }

    // Calculate duration in days
    const dureeEnJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

    // Prepare convention data with description length validation
    let description = data.description || null;
    if (description && description.length > 191) {
      description = description.substring(0, 191);
    }

    const conventionData = {
      numero: data.numero,
      mandatId: mandatId,
      ligneBudgetaireId: data.ligneBudgetaireId,
      partenaireId: data.partenaireId,
      modeSelection: data.modeSelection || "Appel d'offres",
      typeConvention: data.typeConvention || "Prestation",
      numeroConvention: data.numero, // Utiliser le même numéro
      objet: data.objet,
      dateDebut: dateDebut,
      dateFin: dateFin,
      duree: dureeEnJours,
      periodicitePaiement: "Gérée par tranches", // Valeur par défaut car géré par les paiements
      montantTotal: parseFloat(data.montantTotal) || 0,
      statut: data.statut || "Brouillon",
      description: description
    };

    console.log('Processed convention data:', JSON.stringify(conventionData, null, 2));

    // Create convention
    const newConvention = await prisma.convention.create({
      data: conventionData,
      include: {
        mandat: true,
        ligneBudgetaire: true,
        partenaire: true,
        paiements: true
      }
    });

    return NextResponse.json(newConvention, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la convention:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
