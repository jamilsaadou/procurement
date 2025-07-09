import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const partenaires = await prisma.partenaire.findMany({
      include: {
        conventions: {
          include: {
            mandat: true,
            ligneBudgetaire: true
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(partenaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des partenaires' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const partenaire = await prisma.partenaire.create({
      data: {
        nom: data.nom,
        statutJuridique: data.statutJuridique,
        representantLegal: data.representantLegal,
        adresse: data.adresse,
        email: data.email,
        telephone: data.telephone,
        fax: data.fax || null,
        autresInfos: data.autresInfos || null
      }
    });

    return NextResponse.json(partenaire, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du partenaire' },
      { status: 500 }
    );
  }
}
