import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Users, ChevronDown, ChevronRight, Copy, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfilePermissions {
  read: boolean;
  draft: boolean;
  write: boolean;
  acknowledge: boolean;
}

interface BookPermission {
  bookId: string;
  bookName: string;
  permissions: ProfilePermissions;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  color: string;
  usersCount: number;
  bookPermissions: BookPermission[];
}

interface BookCatalogItem {
  id: string;
  name: string;
}

interface VisualizerAssignableUser {
  id: string;
  name: string;
  run: string;
  profileName?: string;
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Administrador de Plataforma',
    description: 'Acceso total al sistema con privilegios administrativos completos',
    color: '#4f46e5',
    usersCount: 2,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      }
    ]
  },
  {
    id: '2',
    name: 'Administrador Mandante',
    description: 'Acceso completo a todos los libros con permisos de gestión',
    color: '#0891b2',
    usersCount: 5,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      }
    ]
  },
  {
    id: '3',
    name: 'Administrador Mandante Subrogante',
    description: 'Permisos administrativos temporales para el mandante',
    color: '#06b6d4',
    usersCount: 3,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      }
    ]
  },
  {
    id: '4',
    name: 'Consultor',
    description: 'Permisos de lectura, borrador y toma de conocimiento',
    color: '#8b5cf6',
    usersCount: 8,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      }
    ]
  },
  {
    id: '5',
    name: 'Consultor Subrogante',
    description: 'Permisos de consultor temporal',
    color: '#a78bfa',
    usersCount: 4,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      }
    ]
  }
];

const PROFILES_STORAGE_KEY = 'permission_profiles_v1';
const BOOKS_STORAGE_KEY = 'permission_books_v1';
const USERS_STORAGE_KEY = 'permission_users_v1';
const USERS_UPDATED_EVENT = 'permission-users-updated';
const VISUALIZER_ASSIGNMENTS_KEY = 'permission_visualizer_assignments_v1';
const PERMISSIONS_CONFIG_UPDATED_EVENT = 'permissions-config-updated';
const DEFAULT_BOOKS: BookCatalogItem[] = [
  { id: '1', name: 'Libro de Obra Maestro' },
  { id: '2', name: 'Libro de Comunicaciones' },
  { id: '3', name: 'Libro de Especialidades' },
  { id: '4', name: 'Libro de Inspecciones' },
  { id: '5', name: 'Libro de Órdenes de Cambio' }
];

const normalizeProfiles = (input: Profile[]): Profile[] =>
  input.filter(profile =>
    profile.id !== '6' &&
    profile.name.toLowerCase() !== 'visualizador'
  );

const loadStoredProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return normalizeProfiles(mockProfiles);
    const parsed = JSON.parse(raw) as Profile[];
    return Array.isArray(parsed) && parsed.length > 0 ? normalizeProfiles(parsed) : normalizeProfiles(mockProfiles);
  } catch {
    return normalizeProfiles(mockProfiles);
  }
};

const loadStoredBooks = (): BookCatalogItem[] => {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) return DEFAULT_BOOKS;
    const parsed = JSON.parse(raw) as BookCatalogItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BOOKS;
  } catch {
    return DEFAULT_BOOKS;
  }
};


