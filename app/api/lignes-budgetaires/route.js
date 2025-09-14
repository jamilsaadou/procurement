import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  try {
    const lignes = await prisma.ligneBudgetaire.findMany({
      include: {
        conventions: {
          include: {
            paiements: {
              where: {
                statut: {
                  in: ['Effectué', 'Validé'] // Seuls les paiements effectués ou validés comptent
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer la consommation réelle pour chaque ligne budgétaire
    const lignesAvecConsommation = lignes.map(ligne => {
      // Calculer le total des paiements effectués pour cette ligne budgétaire
      const totalPaiementsEffectues = ligne.conventions.reduce((total, convention) => {
        const paiementsConvention = convention.paiements.reduce((sum, paiement) => {
          return sum + paiement.montant;
        }, 0);
        return total + paiementsConvention;
      }, 0);

      // Calculer le montant restant basé sur les paiements réels
      const montantRestantCalcule = Math.max(0, ligne.montantInitial - totalPaiementsEffectues);

      return {
        ...ligne,
        montantConsomme: totalPaiementsEffectues,
        montantRestant: montantRestantCalcule,
        tauxConsommation: ligne.montantInitial > 0 ? (totalPaiementsEffectues / ligne.montantInitial) * 100 : 0,
        // Garder les conventions pour d'éventuels besoins futurs, mais les exclure de la réponse principale
        conventions: undefined
      };
    });

    return Response.json(lignesAvecConsommation)
  } catch (error) {
    console.error('Error fetching lignes budgetaires:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.numero || !data.libelle) {
      return Response.json(
        { error: "Missing required fields (numero, libelle)" },
        { status: 400 }
      )
    }

    // Validate montantInitial if provided
    if (data.montantInitial && (isNaN(data.montantInitial) || data.montantInitial <= 0)) {
      return Response.json(
        { error: "Le montant initial doit être un nombre positif" },
        { status: 400 }
      )
    }

    const newLigne = await prisma.ligneBudgetaire.create({
      data: {
        numero: data.numero,
        libelle: data.libelle,
        description: data.description || "", // Default empty description
        montantInitial: data.montantInitial || 0, // Use provided amount or default to 0
        montantRestant: data.montantRestant || data.montantInitial || 0 // Use provided remaining amount or equal to initial amount
      }
    })

    return Response.json(newLigne, { status: 201 })
  } catch (error) {
    console.error('Error creating budget line:', error)
    return Response.json(
      { error: "Failed to create budget line", details: error.message }, 
      { status: 500 }
    )
  }
}
