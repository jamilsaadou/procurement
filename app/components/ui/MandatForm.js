'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function MandatForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    numero: initialData?.numero || '',
    nom: initialData?.nom || '',
    titre: initialData?.titre || '',
    dateDebut: initialData?.dateDebut ? new Date(initialData.dateDebut).toISOString().split('T')[0] : '',
    dateFin: initialData?.dateFin ? new Date(initialData.dateFin).toISOString().split('T')[0] : '',
    regionsIntervention: initialData?.regionsIntervention ? JSON.parse(initialData.regionsIntervention) : [],
    statut: initialData?.statut || 'Actif',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regionsDisponibles = [
    'Niamey',
    'Zinder', 
    'Maradi',
    'Tahoua',
    'Tillaberi',
    'Dosso',
    'Diffa',
    'Agadez',
    'Echelle nationale'
  ];

  const statutsMandat = [
    'Actif',
    'Terminé',
    'Suspendu',
    'En attente'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du mandat est requis';
    }

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    }

    if (formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      newErrors.dateFin = 'La date de fin doit être postérieure à la date de début';
    }

    if (formData.regionsIntervention.length === 0) {
      newErrors.regionsIntervention = 'Au moins une région d\'intervention est requise';
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
      const submitData = {
        ...formData,
        regionsIntervention: JSON.stringify(formData.regionsIntervention),
        dateCreation: formData.dateDebut // Pour compatibilité
      };
      await onSubmit(submitData);
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

  const handleRegionChange = (region) => {
    setFormData(prev => {
      const newRegions = prev.regionsIntervention.includes(region)
        ? prev.regionsIntervention.filter(r => r !== region)
        : [...prev.regionsIntervention, region];
      
      return {
        ...prev,
        regionsIntervention: newRegions
      };
    });

    // Clear error when user selects regions
    if (errors.regionsIntervention) {
      setErrors(prev => ({
        ...prev,
        regionsIntervention: ''
      }));
    }
  };

  const calculateDuration = () => {
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const diffTime = Math.abs(fin - debut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);
      
      if (diffYears > 0) {
        return `${diffYears} an${diffYears > 1 ? 's' : ''} ${diffMonths % 12} mois`;
      } else if (diffMonths > 0) {
        return `${diffMonths} mois`;
      } else {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      }
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Numéro du mandat"
            name="numero"
            value={formData.numero || 'Généré automatiquement'}
            readOnly
            className="bg-gray-50"
          />
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
          >
            {statutsMandat.map(statut => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Nom du mandat"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          error={errors.nom}
          placeholder="Ex: Mandat de prestation informatique"
          required
        />
      </div>

      <div>
        <Input
          label="Titre"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          error={errors.titre}
          placeholder="Ex: Développement d'applications web"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Date de début"
            name="dateDebut"
            type="date"
            value={formData.dateDebut}
            onChange={handleChange}
            error={errors.dateDebut}
            required
          />
        </div>

        <div>
          <Input
            label="Date de fin"
            name="dateFin"
            type="date"
            value={formData.dateFin}
            onChange={handleChange}
            error={errors.dateFin}
            required
          />
        </div>
      </div>

      {calculateDuration() && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Durée calculée:</strong> {calculateDuration()}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Régions d'intervention *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {regionsDisponibles.map(region => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.regionsIntervention.includes(region)}
                onChange={() => handleRegionChange(region)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{region}</span>
            </label>
          ))}
        </div>
        {errors.regionsIntervention && (
          <p className="mt-1 text-sm text-red-600">{errors.regionsIntervention}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={191}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description détaillée du mandat..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/191 caractères
        </p>
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
