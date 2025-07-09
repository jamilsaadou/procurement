'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PartenaireForm from '../../components/ui/PartenaireForm';

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState(null);

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const fetchPartenaires = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/partenaires');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des partenaires');
      }
      const data = await response.json();
      setPartenaires(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartenaire = async (formData) => {
    try {
      const response = await fetch('/api/partenaires', {
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

      await fetchPartenaires();
      setShowModal(false);
      setEditingPartenaire(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (partenaire) => {
    setEditingPartenaire(partenaire);
    setShowModal(true);
  };

  const handleDelete = async (partenaire) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${partenaire.nom}" ?`)) {
      try {
        const response = await fetch(`/api/partenaires/${partenaire.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la suppression');
        }
        
        await fetchPartenaires();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPartenaire(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement des partenaires...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
        <Button onClick={() => setShowModal(true)}>
          Nouveau Partenaire
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partenaires.map((partenaire) => (
          <Card key={partenaire.id} className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {partenaire.nom}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(partenaire)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(partenaire)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Statut:</span> {partenaire.statutJuridique}
                </div>
                <div>
                  <span className="font-medium">Représentant:</span> {partenaire.representantLegal}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {partenaire.email}
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span> {partenaire.telephone}
                </div>
                <div>
                  <span className="font-medium">Adresse:</span> {partenaire.adresse}
                </div>
                {partenaire.fax && (
                  <div>
                    <span className="font-medium">Fax:</span> {partenaire.fax}
                  </div>
                )}
              </div>

              {partenaire.conventions && partenaire.conventions.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Conventions:</span> {partenaire.conventions.length}
                  </div>
                </div>
              )}

              {partenaire.autresInfos && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Autres infos:</span>
                    <p className="mt-1">{partenaire.autresInfos}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {partenaires.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucun partenaire trouvé
          </div>
          <Button onClick={() => setShowModal(true)}>
            Créer le premier partenaire
          </Button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
      >
        <PartenaireForm
          onSubmit={handleCreatePartenaire}
          onCancel={handleCloseModal}
          initialData={editingPartenaire}
        />
      </Modal>
    </div>
  );
}
