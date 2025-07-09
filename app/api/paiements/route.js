import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conventionId = searchParams.get('conventionId');

    let whereClause = {};
    if (conventionId) {
      whereClause.conventionId = conventionId;
    }

    const paiements = await prisma.paiement.findMany({
      where: whereClause,
      include: {
        convention: {
          include: {
            partenaire: true,
            mandat: true,
            ligneBudgetaire: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(paiements);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Récupérer la convention pour calculer le montant
    const convention = await prisma.convention.findUnique({
      where: { id: data.conventionId }
    });

    if (!convention) {
      return NextResponse.json(
        { error: 'Convention non trouvée' },
        { status: 404 }
      );
    }

    // Calculer le montant basé sur le pourcentage
    const montant = (convention.montantTotal * data.pourcentage) / 100;

    // Vérifier que le total des pourcentages ne dépasse pas 100%
    const paiementsExistants = await prisma.paiement.findMany({
      where: { conventionId: data.conventionId }
    });

    const totalPourcentageExistant = paiementsExistants.reduce(
      (sum, p) => sum + p.pourcentage, 0
    );

    if (totalPourcentageExistant + data.pourcentage > 100) {
      return NextResponse.json(
        { error: 'Le total des pourcentages ne peut pas dépasser 100%' },
        { status: 400 }
      );
    }

    const paiement = await prisma.paiement.create({
      data: {
        conventionId: data.conventionId,
        pourcentage: data.pourcentage,
        montant: montant,
        datePrevue: data.datePrevue ? new Date(data.datePrevue) : null,
        dateEffective: data.dateEffective ? new Date(data.dateEffective) : null,
        statut: data.statut || 'En attente',
        description: data.description || null
      },
      include: {
        convention: {
          include: {
            partenaire: true,
            mandat: true,
            ligneBudgetaire: true
          }
        }
      }
    });

    return NextResponse.json(paiement, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
