import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperAdmin, requireAdmin, hashPassword } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions de lecture
    if (user.role === 'admin' && targetUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un utilisateur
export async function PUT(request, { params }) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { email, password, nom, prenom, role, statut } = body;

    // Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifications de permissions
    if (user.role === 'admin' && targetUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Un administrateur ne peut pas modifier un super administrateur' },
        { status: 403 }
      );
    }

    if (role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Seul un super administrateur peut promouvoir quelqu\'un au rang de super administrateur' },
        { status: 403 }
      );
    }

    if (role === 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Seul un super administrateur peut promouvoir quelqu\'un au rang d\'administrateur' },
        { status: 403 }
      );
    }

    // Empêcher un utilisateur de se rétrograder lui-même
    if (user.id === id && role && role !== user.role && 
        (user.role === 'super_admin' || user.role === 'admin')) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData = {};
    
    if (email && email !== targetUser.email) {
      // Vérifier si le nouvel email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
      
      updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (role) updateData.role = role;
    if (statut !== undefined) updateData.statut = statut;

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request, { params }) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifications de permissions
    if (user.role === 'admin' && targetUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Un administrateur ne peut pas supprimer un super administrateur' },
        { status: 403 }
      );
    }

    if (user.role === 'admin' && targetUser.role === 'admin' && user.id !== id) {
      return NextResponse.json(
        { error: 'Un administrateur ne peut pas supprimer un autre administrateur' },
        { status: 403 }
      );
    }

    // Empêcher la suppression du dernier super admin
    if (targetUser.role === 'super_admin') {
      const superAdminCount = await prisma.user.count({
        where: { 
          role: 'super_admin',
          statut: 'actif'
        }
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier super administrateur' },
          { status: 403 }
        );
      }
    }

    // Empêcher l'auto-suppression
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur (les sessions seront supprimées automatiquement grâce à onDelete: Cascade)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
