import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Vérifier si le partenaire existe
    const existingPartenaire = await prisma.partenaire.findUnique({
      where: { id },
      include: {
        conventions: true
      }
    });

    if (!existingPartenaire) {
      return NextResponse.json(
        { error: 'Partenaire non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des conventions associées
    if (existingPartenaire.conventions.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce partenaire car il a des conventions associées' },
        { status: 400 }
      );
    }

    // Supprimer le partenaire
    await prisma.partenaire.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Partenaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du partenaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du partenaire' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Vérifier si le partenaire existe
    const existingPartenaire = await prisma.partenaire.findUnique({
      where: { id }
    });

    if (!existingPartenaire) {
      return NextResponse.json(
        { error: 'Partenaire non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le partenaire
    const updatedPartenaire = await prisma.partenaire.update({
      where: { id },
      data: {
        nom: data.nom,
        statutJuridique: data.statutJuridique,
        representantLegal: data.representantLegal,
        adresse: data.adresse,
        email: data.email,
        telephone: data.telephone,
        fax: data.fax || null,
        autresInfos: data.autresInfos || null
      },
      include: {
        conventions: {
          include: {
            mandat: true,
            ligneBudgetaire: true
          }
        }
      }
    });

    return NextResponse.json(updatedPartenaire);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du partenaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du partenaire' },
      { status: 500 }
    );
  }
}
