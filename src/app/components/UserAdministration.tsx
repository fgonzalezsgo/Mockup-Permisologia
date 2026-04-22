import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Users, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionSet {
  read: boolean;
  draft: boolean;
  write: boolean;
  acknowledge: boolean;
}

interface BookPermission {
  bookId: string;
  bookName: string;
  permissions: PermissionSet;
  isCustom?: boolean;
  disabled?: boolean;
}

interface SharedUser {
  id: string;
  name: string;
  run: string;
  email: string;
  avatar: string;
  avatarColor: string;
  profileId?: string;
  profileName?: string;
  group: string;
  role: string;
  bookPermissions: BookPermission[];
  hasCustomPermissions: boolean;
  disabled?: boolean;
}

interface ProfileTemplate {
  id: string;
  name: string;
  bookPermissions: Array<{ bookId: string; permissions: PermissionSet }>;
}

interface BookCatalogItem {
  id: string;
  name: string;
}

const USERS_STORAGE_KEY = 'permission_users_v1';
const PROFILES_STORAGE_KEY = 'permission_profiles_v1';
const BOOKS_STORAGE_KEY = 'permission_books_v1';
const USERS_UPDATED_EVENT = 'permission-users-updated';

const defaultProfiles: ProfileTemplate[] = [
  {
    id: '1',
    name: 'Administrador de Plataforma',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '2', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '3', permissions: { read: true, draft: true, write: true, acknowledge: true } }
    ]
  },
  {
    id: '2',
    name: 'Administrador Mandante',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '2', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '3', permissions: { read: true, draft: true, write: true, acknowledge: true } }
    ]
  },
  {
    id: '3',
    name: 'Administrador Mandante Subrogante',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '2', permissions: { read: true, draft: true, write: true, acknowledge: true } },
      { bookId: '3', permissions: { read: true, draft: true, write: true, acknowledge: true } }
    ]
  },
  {
    id: '4',
    name: 'Consultor',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: true, write: false, acknowledge: true } },
      { bookId: '2', permissions: { read: true, draft: true, write: false, acknowledge: true } },
      { bookId: '3', permissions: { read: true, draft: true, write: false, acknowledge: true } }
    ]
  },
  {
    id: '5',
    name: 'Consultor Subrogante',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: true, write: false, acknowledge: true } },
      { bookId: '2', permissions: { read: true, draft: true, write: false, acknowledge: true } },
      { bookId: '3', permissions: { read: true, draft: true, write: false, acknowledge: true } }
    ]
  },
  {
    id: '6',
    name: 'Visualizador',
    bookPermissions: [
      { bookId: '1', permissions: { read: true, draft: false, write: false, acknowledge: false } },
      { bookId: '2', permissions: { read: true, draft: false, write: false, acknowledge: false } },
      { bookId: '3', permissions: { read: true, draft: false, write: false, acknowledge: false } }
    ]
  }
];

const defaultBooks: BookCatalogItem[] = [
  { id: '1', name: 'Libro de Obra Maestro' },
  { id: '2', name: 'Libro de Comunicaciones' },
  { id: '3', name: 'Libro de Especialidades' },
  { id: '4', name: 'Libro de Inspecciones' },
  { id: '5', name: 'Libro de Órdenes de Cambio' }
];

const loadUsers = (): SharedUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SharedUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadProfiles = (): ProfileTemplate[] => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return defaultProfiles;
    const parsed = JSON.parse(raw) as ProfileTemplate[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProfiles;
  } catch {
    return defaultProfiles;
  }
};

const loadBooks = (): BookCatalogItem[] => {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) return defaultBooks;
    const parsed = JSON.parse(raw) as BookCatalogItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultBooks;
  } catch {
    return defaultBooks;
  }
};

const persistUsers = (nextUsers: SharedUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
  window.dispatchEvent(new Event(USERS_UPDATED_EVENT));
};

