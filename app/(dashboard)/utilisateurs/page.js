'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import UserForm from '../../components/ui/UserForm';

export default function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Récupérer la liste des utilisateurs
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      window.location.href = '/login';
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Utilisateur créé avec succès');
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      setError('Erreur lors de la création');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Utilisateur modifié avec succès');
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification utilisateur:', error);
      setError('Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Utilisateur supprimé avec succès');
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
  };

  const getRoleLabel = (role) => {
    const roles = {
      'user': 'Utilisateur',
      'admin': 'Administrateur',
      'super_admin': 'Super Administrateur'
    };
    return roles[role] || role;
  };

  const getStatutBadge = (statut) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (statut === 'actif') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800`;
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (role === 'super_admin') {
      return `${baseClasses} bg-purple-100 text-purple-800`;
    } else if (role === 'admin') {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const canManageUser = (targetUser) => {
    if (!currentUser) return false;
    
    // Super admin peut tout faire
    if (currentUser.role === 'super_admin') return true;
    
    // Admin ne peut pas gérer les super admins
    if (currentUser.role === 'admin' && targetUser.role === 'super_admin') return false;
    
    // Admin ne peut pas se supprimer lui-même
    if (currentUser.role === 'admin' && targetUser.id === currentUser.id) return false;
    
    return currentUser.role === 'admin';
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600">Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <Button onClick={() => openModal('create')}>
          Nouvel Utilisateur
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatutBadge(user.statut)}>
                        {user.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canManageUser(user) && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openModal('edit', user)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openModal('delete', user)}
                            >
                              Supprimer
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal pour créer/modifier un utilisateur */}
      <Modal
        isOpen={showModal && (modalType === 'create' || modalType === 'edit')}
        onClose={closeModal}
        title={modalType === 'create' ? 'Nouvel Utilisateur' : 'Modifier l\'Utilisateur'}
      >
        <UserForm
          user={selectedUser}
          currentUserRole={currentUser?.role}
          onSubmit={modalType === 'create' ? handleCreateUser : handleEditUser}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showModal && modalType === 'delete'}
        onClose={closeModal}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ?
          </p>
          <p className="text-sm text-gray-600">
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeModal}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
