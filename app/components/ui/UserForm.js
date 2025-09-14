'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function UserForm({ user = null, onSubmit, onCancel, currentUserRole }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    role: user?.role || 'user',
    statut: user?.statut || 'actif'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Ne pas envoyer le mot de passe s'il est vide lors de la modification
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Déterminer les rôles disponibles selon le rôle de l'utilisateur connecté
  const getAvailableRoles = () => {
    if (currentUserRole === 'super_admin') {
      return [
        { value: 'user', label: 'Utilisateur' },
        { value: 'admin', label: 'Administrateur' },
        { value: 'super_admin', label: 'Super Administrateur' }
      ];
    } else if (currentUserRole === 'admin') {
      return [
        { value: 'user', label: 'Utilisateur' },
        { value: 'admin', label: 'Administrateur' }
      ];
    }
    return [{ value: 'user', label: 'Utilisateur' }];
  };

  const availableRoles = getAvailableRoles();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>

        <div>
          <Input
            label={user ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required={!user}
            placeholder={user ? "Laisser vide pour ne pas changer" : ""}
          />
        </div>

        <div>
          <Input
            label="Nom"
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            error={errors.nom}
            required
          />
        </div>

        <div>
          <Input
            label="Prénom"
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            error={errors.prenom}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {availableRoles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          {errors.statut && (
            <p className="mt-1 text-sm text-red-600">{errors.statut}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : (user ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
