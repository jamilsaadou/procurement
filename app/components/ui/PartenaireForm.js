'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function PartenaireForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    statutJuridique: initialData?.statutJuridique || '',
    representantLegal: initialData?.representantLegal || '',
    adresse: initialData?.adresse || '',
    email: initialData?.email || '',
    telephone: initialData?.telephone || '',
    fax: initialData?.fax || '',
    autresInfos: initialData?.autresInfos || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.statutJuridique.trim()) {
      newErrors.statutJuridique = 'Le statut juridique est requis';
    }

    if (!formData.representantLegal.trim()) {
      newErrors.representantLegal = 'Le représentant légal est requis';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const statutsJuridiques = [
    'SARL',
    'SA',
    'SAS',
    'EURL',
    'Association',
    'Coopérative',
    'Entreprise individuelle',
    'GIE',
    'Autre'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Nom du partenaire"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            error={errors.nom}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut juridique *
          </label>
          <select
            name="statutJuridique"
            value={formData.statutJuridique}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.statutJuridique ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Sélectionner un statut</option>
            {statutsJuridiques.map(statut => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
          {errors.statutJuridique && (
            <p className="mt-1 text-sm text-red-600">{errors.statutJuridique}</p>
          )}
        </div>

        <div>
          <Input
            label="Représentant légal"
            name="representantLegal"
            value={formData.representantLegal}
            onChange={handleChange}
            error={errors.representantLegal}
            required
          />
        </div>

        <div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>

        <div>
          <Input
            label="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            error={errors.telephone}
            required
          />
        </div>

        <div>
          <Input
            label="Fax"
            name="fax"
            value={formData.fax}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse *
        </label>
        <textarea
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.adresse ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.adresse && (
          <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Autres informations
        </label>
        <textarea
          name="autresInfos"
          value={formData.autresInfos}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Informations complémentaires..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
