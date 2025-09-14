'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, BarChart3, TrendingUp, Filter, Download, FileSpreadsheet, Users, Building, CreditCard } from 'lucide-react';
import { exportConventionsToExcel, exportConventionsSummaryToExcel } from '@/lib/excelExport';

// Utilitaires pour les dates
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' CFA';
};

const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
};

const getMonthName = (monthIndex) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex];
};

export default function RapportsPage() {
  const [conventions, setConventions] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conventionsRes, mandatsRes, partenairesRes] = await Promise.all([
          fetch('/api/conventions'),
          fetch('/api/mandats'),
          fetch('/api/partenaires')
        ]);

        if (conventionsRes.ok) {
          const conventionsData = await conventionsRes.json();
          setConventions(conventionsData);
        }

        if (mandatsRes.ok) {
          const mandatsData = await mandatsRes.json();
          setMandats(mandatsData);
        }

        if (partenairesRes.ok) {
          const partenairesData = await partenairesRes.json();
          setPartenaires(partenairesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les données selon la période sélectionnée
  const getFilteredConventions = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'current-month':
        return conventions.filter(conv => {
          const convDate = new Date(conv.dateDebut);
          return convDate.getFullYear() === now.getFullYear() && 
                 convDate.getMonth() === now.getMonth();
        });
      
      case 'current-year':
        return conventions.filter(conv => {
          const convDate = new Date(conv.dateDebut);
          return convDate.getFullYear() === now.getFullYear();
        });
      
      case 'custom-month':
        return conventions.filter(conv => {
          const convDate = new Date(conv.dateDebut);
          return convDate.getFullYear() === selectedYear && 
                 convDate.getMonth() === selectedMonth;
        });
      
      case 'custom-year':
        return conventions.filter(conv => {
          const convDate = new Date(conv.dateDebut);
          return convDate.getFullYear() === selectedYear;
        });
      
      default:
        return conventions;
    }
  };

  const filteredConventions = getFilteredConventions();

  // Statistiques générales
  const totalConventions = filteredConventions.length;
  const totalMontant = filteredConventions.reduce((sum, conv) => sum + (conv.montantTotal || 0), 0);
  const conventionsActives = filteredConventions.filter(conv => conv.statut === 'Active').length;
  const totalPartenaires = partenaires.length;
  const totalMandats = mandats.length;

  // Fonctions d'export
  const handleExportDetailed = () => {
    if (filteredConventions.length === 0) {
      alert('Aucune donnée à exporter pour la période sélectionnée');
      return;
    }
    exportConventionsToExcel(filteredConventions);
  };

  const handleExportSummary = () => {
    if (filteredConventions.length === 0) {
      alert('Aucune donnée à exporter pour la période sélectionnée');
      return;
    }
    exportConventionsSummaryToExcel(filteredConventions);
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current-month':
        return `${getMonthName(now.getMonth())} ${now.getFullYear()}`;
      case 'current-year':
        return `Année ${now.getFullYear()}`;
      case 'custom-month':
        return `${getMonthName(selectedMonth)} ${selectedYear}`;
      case 'custom-year':
        return `Année ${selectedYear}`;
      default:
        return 'Toutes les données';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="text-gray-600">Vue d'ensemble des activités et données d'export</p>
        </div>
      </div>

      {/* Sélection de période */}
      <Card>
        <CardHeader>
          <CardTitle>Période d'analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current-month">Mois actuel</option>
                <option value="current-year">Année actuelle</option>
                <option value="custom-month">Mois personnalisé</option>
                <option value="custom-year">Année personnalisée</option>
                <option value="all">Toutes les données</option>
              </select>
            </div>

            {(selectedPeriod === 'custom-month' || selectedPeriod === 'custom-year') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {selectedPeriod === 'custom-month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mois
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{totalConventions}</div>
                <div className="text-sm text-gray-600">Conventions</div>
                <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalMontant)}
                </div>
                <div className="text-sm text-gray-600">Montant total</div>
                <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{conventionsActives}</div>
                <div className="text-sm text-gray-600">Actives</div>
                <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{totalPartenaires}</div>
                <div className="text-sm text-gray-600">Partenaires</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{totalMandats}</div>
                <div className="text-sm text-gray-600">Mandats</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section d'export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export des données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                Exporter les données pour la période : <strong>{getPeriodLabel()}</strong>
              </p>
              <p className="text-sm text-gray-500">
                {totalConventions} convention(s) disponible(s) pour l'export
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleExportSummary}
                className="flex items-center"
                disabled={totalConventions === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Résumé
              </Button>
              <Button
                variant="primary"
                onClick={handleExportDetailed}
                className="flex items-center"
                disabled={totalConventions === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Détaillé
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des conventions filtrées */}
      {totalConventions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conventions - {getPeriodLabel()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenaire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConventions.map((convention) => (
                    <tr key={convention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {convention.numero}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-48 truncate" title={convention.objet}>
                          {convention.objet}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {convention.partenaire?.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(convention.montantTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          convention.statut === 'Active' ? 'bg-green-100 text-green-800' :
                          convention.statut === 'Terminée' ? 'bg-gray-100 text-gray-800' :
                          convention.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {convention.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(convention.dateDebut)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalConventions === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune convention trouvée
            </h3>
            <p className="text-gray-600">
              Aucune convention n'a été trouvée pour la période sélectionnée : {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
