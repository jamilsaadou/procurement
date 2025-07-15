'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConventionForm from '../../components/ui/ConventionForm';
import PaiementForm from '../../components/ui/PaiementForm';
import { exportConventionsToExcel, exportConventionsSummaryToExcel } from '../../lib/excelExport';
import Link from 'next/link';

export default function ConventionsPage() {
  const [conventions, setConventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConventionModal, setShowConventionModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [editingConvention, setEditingConvention] = useState(null);
  const [selectedConvention, setSelectedConvention] = useState(null);

  useEffect(() => {
    fetchConventions();
  }, []);

  const fetchConventions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conventions');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des conventions');
      }
      const data = await response.json();
      setConventions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConvention = async (formData) => {
    try {
      const response = await fetch('/api/conventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      await fetchConventions();
      setShowConventionModal(false);
      setEditingConvention(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePaiement = async (formData) => {
    try {
      const response = await fetch('/api/paiements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du paiement');
      }

      await fetchConventions();
      setShowPaiementModal(false);
      setSelectedConvention(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (convention) => {
    setEditingConvention(convention);
    setShowConventionModal(true);
  };

  const handleAddPaiement = (convention) => {
    setSelectedConvention(convention);
    setShowPaiementModal(true);
  };

  const handleDelete = async (convention) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la convention "${convention.numeroConvention}" ?`)) {
      try {
        const response = await fetch(`/api/conventions/${convention.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la suppression');
        }
        
        await fetchConventions();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseConventionModal = () => {
    setShowConventionModal(false);
    setEditingConvention(null);
  };

  const handleClosePaiementModal = () => {
    setShowPaiementModal(false);
    setSelectedConvention(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement des conventions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Conventions</h1>
        <div className="flex items-center space-x-3">
          <Link href="/conventions/visualisation">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Visualisation</span>
            </Button>
          </Link>
          {conventions.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => exportConventionsToExcel(conventions)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exporter Excel</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => exportConventionsSummaryToExcel(conventions)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Résumé Excel</span>
              </Button>
            </>
          )}
          <Button onClick={() => setShowConventionModal(true)}>
            Nouvelle Convention
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tableau des conventions selon votre spécification */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
              {conventions.map((convention, index) => (
                <tr key={convention.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.mandat?.titre || 'N/A'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.ligneBudgetaire?.libelle || 'N/A'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.modeSelection}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.partenaire?.nom || 'N/A'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.partenaire?.representantLegal || 'N/A'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.typeConvention}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {convention.numeroConvention}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="max-w-48 truncate" title={convention.objet}>
                      {convention.objet}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(convention.dateDebut)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(convention.dateFin)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.duree} jours
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.periodicitePaiement}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {convention.totalPourcentagePaye || 0}%
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={convention.solde > 0 ? 'text-red-600' : 'text-green-600'}>
                      {convention.solde || 0}%
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(convention)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPaiement(convention)}
                        disabled={convention.solde <= 0}
                      >
                        + Paiement
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(convention)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {conventions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucune convention trouvée
          </div>
          <Button onClick={() => setShowConventionModal(true)}>
            Créer la première convention
          </Button>
        </div>
      )}

      {/* Détails des paiements pour chaque convention */}
      {conventions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Détails des paiements</h2>
          {conventions.map((convention) => (
            <Card key={`paiements-${convention.id}`} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {convention.objet}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Partenaire: {convention.partenaire?.nom} | 
                      Montant total: {formatCurrency(convention.montantTotal)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPaiement(convention)}
                    disabled={convention.solde <= 0}
                  >
                    Ajouter un paiement
                  </Button>
                </div>

                {convention.paiements && convention.paiements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date prévue</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date effective</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {convention.paiements.map((paiement) => (
                          <tr key={paiement.id}>
                            <td className="px-3 py-2 text-sm text-gray-900">{paiement.pourcentage}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(paiement.montant)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {paiement.datePrevue ? formatDate(paiement.datePrevue) : '-'}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {paiement.dateEffective ? formatDate(paiement.dateEffective) : '-'}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                paiement.statut === 'Effectué' ? 'bg-green-100 text-green-800' :
                                paiement.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {paiement.statut}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {paiement.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucun paiement enregistré pour cette convention
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal pour les conventions */}
      <Modal
        isOpen={showConventionModal}
        onClose={handleCloseConventionModal}
        title={editingConvention ? 'Modifier la convention' : 'Nouvelle convention'}
      >
        <ConventionForm
          onSubmit={handleCreateConvention}
          onCancel={handleCloseConventionModal}
          initialData={editingConvention}
        />
      </Modal>

      {/* Modal pour les paiements */}
      <Modal
        isOpen={showPaiementModal}
        onClose={handleClosePaiementModal}
        title="Ajouter un paiement"
      >
        <PaiementForm
          onSubmit={handleCreatePaiement}
          onCancel={handleClosePaiementModal}
          convention={selectedConvention}
        />
      </Modal>
    </div>
  );
}
