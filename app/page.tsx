'use client'

import { StatusBadge } from '../components/ui/status-badge'
import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAl5ZbgWviD4vf-3BjOZB9uQGhxPQT7Dy0",
  authDomain: "lav60-sim.firebaseapp.com",
  databaseURL: "https://lav60-sim-default-rtdb.firebaseio.com",
  projectId: "lav60-sim",
  storageBucket: "lav60-sim.firebasestorage.app",
  messagingSenderId: "76967549738",
  appId: "1:76967549738:web:005e2522cbd495a8491c53"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export default function Home() {
  const [stores, setStores] = useState<any[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    console.log('Conectando ao Firebase...')
    const storesRef = ref(database, 'status')
    
    const unsubscribe = onValue(storesRef, (snapshot) => {
      console.log('Dados recebidos:', snapshot.val())
      const data = snapshot.val()
      if (data) {
        const storesList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        }))
        console.log('Lista de lojas:', storesList)
        setStores(storesList)
      }
    }, (error) => {
      console.error('Erro ao conectar com Firebase:', error)
    })

    return () => unsubscribe()
  }, [])

  const filteredStores = stores.filter(store => {
    const matchesStatus = selectedStatus === 'all' || store.app_status === selectedStatus
    const matchesSearch = store.store_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.machine_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  console.log('Stores filtradas:', filteredStores)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Monitor SIM</h1>
          <p className="mt-1 text-sm text-gray-500">Sistema Integrado de Monitoramento</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['running', 'restarting', 'error', 'down'].map((status) => {
            const count = stores.filter(s => s.app_status === status).length
            return (
              <div key={status} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">
                  {status === 'running' ? 'Rodando' :
                   status === 'restarting' ? 'Reiniciando' :
                   status === 'error' ? 'Com Erro' : 'Desligado'}
                </div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{count}</div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar por ID ou nome da máquina..."
            className="flex-1 rounded-lg border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full sm:w-48 rounded-lg border-gray-300"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="running">Rodando</option>
            <option value="restarting">Reiniciando</option>
            <option value="error">Erro</option>
            <option value="down">Desligado</option>
          </select>
        </div>

        {/* Server List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhum servidor encontrado
            </div>
          ) : (
            filteredStores.map((store) => (
              <div key={store.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Loja {store.store_id}</h3>
                    <p className="text-sm text-gray-500">{store.machine_name}</p>
                  </div>
                  <StatusBadge status={store.app_status} />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="text-gray-500">
                    Última atualização: {new Date(store.timestamp).toLocaleString()}
                  </div>
                  <div className="text-gray-500">
                    Porta 3000: {' '}
                    <span className={store.port_3000 ? 'text-green-600' : 'text-red-600'}>
                      {store.port_3000 ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}