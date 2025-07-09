import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Vérifier si le mandat existe
    const existingMandat = await prisma.mandat.findUnique({
      where: { id: parseInt(id) },
      include: {
        conventions: true
      }
    });

    if (!existingMandat) {
      return NextResponse.json(
        { error: 'Mandat non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des conventions associées
    if (existingMandat.conventions.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce mandat car il a des conventions associées' },
        { status: 400 }
      );
    }

    // Supprimer le mandat
    await prisma.mandat.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Mandat supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du mandat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du mandat' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    console.log('Updating mandat with ID:', id);
    console.log('Received data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.nom || !data.titre || !data.dateDebut || !data.dateFin || !data.regionsIntervention) {
      return NextResponse.json(
        { error: "Champs requis manquants (nom, titre, dateDebut, dateFin, regionsIntervention)" },
        { status: 400 }
      );
    }

    // Validate dates
    const dateDebut = new Date(data.dateDebut);
    const dateFin = new Date(data.dateFin);
    
    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
    }

    if (dateDebut >= dateFin) {
      return NextResponse.json({ error: "La date de fin doit être postérieure à la date de début" }, { status: 400 });
    }

    // Validate regions
    let regionsIntervention;
    try {
      regionsIntervention = typeof data.regionsIntervention === 'string' 
        ? data.regionsIntervention 
        : JSON.stringify(data.regionsIntervention);
      
      const regionsArray = JSON.parse(regionsIntervention);
      if (!Array.isArray(regionsArray) || regionsArray.length === 0) {
        return NextResponse.json({ error: "Au moins une région d'intervention est requise" }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: "Format des régions d'intervention invalide" }, { status: 400 });
    }

    // Prepare mandat data
    const mandatData = {
      nom: data.nom,
      titre: data.titre,
      dateDebut: dateDebut,
      dateFin: dateFin,
      regionsIntervention: regionsIntervention,
      statut: data.statut || "Actif",
      description: data.description || null,
      dateCreation: data.dateCreation ? new Date(data.dateCreation) : undefined
    };

    console.log('Processed mandat data:', JSON.stringify(mandatData, null, 2));

    // Update mandat
    const updatedMandat = await prisma.mandat.update({
      where: { id: parseInt(id) },
      data: mandatData,
      include: {
        conventions: {
          include: {
            ligneBudgetaire: true,
            partenaire: true
          }
        }
      }
    });

    // Add calculated fields
    const regionsArray = JSON.parse(updatedMandat.regionsIntervention);
    const dureeEnJours = Math.ceil((new Date(updatedMandat.dateFin) - new Date(updatedMandat.dateDebut)) / (1000 * 60 * 60 * 24));
    
    const mandatWithCalculations = {
      ...updatedMandat,
      regionsInterventionArray: regionsArray,
      dureeEnJours: dureeEnJours,
      nombreConventions: updatedMandat.conventions.length
    };

    return NextResponse.json(mandatWithCalculations);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mandat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
