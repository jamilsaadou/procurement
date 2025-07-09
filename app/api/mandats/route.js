import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const mandats = await prisma.mandat.findMany({
      include: {
        conventions: {
          include: {
            ligneBudgetaire: true,
            partenaire: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add calculated fields
    const mandatsWithCalculations = mandats.map(mandat => {
      const regionsArray = mandat.regionsIntervention ? JSON.parse(mandat.regionsIntervention) : [];
      const dureeEnJours = Math.ceil((new Date(mandat.dateFin) - new Date(mandat.dateDebut)) / (1000 * 60 * 60 * 24));
      
      return {
        ...mandat,
        regionsInterventionArray: regionsArray,
        dureeEnJours: dureeEnJours,
        nombreConventions: mandat.conventions.length
      };
    });

    return NextResponse.json(mandatsWithCalculations);
  } catch (error) {
    console.error('Erreur lors de la récupération des mandats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mandats' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('Received mandat data:', JSON.stringify(data, null, 2));
    
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
      dateCreation: data.dateCreation ? new Date(data.dateCreation) : dateDebut
    };

    console.log('Processed mandat data:', JSON.stringify(mandatData, null, 2));

    // Create mandat
    const newMandat = await prisma.mandat.create({
      data: mandatData,
      include: {
        conventions: true
      }
    });

    // Update with formatted numero
    const updatedMandat = await prisma.mandat.update({
      where: { id: newMandat.id },
      data: { numero: `MAN-${newMandat.id}` },
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

    return NextResponse.json(mandatWithCalculations, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du mandat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
