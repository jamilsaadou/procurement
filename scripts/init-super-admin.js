const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔍 Vérification de l\'existence d\'un super administrateur...');
    
    // Vérifier si un super admin existe déjà
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' }
    });
    
    if (existingSuperAdmin) {
      console.log('✅ Un super administrateur existe déjà:', existingSuperAdmin.email);
      return existingSuperAdmin;
    }
    
    console.log('🔧 Création du super administrateur par défaut...');
    
    // Créer le super admin par défaut
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@procurement.local',
        password: hashedPassword,
        nom: 'Super Administrateur',
        prenom: 'Système',
        role: 'super_admin',
        statut: 'actif'
      }
    });
    
    console.log('✅ Super administrateur créé avec succès!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Mot de passe: superadmin123');
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!');
    
    return superAdmin;
  } catch (error) {
    console.error('❌ Erreur lors de la création du super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('🎉 Initialisation terminée!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de l\'initialisation:', error);
      process.exit(1);
    });
}

module.exports = { createSuperAdmin };
