'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

const LigneBudgetaireForm = ({ isOpen, onClose, onSubmit, ligneBudgetaire = null }) => {
  const [formData, setFormData] = useState({
    numero: ligneBudgetaire?.numero || '',
    libelle: ligneBudgetaire?.libelle || '',
    periode: ligneBudgetaire?.periode || new Date().getFullYear().toString(),
    montant: ligneBudgetaire?.montant || '',
    montantUtilise: ligneBudgetaire?.montantUtilise || 0,
    description: ligneBudgetaire?.description || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Traitement spécial pour les montants
    if (name === 'montant' || name === 'montantUtilise') {
      processedValue = value.replace(/[^\d]/g, ''); // Garder seulement les chiffres
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Effacer l'erreur si le champ est maintenant rempli
    if (errors[name] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro de la ligne budgétaire est requis';
    }
    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est requis';
    }
    if (!formData.periode.trim()) {
      newErrors.periode = 'La période est requise';
    }
    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
    }
    if (formData.montantUtilise && parseInt(formData.montantUtilise) > parseInt(formData.montant)) {
      newErrors.montantUtilise = 'Le montant utilisé ne peut pas dépasser le montant total';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const processedData = {
        ...formData,
        montant: parseInt(formData.montant),
        montantUtilise: parseInt(formData.montantUtilise) || 0,
        solde: parseInt(formData.montant) - (parseInt(formData.montantUtilise) || 0)
      };
      onSubmit(processedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      numero: '',
      libelle: '',
      periode: new Date().getFullYear().toString(),
      montant: '',
      montantUtilise: 0,
      description: ''
    });
    setErrors({});
    onClose();
  };

  // Générer les années pour la période
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 5; i++) {
    years.push(i.toString());
  }

  // Calculer le solde en temps réel
  const montantTotal = parseInt(formData.montant) || 0;
  const montantUtilise = parseInt(formData.montantUtilise) || 0;
  const solde = montantTotal - montantUtilise;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={ligneBudgetaire ? 'Modifier la ligne budgétaire' : 'Nouvelle ligne budgétaire'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro *
              </label>
              <Input
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="LB-2025-001"
                error={errors.numero}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période *
              </label>
              <select
                name="periode"
                value={formData.periode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.periode && (
                <p className="mt-1 text-sm text-red-600">{errors.periode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé *
            </label>
            <Input
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              placeholder="Fonctionnement - Maintenance informatique"
              error={errors.libelle}
            />
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée de la ligne budgétaire..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant total (CFA) *
              </label>
              <div className="relative">
                <Input
                  name="montant"
                  value={formData.montant}
                  onChange={handleChange}
                  placeholder="120000"
                  error={errors.montant}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">CFA</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant utilisé (CFA)
              </label>
              <div className="relative">
                <Input
                  name="montantUtilise"
                  value={formData.montantUtilise}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.montantUtilise}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">CFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Affichage du solde calculé */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Solde disponible :</span>
              <span className={`text-lg font-bold ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('fr-FR').format(solde)} CFA
              </span>
            </div>
            {solde < 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Le montant utilisé dépasse le montant total
              </p>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button type="submit">
            {ligneBudgetaire ? 'Modifier' : 'Créer'} la ligne budgétaire
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LigneBudgetaireForm;
