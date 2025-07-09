'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MandatForm from '@/components/ui/MandatForm';

// Simple utility functions
function formatDate(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
}

function formatDuration(days) {
  if (!days) return '';
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  
  let result = '';
  if (years > 0) result += `${years} an${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} mois `;
  if (remainingDays > 0 && years === 0) result += `${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
  
  return result.trim();
}

const STATUTS_MANDATS = [
  { id: 'Actif', label: 'Actif' },
  { id: 'Terminé', label: 'Terminé' },
  { id: 'Suspendu', label: 'Suspendu' },
  { id: 'En attente', label: 'En attente' }
];

function getStatusColor(statut) {
  switch (statut) {
    case 'Actif': return 'bg-green-100 text-green-800';
    case 'Terminé': return 'bg-blue-100 text-blue-800';
    case 'Suspendu': return 'bg-red-100 text-red-800';
    case 'En attente': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const MandatsTable = ({ mandats, onView, onEdit, onDelete }) => {
  if (mandats.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileText className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mandat</h3>
        <p className="text-gray-500">Commencez par créer votre premier mandat.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              N° Mandat
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom / Titre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Période d'activité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Régions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conventions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mandats.map((mandat) => (
            <tr key={mandat.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{mandat.numero}</div>
                <div className="text-sm text-gray-500">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatDate(mandat.dateDebut)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{mandat.nom}</div>
                <div className="text-sm text-gray-500">{mandat.titre}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(mandat.dateDebut)} - {formatDate(mandat.dateFin)}
                </div>
                <div className="text-sm text-gray-500">
                  Durée: {formatDuration(mandat.dureeEnJours)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {mandat.regionsInterventionArray?.slice(0, 2).join(', ')}
                  {mandat.regionsInterventionArray?.length > 2 && 
                    ` +${mandat.regionsInterventionArray.length - 2}`
                  }
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mandat.statut)}`}>
                  {mandat.statut}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{mandat.nombreConventions || 0}</div>
                <div className="text-sm text-gray-500">convention{(mandat.nombreConventions || 0) > 1 ? 's' : ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(mandat)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(mandat)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(mandat)}
                    title="Supprimer"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MandatDetailsModal = ({ mandat, isOpen, onClose }) => {
  if (!mandat) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails - ${mandat.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Mandat
            </label>
            <p className="text-sm text-gray-900">{mandat.numero}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mandat.statut)}`}>
              {mandat.statut}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du mandat
          </label>
          <p className="text-sm text-gray-900">{mandat.nom}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre
          </label>
          <p className="text-sm text-gray-900">{mandat.titre}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <p className="text-sm text-gray-900">{formatDate(mandat.dateDebut)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <p className="text-sm text-gray-900">{formatDate(mandat.dateFin)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée
          </label>
          <p className="text-sm text-gray-900">{formatDuration(mandat.dureeEnJours)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Régions d'intervention
          </label>
          <div className="flex flex-wrap gap-2">
            {mandat.regionsInterventionArray?.map((region, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {region}
              </span>
            ))}
          </div>
        </div>

        {mandat.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{mandat.description}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conventions associées
          </label>
          <p className="text-sm text-gray-900">
            {mandat.nombreConventions || 0} convention{(mandat.nombreConventions || 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default function MandatsPage() {
  const [mandats, setMandats] = useState([]);
  const [filteredMandats, setFilteredMandats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMandat, setSelectedMandat] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMandatForm, setShowMandatForm] = useState(false);
  const [editingMandat, setEditingMandat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMandats();
  }, []);

  useEffect(() => {
    filterMandats();
  }, [mandats, searchTerm, statusFilter]);

  const loadMandats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mandats');
      if (!response.ok) throw new Error('Failed to fetch mandats');
      const data = await response.json();
      setMandats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
      setMandats([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMandats = () => {
    let filtered = [...mandats];

    if (searchTerm) {
      filtered = filtered.filter(mandat =>
        mandat.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandat.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandat.titre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(mandat => mandat.statut === statusFilter);
    }

    setFilteredMandats(filtered);
  };

  const handleView = (mandat) => {
    setSelectedMandat(mandat);
    setShowDetailsModal(true);
  };

  const handleEdit = (mandat) => {
    setEditingMandat(mandat);
    setShowMandatForm(true);
  };

  const handleDelete = async (mandat) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le mandat ${mandat.numero} ?`)) {
      try {
        const response = await fetch(`/api/mandats/${mandat.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete mandat');
        }
        
        loadMandats();
      } catch (error) {
        console.error('Erreur lors de la suppression du mandat:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const handleCreateMandat = () => {
    setEditingMandat(null);
    setShowMandatForm(true);
  };

  const handleSubmitMandat = async (mandatData) => {
    try {
      const url = editingMandat ? `/api/mandats/${editingMandat.id}` : '/api/mandats';
      const method = editingMandat ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mandatData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save mandat');
      }
      
      loadMandats();
      setShowMandatForm(false);
      setEditingMandat(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mandat:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Calculate stats
  const stats = {
    total: mandats.length,
    actifs: mandats.filter(m => m.statut === 'Actif').length,
    termines: mandats.filter(m => m.statut === 'Terminé').length,
    suspendus: mandats.filter(m => m.statut === 'Suspendu').length
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
          <h1 className="text-2xl font-bold text-gray-900">Mandats</h1>
          <p className="text-gray-600">Gérez vos mandats avec leurs périodes d'activité et régions d'intervention</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleCreateMandat} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau mandat
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
                  placeholder="Rechercher par numéro, nom ou titre..."
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
                {STATUTS_MANDATS.map(status => (
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
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
            <div className="text-sm text-gray-600">Actifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.termines}</div>
            <div className="text-sm text-gray-600">Terminés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.suspendus}</div>
            <div className="text-sm text-gray-600">Suspendus</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des mandats ({filteredMandats.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MandatsTable
            mandats={filteredMandats}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <MandatDetailsModal
        mandat={selectedMandat}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMandat(null);
        }}
      />

      {showMandatForm && (
        <Modal
          isOpen={showMandatForm}
          onClose={() => {
            setShowMandatForm(false);
            setEditingMandat(null);
          }}
          title={editingMandat ? 'Modifier le mandat' : 'Nouveau mandat'}
          size="lg"
        >
          <MandatForm
            onSubmit={handleSubmitMandat}
            onCancel={() => {
              setShowMandatForm(false);
              setEditingMandat(null);
            }}
            initialData={editingMandat}
          />
        </Modal>
      )}
    </div>
  );
}
