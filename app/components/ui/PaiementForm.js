'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function PaiementForm({ onSubmit, onCancel, convention, initialData = null }) {
  const [formData, setFormData] = useState({
    pourcentage: initialData?.pourcentage || '',
    datePrevue: initialData?.datePrevue ? new Date(initialData.datePrevue).toISOString().split('T')[0] : '',
    dateEffective: initialData?.dateEffective ? new Date(initialData.dateEffective).toISOString().split('T')[0] : '',
    statut: initialData?.statut || 'En attente',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer le solde disponible
  const totalPourcentagePaye = convention?.paiements?.reduce(
    (sum, paiement) => sum + paiement.pourcentage, 0
  ) || 0;
  const soldeDisponible = 100 - totalPourcentagePaye;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pourcentage) {
      newErrors.pourcentage = 'Le pourcentage est requis';
    } else {
      const pourcentage = parseFloat(formData.pourcentage);
      if (isNaN(pourcentage) || pourcentage <= 0) {
        newErrors.pourcentage = 'Le pourcentage doit être un nombre positif';
      } else if (pourcentage > soldeDisponible) {
        newErrors.pourcentage = `Le pourcentage ne peut pas dépasser ${soldeDisponible}%`;
      }
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
        conventionId: convention.id,
        pourcentage: parseFloat(formData.pourcentage),
        datePrevue: formData.datePrevue || null,
        dateEffective: formData.dateEffective || null
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

  const calculerMontant = () => {
    const pourcentage = parseFloat(formData.pourcentage);
    if (!isNaN(pourcentage) && convention?.montantTotal) {
      return (convention.montantTotal * pourcentage) / 100;
    }
    return 0;
  };

  const statutsPaiement = [
    'En attente',
    'Effectué',
    'Annulé'
  ];

  return (
    <div className="space-y-4">
      {/* Informations sur la convention */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Convention: {convention?.objet}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Montant total:</span> {convention?.montantTotal?.toLocaleString()} FCFA
          </div>
          <div>
            <span className="font-medium">Solde disponible:</span> {soldeDisponible}%
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Pourcentage (%)"
              name="pourcentage"
              type="number"
              step="0.01"
              min="0"
              max={soldeDisponible}
              value={formData.pourcentage}
              onChange={handleChange}
              error={errors.pourcentage}
              required
            />
            {formData.pourcentage && (
              <p className="mt-1 text-sm text-gray-600">
                Montant: {calculerMontant().toLocaleString()} FCFA
              </p>
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
            >
              {statutsPaiement.map(statut => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Date prévue"
              name="datePrevue"
              type="date"
              value={formData.datePrevue}
              onChange={handleChange}
            />
          </div>

          <div>
            <Input
              label="Date effective"
              name="dateEffective"
              type="date"
              value={formData.dateEffective}
              onChange={handleChange}
            />
          </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description du paiement..."
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
            {isSubmitting ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </div>
  );
}
