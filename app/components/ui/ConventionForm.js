'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { mandatsAPI, lignesBudgetairesAPI } from '@/lib/data';
import { TYPES_CONVENTIONS, MODES_SELECTION, STATUTS_CONVENTIONS } from '@/lib/constants';

const ConventionForm = ({ isOpen, onClose, onSubmit, convention = null }) => {
  const [formData, setFormData] = useState({
    numero: convention?.numero || '',
    objet: convention?.objet || '',
    dateDebut: convention?.dateDebut || '',
    dateFin: convention?.dateFin || '',
    typeConvention: convention?.typeConvention || 'prestation_service',
    modeSelection: convention?.modeSelection || 'appel_offres',
    statut: convention?.statut || 'active',
    montantTotal: convention?.montantTotal || '',
    periodicitePaiement: convention?.periodicitePaiement || 'mensuel',
    mandatId: convention?.mandatId || '',
    ligneBudgetaireId: convention?.ligneBudgetaireId || '',
    description: convention?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [mandats, setMandats] = useState([]);
  const [lignesBudgetaires, setLignesBudgetaires] = useState([]);
  const [echeancesPaiement, setEcheancesPaiement] = useState(
    convention?.echeancesPaiement || []
  );

  useEffect(() => {
    // Charger les mandats et lignes budgétaires
    setMandats(mandatsAPI.getAll());
    setLignesBudgetaires(lignesBudgetairesAPI.getAll());
  }, []);

  useEffect(() => {
    // Calculer la durée automatiquement
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const diffTime = Math.abs(fin - debut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setFormData(prev => ({
        ...prev,
        duree: diffDays
      }));
    }
  }, [formData.dateDebut, formData.dateFin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Traitement spécial pour les montants
    if (name === 'montantTotal') {
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

  const generateEcheances = () => {
    if (!formData.montantTotal || !formData.dateDebut || !formData.periodicitePaiement) {
      return;
    }

    const montantTotal = parseInt(formData.montantTotal);
    const dateDebut = new Date(formData.dateDebut);
    const dateFin = formData.dateFin ? new Date(formData.dateFin) : null;
    
    let echeances = [];
    let currentDate = new Date(dateDebut);
    let remainingAmount = montantTotal;

    if (formData.periodicitePaiement === 'unique') {
      echeances.push({
        date: formData.dateDebut,
        montant: montantTotal,
        statut: 'en_attente'
      });
    } else {
      let increment;
      let maxEcheances;

      switch (formData.periodicitePaiement) {
        case 'mensuel':
          increment = 1;
          maxEcheances = 12;
          break;
        case 'trimestriel':
          increment = 3;
          maxEcheances = 4;
          break;
        case 'semestriel':
          increment = 6;
          maxEcheances = 2;
          break;
        case 'annuel':
          increment = 12;
          maxEcheances = 1;
          break;
        default:
          increment = 1;
          maxEcheances = 12;
      }

      const montantParEcheance = Math.floor(montantTotal / maxEcheances);
      
      for (let i = 0; i < maxEcheances; i++) {
        const isLastEcheance = i === maxEcheances - 1;
        const montant = isLastEcheance ? remainingAmount : montantParEcheance;
        
        echeances.push({
          date: currentDate.toISOString().split('T')[0],
          montant: montant,
          statut: 'en_attente'
        });

        remainingAmount -= montant;
        currentDate.setMonth(currentDate.getMonth() + increment);

        // Arrêter si on dépasse la date de fin
        if (dateFin && currentDate > dateFin) {
          break;
        }
      }
    }

    setEcheancesPaiement(echeances);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro de la convention est requis';
    }
    if (!formData.objet.trim()) {
      newErrors.objet = 'L\'objet de la convention est requis';
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
    if (!formData.montantTotal || formData.montantTotal <= 0) {
      newErrors.montantTotal = 'Le montant total doit être supérieur à 0';
    }
    if (!formData.mandatId) {
      newErrors.mandatId = 'Veuillez sélectionner un mandat';
    }
    if (!formData.ligneBudgetaireId) {
      newErrors.ligneBudgetaireId = 'Veuillez sélectionner une ligne budgétaire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const processedData = {
        ...formData,
        montantTotal: parseInt(formData.montantTotal),
        montantPaye: 0,
        solde: parseInt(formData.montantTotal),
        echeancesPaiement: echeancesPaiement
      };
      onSubmit(processedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      numero: '',
      objet: '',
      dateDebut: '',
      dateFin: '',
      typeConvention: 'prestation_service',
      modeSelection: 'appel_offres',
      statut: 'active',
      montantTotal: '',
      periodicitePaiement: 'mensuel',
      mandatId: '',
      ligneBudgetaireId: '',
      description: ''
    });
    setErrors({});
    setEcheancesPaiement([]);
    onClose();
  };

  const periodicitePaiementOptions = [
    { id: 'unique', label: 'Paiement unique' },
    { id: 'mensuel', label: 'Mensuel' },
    { id: 'trimestriel', label: 'Trimestriel' },
    { id: 'semestriel', label: 'Semestriel' },
    { id: 'annuel', label: 'Annuel' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={convention ? 'Modifier la convention' : 'Nouvelle convention'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de la convention *
              </label>
              <Input
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="CONV-2025-0001"
                error={errors.numero}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUTS_CONVENTIONS.map(statut => (
                  <option key={statut.id} value={statut.id}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objet de la convention *
            </label>
            <Input
              name="objet"
              value={formData.objet}
              onChange={handleChange}
              placeholder="Maintenance informatique annuelle"
              error={errors.objet}
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
              placeholder="Description détaillée de la convention..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de convention *
              </label>
              <select
                name="typeConvention"
                value={formData.typeConvention}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TYPES_CONVENTIONS.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de sélection *
              </label>
              <select
                name="modeSelection"
                value={formData.modeSelection}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {MODES_SELECTION.map(mode => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Relations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Relations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mandat *
              </label>
              <select
                name="mandatId"
                value={formData.mandatId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un mandat</option>
                {mandats.map(mandat => (
                  <option key={mandat.id} value={mandat.id}>
                    {mandat.numero} - {mandat.nomPartenaire}
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        </div>

        {/* Dates et durée */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Période</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <Input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                error={errors.dateDebut}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <Input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                error={errors.dateFin}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (jours)
              </label>
              <Input
                value={formData.duree || ''}
                readOnly
                className="bg-gray-50"
                placeholder="Calculé automatiquement"
              />
            </div>
          </div>
        </div>

        {/* Montants et paiements */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Montants et paiements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant total (CFA) *
              </label>
              <div className="relative">
                <Input
                  name="montantTotal"
                  value={formData.montantTotal}
                  onChange={handleChange}
                  placeholder="120000"
                  error={errors.montantTotal}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">CFA</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Périodicité de paiement *
              </label>
              <select
                name="periodicitePaiement"
                value={formData.periodicitePaiement}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periodicitePaiementOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={generateEcheances}
              disabled={!formData.montantTotal || !formData.dateDebut || !formData.periodicitePaiement}
            >
              Générer les échéances
            </Button>
          </div>

          {/* Affichage des échéances */}
          {echeancesPaiement.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Échéances de paiement</h4>
              <div className="space-y-2">
                {echeancesPaiement.map((echeance, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>Échéance {index + 1} - {new Date(echeance.date).toLocaleDateString('fr-FR')}</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(echeance.montant)} CFA</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {convention ? 'Modifier' : 'Créer'} la convention
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConventionForm;
