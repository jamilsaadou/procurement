import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clé secrète pour JWT (à déplacer dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Durée de validité du token (24 heures)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Hache un mot de passe
 */
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Vérifie un token JWT
 */
export function verifyToken(token) {
  try {
    console.log('verifyToken - JWT_SECRET:', JWT_SECRET ? 'Present' : 'Missing');
    console.log('verifyToken - Token length:', token ? token.length : 0);
    const result = jwt.verify(token, JWT_SECRET);
    console.log('verifyToken - Success:', result ? 'Yes' : 'No');
    return result;
  } catch (error) {
    console.error('verifyToken - Error:', error.message);
    return null;
  }
}

/**
 * Crée une session utilisateur
 */
export async function createSession(userId) {
  const token = generateToken(userId);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY);
  
  // Supprimer les anciennes sessions expirées
  await prisma.session.deleteMany({
    where: {
      OR: [
        { userId: userId },
        { expiresAt: { lt: new Date() } }
      ]
    }
  });
  
  // Créer une nouvelle session
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
  
  return session;
}

/**
 * Valide une session
 */
export async function validateSession(token) {
  console.log('validateSession - Token received:', token ? 'Present' : 'Missing');
  if (!token) return null;
  
  try {
    // Vérifier le token JWT
    console.log('validateSession - Verifying JWT token...');
    const decoded = verifyToken(token);
    console.log('validateSession - JWT decoded:', decoded ? 'Success' : 'Failed');
    if (!decoded) return null;
    
    // Vérifier la session en base
    console.log('validateSession - Looking up session in database...');
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });
    
    console.log('validateSession - Session found:', session ? 'Yes' : 'No');
    if (session) {
      console.log('validateSession - Session expires at:', session.expiresAt);
      console.log('validateSession - Current time:', new Date());
    }
    
    if (!session || session.expiresAt < new Date()) {
      console.log('validateSession - Session invalid or expired');
      // Session expirée, la supprimer
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }
    
    console.log('validateSession - Session valid, returning user');
    return session.user;
  } catch (error) {
    console.error('Erreur validation session:', error);
    return null;
  }
}

/**
 * Supprime une session (déconnexion)
 */
export async function deleteSession(token) {
  if (!token) return;
  
  try {
    await prisma.session.delete({
      where: { token }
    });
  } catch (error) {
    console.error('Erreur suppression session:', error);
  }
}

/**
 * Authentifie un utilisateur
 */
export async function authenticateUser(email, password) {
  try {
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
    
    // Vérifier le statut
    if (user.statut !== 'actif') {
      return { success: false, error: 'Compte désactivé' };
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
    
    // Créer une session
    const session = await createSession(user.id);
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      },
      token: session.token
    };
  } catch (error) {
    console.error('Erreur authentification:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

/**
 * Crée un utilisateur administrateur par défaut
 */
export async function createDefaultAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (existingAdmin) {
      return existingAdmin;
    }
    
    // Créer l'admin par défaut
    const hashedPassword = await hashPassword('admin123');
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@procurement.local',
        password: hashedPassword,
        nom: 'Administrateur',
        prenom: 'Système',
        role: 'admin',
        statut: 'actif'
      }
    });
    
    console.log('Utilisateur administrateur créé:', admin.email);
    return admin;
  } catch (error) {
    console.error('Erreur création admin:', error);
    return null;
  }
}

/**
 * Middleware d'authentification pour les API routes
 */
export async function requireAuth(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('auth-token')?.value;
  
  const user = await validateSession(token);
  if (!user) {
    return null;
  }
  
  return user;
}

/**
 * Middleware d'authentification admin
 */
export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return user;
}
