import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ChevronDown, ChevronRight, Edit2, Trash2, CheckSquare, Square, Plus, X, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface ResourceGroup {
  id: string;
  name: string;
  resources: Array<{ id: string; name: string }>;
}

interface ResourceFunctionality {
  id: string;
  name: string;
  groups: ResourceGroup[];
}

interface ResourceProfile {
  id: string;
  name: string;
  description: string;
  color: string;
  usersCount: number;
  permissionIds: string[];
}

interface ResourceProfilesStore {
  profiles: ResourceProfile[];
}

const RESOURCE_PROFILES_STORAGE_KEY = 'resource_profiles_v3';
const PERMISSIONS_CONFIG_UPDATED_EVENT = 'permissions-config-updated';

const FUNCTIONALITIES: ResourceFunctionality[] = [
  {
    id: 'administracion',
    name: 'Administración',
    groups: [
      {
        id: 'contratos',
        name: 'Contratos',
        resources: [
          { id: 'solicitudes_contratos', name: 'Solicitudes de Contratos' },
          { id: 'procesos_batch', name: 'Procesos Batch' },
          { id: 'firmas', name: 'Firmas' }
        ]
      },
      {
        id: 'cobranzas',
        name: 'Cobranzas',
        resources: [
          { id: 'acuerdos', name: 'Acuerdos' },
          { id: 'maestros', name: 'Maestros' },
          { id: 'cuentas_fecha_ultima_aprobacion', name: 'Cuentas Fecha Última Aprobación' },
          { id: 'script_pagos', name: 'Script Pagos' },
          { id: 'transacciones_r', name: 'Transacciones (R)' },
          { id: 'rechazos_cr', name: 'Rechazos (CR)' },
          { id: 'usos', name: 'Usos' }
        ]
      },
      {
        id: 'centro_ayuda',
        name: 'Centro de Ayuda',
        resources: [
          { id: 'editor_categorias', name: 'Editor Categorías' },
          { id: 'editor_preguntas_frecuentes', name: 'Editor Preguntas Frecuentes' }
        ]
      },
      {
        id: 'superadministrador',
        name: 'SuperAdministrador',
        resources: [
          { id: 'log_aplicacion', name: 'Log de aplicación' },
          { id: 'mensajes', name: 'Mensajes' },
          { id: 'reinicio_cache', name: 'Reinicio de Caché' },
          { id: 'imagen_login', name: 'Imagen de Login' },
          { id: 'repetir_firma_toma_conocimiento', name: 'Repetir Firma o Toma de Conocimiento' },
          { id: 'intentos_fallidos', name: 'Intentos Fallidos' }
        ]
      }
    ]
  }
];

const DEFAULT_PROFILES: ResourceProfile[] = [
  {
    id: 'rp-admin',
    name: 'Administrador',
    description: 'Acceso total al sistema con privilegios administrativos completos',
    color: '#4f46e5',
    usersCount: 2,
    permissionIds: []
  },
  {
    id: 'rp-cobranza',
    name: 'Cobranza',
    description: 'Permisos de operación sobre recursos de cobranza',
    color: '#0891b2',
    usersCount: 4,
    permissionIds: []
  },
  {
    id: 'rp-controller',
    name: 'Controller',
    description: 'Control operacional y seguimiento de recursos críticos',
    color: '#7c3aed',
    usersCount: 3,
    permissionIds: []
  }
];

const buildDefaultStore = (): ResourceProfilesStore => ({
  profiles: DEFAULT_PROFILES
});

const loadStored = (): ResourceProfilesStore => {
  try {
    const raw = localStorage.getItem(RESOURCE_PROFILES_STORAGE_KEY);
    if (!raw) return buildDefaultStore();
    const parsed = JSON.parse(raw) as ResourceProfilesStore;
    if (!parsed || !Array.isArray(parsed.profiles)) return buildDefaultStore();
    return parsed;
  } catch {
    return buildDefaultStore();
  }
};

const cloneStore = (value: ResourceProfilesStore): ResourceProfilesStore =>
  JSON.parse(JSON.stringify(value)) as ResourceProfilesStore;

