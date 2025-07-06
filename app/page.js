'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  AlertTriangle
} from 'lucide-react';

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

const RecentActivity = ({ conventions }) => {
  const recentConventions = conventions
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

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conventions] = useState(sampleConventions);
  const pathname = usePathname();

  // Calculate stats
  const stats = {
    total: conventions.length,
    active: conventions.filter(c => c.statut === 'active').length,
    enCours: conventions.filter(c => c.statut === 'en_cours').length,
    terminee: conventions.filter(c => c.statut === 'terminee').length,
    montantTotal: conventions.reduce((sum, c) => sum + (c.montantTotal || 0), 0),
    montantPaye: conventions.reduce((sum, c) => sum + (c.montantPaye || 0), 0),
    soldeTotal: conventions.reduce((sum, c) => sum + (c.solde || 0), 0)
  };

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
                value={stats.total}
                icon={FileText}
                color="blue"
                subtitle={`${stats.active} actives`}
              />
              <StatCard
                title="Total Mandats"
                value="0"
                icon={ClipboardList}
                color="green"
                subtitle="0 validés"
              />
              <StatCard
                title="Montant Total"
                value={formatCurrency(stats.montantTotal)}
                icon={Euro}
                color="purple"
                subtitle="Toutes conventions"
              />
              <StatCard
                title="Solde Restant"
                value={formatCurrency(stats.soldeTotal)}
                icon={TrendingUp}
                color={stats.soldeTotal > 0 ? "yellow" : "green"}
                subtitle="À payer"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Conventions en cours"
                value={stats.enCours}
                icon={Calendar}
                color="blue"
              />
              <StatCard
                title="Montant payé"
                value={formatCurrency(stats.montantPaye)}
                icon={Euro}
                color="green"
              />
              <StatCard
                title="Conventions terminées"
                value={stats.terminee}
                icon={FileText}
                color="gray"
              />
            </div>

            {/* Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity conventions={conventions} />
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    Échéances à venir
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune échéance dans les 30 prochains jours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
