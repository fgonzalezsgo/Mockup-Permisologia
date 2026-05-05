import { useState } from 'react';
import { Settings, Lock, Building2, Plus, UserPlus, Check, X, Users, Star, Edit2, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CollaboratorOption = 'private' | 'custom' | string;

interface Collaborator {
  id: string;
  name: string;
  run: string;
  avatar: string;
  avatarColor: string;
  role: string;
}

interface SavedFilter {
  id: string;
  name: string;
  collaboratorIds: string[];
}

const availableCollaborators: Collaborator[] = [
  { id: '1', name: 'María García López', run: '12345678A', avatar: 'M', avatarColor: '#9333ea', role: 'Administrador Mandante' },
  { id: '2', name: 'Juan Martínez Ruiz', run: '87654321B', avatar: 'J', avatarColor: '#6366f1', role: 'Consultor' },
  { id: '3', name: 'Laura Pérez Moreno', run: '78945612E', avatar: 'L', avatarColor: '#8b5cf6', role: 'Consultor' },
  { id: '4', name: 'Carlos Sánchez Gil', run: '45678912C', avatar: 'C', avatarColor: '#ec4899', role: 'Jefe de Proyecto' },
  { id: '5', name: 'Ana Torres Vega', run: '32165498D', avatar: 'A', avatarColor: '#14b8a6', role: 'Coordinador General' }
];

export function DraftEditor() {
  const [collaboratorOption, setCollaboratorOption] = useState<CollaboratorOption>('private');
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [requiresResponse, setRequiresResponse] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: 'filter-1',
      name: 'Equipo Principal',
      collaboratorIds: ['1', '3', '5']
    }
  ]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [showManageFiltersModal, setShowManageFiltersModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);

  const getCollaboratorLabel = () => {
    if (collaboratorOption === 'private') {
      return '🔒 Solo Yo (Privado)';
    } else if (collaboratorOption === 'custom') {
      return `👥 ${selectedCollaborators.length} colaborador${selectedCollaborators.length !== 1 ? 'es' : ''} seleccionado${selectedCollaborators.length !== 1 ? 's' : ''}`;
    } else {
      // It's a saved filter
      const filter = savedFilters.find(f => f.id === collaboratorOption);
      return filter ? `⭐ ${filter.name}` : '🔒 Solo Yo (Privado)';
    }
  };

  const handleOptionSelect = (option: CollaboratorOption) => {
    if (option === 'custom') {
      setShowSaveDraftModal(false);
      setShowCollaboratorModal(true);
    } else if (option === 'manage-filters') {
      setShowSaveDraftModal(false);
      setShowManageFiltersModal(true);
    } else {
      // Check if it's a saved filter
      const filter = savedFilters.find(f => f.id === option);
      if (filter) {
        setSelectedCollaborators(filter.collaboratorIds);
      }
      setCollaboratorOption(option);
    }
  };

  const toggleCollaborator = (collaboratorId: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(collaboratorId)
        ? prev.filter(id => id !== collaboratorId)
        : [...prev, collaboratorId]
    );
  };

  const confirmCustomSelection = () => {
    if (selectedCollaborators.length > 0) {
      setCollaboratorOption('custom');
    }
    setShowCollaboratorModal(false);
    setShowSaveDraftModal(true);
  };

  const openSaveFilterModal = () => {
    setShowCollaboratorModal(false);
    setShowSaveFilterModal(true);
  };

  const saveFilter = () => {
    if (!filterName.trim() || selectedCollaborators.length === 0) return;

    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName.trim(),
      collaboratorIds: [...selectedCollaborators]
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setCollaboratorOption(newFilter.id);
    setFilterName('');
    setShowSaveFilterModal(false);
    setShowSaveDraftModal(true);
  };

  const startEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFilterName(filter.name);
    setSelectedCollaborators(filter.collaboratorIds);
    setShowManageFiltersModal(false);
    setShowSaveDraftModal(false);
    setShowCollaboratorModal(true);
  };

  const updateFilter = () => {
    if (!editingFilter || !filterName.trim() || selectedCollaborators.length === 0) return;

    setSavedFilters(prev => prev.map(f =>
      f.id === editingFilter.id
        ? { ...f, name: filterName.trim(), collaboratorIds: [...selectedCollaborators] }
        : f
    ));

    setCollaboratorOption(editingFilter.id);
    setEditingFilter(null);
    setFilterName('');
    setShowCollaboratorModal(false);
    setShowSaveDraftModal(true);
  };

  const deleteFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    if (collaboratorOption === filterId) {
      setCollaboratorOption('private');
      setSelectedCollaborators([]);
    }
  };

  const cancelEditFilter = () => {
    setEditingFilter(null);
    setFilterName('');
    setSelectedCollaborators([]);
    setShowCollaboratorModal(false);
    setShowSaveDraftModal(true);
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl" style={{ fontWeight: 600, color: '#1f2937' }}>
            Libro de Comunicaciones
          </h1>
          <button className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="space-y-6">
          {/* Receptor Section */}
          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-[#6b7280]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-base" style={{ fontWeight: 600, color: '#1f2937' }}>
                Receptor
              </h2>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Receptor <span className="text-[#ef4444]">*</span>
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent">
                  <option>Seleccione Receptor</option>
                </select>
              </div>

              <div className="pt-8">
                <button className="p-2 border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors">
                  <svg className="w-5 h-5 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Con copia a
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent">
                  <option>Todos (11)</option>
                </select>
                <p className="text-xs text-[#6b7280] mt-1.5">
                  (el receptor y el inspector fiscal siempre serán notificados)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresResponse}
                  onChange={(e) => setRequiresResponse(e.target.checked)}
                  className="w-4 h-4 rounded border-[#d1d5db] text-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]"
                />
                <span className="text-sm" style={{ fontWeight: 500, color: '#374151' }}>
                  Requiere Respuesta
                </span>
              </label>
            </div>
          </div>

          {/* Referencias Section */}
          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-[#6b7280]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h2 className="text-base" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Referencias
                </h2>
              </div>
              <button className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm" style={{ fontWeight: 500 }}>
                Agregar
              </button>
            </div>
            <p className="text-sm text-[#6b7280]">Sin referencias</p>
          </div>

          {/* Tipo de Comunicaciones Section */}
          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-[#6b7280]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h2 className="text-base" style={{ fontWeight: 600, color: '#1f2937' }}>
                Tipo de Comunicaciones
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Tipo Folio <span className="text-[#ef4444]">*</span>
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent">
                  <option>Seleccione Tipo Folio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Ámbito de Comunicaciones
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent">
                  <option>Seleccione Ámbito de Comunicaciones</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Prioridad
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent">
                  <option>⚌ Media</option>
                  <option>⬆ Alta</option>
                  <option>⬇ Baja</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contenido Section */}
          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-[#6b7280]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-base" style={{ fontWeight: 600, color: '#1f2937' }}>
                Contenido
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Asunto <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el asunto"
                  className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors">
                    <svg className="w-5 h-5 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Contenido
                </label>
                <textarea
                  rows={8}
                  placeholder="Escriba el contenido del mensaje..."
                  className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4 pb-8">
          <button className="px-6 py-3 text-[#374151] hover:bg-white rounded-lg transition-colors border border-[#d1d5db]" style={{ fontWeight: 500 }}>
            Cancelar
          </button>
          <button
            onClick={() => setShowSaveDraftModal(true)}
            className="px-6 py-3 bg-[#6b7280] text-white hover:bg-[#4b5563] rounded-lg transition-colors"
            style={{ fontWeight: 500 }}
          >
            Guardar Borrador
          </button>
          <button className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm" style={{ fontWeight: 600 }}>
            Crear Folio
          </button>
        </div>
      </div>

      {/* Save Draft Modal */}
      <AnimatePresence>
        {showSaveDraftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowSaveDraftModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                  <Save className="w-6 h-6 text-[#6b7280]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Guardar Borrador
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona quiénes podrán ver y editar este borrador
                  </p>
                </div>
              </div>

              {/* Collaborators Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#6b7280]" />
                  <h2 className="text-base" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Colaboradores del Borrador
                  </h2>
                </div>

                <div className="relative">
                  <select
                    value={collaboratorOption}
                    onChange={(e) => handleOptionSelect(e.target.value as CollaboratorOption)}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent appearance-none cursor-pointer"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="private">🔒 Solo Yo (Privado)</option>
                    {savedFilters.length > 0 && <option disabled>───────────────</option>}
                    {savedFilters.map(filter => (
                      <option key={filter.id} value={filter.id}>
                        ⭐ {filter.name}
                      </option>
                    ))}
                    {savedFilters.length > 0 && <option disabled>───────────────</option>}
                    <option value="custom">+ Selección Personalizada...</option>
                    {savedFilters.length > 0 && (
                      <option value="manage-filters">⚙️ Gestionar Favoritos...</option>
                    )}
                  </select>
                  {collaboratorOption === 'custom' && selectedCollaborators.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCollaborators.map(id => {
                        const collaborator = availableCollaborators.find(c => c.id === id);
                        if (!collaborator) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#eff6ff] rounded-full border border-[#bfdbfe]"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: collaborator.avatarColor, fontWeight: 600 }}
                            >
                              {collaborator.avatar}
                            </div>
                            <span className="text-sm" style={{ fontWeight: 500, color: '#1e40af' }}>
                              {collaborator.name}
                            </span>
                            <button
                              onClick={() => toggleCollaborator(id)}
                              className="p-0.5 hover:bg-[#dbeafe] rounded-full transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-[#3b82f6]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSaveDraftModal(false)}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aquí iría la lógica de guardar el borrador
                    setShowSaveDraftModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-[#6b7280] text-white hover:bg-[#4b5563] rounded-lg transition-colors shadow-sm"
                  style={{ fontWeight: 600 }}
                >
                  Guardar Borrador
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Collaborators Modal */}
      <AnimatePresence>
        {showCollaboratorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowCollaboratorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-[#4f46e5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Seleccionar Colaboradores
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona las personas que podrán ver y editar este borrador
                  </p>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="mb-6 space-y-2">
                {availableCollaborators.map((collaborator) => (
                  <button
                    key={collaborator.id}
                    onClick={() => toggleCollaborator(collaborator.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${selectedCollaborators.includes(collaborator.id)
                        ? 'border-[#4f46e5] bg-[#eff6ff]'
                        : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: collaborator.avatarColor, fontWeight: 600 }}
                      >
                        {collaborator.avatar}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {collaborator.name}
                        </div>
                        <div className="text-sm text-[#6b7280]">
                          {collaborator.role} · RUN: {collaborator.run}
                        </div>
                      </div>
                      {selectedCollaborators.includes(collaborator.id) && (
                        <div className="w-6 h-6 rounded-full bg-[#4f46e5] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Count */}
              {selectedCollaborators.length > 0 && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg">
                  <div className="flex items-center gap-2 text-[#4f46e5]">
                    <Users className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>
                      {selectedCollaborators.length} colaborador{selectedCollaborators.length !== 1 ? 'es' : ''} seleccionado{selectedCollaborators.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={editingFilter ? cancelEditFilter : () => setShowCollaboratorModal(false)}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                {!editingFilter && selectedCollaborators.length > 0 && (
                  <button
                    onClick={openSaveFilterModal}
                    className="px-4 py-3 bg-[#f59e0b] text-white hover:bg-[#d97706] rounded-lg transition-colors flex items-center gap-2"
                    style={{ fontWeight: 500 }}
                  >
                    <Star className="w-4 h-4" />
                    Guardar como Favorito
                  </button>
                )}
                <button
                  onClick={editingFilter ? updateFilter : confirmCustomSelection}
                  disabled={selectedCollaborators.length === 0}
                  className="flex-1 px-4 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  {editingFilter ? 'Actualizar filtro' : 'Confirmar selección'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Filter Modal */}
      <AnimatePresence>
        {showSaveFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowSaveFilterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#fef3c7] flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Guardar como Favorito
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Dale un nombre a este grupo de colaboradores para reutilizarlo fácilmente
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Nombre del grupo
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="ej. Equipo Principal, Supervisores..."
                  className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="mb-6 p-4 bg-[#fef3c7] rounded-lg">
                <div className="text-sm text-[#92400e]">
                  <span style={{ fontWeight: 600 }}>
                    {selectedCollaborators.length} colaborador{selectedCollaborators.length !== 1 ? 'es' : ''} seleccionado{selectedCollaborators.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowSaveFilterModal(false);
                    setFilterName('');
                    setShowCollaboratorModal(true);
                  }}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFilter}
                  disabled={!filterName.trim()}
                  className="flex-1 px-4 py-3 bg-[#f59e0b] text-white hover:bg-[#d97706] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Filters Modal */}
      <AnimatePresence>
        {showManageFiltersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowManageFiltersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#fef3c7] flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Gestionar Favoritos
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Edita o elimina tus grupos de colaboradores guardados
                  </p>
                </div>
              </div>

              {savedFilters.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                  <p className="text-[#6b7280]">
                    No tienes favoritos guardados
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {savedFilters.map(filter => (
                    <div
                      key={filter.id}
                      className="p-4 bg-[#f9fafb] rounded-lg border border-[#e1e4e8]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-[#f59e0b]" />
                            <span style={{ fontWeight: 600, color: '#1f2937' }}>
                              {filter.name}
                            </span>
                          </div>
                          <div className="text-sm text-[#6b7280]">
                            {filter.collaboratorIds.length} colaborador{filter.collaboratorIds.length !== 1 ? 'es' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditFilter(filter)}
                            className="p-2 text-[#6b7280] hover:bg-white rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFilter(filter.id)}
                            className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setShowManageFiltersModal(false);
                    setShowSaveDraftModal(true);
                  }}
                  className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm"
                  style={{ fontWeight: 600 }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