const loadStoredUsers = (): VisualizerAssignableUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VisualizerAssignableUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadVisualizerAssignments = (): string[] => {
  try {
    const raw = localStorage.getItem(VISUALIZER_ASSIGNMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function PermissionProfiles() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'profiles_clone' | 'visualizer'>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredProfiles());
  const [booksCatalog, setBooksCatalog] = useState<BookCatalogItem[]>(() => loadStoredBooks());
  const [usersCatalog, setUsersCatalog] = useState<VisualizerAssignableUser[]>(() => loadStoredUsers());
  const [visualizerAssignments, setVisualizerAssignments] = useState<string[]>(() => loadVisualizerAssignments());
  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [addBooksModal, setAddBooksModal] = useState<{ profileId: string; profileName: string } | null>(null);
  const [selectedBooksToAdd, setSelectedBooksToAdd] = useState<string[]>([]);
  const [newBookName, setNewBookName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const normalizeRut = (value: string) =>
    value.replace(/[^0-9kK]/g, '').toLowerCase();

  useEffect(() => {
    const syncUsers = () => {
      setUsersCatalog(loadStoredUsers());
    };

    syncUsers();
    window.addEventListener(USERS_UPDATED_EVENT, syncUsers);
    return () => window.removeEventListener(USERS_UPDATED_EVENT, syncUsers);
  }, []);

  const addVisualizerAssignment = (userId: string) => {
    setVisualizerAssignments(prev =>
      prev.includes(userId) ? prev : [...prev, userId]
    );
  };

  const removeVisualizerAssignment = (userId: string) => {
    setVisualizerAssignments(prev => prev.filter(id => id !== userId));
  };

  const normalizedVisualizerRutQuery = normalizeRut(visualizerSearch);
  const visualizerSearchResults = normalizedVisualizerRutQuery.length === 0
    ? []
    : usersCatalog.filter(user => normalizeRut(user.run).includes(normalizedVisualizerRutQuery));

  const assignedVisualizerUsers = usersCatalog
    .filter(user => visualizerAssignments.includes(user.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleProfile = (profileId: string) => {
    setExpandedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const togglePermission = (profileId: string, bookId: string, permission: keyof ProfilePermissions) => {
    setProfiles(prev => prev.map(profile =>
      profile.id === profileId
        ? {
            ...profile,
            bookPermissions: profile.bookPermissions.map(book =>
              book.bookId === bookId
                ? {
                    ...book,
                    permissions: {
                      ...book.permissions,
                      [permission]: !book.permissions[permission]
                    }
                  }
                : book
            )
          }
        : profile
    ));
  };

  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
  };

  const duplicateProfile = (profileId: string) => {
    const profileToDuplicate = profiles.find(p => p.id === profileId);
    if (profileToDuplicate) {
      const newProfile = {
        ...profileToDuplicate,
        id: Date.now().toString(),
        name: `${profileToDuplicate.name} (Copia)`,
        usersCount: 0
      };
      setProfiles(prev => [...prev, newProfile]);
    }
  };

  const toggleAllPermissions = (profileId: string, permissionType: keyof ProfilePermissions) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || profile.bookPermissions.length === 0) return;

    // Check if all permissions of this type are already enabled
    const allEnabled = profile.bookPermissions.every(book => book.permissions[permissionType]);

    // Toggle all to opposite state
    setProfiles(prev => prev.map(p =>
      p.id === profileId
        ? {
            ...p,
            bookPermissions: p.bookPermissions.map(book => ({
              ...book,
              permissions: {
                ...book.permissions,
                [permissionType]: !allEnabled
              }
            }))
          }
        : p
    ));
  };

  const getPermissionCheckboxState = (profileId: string, permissionType: keyof ProfilePermissions) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || profile.bookPermissions.length === 0) return 'none';

    const enabledCount = profile.bookPermissions.filter(book => book.permissions[permissionType]).length;

    if (enabledCount === 0) return 'none';
    if (enabledCount === profile.bookPermissions.length) return 'all';
    return 'some';
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingProfile(null);
    setShowCreateModal(true);
  };

  const openEditModal = (profile: Profile) => {
    setFormData({
      name: profile.name,
      description: profile.description
    });
    setEditingProfile(profile);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProfile(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const saveProfile = () => {
    if (!formData.name.trim()) return;

    if (editingProfile) {
      // Edit existing profile
      setProfiles(prev => prev.map(p =>
        p.id === editingProfile.id
          ? {
              ...p,
              name: formData.name,
              description: formData.description
            }
          : p
      ));
    } else {
      // Create new profile
      const newProfile: Profile = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        color: '#6b7280',
        usersCount: 0,
        bookPermissions: booksCatalog.map(book => ({
          bookId: book.id,
          bookName: book.name,
          permissions: { read: false, draft: false, write: false, acknowledge: false }
        }))
      };
      setProfiles(prev => [...prev, newProfile]);
    }

    closeModal();
  };

  const openAddBooksModal = (profileId: string, profileName: string) => {
    setAddBooksModal({ profileId, profileName });
    setSelectedBooksToAdd([]);
    setNewBookName('');
  };

  const closeAddBooksModal = () => {
    setAddBooksModal(null);
    setSelectedBooksToAdd([]);
    setNewBookName('');
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooksToAdd(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const getAvailableBooksForProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return booksCatalog;
    const assignedBookIds = new Set(profile.bookPermissions.map(book => book.bookId));
    return booksCatalog.filter(book => !assignedBookIds.has(book.id));
  };

  const addBooksToProfile = () => {
    if (!addBooksModal || selectedBooksToAdd.length === 0) return;

    const booksToAdd = selectedBooksToAdd.map(bookId => {
      const book = booksCatalog.find(b => b.id === bookId);
      return {
        bookId,
        bookName: book?.name || '',
        permissions: { read: false, draft: false, write: false, acknowledge: false }
      };
    });

    setProfiles(prev => prev.map(profile =>
      profile.id === addBooksModal.profileId
        ? { ...profile, bookPermissions: [...profile.bookPermissions, ...booksToAdd] }
        : profile
    ));

    closeAddBooksModal();
  };

  const removeBookFromProfile = (profileId: string, bookId: string) => {
    setProfiles(prev => prev.map(profile =>
      profile.id === profileId
        ? { ...profile, bookPermissions: profile.bookPermissions.filter(book => book.bookId !== bookId) }
        : profile
    ));
  };

  const createBookInCatalog = () => {
    const trimmedName = newBookName.trim();
    if (!trimmedName) return;
    if (booksCatalog.some(book => book.name.toLowerCase() === trimmedName.toLowerCase())) return;

    const newBookId = Date.now().toString();
    const newBook: BookCatalogItem = { id: newBookId, name: trimmedName };
    setBooksCatalog(prev => [...prev, newBook]);
    setNewBookName('');
  };

  const removeBookFromCatalog = (bookId: string) => {
    setBooksCatalog(prev => prev.filter(book => book.id !== bookId));
    setSelectedBooksToAdd(prev => prev.filter(id => id !== bookId));
    setProfiles(prev => prev.map(profile => ({
      ...profile,
      bookPermissions: profile.bookPermissions.filter(book => book.bookId !== bookId)
    })));
  };

  const handleSaveConfiguration = () => {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(booksCatalog));
    localStorage.setItem(VISUALIZER_ASSIGNMENTS_KEY, JSON.stringify(visualizerAssignments));
    window.dispatchEvent(new Event(PERMISSIONS_CONFIG_UPDATED_EVENT));
  };

  const handleDiscardChanges = () => {
    setProfiles(loadStoredProfiles());
    setBooksCatalog(loadStoredBooks());
    setVisualizerAssignments(loadVisualizerAssignments());
  };

  const isReadonlyProfilesView = activeTab === 'profiles_clone';

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#1f2937' }}>
                Perfiles de Permisos
              </h1>
              <p className="text-[#6b7280]">
                {activeTab === 'profiles' || activeTab === 'profiles_clone'
                  ? 'Gestiona plantillas de permisos predefinidos para asignar a usuarios'
                  : 'Asigna visualizador de forma independiente al perfil principal del usuario'}
              </p>
            </div>
            {activeTab === 'profiles' && (
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-5 h-5" />
                Crear Perfil
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                activeTab === 'profiles'
                  ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                  : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
              style={{ fontWeight: 600 }}
            >
              Administrar perfiles
            </button>
            <button
              onClick={() => setActiveTab('profiles_clone')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                activeTab === 'profiles_clone'
                  ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                  : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
              style={{ fontWeight: 600 }}
            >
              Ver Perfiles
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                activeTab === 'visualizer'
                  ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                  : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
              style={{ fontWeight: 600 }}
            >
              Asignar Visualizador
            </button>
          </div>
        </div>
      </div>
      {/* Profiles List */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-28">
        {activeTab === 'profiles' || activeTab === 'profiles_clone' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {profiles.length}
                </div>
                <div className="text-sm text-[#6b7280]">
                  Perfiles totales
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {profiles.reduce((sum, p) => sum + p.usersCount, 0)}
                </div>
                <div className="text-sm text-[#6b7280]">
                  Usuarios asignados
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {profiles[0]?.bookPermissions.length || 0}
                </div>
                <div className="text-sm text-[#6b7280]">
                  Libros gestionados
                </div>
              </motion.div>
            </div>

            {/* Profiles Cards */}
            <div className="space-y-4">
              {profiles.map((profile, index) => {
                const isExpanded = expandedProfiles.includes(profile.id);

                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden shadow-sm"
                  >
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 px-6 py-5">
                      {/* Color Badge */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: profile.color }}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </div>

                      {/* Profile Info */}
                      <button
                        onClick={() => toggleProfile(profile.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                            {profile.name}
                          </h3>
                          <p className="text-sm text-[#6b7280] mb-2">
                            {profile.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#6b7280]">
                              <span style={{ fontWeight: 500, color: profile.color }}>
                                {profile.usersCount}
                              </span> usuarios asignados
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                          )}
                        </div>
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!isReadonlyProfilesView && (
                          <button
                            onClick={() => duplicateProfile(profile.id)}
                            className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                            title="Duplicar perfil"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(profile)}
                          className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                          title="Editar perfil"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {!isReadonlyProfilesView && (
                          <button
                            onClick={() => deleteProfile(profile.id)}
                            className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                            title="Eliminar perfil"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content - Book Permissions */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-[#f8f9fb] border-t border-[#e1e4e8] px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Libros del perfil ({profile.bookPermissions.length})
                              </h4>
                              {!isReadonlyProfilesView ? (
                                <button
                                  onClick={() => openAddBooksModal(profile.id, profile.name)}
                                  className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                                  style={{ fontWeight: 500 }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Agregar Libro
                                </button>
                              ) : (
                                <span className="text-xs text-[#6b7280]">Solo lectura</span>
                              )}
                            </div>

                            {/* Table Header */}
                            <div className={`grid gap-6 px-4 py-3 mb-2 bg-[#f8f9fb] rounded-lg ${
                              isReadonlyProfilesView ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr]' : 'grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]'
                            }`}>
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Libro
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => !isReadonlyProfilesView && toggleAllPermissions(profile.id, 'read')}
                                  disabled={isReadonlyProfilesView}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-100 disabled:cursor-default"
                                  title={isReadonlyProfilesView ? 'Solo lectura' : 'Seleccionar/Deseleccionar todos'}
                                >
                                  {getPermissionCheckboxState(profile.id, 'read') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(profile.id, 'read') === 'some' ? (
                                    <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#9ca3af]" />
                                  )}
                                  <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                    Lectura
                                  </span>
                                </button>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => !isReadonlyProfilesView && toggleAllPermissions(profile.id, 'draft')}
                                  disabled={isReadonlyProfilesView}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-100 disabled:cursor-default"
                                  title={isReadonlyProfilesView ? 'Solo lectura' : 'Seleccionar/Deseleccionar todos'}
                                >
                                  {getPermissionCheckboxState(profile.id, 'draft') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(profile.id, 'draft') === 'some' ? (
                                    <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#9ca3af]" />
                                  )}
                                  <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                    Asistente
                                  </span>
                                </button>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => !isReadonlyProfilesView && toggleAllPermissions(profile.id, 'write')}
                                  disabled={isReadonlyProfilesView}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-100 disabled:cursor-default"
                                  title={isReadonlyProfilesView ? 'Solo lectura' : 'Seleccionar/Deseleccionar todos'}
                                >
                                  {getPermissionCheckboxState(profile.id, 'write') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(profile.id, 'write') === 'some' ? (
                                    <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#9ca3af]" />
                                  )}
                                  <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                    Escritura
                                  </span>
                                </button>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => !isReadonlyProfilesView && toggleAllPermissions(profile.id, 'acknowledge')}
                                  disabled={isReadonlyProfilesView}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-100 disabled:cursor-default"
                                  title={isReadonlyProfilesView ? 'Solo lectura' : 'Seleccionar/Deseleccionar todos'}
                                >
                                  {getPermissionCheckboxState(profile.id, 'acknowledge') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(profile.id, 'acknowledge') === 'some' ? (
                                    <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#9ca3af]" />
                                  )}
                                  <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                    Toma Conoc.
                                  </span>
                                </button>
                              </div>
                              {!isReadonlyProfilesView && (
                                <div className="text-sm text-center" style={{ fontWeight: 600, color: '#374151' }}>
                                  Acciones
                                </div>
                              )}
                            </div>

                            {/* Book Rows */}
                            <div className="space-y-2">
                              {profile.bookPermissions.map((book, bookIndex) => (
                                <motion.div
                                  key={book.bookId}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: bookIndex * 0.05 }}
                                  className={`grid gap-6 px-4 py-4 bg-white rounded-lg border border-[#e1e4e8] items-center ${
                                    isReadonlyProfilesView ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr]' : 'grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]'
                                  }`}
                                >
                                  <div style={{ fontWeight: 500, color: '#1f2937' }}>
                                    {book.bookName}
                                  </div>

                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => !isReadonlyProfilesView && togglePermission(profile.id, book.bookId, 'read')}
                                      disabled={isReadonlyProfilesView}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-100 disabled:cursor-default ${book.permissions.read ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}
                                    >
                                      {book.permissions.read ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                      ) : (
                                        <X className="w-5 h-5" strokeWidth={2} />
                                      )}
                                    </button>
                                  </div>

                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => !isReadonlyProfilesView && togglePermission(profile.id, book.bookId, 'draft')}
                                      disabled={isReadonlyProfilesView}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-100 disabled:cursor-default ${book.permissions.draft ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}
                                    >
                                      {book.permissions.draft ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                      ) : (
                                        <X className="w-5 h-5" strokeWidth={2} />
                                      )}
                                    </button>
                                  </div>

                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => !isReadonlyProfilesView && togglePermission(profile.id, book.bookId, 'write')}
                                      disabled={isReadonlyProfilesView}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-100 disabled:cursor-default ${book.permissions.write ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}
                                    >
                                      {book.permissions.write ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                      ) : (
                                        <X className="w-5 h-5" strokeWidth={2} />
                                      )}
                                    </button>
                                  </div>

                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => !isReadonlyProfilesView && togglePermission(profile.id, book.bookId, 'acknowledge')}
                                      disabled={isReadonlyProfilesView}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-100 disabled:cursor-default ${book.permissions.acknowledge ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}
                                    >
                                      {book.permissions.acknowledge ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                      ) : (
                                        <X className="w-5 h-5" strokeWidth={2} />
                                      )}
                                    </button>
                                  </div>

                                  {!isReadonlyProfilesView && (
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => removeBookFromProfile(profile.id, book.bookId)}
                                        className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                                        title="Eliminar libro del perfil"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {usersCatalog.length}
                </div>
                <div className="text-sm text-[#6b7280]">Usuarios totales</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {visualizerAssignments.length}
                </div>
                <div className="text-sm text-[#6b7280]">Con visualizador</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-[#e1e4e8] p-6"
              >
                <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {Math.max(usersCatalog.length - visualizerAssignments.length, 0)}
                </div>
                <div className="text-sm text-[#6b7280]">Sin visualizador</div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#e1e4e8] p-6">
                <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Buscar usuario por RUT
                </h3>
                <p className="text-sm text-[#6b7280] mb-4">
                  Ingresa el RUT del usuario y agrega con el botón "Agregar".
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={visualizerSearch}
                    onChange={(e) => setVisualizerSearch(e.target.value)}
                    placeholder="Ej: 12345678K"
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                </div>

                {normalizedVisualizerRutQuery.length === 0 ? (
                  <div className="text-sm text-[#6b7280] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3">
                    Escribe un RUT para buscar usuarios.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-auto">
                    {visualizerSearchResults.map(user => {
                      const assigned = visualizerAssignments.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`w-full p-4 rounded-lg border ${
                            assigned ? 'border-[#c7d2fe] bg-[#eef2ff]' : 'border-[#e1e4e8] bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.name}</div>
                              <div className="text-sm text-[#6b7280]">RUT: {user.run}</div>
                              {user.profileName && (
                                <div className="text-xs text-[#6b7280] mt-1">Perfil base: {user.profileName}</div>
                              )}
                            </div>
                            <button
                              onClick={() => addVisualizerAssignment(user.id)}
                              disabled={assigned}
                              className="px-3 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontWeight: 600 }}
                            >
                              {assigned ? 'Agregado' : 'Agregar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {visualizerSearchResults.length === 0 && (
                      <div className="text-center py-8 text-[#6b7280]">No se encontraron usuarios con ese RUT.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#e1e4e8] p-6">
                <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Usuarios visualizadores
                </h3>
                <p className="text-sm text-[#6b7280] mb-4">
                  Listado de usuarios que actualmente tienen visualizador asignado.
                </p>

                <div className="space-y-2 max-h-[360px] overflow-auto">
                  {assignedVisualizerUsers.map(user => (
                    <div
                      key={`visualizer-${user.id}`}
                      className="w-full p-4 rounded-lg border border-[#e1e4e8] bg-white"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.name}</div>
                          <div className="text-sm text-[#6b7280]">RUT: {user.run}</div>
                          {user.profileName && (
                            <div className="text-xs text-[#6b7280] mt-1">Perfil base: {user.profileName}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeVisualizerAssignment(user.id)}
                          className="px-3 py-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors border border-[#fecaca]"
                          style={{ fontWeight: 600 }}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                  {assignedVisualizerUsers.length === 0 && (
                    <div className="text-center py-8 text-[#6b7280]">No hay usuarios visualizadores asignados.</div>
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleDiscardChanges}
              className="px-6 py-3 text-[#374151] hover:bg-white rounded-lg transition-colors border border-[#d1d5db]"
              style={{ fontWeight: 500 }}
            >
              Descartar Cambios
            </button>
            <button
              onClick={handleSaveConfiguration}
              className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm"
              style={{ fontWeight: 600 }}
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Add Books Modal */}
      <AnimatePresence>
        {addBooksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeAddBooksModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Agregar Libros
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona libros para <span style={{ fontWeight: 500 }}>{addBooksModal.profileName}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-4 p-4 bg-[#f8f9fb] rounded-lg border border-[#e5e7eb]">
                  <p className="text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Crear nuevo libro
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                      placeholder="Nombre del libro..."
                      className="flex-1 px-3 py-2 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    />
                    <button
                      onClick={createBookInCatalog}
                      disabled={!newBookName.trim()}
                      className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontWeight: 600 }}
                    >
                      Crear
                    </button>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-[#fff7ed] rounded-lg border border-[#fed7aa]">
                  <p className="text-sm mb-2" style={{ fontWeight: 600, color: '#9a3412' }}>
                    Catálogo de libros (eliminar)
                  </p>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {booksCatalog.map(book => (
                      <div key={`catalog-${book.id}`} className="flex items-center justify-between gap-2 bg-white border border-[#fdba74] rounded-lg px-3 py-2">
                        <span className="text-sm text-[#7c2d12]">{book.name}</span>
                        <button
                          onClick={() => removeBookFromCatalog(book.id)}
                          className="p-1.5 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                          title="Eliminar libro del catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {(() => {
                  const availableBooks = getAvailableBooksForProfile(addBooksModal.profileId);
                  if (availableBooks.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-[#6b7280]">No hay libros disponibles para agregar</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {availableBooks.map(book => (
                        <div
                          key={book.id}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all
                            ${selectedBooksToAdd.includes(book.id)
                              ? 'border-[#3b82f6] bg-[#eff6ff]'
                              : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => toggleBookSelection(book.id)}
                              className="flex-1 text-left"
                            >
                              <div style={{ fontWeight: 600, color: '#1f2937' }}>{book.name}</div>
                            </button>
                            <div className="flex items-center gap-2">
                              {selectedBooksToAdd.includes(book.id) && (
                                <Check className="w-4 h-4 text-[#3b82f6]" strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeAddBooksModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addBooksToProfile}
                  disabled={selectedBooksToAdd.length === 0}
                  className="flex-1 px-4 py-3 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Agregar {selectedBooksToAdd.length > 0 ? `(${selectedBooksToAdd.length})` : ''}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Profile Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeModal}
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
                  {editingProfile ? (
                    <Edit2 className="w-6 h-6 text-[#3b82f6]" />
                  ) : (
                    <Plus className="w-6 h-6 text-[#3b82f6]" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    {editingProfile ? 'Editar Perfil' : 'Crear Nuevo Perfil'}
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    {editingProfile ? 'Actualiza la información del perfil' : 'Define un nuevo perfil de permisos para asignar a usuarios'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6 mb-6">
                {/* Name */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Nombre del perfil
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Supervisor de Obra"
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe los permisos y el alcance de este perfil"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                  />
                </div>

                {!editingProfile && (
                  <div className="p-4 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
                    <p className="text-sm text-[#1e40af]" style={{ fontWeight: 500 }}>
                      Después de crear el perfil, podrás configurar los permisos específicos para cada libro.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  {editingProfile ? 'Guardar Cambios' : 'Crear Perfil'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

