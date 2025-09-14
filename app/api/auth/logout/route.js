import { NextResponse } from 'next/server';
import { deleteSession } from '../../../lib/auth';

export async function POST(request) {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      // Supprimer la session de la base de données
      await deleteSession(token);
    }

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immédiatement
    });

    return response;

  } catch (error) {
    console.error('Erreur logout:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
