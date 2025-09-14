import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperAdmin, requireAdmin, hashPassword, hasPermission } from '../../lib/auth';

const prisma = new PrismaClient();

// GET - Lister les utilisateurs
export async function GET(request) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Les super admins peuvent voir tous les utilisateurs
    // Les admins ne peuvent voir que les utilisateurs normaux et eux-mêmes
    let whereClause = {};
    if (user.role === 'admin') {
      whereClause = {
        role: {
          in: ['user', 'admin']
        }
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password, nom, prenom, role, statut } = body;

    // Validation des données
    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être renseignés' },
        { status: 400 }
      );
    }

    // Vérifier les permissions pour créer ce type d'utilisateur
    if (role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Seul un super administrateur peut créer un autre super administrateur' },
        { status: 403 }
      );
    }

    if (role === 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Seul un super administrateur peut créer un administrateur' },
        { status: 403 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nom,
        prenom,
        role,
        statut: statut || 'actif'
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true,
        createdAt: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
