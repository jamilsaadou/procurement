import { NextResponse } from 'next/server';
import { authenticateUser, createDefaultAdmin } from '../../../lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Créer l'admin par défaut s'il n'existe pas
    await createDefaultAdmin();

    // Authentifier l'utilisateur
    const result = await authenticateUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Connexion réussie'
    });

    // Définir le cookie d'authentification
    console.log('Login API - Setting cookie with token:', result.token.substring(0, 20) + '...');
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 heures
      path: '/'
    });

    console.log('Login API - Cookie set successfully');
    return response;

  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
