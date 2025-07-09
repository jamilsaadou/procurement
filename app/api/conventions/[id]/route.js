import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    const convention = await prisma.convention.findUnique({
      where: { id },
      include: {
        mandat: true,
        ligneBudgetaire: true,
        paiements: true
      }
    })

    if (!convention) {
      return Response.json({ error: "Convention not found" }, { status: 404 })
    }

    return Response.json(convention)
  } catch (error) {
    console.error('Convention fetch error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    console.log('PUT request - ID:', id, 'Data:', JSON.stringify(data, null, 2))

    // Check if convention exists
    const existingConvention = await prisma.convention.findUnique({
      where: { id }
    })

    if (!existingConvention) {
      return Response.json({ error: "Convention not found" }, { status: 404 })
    }

    // Only include fields that exist in the schema
    const updateData = {}
    
    // Handle scalar fields
    if (data.numero !== undefined) updateData.numero = data.numero
    if (data.mandatId !== undefined) updateData.mandatId = parseInt(data.mandatId)
    if (data.ligneBudgetaireId !== undefined) updateData.ligneBudgetaireId = data.ligneBudgetaireId
    if (data.modeSelection !== undefined) updateData.modeSelection = data.modeSelection
    if (data.typeConvention !== undefined) updateData.typeConvention = data.typeConvention
    if (data.numeroConvention !== undefined) updateData.numeroConvention = data.numeroConvention
    if (data.objet !== undefined) updateData.objet = data.objet
    if (data.statut !== undefined) updateData.statut = data.statut
    if (data.montantTotal !== undefined) updateData.montantTotal = parseFloat(data.montantTotal)
    if (data.periodicitePaiement !== undefined) updateData.periodicitePaiement = data.periodicitePaiement
    if (data.description !== undefined) updateData.description = data.description
    if (data.duree !== undefined) updateData.duree = parseInt(data.duree)
    
    // Handle date fields
    if (data.dateDebut !== undefined) {
      updateData.dateDebut = new Date(data.dateDebut).toISOString()
    }
    if (data.dateFin !== undefined) {
      updateData.dateFin = new Date(data.dateFin).toISOString()
    }

    console.log('Processed update data:', JSON.stringify(updateData, null, 2))

    const updatedConvention = await prisma.convention.update({
      where: { id },
      data: updateData,
      include: {
        mandat: true,
        ligneBudgetaire: true,
        paiements: true
      }
    })

    // Handle paiements separately if provided
    if (data.paiements && Array.isArray(data.paiements)) {
      // Delete existing paiements
      await prisma.paiement.deleteMany({
        where: { conventionId: id }
      })

      // Create new paiements
      if (data.paiements.length > 0) {
        const paiementsData = data.paiements.map(p => ({
          conventionId: id,
          pourcentage: parseFloat(p.pourcentage) || 0,
          montant: parseFloat(p.montant) || 0,
          datePrevue: p.datePrevue ? new Date(p.datePrevue).toISOString() : null,
          dateEffective: p.dateEffective ? new Date(p.dateEffective).toISOString() : null,
          statut: p.statut || "En attente",
          description: p.description || null
        }))

        await prisma.paiement.createMany({
          data: paiementsData
        })
      }

      // Fetch updated convention with new paiements
      const finalConvention = await prisma.convention.findUnique({
        where: { id },
        include: {
          mandat: true,
          ligneBudgetaire: true,
          paiements: true
        }
      })

      return Response.json(finalConvention)
    }

    return Response.json(updatedConvention)
  } catch (error) {
    console.error('Convention update error:', error)
    if (error.code === 'P2025') {
      return Response.json({ error: "Convention not found" }, { status: 404 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    
    console.log('DELETE request - ID:', id)

    // Check if convention exists
    const existingConvention = await prisma.convention.findUnique({
      where: { id }
    })

    if (!existingConvention) {
      return Response.json({ error: "Convention not found" }, { status: 404 })
    }

    // First delete related paiements
    await prisma.paiement.deleteMany({
      where: { conventionId: id }
    })

    // Then delete the convention
    await prisma.convention.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Convention deletion error:', error)
    if (error.code === 'P2025') {
      return Response.json({ error: "Convention not found" }, { status: 404 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }
}
