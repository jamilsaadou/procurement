import { NextResponse } from 'next/server';
import { validateSession } from '../../../lib/auth';

export async function GET(request) {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Valider la session
    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Session invalide ou expirée' },
        { status: 401 }
      );
    }

    // Retourner les informations utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        statut: user.statut
      }
    });

  } catch (error) {
    console.error('Erreur vérification session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
