import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, ChevronRight, User, Shield, Check, X, Edit2, Trash2, AlertCircle, Plus, BookOpen, CheckSquare, Square, MinusSquare, UserX, UserCheck, UserPlus, Eye, MoreVertical, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface BookPermission {
  bookId: string;
  bookName: string;
  permissions: {
    read: boolean;
    draft: boolean;
    write: boolean;
    acknowledge: boolean;
  };
  isCustom?: boolean;
  disabled?: boolean;
}

type PermissionSet = BookPermission['permissions'];

interface ProfileTemplate {
  id: string;
  name: string;
  bookPermissions: {
    bookId: string;
    permissions: PermissionSet;
  }[];
}

interface UserProfile {
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

interface MultiSelectOption {
  value: string;
  label: string;
}

interface BulkCreateDraftUser {
  id: string;
  existingUserId?: string;
  isExisting: boolean;
  name: string;
  run: string;
  email: string;
  group: string;
  role: string;
  profileId: string;
  profileName: string;
}

interface MultiSelectFilterProps {
  label: string;
  allLabel: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const normalizeBookName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isLibroObraMaestro = (bookId: string, bookName: string) =>
  false;

const sanitizePermissionsForBook = (
  bookId: string,
  bookName: string,
  permissions: PermissionSet
): PermissionSet => permissions;

const applyMaestroPermissionRuleToUsers = (users: UserProfile[]) =>
  users.map(user => ({
    ...user,
    bookPermissions: user.bookPermissions.map(book => ({
      ...book,
      permissions: sanitizePermissionsForBook(book.bookId, book.bookName, book.permissions)
    }))
  }));

function MultiSelectFilter({ label, allLabel, options, selectedValues, onChange }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedCount = selectedValues.length;
  const allSelected = options.length > 0 && selectedCount === options.length;
  const selectedText = selectedCount === 0
    ? allLabel
    : selectedCount === 1
      ? options.find(option => option.value === selectedValues[0])?.label || allLabel
      : `${selectedCount} seleccionados`;

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(current => current !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
      return;
    }

    onChange(options.map(option => option.value));
  };

  return (
    <div ref={containerRef} className="relative min-w-[220px]">
      <label className="block text-xs text-[#6b7280] mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full h-10 px-3 bg-white border border-[#cfd6df] rounded-md text-left text-sm text-[#1f2937] flex items-center justify-between hover:border-[#9ca3af] transition-colors shadow-[inset_0_1px_0_#ffffff]"
      >
        <span className="truncate">{selectedText}</span>
        <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-[#cfd6df] rounded-md shadow-lg z-40">
          <button
            type="button"
            onClick={toggleAll}
            className="w-full text-left px-3 py-2 text-xs text-[#1d4ed8] hover:bg-[#eff6ff] border-b border-[#e5e7eb]"
            style={{ fontWeight: 600 }}
          >
            {allSelected ? 'Limpiar selección' : 'Seleccionar todo'}
          </button>
          <div className="max-h-56 overflow-auto py-1">
            {options.map(option => {
              const checked = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f3f4f6] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option.value)}
                    className="w-4 h-4 rounded border-[#9ca3af] text-[#4f46e5] focus:ring-[#4f46e5]"
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'María García López',
    run: '12345678A',
    email: 'maria.garcia@empresa.com',
    avatar: 'M',
    avatarColor: '#9333ea',
    profileId: '2',
    profileName: 'Administrador Mandante',
    group: 'Mandante',
    role: 'Administrador Mandante',
    hasCustomPermissions: false,
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
    name: 'Juan Martínez Ruiz',
    run: '87654321B',
    email: 'juan.martinez@empresa.com',
    avatar: 'J',
    avatarColor: '#6366f1',
    profileId: '4',
    profileName: 'Consultor',
    group: 'Mandante',
    role: 'Inspector Técnico',
    hasCustomPermissions: false,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: false, write: false, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: false, write: false, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      }
    ]
  },
  {
    id: '3',
    name: 'Laura Pérez Moreno',
    run: '78945612E',
    email: 'laura.perez@empresa.com',
    avatar: 'L',
    avatarColor: '#8b5cf6',
    profileId: '4',
    profileName: 'Consultor',
    group: 'Mandante',
    role: 'Consultor',
    hasCustomPermissions: true,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: false, write: true, acknowledge: false },
        isCustom: true
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: false, write: false, acknowledge: true }
      },
      {
        bookId: '3',
        bookName: 'Libro de Especialidades',
        permissions: { read: true, draft: true, write: false, acknowledge: true }
      }
    ]
  },
  {
    id: '4',
    name: 'Carlos Sánchez Gil',
    run: '45678912C',
    email: 'carlos.sanchez@empresa.com',
    avatar: 'C',
    avatarColor: '#ec4899',
    profileId: '6',
    profileName: 'Visualizador',
    group: 'Contratista',
    role: 'Jefe de Proyecto',
    hasCustomPermissions: true,
    bookPermissions: [
      {
        bookId: '1',
        bookName: 'Libro de Obra Maestro',
        permissions: { read: true, draft: false, write: false, acknowledge: true }
      },
      {
        bookId: '2',
        bookName: 'Libro de Comunicaciones',
        permissions: { read: true, draft: true, write: false, acknowledge: true },
        isCustom: true
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
    name: 'Ana Torres Vega',
    run: '32165498D',
    email: 'ana.torres@empresa.com',
    avatar: 'A',
    avatarColor: '#14b8a6',
    profileId: '2',
    profileName: 'Administrador Mandante',
    group: 'Mandante',
    role: 'Coordinador General',
    hasCustomPermissions: false,
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
  }
];

const PROFILES_STORAGE_KEY = 'permission_profiles_v1';
const BOOKS_STORAGE_KEY = 'permission_books_v1';
const PERMISSIONS_CONFIG_UPDATED_EVENT = 'permissions-config-updated';
const USERS_STORAGE_KEY = 'permission_users_v1';
const USERS_UPDATED_EVENT = 'permission-users-updated';

const DEFAULT_BOOKS = [
  { id: '1', name: 'Libro de Obra Maestro' },
  { id: '2', name: 'Libro de Comunicaciones' },
  { id: '3', name: 'Libro de Especialidades' },
  { id: '4', name: 'Libro de Inspecciones' },
  { id: '5', name: 'Libro de Órdenes de Cambio' }
];

const DEFAULT_PROFILES: ProfileTemplate[] = [
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

const loadStoredProfiles = (): ProfileTemplate[] => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILES;
    const parsed = JSON.parse(raw) as ProfileTemplate[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
};

const loadStoredBooks = (): Array<{ id: string; name: string }> => {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) return DEFAULT_BOOKS;
    const parsed = JSON.parse(raw) as Array<{ id: string; name: string }>;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BOOKS;
  } catch {
    return DEFAULT_BOOKS;
  }
};

const loadStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return mockUsers;
    const parsed = JSON.parse(raw) as UserProfile[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockUsers;
  } catch {
    return mockUsers;
  }
};

