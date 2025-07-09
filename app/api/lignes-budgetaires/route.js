import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  try {
    const lignes = await prisma.ligneBudgetaire.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return Response.json(lignes)
  } catch (error) {
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

    // Convert montantInitial to number
    const montantInitial = Number(data.montantInitial) || 0

    const newLigne = await prisma.ligneBudgetaire.create({
      data: {
        numero: data.numero,
        libelle: data.libelle,
        description: data.description || "",
        montantInitial: montantInitial,
        montantRestant: montantInitial
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
