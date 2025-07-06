'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { conventionsAPI, mandatsAPI, lignesBudgetairesAPI, initializeSampleData } from '@/lib/data';
import ConventionForm from '@/components/ui/ConventionForm';
import LigneBudgetaireForm from '@/components/ui/LigneBudgetaireForm';
// Simple utility functions
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' CFA';
}

function formatDate(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
}

function getStatusColor(statut, type = 'convention') {
  if (type === 'convention') {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'terminee': return 'bg-gray-100 text-gray-800';
      case 'resiliee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  return 'bg-gray-100 text-gray-800';
}
import { STATUTS_CONVENTIONS, TYPES_CONVENTIONS, MODES_SELECTION } from '@/lib/constants';

const ConventionsTable = ({ conventions, onView, onEdit, onDelete }) => {
  if (conventions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune convention</h3>
        <p className="text-gray-500">Commencez par créer votre première convention.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mandat</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ligne budgétaire</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode de sélection</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du partenaire</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Représentant légal</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de convention</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° de la convention</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objet de la convention</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début de la convention</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin de la convention</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périodicité de paiement</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conventions.map((convention, index) => {
            // Récupérer les données liées
            const mandat = mandatsAPI.getById(convention.mandatId);
            const ligneBudgetaire = lignesBudgetairesAPI.getById(convention.ligneBudgetaireId);
            
            return (
              <tr key={convention.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{mandat?.numero || 'N/A'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-32 truncate" title={ligneBudgetaire?.libelle}>
                    {ligneBudgetaire?.numero || 'N/A'}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {MODES_SELECTION.find(m => m.id === convention.modeSelection)?.label || convention.modeSelection}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{mandat?.nomPartenaire || 'N/A'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{mandat?.representantLegal || 'N/A'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {TYPES_CONVENTIONS.find(t => t.id === convention.typeConvention)?.label || convention.typeConvention}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{convention.numero}</td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div className="max-w-48 truncate" title={convention.objet}>
                    {convention.objet}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(convention.dateDebut)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(convention.dateFin)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{convention.duree} jours</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{convention.periodicitePaiement}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(convention.montantPaye)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={convention.solde > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(convention.solde)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(convention)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(convention)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(convention)}
                      title="Supprimer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ConventionDetailsModal = ({ convention, isOpen, onClose }) => {
  if (!convention) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails - ${convention.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Convention
            </label>
            <p className="text-sm text-gray-900">{convention.numero}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <span className={`status-badge ${getStatusColor(convention.statut, 'convention')}`}>
              {STATUTS_CONVENTIONS.find(s => s.id === convention.statut)?.label || convention.statut}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objet de la convention
          </label>
          <p className="text-sm text-gray-900">{convention.objet}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <p className="text-sm text-gray-900">{formatDate(convention.dateDebut)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <p className="text-sm text-gray-900">{formatDate(convention.dateFin)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant total
            </label>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(convention.montantTotal)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant payé
            </label>
            <p className="text-sm font-medium text-green-600">{formatCurrency(convention.montantPaye)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde
            </label>
            <p className={`text-sm font-medium ${convention.solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(convention.solde)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de convention
            </label>
            <p className="text-sm text-gray-900">
              {TYPES_CONVENTIONS.find(t => t.id === convention.type)?.label || convention.type}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de sélection
            </label>
            <p className="text-sm text-gray-900">
              {MODES_SELECTION.find(m => m.id === convention.modeSelection)?.label || convention.modeSelection}
            </p>
          </div>
        </div>

        {convention.partenaire && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partenaire
            </label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-900">{convention.partenaire.nom}</p>
              {convention.partenaire.email && (
                <p className="text-sm text-gray-600">{convention.partenaire.email}</p>
              )}
              {convention.partenaire.telephone && (
                <p className="text-sm text-gray-600">{convention.partenaire.telephone}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default function ConventionsPage() {
  const [conventions, setConventions] = useState([]);
  const [filteredConventions, setFilteredConventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedConvention, setSelectedConvention] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConventionForm, setShowConventionForm] = useState(false);
  const [showLigneBudgetaireForm, setShowLigneBudgetaireForm] = useState(false);
  const [editingConvention, setEditingConvention] = useState(null);
  const [editingLigneBudgetaire, setEditingLigneBudgetaire] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConventions();
  }, []);

  useEffect(() => {
    filterConventions();
  }, [conventions, searchTerm, statusFilter]);

  const loadConventions = () => {
    setLoading(true);
    try {
      // Effacer les données existantes pour forcer la réinitialisation
      if (typeof window !== 'undefined') {
        localStorage.removeItem('procurement_conventions');
        localStorage.removeItem('procurement_mandats');
        localStorage.removeItem('procurement_lignes_budgetaires');
      }
      
      // Initialiser les données d'exemple
      initializeSampleData();
      const data = conventionsAPI.getAll();
      setConventions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des conventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConventions = () => {
    let filtered = [...conventions];

    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.partenaire?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(conv => conv.statut === statusFilter);
    }

    setFilteredConventions(filtered);
  };

  const handleView = (convention) => {
    setSelectedConvention(convention);
    setShowDetailsModal(true);
  };

  const handleEdit = (convention) => {
    setEditingConvention(convention);
    setShowConventionForm(true);
  };

  const handleDelete = (convention) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la convention ${convention.numero} ?`)) {
      conventionsAPI.delete(convention.id);
      loadConventions();
    }
  };

  const handleCreateConvention = () => {
    setEditingConvention(null);
    setShowConventionForm(true);
  };

  const handleCreateLigneBudgetaire = () => {
    setEditingLigneBudgetaire(null);
    setShowLigneBudgetaireForm(true);
  };

  const handleSubmitConvention = (conventionData) => {
    try {
      if (editingConvention) {
        conventionsAPI.update(editingConvention.id, conventionData);
      } else {
        conventionsAPI.create(conventionData);
      }
      loadConventions();
      setShowConventionForm(false);
      setEditingConvention(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la convention:', error);
    }
  };

  const handleSubmitLigneBudgetaire = (ligneBudgetaireData) => {
    try {
      if (editingLigneBudgetaire) {
        lignesBudgetairesAPI.update(editingLigneBudgetaire.id, ligneBudgetaireData);
      } else {
        lignesBudgetairesAPI.create(ligneBudgetaireData);
      }
      // Pas besoin de recharger les conventions, juste fermer le modal
      setShowLigneBudgetaireForm(false);
      setEditingLigneBudgetaire(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la ligne budgétaire:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Conventions</h1>
          <p className="text-gray-600">Gérez vos conventions avec les partenaires</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            onClick={handleCreateLigneBudgetaire}
            variant="outline" 
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ligne budgétaire
          </Button>
          <Button 
            onClick={handleCreateConvention}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle convention
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, objet ou partenaire..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {STATUTS_CONVENTIONS.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{conventions.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {conventions.filter(c => c.statut === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Actives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {conventions.filter(c => c.statut === 'en_cours').length}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {conventions.filter(c => c.statut === 'terminee').length}
            </div>
            <div className="text-sm text-gray-600">Terminées</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des conventions ({filteredConventions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ConventionsTable
            conventions={filteredConventions}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      <ConventionDetailsModal
        convention={selectedConvention}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedConvention(null);
        }}
      />

      {/* Convention Form Modal */}
      <ConventionForm
        isOpen={showConventionForm}
        onClose={() => {
          setShowConventionForm(false);
          setEditingConvention(null);
        }}
        onSubmit={handleSubmitConvention}
        convention={editingConvention}
      />

      {/* Ligne Budgetaire Form Modal */}
      <LigneBudgetaireForm
        isOpen={showLigneBudgetaireForm}
        onClose={() => {
          setShowLigneBudgetaireForm(false);
          setEditingLigneBudgetaire(null);
        }}
        onSubmit={handleSubmitLigneBudgetaire}
        ligneBudgetaire={editingLigneBudgetaire}
      />
    </div>
  );
}