export function ResourceProfiles() {
  const [store, setStore] = useState<ResourceProfilesStore>(() => loadStored());
  const [savedSnapshot, setSavedSnapshot] = useState<ResourceProfilesStore>(() => loadStored());
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>(['rp-admin']);
  const [expandedGroupsByProfile, setExpandedGroupsByProfile] = useState<Record<string, string[]>>({
    'rp-admin': ['contratos']
  });
  const [profileModal, setProfileModal] = useState<{ mode: 'create' | 'edit'; profileId?: string } | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', description: '' });

  const hasChanges = JSON.stringify(store) !== JSON.stringify(savedSnapshot);

  const toggleProfile = (profileId: string) => {
    setExpandedProfiles(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };

  const toggleGroup = (profileId: string, groupId: string) => {
    setExpandedGroupsByProfile(prev => {
      const current = prev[profileId] || [];
      const next = current.includes(groupId)
        ? current.filter(id => id !== groupId)
        : [...current, groupId];
      return { ...prev, [profileId]: next };
    });
  };

  const togglePermission = (profileId: string, resourceId: string) => {
    setStore(prev => ({
      ...prev,
      profiles: prev.profiles.map(profile =>
        profile.id !== profileId
          ? profile
          : {
              ...profile,
              permissionIds: profile.permissionIds.includes(resourceId)
                ? profile.permissionIds.filter(id => id !== resourceId)
                : [...profile.permissionIds, resourceId]
            }
      )
    }));
  };

  const discardChanges = () => {
    const loaded = loadStored();
    setStore(cloneStore(loaded));
    setSavedSnapshot(cloneStore(loaded));
  };

  const saveChanges = () => {
    localStorage.setItem(RESOURCE_PROFILES_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(PERMISSIONS_CONFIG_UPDATED_EVENT));
    setSavedSnapshot(cloneStore(store));
    window.alert('Perfiles de recursos guardados con éxito.');
  };

  const removeProfile = (profileId: string) => {
    setStore(prev => ({ ...prev, profiles: prev.profiles.filter(profile => profile.id !== profileId) }));
    setExpandedProfiles(prev => prev.filter(id => id !== profileId));
    if (profileModal?.profileId === profileId) {
      setProfileModal(null);
      setProfileForm({ name: '', description: '' });
    }
  };

  const openCreateProfileModal = () => {
    setProfileForm({ name: '', description: '' });
    setProfileModal({ mode: 'create' });
  };

  const openEditProfileModal = (profile: ResourceProfile) => {
    setProfileForm({ name: profile.name, description: profile.description });
    setProfileModal({ mode: 'edit', profileId: profile.id });
  };

  const closeProfileModal = () => {
    setProfileModal(null);
    setProfileForm({ name: '', description: '' });
  };

  const saveProfileModal = () => {
    const name = profileForm.name.trim();
    const description = profileForm.description.trim();
    if (!name || !description) {
      window.alert('Completa título y descripción del perfil.');
      return;
    }

    if (profileModal?.mode === 'create') {
      const newId = `rp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const colors = ['#4f46e5', '#0891b2', '#7c3aed', '#0ea5e9', '#2563eb', '#9333ea', '#ec4899', '#f59e0b'];
      const newProfile: ResourceProfile = {
        id: newId,
        name,
        description,
        color: colors[store.profiles.length % colors.length],
        usersCount: 0,
        permissionIds: []
      };
      setStore(prev => ({ ...prev, profiles: [...prev.profiles, newProfile] }));
      setExpandedProfiles(prev => [...prev, newId]);
      setExpandedGroupsByProfile(prev => ({ ...prev, [newId]: ['contratos'] }));
      closeProfileModal();
      return;
    }

    if (profileModal?.mode === 'edit' && profileModal.profileId) {
      setStore(prev => ({
        ...prev,
        profiles: prev.profiles.map(profile =>
          profile.id === profileModal.profileId
            ? { ...profile, name, description }
            : profile
        )
      }));
    }
    closeProfileModal();
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-28">
        <div className="mb-6 flex justify-end">
          <button
            onClick={openCreateProfileModal}
            className="px-5 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm flex items-center gap-2"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            Crear Perfil de Recurso
          </button>
        </div>

        <div className="space-y-4">
          {store.profiles.map((profile, index) => {
            const isExpanded = expandedProfiles.includes(profile.id);
            const activeFunctionality = FUNCTIONALITIES[0];
            const expandedGroups = expandedGroupsByProfile[profile.id] || [];
            const allGroupIds = activeFunctionality.groups.map(group => group.id);
            const areAllGroupsExpanded = allGroupIds.length > 0 && allGroupIds.every(groupId => expandedGroups.includes(groupId));

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-4 px-6 py-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: profile.color }}>
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#111827' }}>{profile.name}</h3>
                    <p className="text-[#6b7280] mb-1">{profile.description}</p>
                    <p className="text-[#6b7280] text-sm">
                      <span style={{ fontWeight: 600, color: profile.color }}>{profile.usersCount}</span> usuarios asignados
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleProfile(profile.id)} className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors" title="Expandir/contraer">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors" title="Acciones del perfil">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => {
                            setExpandedGroupsByProfile(prev => ({
                              ...prev,
                              [profile.id]: areAllGroupsExpanded ? [] : allGroupIds
                            }));
                          }}
                        >
                          {areAllGroupsExpanded ? 'Colapsar todo' : 'Expandir todo'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditProfileModal(profile)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeProfile(profile.id)} className="text-[#ef4444] focus:text-[#ef4444]">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-[#e5e7eb]"
                    >
                      <div className="bg-[#f8f9fb] p-0">
                        <div className="grid grid-cols-[1fr_140px] gap-4 px-6 py-4 border-b border-[#e5e7eb] text-[#111827] bg-white">
                          <div style={{ fontWeight: 600 }}>Recurso</div>
                          <div className="text-center" style={{ fontWeight: 600 }}>Permiso</div>
                        </div>

                        {activeFunctionality.groups.map(group => {
                          const groupOpen = expandedGroups.includes(group.id);
                          return (
                            <div key={`${profile.id}-${group.id}`} className="border-b border-[#e5e7eb] last:border-b-0 bg-white">
                              <button
                                onClick={() => toggleGroup(profile.id, group.id)}
                                className="w-full grid grid-cols-[1fr_140px] gap-4 px-6 py-4 text-left hover:bg-[#f8fafc] transition-colors"
                              >
                                <div className="flex items-center gap-2 text-[#111827]" style={{ fontWeight: 600 }}>
                                  {groupOpen ? <ChevronDown className="w-4 h-4 text-[#6b7280]" /> : <ChevronRight className="w-4 h-4 text-[#6b7280]" />}
                                  {group.name}
                                </div>
                                <div />
                              </button>

                              {groupOpen && group.resources.map(resource => {
                                const checked = profile.permissionIds.includes(resource.id);
                                return (
                                  <div key={`${profile.id}-${resource.id}`} className="grid grid-cols-[1fr_140px] gap-4 px-6 py-4 border-t border-[#f1f5f9]">
                                    <div className="pl-10 text-[#1f2937]">{resource.name}</div>
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => togglePermission(profile.id, resource.id)}
                                        className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
                                          checked
                                            ? 'bg-[#dbeafe] border-[#93c5fd] text-[#2563eb]'
                                            : 'bg-white border-[#9ca3af] text-transparent hover:bg-[#f8fafc]'
                                        }`}
                                      >
                                        {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {profileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
            onClick={closeProfileModal}
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl text-[#111827]" style={{ fontWeight: 600 }}>
                  {profileModal.mode === 'create' ? 'Crear Perfil de Recurso' : 'Modificar Perfil de Recurso'}
                </h3>
                <button onClick={closeProfileModal} className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-2 text-[#374151]" style={{ fontWeight: 600 }}>
                    Título
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Administrador"
                    className="w-full px-4 py-3 rounded-lg border border-[#d1d5db] text-[#1f2937]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[#374151]" style={{ fontWeight: 600 }}>
                    Descripción
                  </label>
                  <textarea
                    value={profileForm.description}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el alcance del perfil"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-[#d1d5db] text-[#1f2937] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeProfileModal}
                  className="px-5 py-2.5 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfileModal}
                  className="px-5 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className={`text-sm ${hasChanges ? 'text-[#b45309]' : 'text-[#6b7280]'}`}>
              {hasChanges ? 'Hay cambios sin guardar.' : 'Sin cambios pendientes.'}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={discardChanges}
                className="px-5 py-2.5 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] transition-colors"
                style={{ fontWeight: 600 }}
              >
                Descartar cambios
              </button>
              <button
                onClick={saveChanges}
                className="px-5 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm"
                style={{ fontWeight: 600 }}
              >
                Guardar configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
