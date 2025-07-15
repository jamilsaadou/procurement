'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, BarChart3, TrendingUp, Filter } from 'lucide-react';

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

// Composant pour la vue mensuelle
const MonthlyView = ({ conventions, selectedYear, selectedMonth, onMonthChange }) => {
  const monthlyData = conventions.filter(conv => {
    const convDate = new Date(conv.dateDebut);
    return convDate.getFullYear() === selectedYear && convDate.getMonth() === selectedMonth;
  });

  const totalMontant = monthlyData.reduce((sum, conv) => sum + conv.montantTotal, 0);
  const conventionsParStatut = monthlyData.reduce((acc, conv) => {
    acc[conv.statut] = (acc[conv.statut] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Vue Mensuelle - {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques mensuelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{monthlyData.length}</div>
            <div className="text-sm text-gray-600">Conventions ce mois</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMontant)}
            </div>
            <div className="text-sm text-gray-600">Montant total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {conventionsParStatut['Active'] || 0}
            </div>
            <div className="text-sm text-gray-600">Conventions actives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {conventionsParStatut['Terminée'] || 0}
            </div>
            <div className="text-sm text-gray-600">Conventions terminées</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des conventions du mois */}
      <Card>
        <CardHeader>
          <CardTitle>Conventions de {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune convention pour ce mois
            </div>
          ) : (
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
                  {monthlyData.map((convention) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour la vue annuelle
const YearlyView = ({ conventions, selectedYear, onYearChange }) => {
  const yearlyData = conventions.filter(conv => {
    const convDate = new Date(conv.dateDebut);
    return convDate.getFullYear() === selectedYear;
  });

  const totalMontant = yearlyData.reduce((sum, conv) => sum + conv.montantTotal, 0);
  
  // Données par mois
  const monthlyBreakdown = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthData = yearlyData.filter(conv => {
      const convDate = new Date(conv.dateDebut);
      return convDate.getMonth() === monthIndex;
    });
    
    return {
      month: getMonthName(monthIndex),
      count: monthData.length,
      montant: monthData.reduce((sum, conv) => sum + conv.montantTotal, 0)
    };
  });

  const conventionsParStatut = yearlyData.reduce((acc, conv) => {
    acc[conv.statut] = (acc[conv.statut] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Vue Annuelle - {selectedYear}
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Statistiques annuelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{yearlyData.length}</div>
            <div className="text-sm text-gray-600">Conventions cette année</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMontant)}
            </div>
            <div className="text-sm text-gray-600">Montant total annuel</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(totalMontant / 12)}
            </div>
            <div className="text-sm text-gray-600">Moyenne mensuelle</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(conventionsParStatut).length}
            </div>
            <div className="text-sm text-gray-600">Statuts différents</div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par mois */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition mensuelle {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyBreakdown.map((month, index) => {
                  const percentage = totalMontant > 0 ? (month.montant / totalMontant * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {month.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(month.montant)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span>{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ConventionsVisualisationPage() {
  const [conventions, setConventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' ou 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchConventions = async () => {
      try {
        const response = await fetch('/api/conventions');
        if (response.ok) {
          const data = await response.json();
          setConventions(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des conventions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConventions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualisation des Conventions</h1>
          <p className="text-gray-600">Analyse mensuelle et annuelle des conventions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'monthly' ? 'primary' : 'outline'}
            onClick={() => setViewMode('monthly')}
            className="flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Vue Mensuelle
          </Button>
          <Button
            variant={viewMode === 'yearly' ? 'primary' : 'outline'}
            onClick={() => setViewMode('yearly')}
            className="flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vue Annuelle
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === 'monthly' ? (
        <MonthlyView
          conventions={conventions}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      ) : (
        <YearlyView
          conventions={conventions}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      )}
    </div>
  );
}
