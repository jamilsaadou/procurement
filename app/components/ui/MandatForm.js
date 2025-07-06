'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

const MandatForm = ({ isOpen, onClose, onSubmit, mandat = null }) => {
  const [formData, setFormData] = useState({
    numero: mandat?.numero || '',
    nomPartenaire: mandat?.nomPartenaire || '',
    representantLegal: mandat?.representantLegal || '',
    dateSignature: mandat?.dateSignature || '',
    typeMandat: mandat?.typeMandat || 'prestation_service',
    statut: mandat?.statut || 'actif',
    adressePartenaire: mandat?.adressePartenaire || '',
    emailPartenaire: mandat?.emailPartenaire || '',
    telephonePartenaire: mandat?.telephonePartenaire || '',
    numeroSiret: mandat?.numeroSiret || '',
    formeJuridique: mandat?.formeJuridique || 'SAS'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.numero = 'Le numéro du mandat est requis';
    }
    if (!formData.nomPartenaire.trim()) {
      newErrors.nomPartenaire = 'Le nom du partenaire est requis';
    }
    if (!formData.representantLegal.trim()) {
      newErrors.representantLegal = 'Le représentant légal est requis';
    }
    if (!formData.dateSignature) {
      newErrors.dateSignature = 'La date de signature est requise';
    }
    if (!formData.adressePartenaire.trim()) {
      newErrors.adressePartenaire = 'L\'adresse est requise';
    }
    if (!formData.emailPartenaire.trim()) {
      newErrors.emailPartenaire = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailPartenaire)) {
      newErrors.emailPartenaire = 'Format d\'email invalide';
    }
    if (!formData.telephonePartenaire.trim()) {
      newErrors.telephonePartenaire = 'Le téléphone est requis';
    }
    if (!formData.numeroSiret.trim()) {
      newErrors.numeroSiret = 'Le numéro SIRET est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      numero: '',
      nomPartenaire: '',
      representantLegal: '',
      dateSignature: '',
      typeMandat: 'prestation_service',
      statut: 'actif',
      adressePartenaire: '',
      emailPartenaire: '',
      telephonePartenaire: '',
      numeroSiret: '',
      formeJuridique: 'SAS'
    });
    setErrors({});
    onClose();
  };

  const typesMandat = [
    { id: 'prestation_service', label: 'Prestation de service' },
    { id: 'fourniture', label: 'Fourniture' },
    { id: 'conseil', label: 'Conseil' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'formation', label: 'Formation' }
  ];

  const statutsMandat = [
    { id: 'actif', label: 'Actif' },
    { id: 'termine', label: 'Terminé' },
    { id: 'suspendu', label: 'Suspendu' }
  ];

  const formesJuridiques = [
    { id: 'SAS', label: 'SAS' },
    { id: 'SARL', label: 'SARL' },
    { id: 'SA', label: 'SA' },
    { id: 'EURL', label: 'EURL' },
    { id: 'SNC', label: 'SNC' },
    { id: 'Auto-entrepreneur', label: 'Auto-entrepreneur' },
    { id: 'Association', label: 'Association' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mandat ? 'Modifier le mandat' : 'Nouveau mandat'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro du mandat *
              </label>
              <Input
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="MAN-2025-0001"
                error={errors.numero}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de signature *
              </label>
              <Input
                type="date"
                name="dateSignature"
                value={formData.dateSignature}
                onChange={handleChange}
                error={errors.dateSignature}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de mandat *
              </label>
              <select
                name="typeMandat"
                value={formData.typeMandat}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typesMandat.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
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
                {statutsMandat.map(statut => (
                  <option key={statut.id} value={statut.id}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Informations du partenaire */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informations du partenaire</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du partenaire *
              </label>
              <Input
                name="nomPartenaire"
                value={formData.nomPartenaire}
                onChange={handleChange}
                placeholder="Entreprise Alpha"
                error={errors.nomPartenaire}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Représentant légal *
              </label>
              <Input
                name="representantLegal"
                value={formData.representantLegal}
                onChange={handleChange}
                placeholder="Jean Dupont"
                error={errors.representantLegal}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <Input
              name="adressePartenaire"
              value={formData.adressePartenaire}
              onChange={handleChange}
              placeholder="123 Rue de la République, 75001 Paris"
              error={errors.adressePartenaire}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                name="emailPartenaire"
                value={formData.emailPartenaire}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                error={errors.emailPartenaire}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <Input
                name="telephonePartenaire"
                value={formData.telephonePartenaire}
                onChange={handleChange}
                placeholder="01 23 45 67 89"
                error={errors.telephonePartenaire}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro SIRET *
              </label>
              <Input
                name="numeroSiret"
                value={formData.numeroSiret}
                onChange={handleChange}
                placeholder="12345678901234"
                error={errors.numeroSiret}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forme juridique *
              </label>
              <select
                name="formeJuridique"
                value={formData.formeJuridique}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {formesJuridiques.map(forme => (
                  <option key={forme.id} value={forme.id}>
                    {forme.label}
                  </option>
                ))}
              </select>
            </div>
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
            {mandat ? 'Modifier' : 'Créer'} le mandat
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MandatForm;
