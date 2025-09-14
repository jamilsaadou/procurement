'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Settings, 
  Menu, 
  X,
  Users,
  BarChart3,
  Euro,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  PieChart,
  LogOut,
  User
} from 'lucide-react';
import { 
  BudgetConsumptionChart, 
  MandatBudgetChart, 
  ConventionEvolutionChart, 
  ConventionStatusChart,
  ProgressBar 
} from './components/ui/Charts';

// Simple utility functions
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' CFA';
}

function formatDate(date, formatStr = 'dd/MM/yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
}

// Sample data
const sampleConventions = [
  {
    id: '1',
    numero: 'CONV-2025-0001',
    objet: 'Maintenance informatique annuelle',
    dateDebut: '2025-01-01',
    dateFin: '2025-12-31',
    montantTotal: 120000,
    montantPaye: 40000,
    solde: 80000,
    partenaire: { nom: 'Entreprise Alpha' },
    statut: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    numero: 'CONV-2025-0002',
    objet: 'Fourniture de matériel de bureau',
    dateDebut: '2025-02-01',
    dateFin: '2025-07-31',
    montantTotal: 45000,
    montantPaye: 45000,
    solde: 0,
    partenaire: { nom: 'Beta Solutions' },
    statut: 'terminee',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    numero: 'CONV-2025-0003',
    objet: 'Conseil en organisation',
    dateDebut: '2025-03-01',
    dateFin: '2025-08-31',
    montantTotal: 75000,
    montantPaye: 25000,
    solde: 50000,
    partenaire: { nom: 'Gamma Consulting' },
    statut: 'en_cours',
    createdAt: new Date().toISOString()
  }
];

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: Home },
  { name: 'Conventions', href: '/conventions', icon: FileText },
  { name: 'Mandats', href: '/mandats', icon: ClipboardList },
  { name: 'Partenaires', href: '/partenaires', icon: Users },
  { name: 'Rapports', href: '/rapports', icon: BarChart3 },
  { name: 'Configuration', href: '/configuration', icon: Settings },
];

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorClasses[color]} text-white mr-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ conventions = [] }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const recentConventions = [...conventions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4">
          {recentConventions.map((convention) => (
            <div key={convention.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {convention.objet}
                </p>
                <p className="text-sm text-gray-500">
                  {convention.numero} • {formatDate(convention.createdAt)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  convention.statut === 'active' ? 'bg-green-100 text-green-800' :
                  convention.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                  convention.statut === 'terminee' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {convention.statut === 'active' ? 'Active' :
                   convention.statut === 'en_cours' ? 'En cours' :
                   convention.statut === 'terminee' ? 'Terminée' :
                   'Brouillon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher les conventions en retard
const ConventionsEnRetard = ({ conventions = [] }) => {
  if (conventions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-red-500 mr-2" />
            Conventions en retard
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 text-center py-4">
            Aucune convention en retard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 text-red-500 mr-2" />
          Conventions en retard ({conventions.length})
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-3">
          {conventions.slice(0, 5).map((convention) => (
            <div key={convention.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{convention.objet}</p>
                <p className="text-xs text-gray-500">
                  {convention.numero} • {convention.partenaire}
                </p>
                <p className="text-xs text-red-600 font-medium">
                  En retard de {convention.joursRetard} jour{convention.joursRetard > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(convention.montantTotal)}
                </p>
                <p className="text-xs text-gray-500">
                  Échéance: {formatDate(convention.dateFin)}
                </p>
              </div>
            </div>
          ))}
          {conventions.length > 5 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              Et {conventions.length - 5} autre{conventions.length - 5 > 1 ? 's' : ''}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Charger les informations utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
      }
    };

    fetchUser();
  }, []);

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
        // Utiliser les données d'exemple en cas d'erreur
        setDashboardData({
          stats: {
            totalConventions: sampleConventions.length,
            conventionsActives: sampleConventions.filter(c => c.statut === 'active').length,
            conventionsEnCours: sampleConventions.filter(c => c.statut === 'en_cours').length,
            conventionsTerminees: sampleConventions.filter(c => c.statut === 'terminee').length,
            conventionsEnRetard: 0,
            totalMandats: 0,
            mandatsActifs: 0,
            budgetTotal: 0,
            budgetConsomme: 0,
            budgetRestant: 0,
            montantTotalConventions: sampleConventions.reduce((sum, c) => sum + c.montantTotal, 0),
            montantTotalPaiements: 0
          },
          conventionsEnRetard: [],
          consommationBudget: [],
          repartitionBudgetParMandat: [],
          chartData: {
            consommationParLigne: [],
            repartitionParMandat: [],
            evolutionConventions: [],
            statutConventions: [
              { name: 'Actives', value: 1, color: '#10B981' },
              { name: 'En cours', value: 1, color: '#3B82F6' },
              { name: 'Terminées', value: 1, color: '#6B7280' },
              { name: 'En retard', value: 0, color: '#EF4444' }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Suivi Conventions
          </h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Version 1.0.0
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              {/* Informations utilisateur */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600">Vue d'ensemble de vos conventions et mandats</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Conventions"
                value={stats.totalConventions || 0}
                icon={FileText}
                color="blue"
                subtitle={`${stats.conventionsActives || 0} actives`}
              />
              <StatCard
                title="Conventions en retard"
                value={stats.conventionsEnRetard || 0}
                icon={Clock}
                color="red"
                subtitle="À traiter"
              />
              <StatCard
                title="Budget Total"
                value={formatCurrency(stats.budgetTotal || 0)}
                icon={Euro}
                color="purple"
                subtitle="Toutes lignes"
              />
              <StatCard
                title="Budget Consommé"
                value={formatCurrency(stats.budgetConsomme || 0)}
                icon={TrendingUp}
                color="yellow"
                subtitle={`${stats.budgetTotal > 0 ? Math.round((stats.budgetConsomme / stats.budgetTotal) * 100) : 0}%`}
              />
            </div>

            {/* Conventions en retard */}
            {dashboardData?.conventionsEnRetard && (
              <ConventionsEnRetard conventions={dashboardData.conventionsEnRetard} />
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consommation de budget */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    Consommation de Budget
                  </h3>
                </div>
                <div className="p-6">
                  <BudgetConsumptionChart data={dashboardData?.chartData?.consommationParLigne || []} />
                </div>
              </div>

              {/* Répartition par mandat */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <PieChart className="h-5 w-5 text-green-500 mr-2" />
                    Répartition Budget par Mandat
                  </h3>
                </div>
                <div className="p-6">
                  <MandatBudgetChart data={dashboardData?.chartData?.repartitionParMandat || []} />
                </div>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statut des conventions */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <PieChart className="h-5 w-5 text-purple-500 mr-2" />
                    Statut des Conventions
                  </h3>
                </div>
                <div className="p-6">
                  <ConventionStatusChart data={dashboardData?.chartData?.statutConventions || []} />
                </div>
              </div>

              {/* Évolution des conventions */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
                    Évolution des Conventions
                  </h3>
                </div>
                <div className="p-6">
                  <ConventionEvolutionChart data={dashboardData?.chartData?.evolutionConventions || []} />
                </div>
              </div>
            </div>

            {/* Budget Progress Bars */}
            {dashboardData?.consommationBudget && dashboardData.consommationBudget.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
                    Détail Consommation par Ligne Budgétaire
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {dashboardData.consommationBudget.slice(0, 5).map((ligne) => (
                      <div key={ligne.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">{ligne.libelle}</span>
                          <span className="text-sm text-gray-500">{ligne.numero}</span>
                        </div>
                        <ProgressBar
                          value={ligne.montantConsomme}
                          max={ligne.montantInitial}
                          label={`${ligne.tauxConsommation}% consommé`}
                          color={ligne.tauxConsommation > 80 ? 'red' : ligne.tauxConsommation > 60 ? 'yellow' : 'green'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity and Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity conventions={sampleConventions} />
              
              {/* Résumé des mandats */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ClipboardList className="h-5 w-5 text-green-500 mr-2" />
                    Résumé des Mandats
                  </h3>
                </div>
                <div className="px-6 py-4">
                  {dashboardData?.repartitionBudgetParMandat && dashboardData.repartitionBudgetParMandat.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.repartitionBudgetParMandat.slice(0, 3).map((mandat) => (
                        <div key={mandat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{mandat.nom}</p>
                            <p className="text-xs text-gray-500">
                              {mandat.numero} • {mandat.nombreConventions} convention{mandat.nombreConventions > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(mandat.budgetTotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun mandat avec budget alloué
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Attention: Certaines données peuvent ne pas être à jour. {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
