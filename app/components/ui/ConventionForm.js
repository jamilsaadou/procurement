'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';

export default function ConventionForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    numero: '',
    mandatId: '',
    ligneBudgetaireId: '',
    partenaireId: '',
    modeSelection: 'Appel d\'offres',
    typeConvention: 'Prestation',
    objet: '',
    dateDebut: '',
    dateFin: '',
    montantTotal: '',
    statut: 'Brouillon',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mandats, setMandats] = useState([]);
  const [lignesBudgetaires, setLignesBudgetaires] = useState([]);
  const [partenaires, setPartenaires] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numero: initialData.numero || '',
        mandatId: initialData.mandatId || '',
        ligneBudgetaireId: initialData.ligneBudgetaireId || '',
        partenaireId: initialData.partenaireId || '',
        modeSelection: initialData.modeSelection || 'Appel d\'offres',
        typeConvention: initialData.typeConvention || 'Prestation',
        objet: initialData.objet || '',
        dateDebut: initialData.dateDebut ? new Date(initialData.dateDebut).toISOString().split('T')[0] : '',
        dateFin: initialData.dateFin ? new Date(initialData.dateFin).toISOString().split('T')[0] : '',
        montantTotal: initialData.montantTotal?.toString() || '',
        statut: initialData.statut || 'Brouillon',
        description: initialData.description || ''
      });
    } else {
      // Générer un seul numéro automatique pour une nouvelle convention
      const generateNumero = () => {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        return `CONV-${year}-${timestamp}`;
      };
      
      setFormData(prev => ({
        ...prev,
        numero: generateNumero()
      }));
    }
  }, [initialData]);

  const fetchData = async () => {
    try {
      const [mandatsRes, lignesRes, partenairesRes] = await Promise.all([
        fetch('/api/mandats'),
        fetch('/api/lignes-budgetaires'),
        fetch('/api/partenaires')
      ]);

      if (mandatsRes.ok) {
        const mandatsData = await mandatsRes.json();
        setMandats(mandatsData);
      }

      if (lignesRes.ok) {
        const lignesData = await lignesRes.json();
        setLignesBudgetaires(lignesData);
      }

      if (partenairesRes.ok) {
        const partenairesData = await partenairesRes.json();
        setPartenaires(partenairesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro est requis';
    }

    if (!formData.mandatId) {
      newErrors.mandatId = 'Le mandat est requis';
    }

    if (!formData.ligneBudgetaireId) {
      newErrors.ligneBudgetaireId = 'La ligne budgétaire est requise';
    }

    if (!formData.partenaireId) {
      newErrors.partenaireId = 'Le partenaire est requis';
    }


    if (!formData.objet.trim()) {
      newErrors.objet = 'L\'objet est requis';
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

    if (!formData.montantTotal || parseFloat(formData.montantTotal) <= 0) {
      newErrors.montantTotal = 'Le montant total doit être supérieur à 0';
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
        mandatId: parseInt(formData.mandatId),
        montantTotal: parseFloat(formData.montantTotal)
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

  const modesSelection = [
    'Appel d\'offres',
    'Consultation',
    'Gré à gré',
    'Concours',
    'Marché négocié'
  ];

  const typesConvention = [
    'Prestation',
    'Fourniture',
    'Travaux',
    'Service',
    'Maintenance'
  ];


  const statutsConvention = [
    'Brouillon',
    'Active',
    'En cours',
    'Terminée',
    'Résiliée'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="N° Convention"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            error={errors.numero}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mandat *
          </label>
          <select
            name="mandatId"
            value={formData.mandatId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mandatId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Sélectionner un mandat</option>
            {mandats.map(mandat => (
              <option key={mandat.id} value={mandat.id}>
                {mandat.titre}
              </option>
            ))}
          </select>
          {errors.mandatId && (
            <p className="mt-1 text-sm text-red-600">{errors.mandatId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ligne budgétaire *
          </label>
          <select
            name="ligneBudgetaireId"
            value={formData.ligneBudgetaireId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.ligneBudgetaireId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Sélectionner une ligne budgétaire</option>
            {lignesBudgetaires.map(ligne => (
              <option key={ligne.id} value={ligne.id}>
                {ligne.numero} - {ligne.libelle}
              </option>
            ))}
          </select>
          {errors.ligneBudgetaireId && (
            <p className="mt-1 text-sm text-red-600">{errors.ligneBudgetaireId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partenaire *
          </label>
          <select
            name="partenaireId"
            value={formData.partenaireId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.partenaireId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Sélectionner un partenaire</option>
            {partenaires.map(partenaire => (
              <option key={partenaire.id} value={partenaire.id}>
                {partenaire.nom} - {partenaire.representantLegal}
              </option>
            ))}
          </select>
          {errors.partenaireId && (
            <p className="mt-1 text-sm text-red-600">{errors.partenaireId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode de sélection *
          </label>
          <select
            name="modeSelection"
            value={formData.modeSelection}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {modesSelection.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de convention *
          </label>
          <select
            name="typeConvention"
            value={formData.typeConvention}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {typesConvention.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>


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

        <div>
          <Input
            label="Montant total (FCFA)"
            name="montantTotal"
            type="number"
            step="0.01"
            min="0"
            value={formData.montantTotal}
            onChange={handleChange}
            error={errors.montantTotal}
            required
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
            {statutsConvention.map(statut => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Objet de la convention"
          name="objet"
          value={formData.objet}
          onChange={handleChange}
          error={errors.objet}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span className="text-sm text-gray-500 ml-2">
            ({formData.description.length}/191 caractères)
          </span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={191}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formData.description.length > 191 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Description détaillée de la convention..."
        />
        {formData.description.length > 191 && (
          <p className="mt-1 text-sm text-red-600">
            La description ne peut pas dépasser 191 caractères
          </p>
        )}
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