export function UserPermissions() {
  const [users, setUsers] = useState<UserProfile[]>(() => applyMaestroPermissionRuleToUsers(loadStoredUsers()));
  const [savedUsersSnapshot, setSavedUsersSnapshot] = useState<UserProfile[]>(() => applyMaestroPermissionRuleToUsers(loadStoredUsers()));
  const [profilesCatalog, setProfilesCatalog] = useState<ProfileTemplate[]>(() => loadStoredProfiles());
  const [booksCatalog, setBooksCatalog] = useState<Array<{ id: string; name: string }>>(() => loadStoredBooks());
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilters, setGroupFilters] = useState<string[]>([]);
  const [bookFilters, setBookFilters] = useState<string[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [permissionFilters, setPermissionFilters] = useState<Array<keyof PermissionSet>>([]);
  const [profileFilters, setProfileFilters] = useState<string[]>([]);
  const [isBooksListView, setIsBooksListView] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [bulkCreateRunInput, setBulkCreateRunInput] = useState('');
  const [bulkCreateUsers, setBulkCreateUsers] = useState<BulkCreateDraftUser[]>([]);
  const [editingBulkCreateUserId, setEditingBulkCreateUserId] = useState<string | null>(null);
  const [selectedBooksForBulkCreate, setSelectedBooksForBulkCreate] = useState<string[]>([]);
  const [bulkCreateBookPermissions, setBulkCreateBookPermissions] = useState<Record<string, PermissionSet>>({});
  const [bulkCreateBooksOpen, setBulkCreateBooksOpen] = useState(false);
  const [bulkCreateBooksSearch, setBulkCreateBooksSearch] = useState('');
  const [showBulkCreatePreviewModal, setShowBulkCreatePreviewModal] = useState(false);
  const bulkCreateBooksRef = useRef<HTMLDivElement | null>(null);
  const [editForm, setEditForm] = useState({
    group: '',
    role: '',
    profileId: '',
    profileName: ''
  });
  const [addBooksModal, setAddBooksModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedBooksToAdd, setSelectedBooksToAdd] = useState<string[]>([]);
  const [addUsersToBookModal, setAddUsersToBookModal] = useState<{ bookId: string; bookName: string } | null>(null);
  const [selectedUsersToAddToBook, setSelectedUsersToAddToBook] = useState<string[]>([]);
  const [copyPermissionsModal, setCopyPermissionsModal] = useState<{ sourceUserId: string; sourceUserName: string } | null>(null);
  const [selectedBooksToCopy, setSelectedBooksToCopy] = useState<string[]>([]);
  const [selectedUsersForCopy, setSelectedUsersForCopy] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete-user' | 'disable-user' | 'enable-user' | 'remove-book' | 'disable-book' | 'enable-book';
    userId?: string;
    userName?: string;
    bookId?: string;
    bookName?: string;
  } | null>(null);

  const alignUsersWithSharedConfig = (
    inputUsers: UserProfile[],
    profileData: ProfileTemplate[],
    bookData: Array<{ id: string; name: string }>
  ) => {
    const profileById = new Map(profileData.map(profile => [profile.id, profile]));
    const bookNameById = new Map(bookData.map(book => [book.id, book.name]));
    const catalogBookIds = new Set(bookData.map(book => book.id));

    return inputUsers.map(user => {
      const profile = user.profileId ? profileById.get(user.profileId) : undefined;

      if (!profile) {
        return {
          ...user,
          bookPermissions: user.bookPermissions
            .filter(book => catalogBookIds.has(book.bookId))
            .map(book => {
              const bookName = bookNameById.get(book.bookId) || book.bookName;
              return {
                ...book,
                bookName,
                permissions: sanitizePermissionsForBook(book.bookId, bookName, book.permissions)
              };
            })
        };
      }

      const userBooksById = new Map(user.bookPermissions.map(book => [book.bookId, book]));
      const profileBooks = profile.bookPermissions.map(book => {
        const existing = userBooksById.get(book.bookId);
        const bookName = bookNameById.get(book.bookId) || existing?.bookName || `Libro ${book.bookId}`;

        return {
          bookId: book.bookId,
          bookName,
          permissions: sanitizePermissionsForBook(book.bookId, bookName, { ...book.permissions }),
          disabled: existing?.disabled,
          isCustom: false
        };
      });

      const extraBooks = user.bookPermissions
        .filter(book => !profile.bookPermissions.some(profileBook => profileBook.bookId === book.bookId))
        .filter(book => catalogBookIds.has(book.bookId))
        .map(book => {
          const bookName = bookNameById.get(book.bookId) || book.bookName;
          return {
            ...book,
            bookName,
            permissions: sanitizePermissionsForBook(book.bookId, bookName, book.permissions),
            isCustom: true
          };
        });

      return {
        ...user,
        profileName: profile.name,
        bookPermissions: [...profileBooks, ...extraBooks]
      };
    });
  };

  useEffect(() => {
    const syncFromSharedConfig = () => {
      const latestProfiles = loadStoredProfiles();
      const latestBooks = loadStoredBooks();
      setProfilesCatalog(latestProfiles);
      setBooksCatalog(latestBooks);
      setUsers(prev => alignUsersWithSharedConfig(prev, latestProfiles, latestBooks));
      setSavedUsersSnapshot(prev => alignUsersWithSharedConfig(prev, latestProfiles, latestBooks));
    };

    syncFromSharedConfig();
    window.addEventListener(PERMISSIONS_CONFIG_UPDATED_EVENT, syncFromSharedConfig);

    return () => {
      window.removeEventListener(PERMISSIONS_CONFIG_UPDATED_EVENT, syncFromSharedConfig);
    };
  }, []);

  const toggleUser = (userId: string) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user.id);
    setEditForm({
      group: user.group,
      role: user.role,
      profileId: user.profileId || '',
      profileName: user.profileName || ''
    });
  };

  const openCreateUserModal = () => {
    setBulkCreateRunInput('');
    setBulkCreateUsers([]);
    setEditingBulkCreateUserId(null);
    setSelectedBooksForBulkCreate([]);
    setBulkCreateBookPermissions({});
    setBulkCreateBooksOpen(false);
    setBulkCreateBooksSearch('');
    setShowBulkCreatePreviewModal(false);
    setIsCreateUserModalOpen(true);
  };

  const closeCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    setBulkCreateRunInput('');
    setBulkCreateUsers([]);
    setEditingBulkCreateUserId(null);
    setSelectedBooksForBulkCreate([]);
    setBulkCreateBookPermissions({});
    setBulkCreateBooksOpen(false);
    setBulkCreateBooksSearch('');
    setShowBulkCreatePreviewModal(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!bulkCreateBooksRef.current) return;
      if (!bulkCreateBooksRef.current.contains(event.target as Node)) {
        setBulkCreateBooksOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const addBulkCreateUserByRun = () => {
    const run = bulkCreateRunInput.trim();
    if (!run) return;

    const alreadyAddedInBatch = bulkCreateUsers.some(user => user.run.toLowerCase() === run.toLowerCase());
    if (alreadyAddedInBatch) {
      window.alert('Ese RUN ya fue agregado en esta carga masiva.');
      return;
    }

    const existingUser = users.find(user => user.run.toLowerCase() === run.toLowerCase());
    const draftId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setBulkCreateUsers(prev => [
      ...prev,
      existingUser
        ? {
            id: draftId,
            existingUserId: existingUser.id,
            isExisting: true,
            name: existingUser.name,
            run,
            email: existingUser.email,
            group: existingUser.group,
            role: existingUser.role,
            profileId: existingUser.profileId || '',
            profileName: existingUser.profileName || ''
          }
        : {
            id: draftId,
            isExisting: false,
            name: '',
            run,
            email: '',
            group: '',
            role: '',
            profileId: '',
            profileName: ''
          }
    ]);
    setBulkCreateRunInput('');
  };

  const removeBulkCreateUser = (draftId: string) => {
    setBulkCreateUsers(prev => prev.filter(user => user.id !== draftId));
    if (editingBulkCreateUserId === draftId) {
      setEditingBulkCreateUserId(null);
    }
  };

  const updateBulkCreateUser = (draftId: string, updates: Partial<BulkCreateDraftUser>) => {
    setBulkCreateUsers(prev => prev.map(user => user.id === draftId ? { ...user, ...updates } : user));
  };

  const saveBulkCreateUserFromModal = (draftId: string) => {
    const draftUser = bulkCreateUsers.find(user => user.id === draftId);
    if (!draftUser) return;

    if (!draftUser.name.trim() || !draftUser.group || !draftUser.role.trim()) {
      window.alert('Completa nombre, grupo y cargo para continuar.');
      return;
    }

    setBulkCreateUsers(prev => prev.map(user =>
      user.id === draftId
        ? {
            ...user,
            isExisting: true
          }
        : user
    ));
    setEditingBulkCreateUserId(null);
  };

  const toggleBulkCreateBookSelection = (bookId: string) => {
    setSelectedBooksForBulkCreate(prev => {
      const isSelected = prev.includes(bookId);
      if (isSelected) {
        setBulkCreateBookPermissions(current => {
          const next = { ...current };
          delete next[bookId];
          return next;
        });
        return prev.filter(id => id !== bookId);
      }

      setBulkCreateBookPermissions(current => ({
        ...current,
        [bookId]: { read: false, draft: false, write: false, acknowledge: false }
      }));
      return [...prev, bookId];
    });
  };

  const toggleBulkCreateBookPermission = (bookId: string, permissionType: keyof PermissionSet) => {
    const bookName = catalogById.get(bookId) || `Libro ${bookId}`;
    setBulkCreateBookPermissions(prev => {
      const current = prev[bookId] || { read: false, draft: false, write: false, acknowledge: false };
      const nextPermissions = {
        ...current,
        [permissionType]: !current[permissionType]
      };
      return {
        ...prev,
        [bookId]: sanitizePermissionsForBook(bookId, bookName, nextPermissions)
      };
    });
  };

  const createUsersBulk = () => {
    if (bulkCreateUsers.length === 0) {
      window.alert('Agrega al menos un usuario para crear.');
      return;
    }

    const newUsersDraft = bulkCreateUsers.filter(user => !user.existingUserId);
    const existingUsersDraft = bulkCreateUsers.filter(user => !!user.existingUserId);

    const invalidUsers = newUsersDraft.filter(user => !user.name.trim() || !user.run.trim() || !user.group || !user.role.trim());
    if (invalidUsers.length > 0) {
      window.alert('Hay usuarios pendientes sin datos. Presiona "Crear Especialista" y completa nombre, grupo y cargo.');
      return;
    }

    const duplicatedRuns = newUsersDraft.filter(
      user => users.some(existing => existing.run.toLowerCase() === user.run.trim().toLowerCase())
    );
    if (duplicatedRuns.length > 0) {
      window.alert('Hay RUN ya existentes en el sistema. Corrige esos usuarios antes de guardar.');
      return;
    }

    const bookNameById = new Map(booksCatalog.map(book => [book.id, book.name]));
    const areSamePermissions = (a: PermissionSet, b: PermissionSet) => (
      a.read === b.read &&
      a.draft === b.draft &&
      a.write === b.write &&
      a.acknowledge === b.acknowledge
    );
    const existingMaxId = users.reduce((max, user) => {
      const parsed = Number.parseInt(user.id, 10);
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);
    const avatarColorPalette = ['#4f46e5', '#2563eb', '#0ea5e9', '#0891b2', '#0f766e', '#059669', '#ca8a04', '#b45309'];
    let omittedConflicts = 0;

    const createdUsers: UserProfile[] = newUsersDraft.map((draftUser, index) => {
      const selectedProfile = profilesCatalog.find(profile => profile.id === draftUser.profileId);
      const profileBooks = selectedProfile
        ? selectedProfile.bookPermissions.map(book => ({
            bookId: book.bookId,
            bookName: bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
            permissions: sanitizePermissionsForBook(
              book.bookId,
              bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
              { ...book.permissions }
            ),
            isCustom: false
          }))
        : [];
      const profilePermissionsByBookId = new Map(
        (selectedProfile?.bookPermissions || []).map(book => [
          book.bookId,
          sanitizePermissionsForBook(
            book.bookId,
            bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
            { ...book.permissions }
          )
        ])
      );
      const extraBooks = selectedBooksForBulkCreate
        .map(bookId => {
          const bookName = bookNameById.get(bookId) || `Libro ${bookId}`;
          const requestedPermissions = sanitizePermissionsForBook(
            bookId,
            bookName,
            bulkCreateBookPermissions[bookId] || { read: false, draft: false, write: false, acknowledge: false }
          );
          const profilePermissions = profilePermissionsByBookId.get(bookId);

          if (profilePermissions) {
            if (!areSamePermissions(profilePermissions, requestedPermissions)) {
              omittedConflicts += 1;
            }
            return null;
          }

          return {
            bookId,
            bookName,
            permissions: requestedPermissions,
            isCustom: true
          };
        })
        .filter((book): book is { bookId: string; bookName: string; permissions: PermissionSet; isCustom: boolean } => book !== null);
      const assignedBooks = selectedProfile
        ? [...profileBooks, ...extraBooks]
        : selectedBooksForBulkCreate.length > 0
          ? extraBooks
          : [];

      return {
        id: String(existingMaxId + index + 1),
        name: draftUser.name.trim(),
        run: draftUser.run.trim(),
        email: draftUser.email.trim(),
        avatar: draftUser.name.trim().charAt(0).toUpperCase() || 'U',
        avatarColor: avatarColorPalette[(users.length + index) % avatarColorPalette.length],
        profileId: draftUser.profileId,
        profileName: draftUser.profileName,
        group: draftUser.group,
        role: draftUser.role.trim(),
        hasCustomPermissions: extraBooks.length > 0,
        disabled: false,
        bookPermissions: assignedBooks
      };
    });

    setUsers(prev => prev.map(user => {
      const draftExisting = existingUsersDraft.find(draft => draft.existingUserId === user.id);
      if (!draftExisting || selectedBooksForBulkCreate.length === 0) return user;

      const currentBooksById = new Map(user.bookPermissions.map(book => [book.bookId, book]));
      const mergedBooks = [...user.bookPermissions];
      const profile = draftExisting.profileId
        ? profilesCatalog.find(p => p.id === draftExisting.profileId)
        : undefined;
      const profilePermissionsByBookId = new Map(
        (profile?.bookPermissions || []).map(book => [
          book.bookId,
          sanitizePermissionsForBook(
            book.bookId,
            bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
            { ...book.permissions }
          )
        ])
      );

      selectedBooksForBulkCreate.forEach(bookId => {
        const bookName = bookNameById.get(bookId) || `Libro ${bookId}`;
        const requestedPermissions = sanitizePermissionsForBook(
          bookId,
          bookName,
          bulkCreateBookPermissions[bookId] || { read: false, draft: false, write: false, acknowledge: false }
        );
        const profilePermissions = profilePermissionsByBookId.get(bookId);
        if (profilePermissions) {
          if (!areSamePermissions(profilePermissions, requestedPermissions)) {
            omittedConflicts += 1;
          }
          return;
        }

        const existingBook = currentBooksById.get(bookId);
        if (existingBook) {
          mergedBooks.splice(
            mergedBooks.findIndex(book => book.bookId === bookId),
            1,
            { ...existingBook, bookName, permissions: requestedPermissions, isCustom: true }
          );
          return;
        }

        mergedBooks.push({
          bookId,
          bookName,
          permissions: requestedPermissions,
          isCustom: true
        });
      });

      return {
        ...user,
        bookPermissions: mergedBooks,
        hasCustomPermissions: true
      };
    }).concat(createdUsers));
    closeCreateUserModal();
    const conflictSuffix = omittedConflicts > 0
      ? ` Se omitieron ${omittedConflicts} asignación(es) en conflicto con permisos de perfil.`
      : '';
    window.alert(`Guardado con éxito. Nuevos: ${createdUsers.length}, existentes actualizados: ${existingUsersDraft.length}.${conflictSuffix}`);
  };

  const filteredBulkCreateBooks = booksCatalog.filter(book =>
    book.name.toLowerCase().includes(bulkCreateBooksSearch.toLowerCase())
  );
  const allFilteredBooksSelected = filteredBulkCreateBooks.length > 0 &&
    filteredBulkCreateBooks.every(book => selectedBooksForBulkCreate.includes(book.id));

  const toggleSelectAllFilteredBulkBooks = () => {
    if (allFilteredBooksSelected) {
      filteredBulkCreateBooks.forEach(book => {
        if (selectedBooksForBulkCreate.includes(book.id)) {
          toggleBulkCreateBookSelection(book.id);
        }
      });
      return;
    }

    filteredBulkCreateBooks.forEach(book => {
      if (!selectedBooksForBulkCreate.includes(book.id)) {
        toggleBulkCreateBookSelection(book.id);
      }
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({
      group: '',
      role: '',
      profileId: '',
      profileName: ''
    });
  };

  const saveUserChanges = () => {
    if (!editingUser) return;

    const selectedProfile = profilesCatalog.find(profile => profile.id === editForm.profileId);
    const bookNameById = new Map(booksCatalog.map(book => [book.id, book.name]));

    setUsers(prev => prev.map(user =>
      user.id === editingUser
        ? {
            ...user,
            group: editForm.group,
            role: editForm.role,
            profileId: editForm.profileId,
            profileName: editForm.profileName,
            bookPermissions: selectedProfile
              ? selectedProfile.bookPermissions.map(book => ({
                  bookId: book.bookId,
                  bookName: bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
                  permissions: sanitizePermissionsForBook(
                    book.bookId,
                    bookNameById.get(book.bookId) || `Libro ${book.bookId}`,
                    { ...book.permissions }
                  ),
                  isCustom: false
                }))
              : user.bookPermissions
          }
        : user
    ));

    closeEditModal();
  };

  const getProfileBookPermissions = (profileId: string | undefined, bookId: string) => {
    const profile = profilesCatalog.find(p => p.id === profileId);
    const permissions = profile?.bookPermissions.find(book => book.bookId === bookId)?.permissions;
    if (!permissions) return undefined;
    const bookName = booksCatalog.find(book => book.id === bookId)?.name || `Libro ${bookId}`;
    return sanitizePermissionsForBook(bookId, bookName, permissions);
  };

  const hasSamePermissions = (a: PermissionSet, b: PermissionSet) => (
    a.read === b.read &&
    a.draft === b.draft &&
    a.write === b.write &&
    a.acknowledge === b.acknowledge
  );

  const isBookPermissionException = (user: UserProfile, book: BookPermission) => {
    if (!user.profileId) return !!book.isCustom;

    const profilePermissions = getProfileBookPermissions(user.profileId, book.bookId);
    if (!profilePermissions) return true;

    return !hasSamePermissions(book.permissions, profilePermissions);
  };

  const hasUserPermissionExceptions = (user: UserProfile) => {
    if (!user.profileId) return user.bookPermissions.some(book => !!book.isCustom);

    const profile = profilesCatalog.find(p => p.id === user.profileId);
    if (!profile) return false;

    const profileBookIds = new Set(profile.bookPermissions.map(book => book.bookId));
    const userBookIds = new Set(user.bookPermissions.map(book => book.bookId));

    const hasMissingOrExtraBooks = profile.bookPermissions.some(book => !userBookIds.has(book.bookId)) ||
      user.bookPermissions.some(book => !profileBookIds.has(book.bookId));

    if (hasMissingOrExtraBooks) return true;

    return user.bookPermissions.some(book => isBookPermissionException(user, book));
  };

  const toggleUserEnabled = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.disabled) {
      // Enable user
      setConfirmModal({
        type: 'enable-user',
        userId,
        userName: user.name
      });
    } else {
      // Disable user
      setConfirmModal({
        type: 'disable-user',
        userId,
        userName: user.name
      });
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setConfirmModal(null);
  };

  const confirmAction = () => {
    if (!confirmModal) return;

    switch (confirmModal.type) {
      case 'delete-user':
        if (confirmModal.userId) {
          deleteUser(confirmModal.userId);
        }
        break;
      case 'disable-user':
        if (confirmModal.userId) {
          setUsers(prev => prev.map(user =>
            user.id === confirmModal.userId ? { ...user, disabled: true } : user
          ));
        }
        setConfirmModal(null);
        break;
      case 'enable-user':
        if (confirmModal.userId) {
          setUsers(prev => prev.map(user =>
            user.id === confirmModal.userId ? { ...user, disabled: false } : user
          ));
        }
        setConfirmModal(null);
        break;
      case 'remove-book':
        if (confirmModal.userId && confirmModal.bookId) {
          setUsers(prev => prev.map(user =>
            user.id === confirmModal.userId
              ? {
                  ...user,
                  bookPermissions: user.bookPermissions.filter(book => book.bookId !== confirmModal.bookId)
                }
              : user
          ));
        }
        setConfirmModal(null);
        break;
      case 'disable-book':
        if (confirmModal.userId && confirmModal.bookId) {
          setUsers(prev => prev.map(user =>
            user.id === confirmModal.userId
              ? {
                  ...user,
                  bookPermissions: user.bookPermissions.map(book =>
                    book.bookId === confirmModal.bookId ? { ...book, disabled: true } : book
                  )
                }
              : user
          ));
        }
        setConfirmModal(null);
        break;
      case 'enable-book':
        if (confirmModal.userId && confirmModal.bookId) {
          setUsers(prev => prev.map(user =>
            user.id === confirmModal.userId
              ? {
                  ...user,
                  bookPermissions: user.bookPermissions.map(book =>
                    book.bookId === confirmModal.bookId ? { ...book, disabled: false } : book
                  )
                }
              : user
          ));
        }
        setConfirmModal(null);
        break;
    }
  };

  const openAddBooksModal = (userId: string, userName: string) => {
    setAddBooksModal({ userId, userName });
    setSelectedBooksToAdd([]);
  };

  const closeAddBooksModal = () => {
    setAddBooksModal(null);
    setSelectedBooksToAdd([]);
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooksToAdd(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const addBooksToUser = () => {
    if (!addBooksModal || selectedBooksToAdd.length === 0) return;

    const booksToAdd = selectedBooksToAdd.map(bookId => {
      const book = booksCatalog.find(b => b.id === bookId);
      return {
        bookId,
        bookName: book?.name || '',
        permissions: { read: false, draft: false, write: false, acknowledge: false }
      };
    });

    setUsers(prev => prev.map(user =>
      user.id === addBooksModal.userId
        ? {
            ...user,
            bookPermissions: [...user.bookPermissions, ...booksToAdd]
          }
        : user
    ));

    closeAddBooksModal();
  };

  const openAddUsersToBookModal = (bookId: string, bookName: string) => {
    setAddUsersToBookModal({ bookId, bookName });
    setSelectedUsersToAddToBook([]);
  };

  const closeAddUsersToBookModal = () => {
    setAddUsersToBookModal(null);
    setSelectedUsersToAddToBook([]);
  };

  const toggleUserSelectionForBook = (userId: string) => {
    setSelectedUsersToAddToBook(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getAvailableUsersForBook = (bookId: string) => {
    return users.filter(user => !user.bookPermissions.some(book => book.bookId === bookId));
  };

  const addUsersToBook = () => {
    if (!addUsersToBookModal || selectedUsersToAddToBook.length === 0) return;

    const bookName = catalogById.get(addUsersToBookModal.bookId) || addUsersToBookModal.bookName;

    setUsers(prev => prev.map(user => {
      if (!selectedUsersToAddToBook.includes(user.id)) return user;
      if (user.bookPermissions.some(book => book.bookId === addUsersToBookModal.bookId)) return user;

      return {
        ...user,
        bookPermissions: [
          ...user.bookPermissions,
          {
            bookId: addUsersToBookModal.bookId,
            bookName,
            permissions: { read: false, draft: false, write: false, acknowledge: false }
          }
        ]
      };
    }));

    closeAddUsersToBookModal();
  };

  const openCopyPermissionsModal = (user: UserProfile) => {
    setCopyPermissionsModal({ sourceUserId: user.id, sourceUserName: user.name });
    setSelectedBooksToCopy([]);
    setSelectedUsersForCopy([]);
  };

  const closeCopyPermissionsModal = () => {
    setCopyPermissionsModal(null);
    setSelectedBooksToCopy([]);
    setSelectedUsersForCopy([]);
  };

  const toggleBookSelectionForCopy = (bookId: string) => {
    setSelectedBooksToCopy(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const toggleUserSelectionForCopy = (userId: string) => {
    setSelectedUsersForCopy(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const calculateCopyPermissionChanges = () => {
    if (!copyPermissionsModal) return 0;

    const sourceUser = users.find(user => user.id === copyPermissionsModal.sourceUserId);
    if (!sourceUser) return 0;

    const sourceBookById = new Map(
      sourceUser.bookPermissions
        .filter(book => selectedBooksToCopy.includes(book.bookId))
        .map(book => [
          book.bookId,
          sanitizePermissionsForBook(book.bookId, book.bookName, book.permissions)
        ])
    );

    let totalChanges = 0;
    selectedUsersForCopy.forEach(targetUserId => {
      const targetUser = users.find(user => user.id === targetUserId);
      if (!targetUser) return;

      sourceBookById.forEach((sourcePermissions, bookId) => {
        const targetBook = targetUser.bookPermissions.find(book => book.bookId === bookId);
        const targetPermissions = targetBook
          ? targetBook.permissions
          : { read: false, draft: false, write: false, acknowledge: false };

        totalChanges += Number(targetPermissions.read !== sourcePermissions.read);
        totalChanges += Number(targetPermissions.draft !== sourcePermissions.draft);
        totalChanges += Number(targetPermissions.write !== sourcePermissions.write);
        totalChanges += Number(targetPermissions.acknowledge !== sourcePermissions.acknowledge);
      });
    });

    return totalChanges;
  };

  const applyCopiedPermissions = () => {
    if (!copyPermissionsModal || selectedBooksToCopy.length === 0 || selectedUsersForCopy.length === 0) return;

    const sourceUser = users.find(user => user.id === copyPermissionsModal.sourceUserId);
    if (!sourceUser) return;

    const sourceBooksToCopy = new Map(
      sourceUser.bookPermissions
        .filter(book => selectedBooksToCopy.includes(book.bookId))
        .map(book => [
          book.bookId,
          {
            ...book,
            permissions: sanitizePermissionsForBook(book.bookId, book.bookName, book.permissions)
          }
        ])
    );

    const changesCount = calculateCopyPermissionChanges();
    if (changesCount === 0) {
      window.alert('No hay permisos para modificar con la selección actual.');
      return;
    }

    const shouldContinue = window.confirm(
      `Se modificarán ${changesCount} permiso(s). ¿Desea continuar?`
    );

    if (!shouldContinue) return;

    const targetUserIds = new Set(selectedUsersForCopy);
    setUsers(prev => prev.map(user => {
      if (!targetUserIds.has(user.id)) return user;

      const nextBookPermissions = [...user.bookPermissions];

      sourceBooksToCopy.forEach((sourceBook, bookId) => {
        const existingIndex = nextBookPermissions.findIndex(book => book.bookId === bookId);
        if (existingIndex >= 0) {
          const existingBook = nextBookPermissions[existingIndex];
          nextBookPermissions[existingIndex] = {
            ...existingBook,
            permissions: sanitizePermissionsForBook(bookId, sourceBook.bookName, sourceBook.permissions),
            isCustom: true
          };
          return;
        }

        nextBookPermissions.push({
          bookId: sourceBook.bookId,
          bookName: sourceBook.bookName,
          permissions: sanitizePermissionsForBook(bookId, sourceBook.bookName, sourceBook.permissions),
          isCustom: true,
          disabled: false
        });
      });

      return {
        ...user,
        bookPermissions: nextBookPermissions
      };
    }));

    closeCopyPermissionsModal();
  };

  const removeBookFromUser = (userId: string, bookId: string) => {
    const user = users.find(u => u.id === userId);
    const book = user?.bookPermissions.find(b => b.bookId === bookId);

    if (!user || !book) return;
    if (!canRemoveBookFromUser(user, bookId)) return;

    setConfirmModal({
      type: 'remove-book',
      userId,
      userName: user.name,
      bookId,
      bookName: book.bookName
    });
  };

  const toggleBookEnabled = (userId: string, bookId: string) => {
    const user = users.find(u => u.id === userId);
    const book = user?.bookPermissions.find(b => b.bookId === bookId);

    if (!user || !book) return;

    if (book.disabled) {
      // Enable book
      setConfirmModal({
        type: 'enable-book',
        userId,
        userName: user.name,
        bookId,
        bookName: book.bookName
      });
    } else {
      // Disable book
      setConfirmModal({
        type: 'disable-book',
        userId,
        userName: user.name,
        bookId,
        bookName: book.bookName
      });
    }
  };

  const getAvailableBooksForUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return booksCatalog;

    const assignedBookIds = user.bookPermissions.map(b => b.bookId);
    return booksCatalog.filter(book => !assignedBookIds.includes(book.id));
  };

  const isProfileBookForUser = (user: UserProfile, bookId: string) => {
    if (!user.profileId) return false;
    const profile = profilesCatalog.find(p => p.id === user.profileId);
    if (!profile) return false;
    return profile.bookPermissions.some(book => book.bookId === bookId);
  };

  const canEditBookPermissions = (user: UserProfile, book: BookPermission) =>
    !book.disabled &&
    !isProfileBookForUser(user, book.bookId);

  const canRemoveBookFromUser = (user: UserProfile, bookId: string) =>
    !isProfileBookForUser(user, bookId);

  const toggleBookPermission = (
    userId: string,
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetUser = users.find(user => user.id === userId);
    const targetBook = targetUser?.bookPermissions.find(book => book.bookId === bookId);
    if (!targetUser || !targetBook || !canEditBookPermissions(targetUser, targetBook)) return;

    setUsers(prev => prev.map(user =>
      user.id === userId
        ? {
            ...user,
            bookPermissions: user.bookPermissions.map(book =>
              book.bookId === bookId
                ? {
                    ...book,
                    ...(canEditBookPermissions(user, book) ? {
                    permissions: permissionType === 'write' && isLibroObraMaestro(book.bookId, book.bookName)
                      ? {
                          ...book.permissions,
                          write: false
                        }
                      : {
                          ...book.permissions,
                          [permissionType]: !book.permissions[permissionType]
                        },
                    isCustom: true
                    } : {})
                  }
                : book
            )
          }
        : user
    ));
  };

  const toggleAllPermissions = (userId: string, permissionType: keyof BookPermission['permissions']) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const editableBooks = user.bookPermissions.filter(book => canEditBookPermissions(user, book));
    if (editableBooks.length === 0) return;

    // Check if all permissions of this type are already enabled
    const allEnabled = editableBooks.every(book => book.permissions[permissionType]);

    // Toggle all to opposite state
    setUsers(prev => prev.map(u =>
      u.id === userId
        ? {
            ...u,
            bookPermissions: u.bookPermissions.map(book => ({
              ...book,
              permissions: canEditBookPermissions(u, book)
                ? {
                    ...book.permissions,
                    ...(permissionType === 'write' && isLibroObraMaestro(book.bookId, book.bookName)
                      ? { write: false }
                      : { [permissionType]: !allEnabled })
                  }
                : book.permissions
            }))
          }
        : u
    ));
  };

  const getPermissionCheckboxState = (userId: string, permissionType: keyof BookPermission['permissions']) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.bookPermissions.length === 0) return 'none';
    const editableBooks = user.bookPermissions.filter(book => canEditBookPermissions(user, book));
    if (editableBooks.length === 0) return 'none';

    const enabledCount = editableBooks.filter(book => book.permissions[permissionType]).length;

    if (enabledCount === 0) return 'none';
    if (enabledCount === editableBooks.length) return 'all';
    return 'some';
  };

  const hasEditablePermissionsForUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    return user.bookPermissions.some(book => canEditBookPermissions(user, book));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.run.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilters.length === 0 || groupFilters.includes(user.group);
    const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
    const matchesProfile = profileFilters.length === 0 || (!!user.profileId && profileFilters.includes(user.profileId));
    const matchesBook = bookFilters.length === 0 || user.bookPermissions.some(book => bookFilters.includes(book.bookId));

    const booksForPermissionCheck = bookFilters.length === 0
      ? user.bookPermissions
      : user.bookPermissions.filter(book => bookFilters.includes(book.bookId));
    const matchesPermission = permissionFilters.length === 0 ||
      booksForPermissionCheck.some(book => permissionFilters.some(permission => book.permissions[permission]));

    return matchesSearch && matchesGroup && matchesRole && matchesProfile && matchesBook && matchesPermission;
  });

  const catalogById = new Map<string, string>();
  booksCatalog.forEach(book => catalogById.set(book.id, book.name));
  users.forEach(user => {
    user.bookPermissions.forEach(book => {
      if (!catalogById.has(book.bookId)) {
        catalogById.set(book.bookId, book.bookName);
      }
    });
  });

  const booksFromFilteredUsers = Array.from(catalogById.entries())
    .map(([bookId, bookName]) => ({
      bookId,
      bookName,
      assignments: filteredUsers
        .map(user => {
          const permission = user.bookPermissions.find(book => book.bookId === bookId);
          return permission ? { user, permission } : null;
        })
        .filter((entry): entry is { user: UserProfile; permission: BookPermission } => entry !== null)
        .filter(({ permission }) => permissionFilters.length === 0 || permissionFilters.some(permissionType => permission.permissions[permissionType]))
    }))
    .filter(book => bookFilters.length === 0 || bookFilters.includes(book.bookId));

  const toggleAllPermissionsForBook = (
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    const actionableAssignments = targetAssignments.filter(({ user, permission }) => canEditBookPermissions(user, permission));
    if (actionableAssignments.length === 0) return;

    const allEnabled = actionableAssignments.every(({ permission }) => permission.permissions[permissionType]);
    const targetUserIds = new Set(actionableAssignments.map(({ user }) => user.id));

    setUsers(prev => prev.map(user => {
      if (!targetUserIds.has(user.id)) return user;

      return {
        ...user,
        bookPermissions: user.bookPermissions.map(book =>
          book.bookId === bookId && canEditBookPermissions(user, book)
            ? {
                ...book,
                permissions: {
                  ...book.permissions,
                  ...(permissionType === 'write' && isLibroObraMaestro(book.bookId, book.bookName)
                    ? { write: false }
                    : { [permissionType]: !allEnabled })
                },
                isCustom: true
              }
            : book
        )
      };
    }));
  };

  const hasEditableAssignmentsForBook = (bookId: string) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    return targetAssignments.some(({ user, permission }) => canEditBookPermissions(user, permission));
  };

  const getBookPermissionCheckboxState = (
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    const actionableAssignments = targetAssignments.filter(({ user, permission }) => canEditBookPermissions(user, permission));
    if (actionableAssignments.length === 0) return 'none';

    const enabledCount = actionableAssignments.filter(({ permission }) => permission.permissions[permissionType]).length;
    if (enabledCount === 0) return 'none';
    if (enabledCount === actionableAssignments.length) return 'all';
    return 'some';
  };

  const roleOptions = Array.from(new Set(users.map(user => user.role))).sort((a, b) => a.localeCompare(b));
  const profileOptions = profilesCatalog.map(profile => ({ value: profile.id, label: profile.name }));
  const bookOptions = Array.from(catalogById.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const permissionOptions: MultiSelectOption[] = [
    { value: 'read', label: 'Lectura' },
    { value: 'draft', label: 'Asistente' },
    { value: 'write', label: 'Escritura' },
    { value: 'acknowledge', label: 'Toma Conoc.' }
  ];

  const serializeUser = (user: UserProfile) => JSON.stringify({
    name: user.name,
    run: user.run,
    email: user.email,
    group: user.group,
    role: user.role,
    profileId: user.profileId || '',
    profileName: user.profileName || '',
    disabled: !!user.disabled,
    bookPermissions: [...user.bookPermissions]
      .sort((a, b) => a.bookId.localeCompare(b.bookId))
      .map(book => ({
        bookId: book.bookId,
        disabled: !!book.disabled,
        permissions: book.permissions
      }))
  });

  const savedUsersById = new Map(savedUsersSnapshot.map(user => [user.id, user]));
  const currentUsersById = new Map(users.map(user => [user.id, user]));

  const modifiedUsers = users.filter(user => {
    const snapshot = savedUsersById.get(user.id);
    if (!snapshot) return true;
    return serializeUser(user) !== serializeUser(snapshot);
  });

  const removedUsers = savedUsersSnapshot.filter(user => !currentUsersById.has(user.id));
  const changedUsers = [...modifiedUsers, ...removedUsers];

  const hasSamePermissionSet = (a: PermissionSet, b: PermissionSet) => (
    a.read === b.read &&
    a.draft === b.draft &&
    a.write === b.write &&
    a.acknowledge === b.acknowledge
  );

  const changedAssignments = users.flatMap(user => {
    const snapshotUser = savedUsersById.get(user.id);
    const snapshotBooksById = new Map((snapshotUser?.bookPermissions || []).map(book => [book.bookId, book]));
    const currentBooksById = new Map(user.bookPermissions.map(book => [book.bookId, book]));
    const unionBookIds = new Set([
      ...Array.from(snapshotBooksById.keys()),
      ...Array.from(currentBooksById.keys())
    ]);

    return Array.from(unionBookIds)
      .map(bookId => {
        const previousBook = snapshotBooksById.get(bookId);
        const currentBook = currentBooksById.get(bookId);

        if (!previousBook && currentBook) {
          return {
            userId: user.id,
            bookId,
            changeUnits: 1
          };
        }

        if (previousBook && !currentBook) {
          return {
            userId: user.id,
            bookId,
            changeUnits: 1
          };
        }

        if (!previousBook || !currentBook) return null;

        const changedPermissions = (
          Number(previousBook.permissions.read !== currentBook.permissions.read) +
          Number(previousBook.permissions.draft !== currentBook.permissions.draft) +
          Number(previousBook.permissions.write !== currentBook.permissions.write) +
          Number(previousBook.permissions.acknowledge !== currentBook.permissions.acknowledge)
        );

        const disabledChanged = Number(!!previousBook.disabled !== !!currentBook.disabled);
        const changeUnits = changedPermissions + disabledChanged;

        if (changeUnits === 0) return null;

        return {
          userId: user.id,
          bookId,
          changeUnits
        };
      })
      .filter((entry): entry is { userId: string; bookId: string; changeUnits: number } => entry !== null);
  });

  const removedAssignments = savedUsersSnapshot
    .filter(savedUser => !currentUsersById.has(savedUser.id))
    .flatMap(savedUser => savedUser.bookPermissions.map(book => ({
      userId: savedUser.id,
      bookId: book.bookId,
      changeUnits: 1
    })));

  const allChangedAssignments = [...changedAssignments, ...removedAssignments];

  const impactedBookIds = new Set<string>();
  allChangedAssignments.forEach(assignment => impactedBookIds.add(assignment.bookId));

  const impactedBooks = Array.from(impactedBookIds).map(bookId => {
    const bookName = catalogById.get(bookId) || `Libro ${bookId}`;
    const currentAssignments = users.filter(user => user.bookPermissions.some(book => book.bookId === bookId));

    const readEnabled = currentAssignments.filter(user => user.bookPermissions.find(book => book.bookId === bookId)?.permissions.read).length;
    const draftEnabled = currentAssignments.filter(user => user.bookPermissions.find(book => book.bookId === bookId)?.permissions.draft).length;
    const writeEnabled = currentAssignments.filter(user => user.bookPermissions.find(book => book.bookId === bookId)?.permissions.write).length;

    return {
      id: bookId,
      name: bookName,
      status: currentAssignments.length > 0 ? 'Modificado' : 'Sin asignaciones',
      read: `${readEnabled}/${currentAssignments.length}`,
      draft: `${draftEnabled}/${currentAssignments.length}`,
      write: `${writeEnabled}/${currentAssignments.length}`
    };
  });

  const previewAssignmentsCount = allChangedAssignments.reduce((sum, assignment) => sum + assignment.changeUnits, 0);

  const handleSaveChanges = () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event(USERS_UPDATED_EVENT));
    setSavedUsersSnapshot(JSON.parse(JSON.stringify(users)) as UserProfile[]);
    setShowPreviewModal(false);
    window.alert('Cambios guardados con éxito.');
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#1f2937' }}>
                Permisos por Usuario
              </h1>
              <p className="text-[#6b7280]">
                Vista detallada de permisos asignados a cada usuario del sistema
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, RUN o email..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              />
            </div>

            <div className="flex items-start gap-4 flex-wrap w-full">
              <MultiSelectFilter
                label="Grupos"
                allLabel="Todos los grupos"
                options={[
                  { value: 'Mandante', label: 'Mandante' },
                  { value: 'Contratista', label: 'Contratista' }
                ]}
                selectedValues={groupFilters}
                onChange={setGroupFilters}
              />

              <MultiSelectFilter
                label="Roles"
                allLabel="Todos los roles"
                options={roleOptions.map(role => ({ value: role, label: role }))}
                selectedValues={roleFilters}
                onChange={setRoleFilters}
              />

              <MultiSelectFilter
                label="Perfiles"
                allLabel="Todos los perfiles"
                options={profileOptions}
                selectedValues={profileFilters}
                onChange={setProfileFilters}
              />

              <MultiSelectFilter
                label="Libros"
                allLabel="Todos los libros"
                options={bookOptions}
                selectedValues={bookFilters}
                onChange={setBookFilters}
              />

              <MultiSelectFilter
                label="Permisos"
                allLabel="Todos los permisos"
                options={permissionOptions}
                selectedValues={permissionFilters}
                onChange={(values) => setPermissionFilters(values as Array<keyof PermissionSet>)}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsBooksListView(prev => !prev)}
                className="px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm"
                style={{ fontWeight: 600 }}
              >
                {isBooksListView ? 'Ver listado de usuarios' : 'Ver listado de libros'}
              </button>
              <button
                onClick={openCreateUserModal}
                className="px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <UserPlus className="w-4 h-4" />
                Asignar Usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-28">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
              {users.length}
            </div>
            <div className="text-sm text-[#6b7280]">
              Usuarios totales
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
              {users.filter(u => u.group === 'Mandante').length}
            </div>
            <div className="text-sm text-[#6b7280]">
              Grupo Mandante
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
              {users.filter(u => u.group === 'Contratista').length}
            </div>
            <div className="text-sm text-[#6b7280]">
              Grupo Contratista
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="flex items-center gap-2 text-3xl mb-1" style={{ fontWeight: 600, color: '#f59e0b' }}>
              <AlertCircle className="w-7 h-7" />
              {users.filter(hasUserPermissionExceptions).length}
            </div>
            <div className="text-sm text-[#6b7280]">
              Usuarios con permisos modificados
            </div>
          </motion.div>
        </div>

        {/* Users List */}
        {isBooksListView ? (
          <div className="space-y-4">
            {booksFromFilteredUsers.map((bookEntry, index) => {
              const isExpanded = expandedBooks.includes(bookEntry.bookId);

              return (
                <motion.div
                  key={bookEntry.bookId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="w-12 h-12 rounded-xl bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>

                    <button
                      onClick={() => toggleBook(bookEntry.bookId)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                          {bookEntry.bookName}
                        </h3>
                        <p className="text-sm text-[#3b82f6]" style={{ fontWeight: 500 }}>
                          {bookEntry.assignments.length} usuarios
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => openAddUsersToBookModal(bookEntry.bookId, bookEntry.bookName)}
                      className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors"
                      title="Agregar usuario al libro"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#f8f9fb] border-t border-[#e1e4e8]">
                          {bookEntry.assignments.length > 0 ? (
                            <div className="px-6 py-4">
                              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 px-4 py-3 mb-2 bg-[#f8f9fb] rounded-lg">
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Profesional
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    onClick={() => toggleAllPermissionsForBook(bookEntry.bookId, 'read')}
                                    disabled={!hasEditableAssignmentsForBook(bookEntry.bookId)}
                                    className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={hasEditableAssignmentsForBook(bookEntry.bookId) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                  >
                                    {getBookPermissionCheckboxState(bookEntry.bookId, 'read') === 'all' ? (
                                      <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                    ) : getBookPermissionCheckboxState(bookEntry.bookId, 'read') === 'some' ? (
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
                                    onClick={() => toggleAllPermissionsForBook(bookEntry.bookId, 'draft')}
                                    disabled={!hasEditableAssignmentsForBook(bookEntry.bookId)}
                                    className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={hasEditableAssignmentsForBook(bookEntry.bookId) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                  >
                                    {getBookPermissionCheckboxState(bookEntry.bookId, 'draft') === 'all' ? (
                                      <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                    ) : getBookPermissionCheckboxState(bookEntry.bookId, 'draft') === 'some' ? (
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
                                    onClick={() => toggleAllPermissionsForBook(bookEntry.bookId, 'write')}
                                    disabled={!hasEditableAssignmentsForBook(bookEntry.bookId) || isLibroObraMaestro(bookEntry.bookId, bookEntry.bookName)}
                                    className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={
                                      isLibroObraMaestro(bookEntry.bookId, bookEntry.bookName)
                                        ? 'Escritura no disponible para Libro de Obra Maestro'
                                        : hasEditableAssignmentsForBook(bookEntry.bookId)
                                          ? 'Seleccionar/Deseleccionar todos'
                                          : 'No hay libros nuevos editables para esta acción'
                                    }
                                  >
                                    {getBookPermissionCheckboxState(bookEntry.bookId, 'write') === 'all' ? (
                                      <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                    ) : getBookPermissionCheckboxState(bookEntry.bookId, 'write') === 'some' ? (
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
                                    onClick={() => toggleAllPermissionsForBook(bookEntry.bookId, 'acknowledge')}
                                    disabled={!hasEditableAssignmentsForBook(bookEntry.bookId)}
                                    className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={hasEditableAssignmentsForBook(bookEntry.bookId) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                  >
                                    {getBookPermissionCheckboxState(bookEntry.bookId, 'acknowledge') === 'all' ? (
                                      <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                    ) : getBookPermissionCheckboxState(bookEntry.bookId, 'acknowledge') === 'some' ? (
                                      <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                    ) : (
                                      <Square className="w-4 h-4 text-[#9ca3af]" />
                                    )}
                                    <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                      Toma Conoc.
                                    </span>
                                  </button>
                                </div>
                                <div className="text-sm text-center" style={{ fontWeight: 600, color: '#374151' }}>
                                  Acciones
                                </div>
                              </div>

                              <div className="space-y-2">
                                {bookEntry.assignments.map(({ user, permission }, userIndex) => (
                                  <motion.div
                                    key={`${bookEntry.bookId}-${user.id}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: userIndex * 0.05 }}
                                    className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 px-4 py-4 bg-white rounded-lg border items-center ${
                                      isBookPermissionException(user, permission) ? 'border-[#f59e0b]' : 'border-[#e1e4e8]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                        style={{ backgroundColor: user.avatarColor, fontWeight: 600 }}
                                      >
                                        {user.avatar}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div style={{ fontWeight: 500, color: '#1f2937' }}>
                                            {user.name}
                                          </div>
                                          {isBookPermissionException(user, permission) && (
                                            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                                          )}
                                        </div>
                                        <div className="text-sm text-[#6b7280] mb-1">
                                          RUN: {user.run}
                                        </div>
                                        <div className="text-sm text-[#6b7280] mb-1">
                                          Cargo: {user.role}
                                        </div>
                                        {user.profileName ? (
                                          <div className="flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-[#4f46e5]" />
                                            <span className="text-xs text-[#4f46e5]" style={{ fontWeight: 500 }}>
                                              {user.profileName}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-[#94a3b8] italic">Sin perfil</span>
                                        )}
                                      </div>
                                    </div>

                                    {(['read', 'draft', 'write', 'acknowledge'] as Array<keyof BookPermission['permissions']>).map(permissionType => (
                                      <div key={permissionType} className="flex justify-center">
                                        <button
                                          onClick={() => toggleBookPermission(user.id, permission.bookId, permissionType)}
                                          disabled={
                                            permission.disabled ||
                                            isProfileBookForUser(user, permission.bookId) ||
                                            (permissionType === 'write' && isLibroObraMaestro(permission.bookId, permission.bookName))
                                          }
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                            ${permission.permissions[permissionType]
                                              ? isBookPermissionException(user, permission)
                                                ? 'bg-[#fef3c7] text-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                            }
                                          `}
                                          title={
                                            permissionType === 'write' && isLibroObraMaestro(permission.bookId, permission.bookName)
                                              ? 'Escritura no disponible para Libro de Obra Maestro'
                                              : isProfileBookForUser(user, permission.bookId)
                                                  ? 'Permisos heredados del perfil base (solo editable en libros nuevos)'
                                                : permission.disabled
                                                  ? 'Libro deshabilitado'
                                                  : 'Alternar permiso'
                                          }
                                        >
                                          {permission.permissions[permissionType] ? (
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                          ) : (
                                            <X className="w-5 h-5" strokeWidth={2} />
                                          )}
                                        </button>
                                      </div>
                                    ))}

                                    <div className="flex justify-center">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleBookEnabled(user.id, permission.bookId)}
                                          className={`p-2 rounded-lg transition-colors ${
                                            permission.disabled
                                              ? 'text-[#10b981] hover:bg-[#d1fae5]'
                                              : 'text-[#f59e0b] hover:bg-[#fef3c7]'
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                          title={permission.disabled ? 'Habilitar acceso a libro' : 'Deshabilitar acceso a libro'}
                                        >
                                          {permission.disabled ? (
                                            <UserCheck className="w-5 h-5" />
                                          ) : (
                                            <UserX className="w-5 h-5" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => removeBookFromUser(user.id, permission.bookId)}
                                          disabled={!canRemoveBookFromUser(user, permission.bookId)}
                                          className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={
                                            isProfileBookForUser(user, permission.bookId)
                                                ? 'Libro heredado del perfil base (no se puede quitar)'
                                                : 'Quitar usuario del libro'
                                          }
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="px-6 py-8 text-center">
                              <User className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                              <p className="text-[#6b7280]">No hay usuarios asignados a este libro</p>
                              <button
                                onClick={() => openAddUsersToBookModal(bookEntry.bookId, bookEntry.bookName)}
                                className="mt-4 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 mx-auto"
                                style={{ fontWeight: 500 }}
                              >
                                <UserPlus className="w-4 h-4" />
                                Agregar primer usuario
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
        <div className="space-y-4">
          {filteredUsers.map((user, index) => {
            const isExpanded = expandedUsers.includes(user.id);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border overflow-hidden shadow-sm ${
                  user.disabled ? 'bg-[#f3f4f6]' : 'bg-white'
                } ${
                  hasUserPermissionExceptions(user) ? 'border-[#f59e0b]' : 'border-[#e1e4e8]'
                }`}
              >
                {/* User Header */}
                <div className="flex items-center gap-4 px-6 py-5">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
                    style={{ backgroundColor: user.avatarColor, fontWeight: 600 }}
                  >
                    {user.avatar}
                  </div>

                  {/* User Info */}
                  <button
                    onClick={() => toggleUser(user.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg" style={{ fontWeight: 600, color: '#1f2937' }}>
                          {user.name}
                        </h3>
                        {user.disabled && (
                          <span className="px-2 py-0.5 bg-[#f3f4f6] text-[#6b7280] rounded text-xs" style={{ fontWeight: 600 }}>
                            Deshabilitado
                          </span>
                        )}
                        {hasUserPermissionExceptions(user) && (
                          <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6b7280] mb-2">
                        <span>RUN: {user.run}</span>
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-[#eff6ff] text-[#1e40af] rounded-full text-xs" style={{ fontWeight: 500 }}>
                          {user.group}
                        </span>
                        <span className="text-sm text-[#6b7280]">
                          {user.role}
                        </span>
                        {user.profileName ? (
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-[#4f46e5]" />
                            <span className="text-xs text-[#4f46e5]" style={{ fontWeight: 500 }}>
                              {user.profileName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94a3b8] italic">Sin perfil</span>
                        )}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                          title="Acciones de usuario"
                          aria-label="Acciones de usuario"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => openCopyPermissionsModal(user)}>
                          <Copy className="w-4 h-4" />
                          Copiar permisos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                          <Edit2 className="w-4 h-4" />
                          Editar usuario
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserEnabled(user.id)}>
                          {user.disabled ? (
                            <UserCheck className="w-4 h-4 text-[#10b981]" />
                          ) : (
                            <UserX className="w-4 h-4 text-[#f59e0b]" />
                          )}
                          {user.disabled ? 'Habilitar usuario' : 'Deshabilitar usuario'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            setConfirmModal({
                              type: 'delete-user',
                              userId: user.id,
                              userName: user.name
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar usuario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                        {/* Add Books Button */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                            Libros Asignados ({user.bookPermissions.length})
                          </h4>
                          <button
                            onClick={() => openAddBooksModal(user.id, user.name)}
                            className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                            style={{ fontWeight: 500 }}
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Libro
                          </button>
                        </div>

                        {user.bookPermissions.length === 0 ? (
                          <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                            <p className="text-[#6b7280] mb-4">
                              Este usuario no tiene libros asignados
                            </p>
                            <button
                              onClick={() => openAddBooksModal(user.id, user.name)}
                              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 mx-auto"
                              style={{ fontWeight: 500 }}
                            >
                              <Plus className="w-4 h-4" />
                              Agregar primer libro
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Table Header */}
                            <div className={`px-4 py-3 mb-2 rounded-lg ${
                              isBooksListView
                                ? 'grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 bg-[#f8f9fb]'
                                : 'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto] gap-4 bg-[#f8f9fb]'
                            }`}>
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Libro
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => toggleAllPermissions(user.id, 'read')}
                                  disabled={!hasEditablePermissionsForUser(user.id)}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={hasEditablePermissionsForUser(user.id) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                >
                                  {getPermissionCheckboxState(user.id, 'read') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(user.id, 'read') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(user.id, 'draft')}
                                  disabled={!hasEditablePermissionsForUser(user.id)}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={hasEditablePermissionsForUser(user.id) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                >
                                  {getPermissionCheckboxState(user.id, 'draft') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(user.id, 'draft') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(user.id, 'write')}
                                  disabled={!hasEditablePermissionsForUser(user.id)}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={hasEditablePermissionsForUser(user.id) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                >
                                  {getPermissionCheckboxState(user.id, 'write') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(user.id, 'write') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(user.id, 'acknowledge')}
                                  disabled={!hasEditablePermissionsForUser(user.id)}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={hasEditablePermissionsForUser(user.id) ? 'Seleccionar/Deseleccionar todos' : 'No hay libros nuevos editables para esta acción'}
                                >
                                  {getPermissionCheckboxState(user.id, 'acknowledge') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(user.id, 'acknowledge') === 'some' ? (
                                    <MinusSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#9ca3af]" />
                                  )}
                                  <span className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                    Toma Conoc.
                                  </span>
                                </button>
                              </div>
                              <div className="text-sm text-center" style={{ fontWeight: 600, color: '#374151' }}>
                                Acciones
                              </div>
                            </div>

                            {/* Book Rows */}
                            <div className="space-y-2">
                              {user.bookPermissions.map((book, bookIndex) => (
                                <motion.div
                                  key={book.bookId}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: bookIndex * 0.05 }}
                                  className={`px-4 py-4 rounded-lg border items-center ${
                                    isBooksListView
                                      ? 'grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6'
                                      : 'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto] gap-4'
                                  } ${
                                    book.disabled ? 'bg-[#f9fafb]' : 'bg-white'
                                  } ${
                                    isBookPermissionException(user, book) ? 'border-[#f59e0b]' : 'border-[#e1e4e8]'
                                  }`}
                                >
                              {/* Book Name */}
                              <div className="flex items-center gap-2">
                                {isBookPermissionException(user, book) && (
                                  <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                                )}
                                <span style={{ fontWeight: 500, color: '#1f2937' }}>
                                  {book.bookName}
                                </span>
                                {book.disabled && (
                                  <span className="px-2 py-0.5 bg-[#e5e7eb] text-[#6b7280] rounded text-xs" style={{ fontWeight: 600 }}>
                                    Deshabilitado
                                  </span>
                                )}
                              </div>

                              {/* Read Permission */}
                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleBookPermission(user.id, book.bookId, 'read')}
                                  disabled={!canEditBookPermissions(user, book)}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${book.permissions.read
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    isProfileBookForUser(user, book.bookId)
                                        ? 'Permisos heredados del perfil base (solo editable en libros nuevos)'
                                        : book.disabled
                                          ? 'Libro deshabilitado'
                                          : 'Alternar permiso de lectura'
                                  }
                                >
                                  {book.permissions.read ? (
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                  ) : (
                                    <X className="w-5 h-5" strokeWidth={2} />
                                  )}
                                </button>
                              </div>

                              {/* Draft Permission */}
                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleBookPermission(user.id, book.bookId, 'draft')}
                                  disabled={!canEditBookPermissions(user, book)}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${book.permissions.draft
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    isProfileBookForUser(user, book.bookId)
                                        ? 'Permisos heredados del perfil base (solo editable en libros nuevos)'
                                        : book.disabled
                                          ? 'Libro deshabilitado'
                                          : 'Alternar permiso de asistente'
                                  }
                                >
                                  {book.permissions.draft ? (
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                  ) : (
                                    <X className="w-5 h-5" strokeWidth={2} />
                                  )}
                                </button>
                              </div>

                              {/* Write Permission */}
                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleBookPermission(user.id, book.bookId, 'write')}
                                  disabled={!canEditBookPermissions(user, book) || isLibroObraMaestro(book.bookId, book.bookName)}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${book.permissions.write
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    isLibroObraMaestro(book.bookId, book.bookName)
                                      ? 'Escritura no disponible para Libro de Obra Maestro'
                                      : isProfileBookForUser(user, book.bookId)
                                          ? 'Permisos heredados del perfil base (solo editable en libros nuevos)'
                                        : book.disabled
                                          ? 'Libro deshabilitado'
                                          : 'Alternar permiso de escritura'
                                  }
                                >
                                  {book.permissions.write ? (
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                  ) : (
                                    <X className="w-5 h-5" strokeWidth={2} />
                                  )}
                                </button>
                              </div>

                                  {/* Acknowledge Permission */}
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => toggleBookPermission(user.id, book.bookId, 'acknowledge')}
                                      disabled={!canEditBookPermissions(user, book)}
                                      className={`
                                      w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                      ${book.permissions.acknowledge
                                        ? isBookPermissionException(user, book)
                                          ? 'bg-[#fef3c7] text-[#f59e0b]'
                                          : 'bg-[#dcfce7] text-[#16a34a]'
                                        : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                      }
                                    `}
                                      title={
                                        isProfileBookForUser(user, book.bookId)
                                            ? 'Permisos heredados del perfil base (solo editable en libros nuevos)'
                                            : book.disabled
                                              ? 'Libro deshabilitado'
                                              : 'Alternar permiso de toma de conocimiento'
                                      }
                                    >
                                      {book.permissions.acknowledge ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                      ) : (
                                        <X className="w-5 h-5" strokeWidth={2} />
                                      )}
                                    </button>
                                  </div>

                                  {isBooksListView ? (
                                    <div className="flex justify-center">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleBookEnabled(user.id, book.bookId)}
                                          className={`p-2 rounded-lg transition-colors ${
                                            book.disabled
                                              ? 'text-[#10b981] hover:bg-[#d1fae5]'
                                              : 'text-[#f59e0b] hover:bg-[#fef3c7]'
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                          title={book.disabled ? 'Habilitar acceso a libro' : 'Deshabilitar acceso a libro'}
                                        >
                                          {book.disabled ? (
                                            <UserCheck className="w-5 h-5" />
                                          ) : (
                                            <UserX className="w-5 h-5" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => removeBookFromUser(user.id, book.bookId)}
                                          disabled={!canRemoveBookFromUser(user, book.bookId)}
                                          className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={
                                            isProfileBookForUser(user, book.bookId)
                                                ? 'Libro heredado del perfil base (no se puede quitar)'
                                                : 'Quitar libro'
                                          }
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* Enable/Disable Book */}
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => toggleBookEnabled(user.id, book.bookId)}
                                          className={`p-2 rounded-lg transition-colors ${
                                            book.disabled
                                              ? 'text-[#10b981] hover:bg-[#d1fae5]'
                                              : 'text-[#f59e0b] hover:bg-[#fef3c7]'
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                          title={book.disabled ? 'Habilitar acceso a libro' : 'Deshabilitar acceso a libro'}
                                        >
                                          {book.disabled ? (
                                            <UserCheck className="w-5 h-5" />
                                          ) : (
                                            <UserX className="w-5 h-5" />
                                          )}
                                        </button>
                                      </div>

                                      {/* Remove Book */}
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => removeBookFromUser(user.id, book.bookId)}
                                          disabled={!canRemoveBookFromUser(user, book.bookId)}
                                          className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={
                                            isProfileBookForUser(user, book.bookId)
                                                ? 'Libro heredado del perfil base (no se puede quitar)'
                                                : 'Quitar libro'
                                          }
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isCreateUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={closeCreateUserModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f8f9fb] rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col relative"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-[#4f46e5] to-[#a21caf] text-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-4xl" style={{ fontWeight: 600 }}>
                    Asignar Usuarios a Libros
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowBulkCreatePreviewModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Previsualizar
                    </button>
                    <button
                      onClick={createUsersBulk}
                      className="px-5 py-2.5 rounded-xl bg-white text-[#4f46e5] hover:bg-[#ede9fe] transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={closeCreateUserModal}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Atrás
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="w-5 h-5 text-[#4f46e5]" />
                    <h4 className="text-3xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                      Usuarios ({bulkCreateUsers.length} asignados)
                    </h4>
                  </div>
                  <label className="block text-sm mb-2 text-[#4b5563]">RUN</label>
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      value={bulkCreateRunInput}
                      onChange={(e) => setBulkCreateRunInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addBulkCreateUserByRun();
                        }
                      }}
                      placeholder="Ingrese RUN"
                      className="w-full max-w-xl px-4 py-3 bg-white border border-[#cbd5e1] rounded-xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    />
                    <button
                      onClick={addBulkCreateUserByRun}
                      className="px-8 py-3 rounded-xl bg-[#9ca3af] text-white hover:bg-[#6b7280] transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Agregar
                    </button>
                  </div>

                  {bulkCreateUsers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bulkCreateUsers.map(draftUser => (
                        <div key={draftUser.id} className="bg-white border border-[#dbe3ef] rounded-xl p-4 shadow-sm max-w-[440px]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white flex items-center justify-center text-3xl" style={{ fontWeight: 700 }}>
                                {draftUser.isExisting
                                  ? (draftUser.name || draftUser.run).trim().slice(0, 2).toUpperCase()
                                  : '?'}
                              </div>
                              <div>
                                <div className={`text-3xl ${draftUser.isExisting ? 'text-[#0f172a]' : 'text-[#94a3b8] italic'}`} style={{ fontWeight: 600 }}>
                                  {draftUser.name || 'Sin nombre'}
                                </div>
                                <div className="text-2xl text-[#475569] flex items-center gap-2 mt-1">
                                  RUN: {draftUser.run}
                                  {!draftUser.isExisting && (
                                    <span className="inline-flex px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-xs">
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                                {draftUser.isExisting ? (
                                  <div className="mt-3 text-xl text-[#94a3b8] italic">
                                    {draftUser.profileName || 'Sin perfil'}
                                  </div>
                                ) : (
                                  <div className="mt-2 text-sm text-[#94a3b8] italic">Crear especialista primero</div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeBulkCreateUser(draftUser.id)}
                              className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                              title="Quitar usuario"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {draftUser.isExisting ? (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => setEditingBulkCreateUserId(draftUser.id)}
                                className="inline-flex items-center gap-2 text-[#334155] hover:text-[#1e293b] transition-colors text-sm"
                                style={{ fontWeight: 600 }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingBulkCreateUserId(draftUser.id)}
                              className="mt-3 w-full px-4 py-2.5 rounded-xl bg-[#0ea543] text-white hover:bg-[#15803d] transition-colors inline-flex items-center justify-center gap-2"
                              style={{ fontWeight: 600 }}
                            >
                              <UserPlus className="w-4 h-4" />
                              Crear Especialista
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-[#7c3aed]" />
                    <h4 className="text-3xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                      Libros Asignados ({selectedBooksForBulkCreate.length})
                    </h4>
                  </div>
                  <div ref={bulkCreateBooksRef} className="relative mb-4 max-w-2xl">
                    <button
                      onClick={() => setBulkCreateBooksOpen(prev => !prev)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#cbd5e1] text-left text-[#1f2937] flex items-center justify-between"
                    >
                      <span>
                        {selectedBooksForBulkCreate.length === 0
                          ? 'Seleccionar libros...'
                          : `${selectedBooksForBulkCreate.length} libro(s) seleccionado(s)`}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-[#64748b] transition-transform ${bulkCreateBooksOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {bulkCreateBooksOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-[#cbd5e1] rounded-xl shadow-lg z-40 overflow-hidden">
                        <div className="p-3 border-b border-[#e2e8f0]">
                          <input
                            type="text"
                            value={bulkCreateBooksSearch}
                            onChange={(e) => setBulkCreateBooksSearch(e.target.value)}
                            placeholder="Buscar libros..."
                            className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          />
                          <button
                            onClick={toggleSelectAllFilteredBulkBooks}
                            className="w-full mt-2 px-3 py-2 rounded-lg bg-[#f3e8ff] text-[#7e22ce] hover:bg-[#e9d5ff] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            {allFilteredBooksSelected ? 'Limpiar selección' : 'Seleccionar Todos'}
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredBulkCreateBooks.map(book => (
                            <label key={book.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#f8fafc] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBooksForBulkCreate.includes(book.id)}
                                onChange={() => toggleBulkCreateBookSelection(book.id)}
                                className="mt-1 w-4 h-4"
                              />
                              <div>
                                <div className="text-[#1f2937]">{book.name}</div>
                                <div className="text-xs text-[#94a3b8]">sistema</div>
                              </div>
                            </label>
                          ))}
                          {filteredBulkCreateBooks.length === 0 && (
                            <div className="px-2 py-3 text-sm text-[#94a3b8]">No hay libros para esta búsqueda.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#dbe3ef] rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-3 px-4 py-3 bg-[#f1f5f9] text-[#334155]" style={{ fontWeight: 600 }}>
                      <div>Libro</div>
                      <div>Lectura</div>
                      <div>Asistente</div>
                      <div>Escritura</div>
                      <div>Toma de Conoc.</div>
                      <div>Acciones</div>
                    </div>
                    {selectedBooksForBulkCreate.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-[#64748b]">Selecciona libros para definir permisos.</div>
                    ) : (
                      selectedBooksForBulkCreate.map(bookId => {
                        const bookName = catalogById.get(bookId) || `Libro ${bookId}`;
                        const permissions = bulkCreateBookPermissions[bookId] || { read: false, draft: false, write: false, acknowledge: false };
                        return (
                          <div key={bookId} className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-3 px-4 py-3 border-t border-[#eef2f7] items-center text-sm">
                            <div className="text-[#1f2937]">{bookName}</div>
                            <div>
                              <button
                                onClick={() => toggleBulkCreateBookPermission(bookId, 'read')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.read ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}
                              >
                                {permissions.read ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() => toggleBulkCreateBookPermission(bookId, 'draft')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.draft ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}
                              >
                                {permissions.draft ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() => toggleBulkCreateBookPermission(bookId, 'write')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.write ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}
                              >
                                {permissions.write ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() => toggleBulkCreateBookPermission(bookId, 'acknowledge')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.acknowledge ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}
                              >
                                {permissions.acknowledge ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() => toggleBulkCreateBookSelection(bookId)}
                                className="text-[#ef4444] hover:text-[#dc2626] transition-colors"
                                title="Quitar libro"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

              <div className="px-6 py-4 border-t border-[#e5e7eb] bg-white flex items-center justify-between gap-3">
                <div className="text-sm text-[#6b7280]">
                  {bulkCreateUsers.length} usuario(s) preparado(s) para crear
                </div>
              </div>

              <AnimatePresence>
                {editingBulkCreateUserId && (() => {
                  const editingDraft = bulkCreateUsers.find(user => user.id === editingBulkCreateUserId);
                  if (!editingDraft) return null;

                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-10"
                      onClick={() => setEditingBulkCreateUserId(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl text-[#1f2937]" style={{ fontWeight: 600 }}>
                            {editingDraft.isExisting ? 'Editar usuario' : 'Crear especialista'}: {editingDraft.run}
                          </h4>
                          <button
                            onClick={() => setEditingBulkCreateUserId(null)}
                            className="text-sm text-[#6b7280] hover:text-[#374151]"
                            style={{ fontWeight: 500 }}
                          >
                            Cerrar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          <input
                            type="text"
                            value={editingDraft.name}
                            onChange={(e) => updateBulkCreateUser(editingDraft.id, { name: e.target.value })}
                            placeholder="Nombre completo"
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg"
                          />
                          <input
                            type="email"
                            value={editingDraft.email}
                            onChange={(e) => updateBulkCreateUser(editingDraft.id, { email: e.target.value })}
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg"
                          />
                          <select
                            value={editingDraft.group}
                            onChange={(e) => updateBulkCreateUser(editingDraft.id, { group: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg"
                          >
                            <option value="">Seleccionar grupo...</option>
                            <option value="Mandante">Mandante</option>
                            <option value="Contratista">Contratista</option>
                          </select>
                          <input
                            type="text"
                            value={editingDraft.role}
                            onChange={(e) => updateBulkCreateUser(editingDraft.id, { role: e.target.value })}
                            placeholder="Cargo / Rol"
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg"
                          />
                          <select
                            value={editingDraft.profileId}
                            onChange={(e) => {
                              const selectedProfile = profilesCatalog.find(p => p.id === e.target.value);
                              updateBulkCreateUser(editingDraft.id, {
                                profileId: e.target.value,
                                profileName: selectedProfile?.name || ''
                              });
                            }}
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg md:col-span-2"
                          >
                            <option value="">Sin Perfil</option>
                            {profilesCatalog.map(profile => (
                              <option key={profile.id} value={profile.id}>
                                {profile.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setEditingBulkCreateUserId(null)}
                            className="px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f8fafc] transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => saveBulkCreateUserFromModal(editingDraft.id)}
                            className="px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Guardar
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              <AnimatePresence>
                {showBulkCreatePreviewModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-20"
                    onClick={() => setShowBulkCreatePreviewModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.98, y: 8 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.98, y: 8 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[86vh] overflow-hidden"
                    >
                      <div className="px-6 py-5 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white flex items-center justify-between">
                        <h4 className="text-4xl" style={{ fontWeight: 600 }}>Previsualización de Cambios</h4>
                        <button
                          onClick={() => setShowBulkCreatePreviewModal(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          Atrás
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto max-h-[calc(86vh-88px)] space-y-6">
                        <div>
                          <h5 className="text-2xl mb-3 text-[#1f2937]" style={{ fontWeight: 600 }}>
                            Especialistas ({bulkCreateUsers.length})
                          </h5>
                          <div className="rounded-xl border border-[#dbe3ef] overflow-hidden">
                            <div className="grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-4 px-4 py-3 bg-[#f1f5f9] text-[#334155]" style={{ fontWeight: 600 }}>
                              <div>RUN</div>
                              <div>Nombre</div>
                              <div>Estado</div>
                              <div>Perfiles</div>
                            </div>
                            {bulkCreateUsers.length === 0 ? (
                              <div className="px-4 py-4 text-sm text-[#64748b]">No hay especialistas agregados.</div>
                            ) : (
                              bulkCreateUsers.map(user => (
                                <div key={user.id} className="grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-4 px-4 py-3 border-t border-[#eef2f7] text-sm">
                                  <div>{user.run}</div>
                                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.name || 'Sin nombre'}</div>
                                  <div>
                                    <span className="inline-flex px-2 py-1 rounded-md bg-[#f1f5f9] text-[#475569]">
                                      {user.isExisting ? 'Existente' : 'Pendiente'}
                                    </span>
                                  </div>
                                  <div>{user.profileName || 'Sin perfil'}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-2xl mb-3 text-[#1f2937]" style={{ fontWeight: 600 }}>
                            Libros ({selectedBooksForBulkCreate.length})
                          </h5>
                          <div className="rounded-xl border border-[#dbe3ef] overflow-hidden">
                            <div className="grid grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3 bg-[#f1f5f9] text-[#334155]" style={{ fontWeight: 600 }}>
                              <div>Nombre</div>
                              <div>Estado</div>
                              <div>Lectura</div>
                              <div>Asistente</div>
                              <div>Escritura</div>
                            </div>
                            {selectedBooksForBulkCreate.length === 0 ? (
                              <div className="px-4 py-4 text-sm text-[#64748b]">No hay libros seleccionados.</div>
                            ) : (
                              selectedBooksForBulkCreate.map(bookId => {
                                const bookName = catalogById.get(bookId) || `Libro ${bookId}`;
                                const permissions = bulkCreateBookPermissions[bookId] || { read: false, draft: false, write: false, acknowledge: false };
                                return (
                                  <div key={`preview-bulk-book-${bookId}`} className="grid grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3 border-t border-[#eef2f7] text-sm items-center">
                                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{bookName}</div>
                                    <div>
                                      <span className="inline-flex px-2 py-1 rounded-md bg-[#f1f5f9] text-[#475569]">Existente</span>
                                    </div>
                                    <div className={permissions.read ? 'text-[#16a34a]' : 'text-[#94a3b8]'}>{permissions.read ? '✓' : '✕'}</div>
                                    <div className={permissions.draft ? 'text-[#16a34a]' : 'text-[#94a3b8]'}>{permissions.draft ? '✓' : '✕'}</div>
                                    <div className={permissions.write ? 'text-[#16a34a]' : 'text-[#94a3b8]'}>{permissions.write ? '✓' : '✕'}</div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-2xl mb-3 text-[#1f2937]" style={{ fontWeight: 600 }}>
                            Vista Matriz de Asignaciones
                          </h5>
                          <div className="rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-5 py-4">
                            <div className="text-[#334155]">
                              Se crearán <span className="text-[#4f46e5]" style={{ fontWeight: 600 }}>{bulkCreateUsers.length} × {selectedBooksForBulkCreate.length} = {bulkCreateUsers.length * selectedBooksForBulkCreate.length}</span> asignaciones totales
                            </div>
                            <div className="text-sm text-[#64748b] mt-2">
                              Cada uno de los {bulkCreateUsers.length} usuarios tendrá acceso a cada uno de los {selectedBooksForBulkCreate.length} libros con los permisos especificados.
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                  <Edit2 className="w-6 h-6 text-[#4f46e5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Editar Usuario
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Modifica el grupo, cargo y perfil del usuario
                  </p>
                </div>
              </div>

              <div className="space-y-5 mb-6">
                {/* User Info (Read-only) */}
                {(() => {
                  const currentUser = users.find(u => u.id === editingUser);
                  return currentUser ? (
                    <div className="p-4 bg-[#f8f9fb] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: currentUser.avatarColor, fontWeight: 600 }}
                        >
                          {currentUser.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {currentUser.name}
                          </div>
                          <div className="text-sm text-[#6b7280]">
                            RUN: {currentUser.run}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Group Selector */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Grupo
                  </label>
                  <select
                    value={editForm.group}
                    onChange={(e) => setEditForm(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">Seleccionar grupo...</option>
                    <option value="Mandante">Mandante</option>
                    <option value="Contratista">Contratista</option>
                  </select>
                </div>

                {/* Role Input */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Cargo / Rol
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="ej. Inspector Técnico, Jefe de Proyecto..."
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                </div>

                {/* Profile Selector */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Perfil de Permisos
                  </label>
                  <select
                    value={editForm.profileId}
                    onChange={(e) => {
                      const nextProfileId = e.target.value;
                      if (nextProfileId === editForm.profileId) return;

                      const shouldApply = window.confirm(
                        'Al cambiar el perfil se restablecerán los permisos del usuario según el nuevo perfil. ¿Desea continuar?'
                      );

                      if (!shouldApply) return;

                      const selectedProfile = profilesCatalog.find(p => p.id === e.target.value);
                      setEditForm(prev => ({
                        ...prev,
                        profileId: nextProfileId,
                        profileName: selectedProfile?.name || ''
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">Sin Perfil</option>
                    {profilesCatalog.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#6b7280] mt-2">
                    Sin perfil, el usuario puede agregar cualquier libro y permiso. Si elige un perfil, se aplican permisos base.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveUserChanges}
                  disabled={!editForm.group || !editForm.role}
                  className="flex-1 px-4 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    Selecciona los libros para asignar a <span style={{ fontWeight: 500 }}>{addBooksModal.userName}</span>
                  </p>
                </div>
              </div>

              {/* Available Books List */}
              <div className="mb-6">
                {(() => {
                  const availableForUser = getAvailableBooksForUser(addBooksModal.userId);

                  if (availableForUser.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                        <p className="text-[#6b7280]">
                          No hay libros disponibles para agregar
                        </p>
                        <p className="text-sm text-[#9ca3af] mt-1">
                          El usuario ya tiene acceso a todos los libros
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {availableForUser.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => toggleBookSelection(book.id)}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${selectedBooksToAdd.includes(book.id)
                              ? 'border-[#3b82f6] bg-[#eff6ff]'
                              : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div style={{ fontWeight: 600, color: '#1f2937' }}>
                                {book.name}
                              </div>
                            </div>
                            {selectedBooksToAdd.includes(book.id) && (
                              <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Selected Count */}
              {selectedBooksToAdd.length > 0 && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg">
                  <div className="flex items-center gap-2 text-[#3b82f6]">
                    <BookOpen className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>
                      {selectedBooksToAdd.length} libro{selectedBooksToAdd.length !== 1 ? 's' : ''} seleccionado{selectedBooksToAdd.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">
                    Los libros se agregarán sin permisos activos. Puedes configurarlos después.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={closeAddBooksModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addBooksToUser}
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

      {/* Add Users To Book Modal */}
      <AnimatePresence>
        {addUsersToBookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeAddUsersToBookModal}
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
                  <UserPlus className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Agregar Usuarios
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona los usuarios para agregar al libro <span style={{ fontWeight: 500 }}>{addUsersToBookModal.bookName}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                {(() => {
                  const availableForBook = getAvailableUsersForBook(addUsersToBookModal.bookId);

                  if (availableForBook.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                        <p className="text-[#6b7280]">
                          No hay usuarios disponibles para agregar
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {availableForBook.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => toggleUserSelectionForBook(user.id)}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${selectedUsersToAddToBook.includes(user.id)
                              ? 'border-[#3b82f6] bg-[#eff6ff]'
                              : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: user.avatarColor, fontWeight: 600 }}
                            >
                              {user.avatar}
                            </div>
                            <div className="flex-1">
                              <div style={{ fontWeight: 600, color: '#1f2937' }}>
                                {user.name}
                              </div>
                              <div className="text-sm text-[#6b7280]">
                                RUN: {user.run}
                              </div>
                            </div>
                            {selectedUsersToAddToBook.includes(user.id) && (
                              <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {selectedUsersToAddToBook.length > 0 && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg">
                  <div className="flex items-center gap-2 text-[#3b82f6]">
                    <User className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>
                      {selectedUsersToAddToBook.length} usuario{selectedUsersToAddToBook.length !== 1 ? 's' : ''} seleccionado{selectedUsersToAddToBook.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">
                    Los usuarios se agregarán con permisos desactivados para este libro.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={closeAddUsersToBookModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addUsersToBook}
                  disabled={selectedUsersToAddToBook.length === 0}
                  className="flex-1 px-4 py-3 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Agregar {selectedUsersToAddToBook.length > 0 ? `(${selectedUsersToAddToBook.length})` : ''}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Permissions Modal */}
      <AnimatePresence>
        {copyPermissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeCopyPermissionsModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                  <Copy className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Copiar Permisos
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona libros de <span style={{ fontWeight: 600 }}>{copyPermissionsModal.sourceUserName}</span> y los usuarios destino.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: '#374151' }}>
                    Libros a copiar
                  </h4>
                  <div className="space-y-2">
                    {(users.find(user => user.id === copyPermissionsModal.sourceUserId)?.bookPermissions || []).map(book => (
                      <button
                        key={book.bookId}
                        onClick={() => toggleBookSelectionForCopy(book.bookId)}
                        className={`
                          w-full p-3 rounded-lg border-2 transition-all text-left
                          ${selectedBooksToCopy.includes(book.bookId)
                            ? 'border-[#3b82f6] bg-[#eff6ff]'
                            : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div style={{ fontWeight: 600, color: '#1f2937' }}>
                              {book.bookName}
                            </div>
                            <div className="text-xs text-[#6b7280] mt-1">
                              Lectura: {book.permissions.read ? 'Sí' : 'No'} | Asistente: {book.permissions.draft ? 'Sí' : 'No'} | Escritura: {book.permissions.write ? 'Sí' : 'No'} | Toma Conoc.: {book.permissions.acknowledge ? 'Sí' : 'No'}
                            </div>
                          </div>
                          {selectedBooksToCopy.includes(book.bookId) && (
                            <Check className="w-4 h-4 text-[#2563eb]" strokeWidth={3} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: '#374151' }}>
                    Usuarios destino
                  </h4>
                  <div className="space-y-2">
                    {users
                      .filter(user => user.id !== copyPermissionsModal.sourceUserId)
                      .map(user => (
                        <button
                          key={user.id}
                          onClick={() => toggleUserSelectionForCopy(user.id)}
                          className={`
                            w-full p-3 rounded-lg border-2 transition-all text-left
                            ${selectedUsersForCopy.includes(user.id)
                              ? 'border-[#3b82f6] bg-[#eff6ff]'
                              : 'border-[#e1e4e8] hover:border-[#d1d5db] bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                                style={{ backgroundColor: user.avatarColor, fontWeight: 600 }}
                              >
                                {user.avatar}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.name}</div>
                                <div className="text-xs text-[#6b7280]">{user.run}</div>
                              </div>
                            </div>
                            {selectedUsersForCopy.includes(user.id) && (
                              <Check className="w-4 h-4 text-[#2563eb]" strokeWidth={3} />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {(selectedBooksToCopy.length > 0 || selectedUsersForCopy.length > 0) && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg text-sm text-[#1d4ed8]">
                  <span style={{ fontWeight: 600 }}>
                    Seleccionados: {selectedBooksToCopy.length} libro(s) y {selectedUsersForCopy.length} usuario(s).
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={closeCopyPermissionsModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={applyCopiedPermissions}
                  disabled={selectedBooksToCopy.length === 0 || selectedUsersForCopy.length === 0}
                  className="flex-1 px-4 py-3 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Copiar permisos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 rounded-lg border border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
              style={{ fontWeight: 600 }}
            >
              Previsualizar cambios
            </button>

            <button
              onClick={handleSaveChanges}
              className="px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm"
              style={{ fontWeight: 600 }}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* Preview Changes Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[88vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl mb-1 flex items-center gap-2" style={{ fontWeight: 600 }}>
                      <Eye className="w-6 h-6" /> Previsualización de Cambios
                    </h3>
                    <p className="text-blue-100">Revisa todos los cambios antes de aplicarlos</p>
                  </div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(88vh-180px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-5">
                    <div className="text-sm text-[#1d4ed8] mb-2" style={{ fontWeight: 600 }}>Usuarios</div>
                    <div className="text-4xl text-[#1d4ed8]" style={{ fontWeight: 700 }}>{changedUsers.length}</div>
                    <div className="text-sm text-[#1d4ed8] mt-1">usuarios modificados</div>
                  </div>
                  <div className="rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] p-5">
                    <div className="text-sm text-[#7c3aed] mb-2" style={{ fontWeight: 600 }}>Libros</div>
                    <div className="text-4xl text-[#7c3aed]" style={{ fontWeight: 700 }}>{impactedBooks.length}</div>
                    <div className="text-sm text-[#7c3aed] mt-1">libros impactados</div>
                  </div>
                  <div className="rounded-xl border border-[#99f6e4] bg-[#ecfeff] p-5">
                    <div className="text-sm text-[#0f766e] mb-2" style={{ fontWeight: 600 }}>Asignaciones</div>
                    <div className="text-4xl text-[#0f766e]" style={{ fontWeight: 700 }}>{previewAssignmentsCount}</div>
                    <div className="text-sm text-[#0f766e] mt-1">asignaciones afectadas</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl mb-3" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Usuarios modificados ({changedUsers.length})
                  </h4>
                  <div className="rounded-xl border border-[#e5e7eb] overflow-hidden">
                    <div className="grid grid-cols-[1fr_1.3fr_1fr] gap-4 px-4 py-3 bg-[#f8fafc] text-sm" style={{ fontWeight: 600, color: '#334155' }}>
                      <div>RUN</div>
                      <div>Nombre</div>
                      <div>Perfil</div>
                    </div>
                    {changedUsers.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-[#64748b]">No hay cambios pendientes.</div>
                    ) : (
                      changedUsers.map(user => (
                        <div key={`preview-user-${user.id}`} className="grid grid-cols-[1fr_1.3fr_1fr] gap-4 px-4 py-3 border-t border-[#f1f5f9] text-sm">
                          <div>{user.run}</div>
                          <div>{user.name}</div>
                          <div>{user.profileName || 'Sin perfil'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-xl mb-3" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Libros ({impactedBooks.length})
                  </h4>
                  <div className="rounded-xl border border-[#e5e7eb] overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-[#f8fafc] text-sm" style={{ fontWeight: 600, color: '#334155' }}>
                      <div>Nombre</div>
                      <div>Estado</div>
                      <div>Lectura</div>
                      <div>Asistente</div>
                      <div>Escritura</div>
                    </div>
                    {impactedBooks.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-[#64748b]">No hay libros impactados.</div>
                    ) : (
                      impactedBooks.map(book => (
                        <div key={`preview-book-${book.id}`} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-t border-[#f1f5f9] text-sm">
                          <div>{book.name}</div>
                          <div>{book.status}</div>
                          <div>{book.read}</div>
                          <div>{book.draft}</div>
                          <div>{book.write}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-end gap-3 bg-white">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f8fafc] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cerrar previsualización
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Guardar cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  confirmModal.type === 'delete-user' || confirmModal.type === 'remove-book' ? 'bg-[#fee2e2]' :
                  confirmModal.type === 'disable-user' || confirmModal.type === 'disable-book' ? 'bg-[#fef3c7]' :
                  confirmModal.type === 'enable-user' || confirmModal.type === 'enable-book' ? 'bg-[#d1fae5]' :
                  'bg-[#fee2e2]'
                }`}>
                  {confirmModal.type === 'delete-user' || confirmModal.type === 'remove-book' ? (
                    <Trash2 className="w-6 h-6 text-[#ef4444]" />
                  ) : confirmModal.type === 'disable-user' || confirmModal.type === 'disable-book' ? (
                    <UserX className="w-6 h-6 text-[#f59e0b]" />
                  ) : confirmModal.type === 'enable-user' || confirmModal.type === 'enable-book' ? (
                    <UserCheck className="w-6 h-6 text-[#10b981]" />
                  ) : (
                    <Trash2 className="w-6 h-6 text-[#ef4444]" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    {confirmModal.type === 'delete-user' && 'Eliminar Usuario'}
                    {confirmModal.type === 'disable-user' && 'Deshabilitar Usuario'}
                    {confirmModal.type === 'enable-user' && 'Habilitar Usuario'}
                    {confirmModal.type === 'remove-book' && 'Quitar Libro'}
                    {confirmModal.type === 'disable-book' && 'Deshabilitar Acceso a Libro'}
                    {confirmModal.type === 'enable-book' && 'Habilitar Acceso a Libro'}
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    {confirmModal.type === 'delete-user' && `¿Estás seguro de que deseas eliminar a ${confirmModal.userName}? Esta acción no se puede deshacer.`}
                    {confirmModal.type === 'disable-user' && `¿Estás seguro de que deseas deshabilitar a ${confirmModal.userName}? El usuario no podrá acceder al sistema.`}
                    {confirmModal.type === 'enable-user' && `¿Estás seguro de que deseas habilitar a ${confirmModal.userName}? El usuario podrá acceder al sistema nuevamente.`}
                    {confirmModal.type === 'remove-book' && `¿Estás seguro de que deseas quitar el libro "${confirmModal.bookName}" de ${confirmModal.userName}?`}
                    {confirmModal.type === 'disable-book' && `¿Estás seguro de que deseas deshabilitar el acceso de ${confirmModal.userName} al libro "${confirmModal.bookName}"?`}
                    {confirmModal.type === 'enable-book' && `¿Estás seguro de que deseas habilitar el acceso de ${confirmModal.userName} al libro "${confirmModal.bookName}"?`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors shadow-sm ${
                    confirmModal.type === 'delete-user' || confirmModal.type === 'remove-book' ? 'bg-[#ef4444] hover:bg-[#dc2626]' :
                    confirmModal.type === 'disable-user' || confirmModal.type === 'disable-book' ? 'bg-[#f59e0b] hover:bg-[#d97706]' :
                    confirmModal.type === 'enable-user' || confirmModal.type === 'enable-book' ? 'bg-[#10b981] hover:bg-[#059669]' :
                    'bg-[#ef4444] hover:bg-[#dc2626]'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {confirmModal.type === 'delete-user' && 'Eliminar'}
                  {confirmModal.type === 'disable-user' && 'Deshabilitar'}
                  {confirmModal.type === 'enable-user' && 'Habilitar'}
                  {confirmModal.type === 'remove-book' && 'Quitar Libro'}
                  {confirmModal.type === 'disable-book' && 'Deshabilitar'}
                  {confirmModal.type === 'enable-book' && 'Habilitar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
