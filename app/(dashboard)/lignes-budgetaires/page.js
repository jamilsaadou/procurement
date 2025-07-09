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

const LignesBudgetairesTable = ({ lignesBudgetaires, onView, onEdit, onDelete }) => {
  if (lignesBudgetaires.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ligne budgétaire</h3>
        <p className="text-gray-500">Commencez par créer votre première ligne budgétaire.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant initial</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant restant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lignesBudgetaires.map((ligne, index) => {
            const montantUtilise = ligne.montantInitial - ligne.montantRestant;
            const pourcentageUtilise = ligne.montantInitial > 0 ? (montantUtilise / ligne.montantInitial) * 100 : 0;
            
            return (
              <tr key={ligne.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ligne.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-48 truncate" title={ligne.libelle}>
                    {ligne.libelle}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-32 truncate" title={ligne.description}>
                    {ligne.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(ligne.montantInitial)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={ligne.montantRestant > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(ligne.montantRestant)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${pourcentageUtilise >= 90 ? 'bg-red-500' : pourcentageUtilise >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {pourcentageUtilise.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(ligne.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(ligne)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ligne)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(ligne)}
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

const LigneBudgetaireDetailsModal = ({ ligneBudgetaire, isOpen, onClose }) => {
  if (!ligneBudgetaire) return null;

  const montantUtilise = ligneBudgetaire.montantInitial - ligneBudgetaire.montantRestant;
  const pourcentageUtilise = ligneBudgetaire.montantInitial > 0 ? (montantUtilise / ligneBudgetaire.montantInitial) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails - ${ligneBudgetaire.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro
            </label>
            <p className="text-sm text-gray-900">{ligneBudgetaire.numero}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de création
            </label>
            <p className="text-sm text-gray-900">{formatDate(ligneBudgetaire.createdAt)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Libellé
          </label>
          <p className="text-sm text-gray-900">{ligneBudgetaire.libelle}</p>
        </div>

        {ligneBudgetaire.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{ligneBudgetaire.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant initial
            </label>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(ligneBudgetaire.montantInitial)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant utilisé
            </label>
            <p className="text-sm font-medium text-blue-600">{formatCurrency(montantUtilise)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant restant
            </label>
            <p className={`text-sm font-medium ${ligneBudgetaire.montantRestant > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(ligneBudgetaire.montantRestant)}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Utilisation du budget
          </label>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${pourcentageUtilise >= 90 ? 'bg-red-500' : pourcentageUtilise >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {pourcentageUtilise.toFixed(1)}% utilisé
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default function LignesBudgetairesPage() {
  const [lignesBudgetaires, setLignesBudgetaires] = useState([]);
  const [filteredLignesBudgetaires, setFilteredLignesBudgetaires] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLigneBudgetaire, setSelectedLigneBudgetaire] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLigneBudgetaireForm, setShowLigneBudgetaireForm] = useState(false);
  const [editingLigneBudgetaire, setEditingLigneBudgetaire] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLignesBudgetaires = async () => {
      try {
        const response = await fetch('/api/lignes-budgetaires');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLignesBudgetaires(data);
        setFilteredLignesBudgetaires(data);
      } catch (error) {
        console.error('Error fetching lignes budgetaires:', error);
        setLignesBudgetaires([]);
        setFilteredLignesBudgetaires([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLignesBudgetaires();
  }, []);

  useEffect(() => {
    let filtered = [...lignesBudgetaires];

    if (searchTerm) {
      filtered = filtered.filter(ligne =>
        ligne.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ligne.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ligne.description && ligne.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLignesBudgetaires(filtered);
  }, [searchTerm, lignesBudgetaires]);

  const handleView = (ligneBudgetaire) => {
    setSelectedLigneBudgetaire(ligneBudgetaire);
    setShowDetailsModal(true);
  };

  const handleEdit = (ligneBudgetaire) => {
    setEditingLigneBudgetaire(ligneBudgetaire);
    setShowLigneBudgetaireForm(true);
  };

  const handleDelete = async (ligneBudgetaire) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la ligne budgétaire ${ligneBudgetaire.numero} ?`)) {
      try {
        await fetch(`/api/lignes-budgetaires/${ligneBudgetaire.id}`, {
          method: 'DELETE'
        });
        const response = await fetch('/api/lignes-budgetaires');
        const data = await response.json();
        setLignesBudgetaires(data);
        setFilteredLignesBudgetaires(data);
      } catch (error) {
        console.error('Error deleting ligne budgetaire:', error);
      }
    }
  };

  const handleCreateLigneBudgetaire = () => {
    setEditingLigneBudgetaire(null);
    setShowLigneBudgetaireForm(true);
  };

  const handleSubmitLigneBudgetaire = async (ligneBudgetaireData) => {
    try {
      const method = editingLigneBudgetaire ? 'PUT' : 'POST';
      const url = editingLigneBudgetaire 
        ? `/api/lignes-budgetaires/${editingLigneBudgetaire.id}`
        : '/api/lignes-budgetaires';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ligneBudgetaireData)
      });

      const response = await fetch('/api/lignes-budgetaires');
      const data = await response.json();
      setLignesBudgetaires(data);
      setFilteredLignesBudgetaires(data);
      setShowLigneBudgetaireForm(false);
      setEditingLigneBudgetaire(null);
    } catch (error) {
      console.error('Error saving ligne budgetaire:', error);
    }
  };

  // Calculer les statistiques
  const totalMontantInitial = lignesBudgetaires.reduce((sum, ligne) => sum + ligne.montantInitial, 0);
  const totalMontantRestant = lignesBudgetaires.reduce((sum, ligne) => sum + ligne.montantRestant, 0);
  const totalMontantUtilise = totalMontantInitial - totalMontantRestant;
  const lignesEpuisees = lignesBudgetaires.filter(ligne => ligne.montantRestant <= 0).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Lignes budgétaires</h1>
          <p className="text-gray-600">Gérez vos lignes budgétaires et suivez leur utilisation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            onClick={handleCreateLigneBudgetaire}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle ligne budgétaire
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
                  placeholder="Rechercher par numéro, libellé ou description..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{lignesBudgetaires.length}</div>
            <div className="text-sm text-gray-600">Total lignes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMontantInitial)}
            </div>
            <div className="text-sm text-gray-600">Budget total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalMontantUtilise)}
            </div>
            <div className="text-sm text-gray-600">Montant utilisé</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {lignesEpuisees}
            </div>
            <div className="text-sm text-gray-600">Lignes épuisées</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des lignes budgétaires ({filteredLignesBudgetaires.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LignesBudgetairesTable
            lignesBudgetaires={filteredLignesBudgetaires}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      <LigneBudgetaireDetailsModal
        ligneBudgetaire={selectedLigneBudgetaire}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLigneBudgetaire(null);
        }}
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
