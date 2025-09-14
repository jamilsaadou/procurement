'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

const LigneBudgetaireForm = ({ isOpen, onClose, onSubmit, ligne = null }) => {
  const [formData, setFormData] = useState({
    numero: ligne?.numero || '',
    libelle: ligne?.libelle || '',
    montantInitial: ligne?.montantInitial || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      newErrors.numero = 'Le code de la ligne est requis';
    }
    if (!formData.libelle.trim()) {
      newErrors.libelle = 'La désignation de la ligne d\'imputation est requise';
    }
    if (!formData.montantInitial || parseFloat(formData.montantInitial) <= 0) {
      newErrors.montantInitial = 'Le montant initial doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        montantInitial: parseFloat(formData.montantInitial),
        // Le montant restant est égal au montant initial lors de la création
        montantRestant: parseFloat(formData.montantInitial)
      };
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      numero: '',
      libelle: '',
      montantInitial: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={ligne ? 'Modifier la ligne budgétaire' : 'Nouvelle ligne budgétaire'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code de la ligne *
          </label>
          <Input
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="BUD-2025-001"
            error={errors.numero}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Désignation de la ligne d'imputation *
          </label>
          <Input
            name="libelle"
            value={formData.libelle}
            onChange={handleChange}
            placeholder="Maintenance informatique"
            error={errors.libelle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant initial (CFA) *
          </label>
          <Input
            name="montantInitial"
            type="number"
            min="0"
            step="0.01"
            value={formData.montantInitial}
            onChange={handleChange}
            placeholder="1000000"
            error={errors.montantInitial}
          />
        </div>


        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button type="submit">
            {ligne ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LigneBudgetaireForm;
