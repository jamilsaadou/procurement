'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

const LigneBudgetaireForm = ({ isOpen, onClose, onSubmit, ligne = null }) => {
  const [formData, setFormData] = useState({
    numero: ligne?.numero || '',
    libelle: ligne?.libelle || '',
    description: ligne?.description || '',
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
      newErrors.numero = 'Le numéro est requis';
    }
    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est requis';
    }
    if (formData.montantInitial && isNaN(formData.montantInitial)) {
      newErrors.montantInitial = 'Montant invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        montantInitial: parseFloat(formData.montantInitial) || 0
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      numero: '',
      libelle: '',
      description: '',
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
            Numéro *
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
            Libellé *
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
            Montant initial (CFA)
          </label>
          <Input
            name="montantInitial"
            value={formData.montantInitial}
            onChange={handleChange}
            placeholder="120000"
            error={errors.montantInitial}
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
            placeholder="Description de la ligne budgétaire..."
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