export function UserAdministration() {
  const [users, setUsers] = useState<SharedUser[]>(() => loadUsers());
  const [profiles, setProfiles] = useState<ProfileTemplate[]>(() => loadProfiles());
  const [books, setBooks] = useState<BookCatalogItem[]>(() => loadBooks());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    run: '',
    email: '',
    group: 'Mandante',
    role: '',
    profileId: ''
  });

  useEffect(() => {
    const syncData = () => {
      setUsers(loadUsers());
      setProfiles(loadProfiles());
      setBooks(loadBooks());
    };
    syncData();
    window.addEventListener(USERS_UPDATED_EVENT, syncData);
    window.addEventListener('permissions-config-updated', syncData);

    return () => {
      window.removeEventListener(USERS_UPDATED_EVENT, syncData);
      window.removeEventListener('permissions-config-updated', syncData);
    };
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      run: '',
      email: '',
      group: 'Mandante',
      role: '',
      profileId: profileOptions[0]?.id || ''
    });
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (user: SharedUser) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      run: user.run,
      email: user.email,
      group: user.group,
      role: user.role,
      profileId: user.profileId || profileOptions[0]?.id || ''
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUserId(null);
    resetForm();
  };

  const profileOptions = useMemo(
    () => profiles.map(profile => ({ id: profile.id, name: profile.name })),
    [profiles]
  );

  useEffect(() => {
    if (!form.profileId && profileOptions[0]) {
      setForm(prev => ({ ...prev, profileId: profileOptions[0].id }));
    }
  }, [form.profileId, profileOptions]);

  const saveUser = () => {
    const name = form.name.trim();
    const run = form.run.trim();
    const email = form.email.trim().toLowerCase();
    const role = form.role.trim();
    if (!name || !run || !email || !role || !form.profileId) return;
    if (users.some(user =>
      user.id !== editingUserId &&
      (user.run.toLowerCase() === run.toLowerCase() || user.email.toLowerCase() === email)
    )) return;

    const selectedProfile = profiles.find(profile => profile.id === form.profileId);
    const bookNameById = new Map(books.map(book => [book.id, book.name]));

    const baseUser = users.find(user => user.id === editingUserId);
    const userToSave: SharedUser = {
      id: editingUserId || Date.now().toString(),
      name,
      run,
      email,
      avatar: name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || baseUser?.avatar || 'U',
      avatarColor: baseUser?.avatarColor || '#4f46e5',
      profileId: selectedProfile?.id,
      profileName: selectedProfile?.name || '',
      group: form.group,
      role,
      hasCustomPermissions: false,
      bookPermissions: (selectedProfile?.bookPermissions || []).map(book => ({
        bookId: book.bookId,
        bookName: bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
        permissions: { ...book.permissions },
        isCustom: false
      }))
    };

    const nextUsers = editingUserId
      ? users.map(user => (user.id === editingUserId ? userToSave : user))
      : [...users, userToSave];
    setUsers(nextUsers);
    persistUsers(nextUsers);
    closeModal();
  };

  const deleteUser = (id: string) => {
    const nextUsers = users.filter(user => user.id !== id);
    setUsers(nextUsers);
    persistUsers(nextUsers);
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#1f2937' }}>
                Listado de Usuarios del Contrato
              </h1>
              <p className="text-[#6b7280]">Visualiza usuarios existentes y agrega nuevos con grupo, rol y perfil.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-5 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" />
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e4e8] rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#4f46e5]" />
            <h2 className="text-xl" style={{ fontWeight: 600, color: '#1f2937' }}>
              Usuarios ({users.length})
            </h2>
          </div>

          {users.length === 0 ? (
            <p className="text-[#6b7280]">No hay usuarios cargados.</p>
          ) : (
            <div className="space-y-2">
              <div
                className="grid grid-cols-[1.3fr_1fr_1.2fr_1fr_1fr_1.2fr_auto] gap-3 items-center px-3 py-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg text-sm"
                style={{ fontWeight: 600, color: '#334155' }}
              >
                <div>Nombre</div>
                <div>RUN</div>
                <div>Email</div>
                <div>Grupo</div>
                <div>Rol</div>
                <div>Perfil</div>
                <div className="text-center">Acciones</div>
              </div>

              {users.map(user => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1.3fr_1fr_1.2fr_1fr_1fr_1.2fr_auto] gap-3 items-center p-3 border border-[#e5e7eb] rounded-lg"
                >
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.name}</div>
                  <div className="text-sm text-[#6b7280]">{user.run}</div>
                  <div className="text-sm text-[#6b7280]">{user.email}</div>
                  <div className="text-sm text-[#6b7280]">{user.group}</div>
                  <div className="text-sm text-[#6b7280]">{user.role}</div>
                  <div className="text-sm text-[#4f46e5]">{user.profileName || 'Sin perfil'}</div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

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
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                  {editingUserId ? 'Editar Usuario' : 'Agregar Usuario'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!!editingUserId}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent disabled:bg-[#f3f4f6] disabled:text-[#6b7280] disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  placeholder="RUN"
                  value={form.run}
                  onChange={(e) => setForm(prev => ({ ...prev, run: e.target.value }))}
                  disabled={!!editingUserId}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent disabled:bg-[#f3f4f6] disabled:text-[#6b7280] disabled:cursor-not-allowed"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                />
                <select
                  value={form.group}
                  onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value }))}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                >
                  <option value="Mandante">Mandante</option>
                  <option value="Contratista">Contratista</option>
                </select>
                <input
                  type="text"
                  placeholder="Rol / Cargo"
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                />
                <select
                  value={form.profileId}
                  onChange={(e) => setForm(prev => ({ ...prev, profileId: e.target.value }))}
                  className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                >
                  {profileOptions.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveUser}
                  className="flex-1 px-4 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm"
                  style={{ fontWeight: 600 }}
                >
                  {editingUserId ? 'Guardar Cambios' : 'Agregar Usuario'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
