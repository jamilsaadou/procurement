import { Suspense } from 'react';
import { LoginForm } from '../components/ui/LoginForm';

export const metadata = {
  title: 'Connexion - Suivi des Conventions',
  description: 'Connectez-vous à votre plateforme de gestion des conventions',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}
