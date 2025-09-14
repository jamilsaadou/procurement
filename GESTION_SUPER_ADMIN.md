# Gestion du Super Administrateur

## Vue d'ensemble

Le système de gestion des utilisateurs de l'application Procurement comprend trois niveaux de rôles :

- **Utilisateur** (`user`) : Accès de base aux fonctionnalités
- **Administrateur** (`admin`) : Gestion des utilisateurs normaux et accès complet aux données
- **Super Administrateur** (`super_admin`) : Contrôle total du système, y compris la gestion des autres administrateurs

## Fonctionnalités du Super Admin

### Permissions exclusives

Le Super Administrateur dispose de permissions étendues :

1. **Gestion complète des utilisateurs** :
   - Créer, modifier et supprimer tous types d'utilisateurs
   - Promouvoir des utilisateurs au rang d'administrateur
   - Créer d'autres super administrateurs

2. **Contrôle des accès** :
   - Voir tous les utilisateurs du système
   - Gérer les statuts (actif/inactif)
   - Modifier les rôles de tous les utilisateurs

3. **Sécurité** :
   - Impossible de supprimer le dernier super admin
   - Protection contre l'auto-suppression
   - Contrôle des permissions granulaire

## Accès initial

### Compte par défaut

Un super administrateur par défaut est créé automatiquement :

```
Email: superadmin@procurement.local
Mot de passe: superadmin123
```

⚠️ **IMPORTANT** : Changez ce mot de passe immédiatement après la première connexion !

### Création manuelle

Pour créer un super admin manuellement, exécutez :

```bash
cd procurement
node scripts/init-super-admin.js
```

## Interface de gestion

### Accès à la gestion des utilisateurs

1. Connectez-vous avec un compte administrateur ou super administrateur
2. Dans le menu latéral, section "Administration"
3. Cliquez sur "Utilisateurs"

### Fonctionnalités disponibles

#### Pour les Super Administrateurs :
- Voir tous les utilisateurs (y compris les autres super admins)
- Créer des utilisateurs avec tous les rôles
- Modifier tous les utilisateurs
- Supprimer tous les utilisateurs (sauf eux-mêmes et le dernier super admin)

#### Pour les Administrateurs :
- Voir les utilisateurs normaux et les autres administrateurs
- Créer uniquement des utilisateurs normaux et des administrateurs
- Modifier les utilisateurs normaux et leur propre profil
- Supprimer uniquement les utilisateurs normaux

## Sécurité et bonnes pratiques

### Règles de sécurité implémentées

1. **Protection du dernier super admin** : Impossible de supprimer le dernier super administrateur actif
2. **Auto-protection** : Un utilisateur ne peut pas supprimer son propre compte
3. **Hiérarchie des rôles** : Les administrateurs ne peuvent pas gérer les super administrateurs
4. **Validation des permissions** : Vérification côté serveur et client

### Recommandations

1. **Changez le mot de passe par défaut** immédiatement
2. **Limitez le nombre de super admins** (2-3 maximum recommandé)
3. **Utilisez des emails professionnels** pour les comptes administrateurs
4. **Activez la double authentification** (à implémenter si nécessaire)
5. **Auditez régulièrement** les comptes utilisateurs

## Structure technique

### Base de données

Le rôle est stocké dans la table `User` :

```sql
role VARCHAR(255) DEFAULT 'user' -- 'user', 'admin', 'super_admin'
```

### API Endpoints

- `GET /api/users` - Liste des utilisateurs (avec filtrage par rôle)
- `POST /api/users` - Création d'utilisateur
- `GET /api/users/[id]` - Détails d'un utilisateur
- `PUT /api/users/[id]` - Modification d'utilisateur
- `DELETE /api/users/[id]` - Suppression d'utilisateur

### Middleware d'authentification

```javascript
// Vérification admin ou super admin
requireAdmin(request)

// Vérification super admin uniquement
requireSuperAdmin(request)

// Vérification de permissions spécifiques
hasPermission(user, action)
```

## Dépannage

### Problèmes courants

1. **Impossible d'accéder à la gestion des utilisateurs**
   - Vérifiez que vous êtes connecté avec un compte admin/super admin
   - Vérifiez que le token d'authentification est valide

2. **Erreur lors de la création d'utilisateur**
   - Vérifiez les permissions du rôle demandé
   - Assurez-vous que l'email n'existe pas déjà

3. **Impossible de supprimer un utilisateur**
   - Vérifiez les règles de sécurité (dernier super admin, auto-suppression)
   - Vérifiez les permissions du rôle cible

### Logs utiles

Les actions importantes sont loggées dans la console :
- Création/modification/suppression d'utilisateurs
- Tentatives d'accès non autorisées
- Erreurs d'authentification

## Migration et mise à jour

### Mise à jour du schéma

Si vous mettez à jour une installation existante :

```bash
npx prisma migrate dev
node scripts/init-super-admin.js
```

### Sauvegarde

Avant toute modification importante :

```bash
# Sauvegarde de la base de données
mysqldump -u username -p procurementdb > backup.sql
```

## Support

Pour toute question ou problème concernant la gestion des super administrateurs, consultez :

1. Les logs de l'application
2. La documentation technique dans `/app/lib/auth.js`
3. Les tests d'API dans `/app/api/users/`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 14 septembre 2025
