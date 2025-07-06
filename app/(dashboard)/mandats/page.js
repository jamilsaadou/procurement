'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  FileText,
  Calendar,
  Euro,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import MandatForm from '@/components/ui/MandatForm';
import { mandatsAPI } from '@/lib/data';

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

const STATUTS_MANDATS = [
  { id: 'brouillon', label: 'Brouillon' },
  { id: 'actif', label: 'Actif' },
  { id: 'termine', label: 'Terminé' },
  { id: 'suspendu', label: 'Suspendu' }
];

const TYPES_MANDATS = [
  { id: 'prestation_service', label: 'Prestation de service' },
  { id: 'fourniture', label: 'Fourniture' },
  { id: 'conseil', label: 'Conseil' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'formation', label: 'Formation' }
];

function getStatusColor(statut) {
  switch (statut) {
    case 'brouillon': return 'bg-gray-100 text-gray-800';
    case 'actif': return 'bg-green-100 text-green-800';
    case 'termine': return 'bg-blue-100 text-blue-800';
    case 'suspendu': return 'bg-red-100 text-red-800';
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
              Nom du partenaire
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Représentant légal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de signature
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
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
                <div className="text-sm text-gray-500">{mandat.formeJuridique}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{mandat.nomPartenaire}</div>
                <div className="text-sm text-gray-500">{mandat.emailPartenaire}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{mandat.representantLegal}</div>
                <div className="text-sm text-gray-500">{mandat.telephonePartenaire}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {TYPES_MANDATS.find(t => t.id === mandat.typeMandat)?.label || mandat.typeMandat}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(mandat.dateSignature)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mandat.statut)}`}>
                  {STATUTS_MANDATS.find(s => s.id === mandat.statut)?.label || mandat.statut}
                </span>
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
              {STATUTS_MANDATS.find(s => s.id === mandat.statut)?.label || mandat.statut}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du partenaire
            </label>
            <p className="text-sm text-gray-900">{mandat.nomPartenaire}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Représentant légal
            </label>
            <p className="text-sm text-gray-900">{mandat.representantLegal}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <p className="text-sm text-gray-900">{mandat.adressePartenaire}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">{mandat.emailPartenaire}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <p className="text-sm text-gray-900">{mandat.telephonePartenaire}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIRET
            </label>
            <p className="text-sm text-gray-900">{mandat.numeroSiret}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forme juridique
            </label>
            <p className="text-sm text-gray-900">{mandat.formeJuridique}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de mandat
            </label>
            <p className="text-sm text-gray-900">
              {TYPES_MANDATS.find(t => t.id === mandat.typeMandat)?.label || mandat.typeMandat}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de signature
            </label>
            <p className="text-sm text-gray-900">{formatDate(mandat.dateSignature)}</p>
          </div>
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

  const loadMandats = () => {
    setLoading(true);
    try {
      const data = mandatsAPI.getAll();
      setMandats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMandats = () => {
    let filtered = [...mandats];

    if (searchTerm) {
      filtered = filtered.filter(mandat =>
        mandat.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandat.nomPartenaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandat.representantLegal.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = (mandat) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le mandat ${mandat.numero} ?`)) {
      mandatsAPI.delete(mandat.id);
      loadMandats();
    }
  };

  const handleCreateMandat = () => {
    setEditingMandat(null);
    setShowMandatForm(true);
  };

  const handleSubmitMandat = (mandatData) => {
    try {
      if (editingMandat) {
        mandatsAPI.update(editingMandat.id, mandatData);
      } else {
        mandatsAPI.create(mandatData);
      }
      loadMandats();
      setShowMandatForm(false);
      setEditingMandat(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mandat:', error);
    }
  };

  // Calculate stats
  const stats = {
    total: mandats.length,
    actifs: mandats.filter(m => m.statut === 'actif').length,
    termines: mandats.filter(m => m.statut === 'termine').length,
    brouillons: mandats.filter(m => m.statut === 'brouillon').length
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
          <p className="text-gray-600">Gérez vos mandats avec les partenaires</p>
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
                  placeholder="Rechercher par numéro, partenaire ou représentant..."
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
            <div className="text-2xl font-bold text-gray-600">{stats.brouillons}</div>
            <div className="text-sm text-gray-600">Brouillons</div>
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

      <MandatForm
        isOpen={showMandatForm}
        onClose={() => {
          setShowMandatForm(false);
          setEditingMandat(null);
        }}
        onSubmit={handleSubmitMandat}
        mandat={editingMandat}
      />
    </div>
  );
}
