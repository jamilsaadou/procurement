'use client'
import { useEffect, useState } from 'react'

export default function TestDBPage() {
  const [conventions, setConventions] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch conventions
        const conventionsRes = await fetch('/api/conventions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!conventionsRes.ok) {
          const errorData = await conventionsRes.json();
          throw new Error(`Conventions fetch failed: ${errorData.error || conventionsRes.statusText}`);
        }
        const conventionsData = await conventionsRes.json();
        setConventions(conventionsData);

        // Fetch mandats
        const mandatsRes = await fetch('/api/mandats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
          
        if (!mandatsRes.ok) {
          const errorData = await mandatsRes.json();
          throw new Error(`Mandats fetch failed: ${errorData.error || mandatsRes.statusText}`);
        }
        const mandatsData = await mandatsRes.json();
        setMandats(mandatsData);

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Chargement des données...</div>
  if (error) return <div>Erreur: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Liste des Mandats et Conventions</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mandats</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Représentant légal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de signature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mandats.map(mandat => (
                <tr key={mandat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mandat.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mandat.nomPartenaire}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mandat.representantLegal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mandat.dateSignature).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${mandat.statut === 'actif' ? 'bg-green-100 text-green-800' : 
                        mandat.statut === 'termine' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {mandat.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Conventions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conventions.map(convention => (
                <tr key={convention.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{convention.numero}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{convention.objet}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(convention.dateDebut).toLocaleDateString()} - 
                    {new Date(convention.dateFin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convention.montantTotal} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${convention.statut === 'active' ? 'bg-green-100 text-green-800' : 
                        convention.statut === 'terminee' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {convention.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
