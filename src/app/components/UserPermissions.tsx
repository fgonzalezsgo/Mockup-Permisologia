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

interface UserResourceAccess {
  resourceId: string;
  resourceName: string;
  moduleName: string;
}

interface ResourceGroupView {
  id: string;
  name: string;
  moduleName: string;
}

interface ResourceProfileTemplate {
  id: string;
  name: string;
  permissionIds: string[];
}

type PermissionSet = BookPermission['permissions'];
type HierarchyPermission = 'read' | 'draft' | 'write';

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
  permissionExpiryDate?: string;
  avatar: string;
  avatarColor: string;
  profileId?: string;
  profileName?: string;
  profileIds?: string[];
  profileNames?: string[];
  group: string;
  role: string;
  bookPermissions: BookPermission[];
  resourceProfileIds?: string[];
  resourcePermissions?: UserResourceAccess[];
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

interface BulkCreateAssignmentDetail {
  userName: string;
  bookName: string;
  permissions: PermissionSet;
  note?: string;
}

interface BulkCreateResultModalData {
  createdUsers: number;
  updatedUsers: number;
  appliedAssignments: BulkCreateAssignmentDetail[];
  omittedAssignments: BulkCreateAssignmentDetail[];
}

interface MultiSelectFilterProps {
  label: string;
  allLabel: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const DEFAULT_CARGO_OPTIONS = [
  'Director de proyecto',
  'Jefe de obra',
  'Encargado de obra',
  'Ingeniero de obra',
  'Jefe de calidad',
  'Jefe de vigilancia ambiental',
  'Jefe de seguridad',
  'Jefe de servicios administrativos',
  'Jefe de compras',
  'Subcontratistas/obreros',
  'Topografo/Jefe de topografia'
];

const CONSTRUCTION_COMPANIES = [
  'SalfaCorp',
  'Besalco',
  'Socovesa',
  'Echeverria Izquierdo',
  'Moller y Perez-Cotapos'
];

const normalizeCompanyValue = (value: string) => {
  if (value === 'Mandante') return 'SalfaCorp';
  if (value === 'Contratista') return 'Besalco';
  return value;
};

const parseRolesFromValue = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

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
    group: 'SalfaCorp',
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
    group: 'Besalco',
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
    group: 'Socovesa',
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
    group: 'Echeverria Izquierdo',
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
    group: 'Moller y Perez-Cotapos',
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
const RESOURCE_PROFILES_STORAGE_KEY = 'resource_profiles_v3';
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

const RESOURCE_CATALOG: UserResourceAccess[] = [
  { resourceId: 'solicitudes_contratos', resourceName: 'Solicitudes de Contratos', moduleName: 'Contratos' },
  { resourceId: 'procesos_batch', resourceName: 'Procesos Batch', moduleName: 'Contratos' },
  { resourceId: 'firmas', resourceName: 'Firmas', moduleName: 'Contratos' },
  { resourceId: 'acuerdos', resourceName: 'Acuerdos', moduleName: 'Cobranzas' },
  { resourceId: 'maestros', resourceName: 'Maestros', moduleName: 'Cobranzas' },
  { resourceId: 'cuentas_fecha_ultima_aprobacion', resourceName: 'Cuentas Fecha Última Aprobación', moduleName: 'Cobranzas' },
  { resourceId: 'script_pagos', resourceName: 'Script Pagos', moduleName: 'Cobranzas' },
  { resourceId: 'transacciones_r', resourceName: 'Transacciones (R)', moduleName: 'Cobranzas' },
  { resourceId: 'rechazos_cr', resourceName: 'Rechazos (CR)', moduleName: 'Cobranzas' },
  { resourceId: 'usos', resourceName: 'Usos', moduleName: 'Cobranzas' },
  { resourceId: 'editor_categorias', resourceName: 'Editor Categorías', moduleName: 'Centro de Ayuda' },
  { resourceId: 'editor_preguntas_frecuentes', resourceName: 'Editor Preguntas Frecuentes', moduleName: 'Centro de Ayuda' },
  { resourceId: 'log_aplicacion', resourceName: 'Log de aplicación', moduleName: 'SuperAdministrador' },
  { resourceId: 'mensajes', resourceName: 'Mensajes', moduleName: 'SuperAdministrador' },
  { resourceId: 'reinicio_cache', resourceName: 'Reinicio de Caché', moduleName: 'SuperAdministrador' },
  { resourceId: 'imagen_login', resourceName: 'Imagen de Login', moduleName: 'SuperAdministrador' },
  { resourceId: 'repetir_firma_toma_conocimiento', resourceName: 'Repetir Firma o Toma de Conocimiento', moduleName: 'SuperAdministrador' },
  { resourceId: 'intentos_fallidos', resourceName: 'Intentos Fallidos', moduleName: 'SuperAdministrador' }
];

const RESOURCE_GROUPS: ResourceGroupView[] = [
  { id: 'contratos', name: 'Contratos', moduleName: 'Contratos' },
  { id: 'cobranzas', name: 'Cobranzas', moduleName: 'Cobranzas' },
  { id: 'centro_ayuda', name: 'Centro de Ayuda', moduleName: 'Centro de Ayuda' },
  { id: 'superadministrador', name: 'SuperAdministrador', moduleName: 'SuperAdministrador' }
];

const RESOURCE_PROFILE_BY_PERMISSION_PROFILE: Record<string, string[]> = {
  '1': RESOURCE_CATALOG.map(resource => resource.resourceId),
  '2': RESOURCE_CATALOG.map(resource => resource.resourceId),
  '3': RESOURCE_CATALOG.map(resource => resource.resourceId),
  '4': [
    'solicitudes_contratos',
    'firmas',
    'acuerdos',
    'maestros',
    'transacciones_r',
    'rechazos_cr',
    'usos',
    'editor_preguntas_frecuentes'
  ],
  '5': [
    'solicitudes_contratos',
    'firmas',
    'acuerdos',
    'maestros',
    'transacciones_r',
    'rechazos_cr',
    'usos'
  ],
  '6': [
    'solicitudes_contratos',
    'firmas',
    'editor_preguntas_frecuentes'
  ]
};

const DEFAULT_RESOURCE_PROFILES: ResourceProfileTemplate[] = [
  { id: 'rp-admin', name: 'Administrador', permissionIds: [] },
  { id: 'rp-cobranza', name: 'Cobranza', permissionIds: [] },
  { id: 'rp-controller', name: 'Controller', permissionIds: [] }
];

type UserResourceContext = Pick<UserProfile, 'profileId' | 'profileName' | 'profileIds' | 'profileNames' | 'group' | 'role'>;

const buildResourceList = (resourceIds: string[]): UserResourceAccess[] => {
  const catalogById = new Map(RESOURCE_CATALOG.map(resource => [resource.resourceId, resource]));
  return Array.from(new Set(resourceIds))
    .map(resourceId => catalogById.get(resourceId))
    .filter((resource): resource is UserResourceAccess => !!resource);
};

const resolveResourceIdsForProfile = (profile: ResourceProfileTemplate): string[] => {
  if (profile.permissionIds.length > 0) return profile.permissionIds;

  const normalizedName = profile.name.toLowerCase();
  if (normalizedName.includes('admin')) {
    return RESOURCE_CATALOG.map(resource => resource.resourceId);
  }
  if (normalizedName.includes('cobranza')) {
    return RESOURCE_CATALOG
      .filter(resource => resource.moduleName === 'Cobranzas')
      .map(resource => resource.resourceId);
  }
  if (normalizedName.includes('controller')) {
    return RESOURCE_CATALOG
      .filter(resource => resource.moduleName === 'Cobranzas' || resource.moduleName === 'Contratos')
      .map(resource => resource.resourceId);
  }

  return [];
};

const buildResourcesFromResourceProfiles = (
  selectedProfileIds: string[],
  resourceProfilesCatalog: ResourceProfileTemplate[]
): UserResourceAccess[] => {
  if (selectedProfileIds.length === 0) return [];

  const profileById = new Map(resourceProfilesCatalog.map(profile => [profile.id, profile]));
  const resourceIds = selectedProfileIds.flatMap(profileId => {
    const profile = profileById.get(profileId);
    return profile ? resolveResourceIdsForProfile(profile) : [];
  });
  return buildResourceList(resourceIds);
};

const getDefaultResourcesForUser = (user: UserResourceContext): UserResourceAccess[] => {
  const selectedProfileIds = (user.profileIds && user.profileIds.length > 0)
    ? user.profileIds
    : user.profileId
      ? [user.profileId]
      : [];

  if (selectedProfileIds.length > 0) {
    const profileResourceIds = selectedProfileIds.flatMap(profileId => RESOURCE_PROFILE_BY_PERMISSION_PROFILE[profileId] || []);
    if (profileResourceIds.length > 0) {
      return buildResourceList(profileResourceIds);
    }
  }

  const selectedProfileNames = (user.profileNames && user.profileNames.length > 0)
    ? user.profileNames
    : user.profileName
      ? [user.profileName]
      : [];
  const normalizedNames = selectedProfileNames.map(name => name.toLowerCase());

  if (normalizedNames.some(name => name.includes('admin'))) {
    return [...RESOURCE_CATALOG];
  }
  if (normalizedNames.some(name => name.includes('consultor'))) {
    return buildResourceList(RESOURCE_PROFILE_BY_PERMISSION_PROFILE['4']);
  }
  if (normalizedNames.some(name => name.includes('visualizador'))) {
    return buildResourceList(RESOURCE_PROFILE_BY_PERMISSION_PROFILE['6']);
  }
  return [];
};

const ensureUserResources = (user: UserProfile): UserProfile => ({
  ...user,
  profileIds: (user.profileIds && user.profileIds.length > 0)
    ? user.profileIds
    : user.profileId
      ? [user.profileId]
      : [],
  profileNames: (user.profileNames && user.profileNames.length > 0)
    ? user.profileNames
    : user.profileName
      ? [user.profileName]
      : [],
  resourceProfileIds: user.resourceProfileIds || [],
  resourcePermissions: (user.resourcePermissions && user.resourcePermissions.length > 0)
    ? user.resourcePermissions
    : getDefaultResourcesForUser(user)
});

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

const loadStoredResourceProfiles = (): ResourceProfileTemplate[] => {
  try {
    const raw = localStorage.getItem(RESOURCE_PROFILES_STORAGE_KEY);
    if (!raw) return DEFAULT_RESOURCE_PROFILES;
    const parsed = JSON.parse(raw) as { profiles?: Array<{ id: string; name: string; permissionIds?: string[] }> };
    const profiles = parsed?.profiles;
    if (!Array.isArray(profiles) || profiles.length === 0) return DEFAULT_RESOURCE_PROFILES;

    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      permissionIds: Array.isArray(profile.permissionIds) ? profile.permissionIds : []
    }));
  } catch {
    return DEFAULT_RESOURCE_PROFILES;
  }
};

export function UserPermissions() {
  const [users, setUsers] = useState<UserProfile[]>(() =>
    applyMaestroPermissionRuleToUsers(loadStoredUsers())
      .map(user => ({ ...user, group: normalizeCompanyValue(user.group) }))
      .map(ensureUserResources)
  );
  const [savedUsersSnapshot, setSavedUsersSnapshot] = useState<UserProfile[]>(() =>
    applyMaestroPermissionRuleToUsers(loadStoredUsers())
      .map(user => ({ ...user, group: normalizeCompanyValue(user.group) }))
      .map(ensureUserResources)
  );
  const [profilesCatalog, setProfilesCatalog] = useState<ProfileTemplate[]>(() => loadStoredProfiles());
  const [resourceProfilesCatalog, setResourceProfilesCatalog] = useState<ResourceProfileTemplate[]>(() => loadStoredResourceProfiles());
  const [booksCatalog, setBooksCatalog] = useState<Array<{ id: string; name: string }>>(() => loadStoredBooks());
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [expandedUserSections, setExpandedUserSections] = useState<Record<string, { resources: boolean; books: boolean }>>({});
  const [expandedResourceGroupsByUser, setExpandedResourceGroupsByUser] = useState<Record<string, string[]>>({});
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);
  const [expandedResources, setExpandedResources] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilters, setGroupFilters] = useState<string[]>([]);
  const [bookFilters, setBookFilters] = useState<string[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [permissionFilters, setPermissionFilters] = useState<Array<keyof PermissionSet>>([]);
  const [profileFilters, setProfileFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'users' | 'books' | 'resources'>('users');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isQuickCreateUserModalOpen, setIsQuickCreateUserModalOpen] = useState(false);
  const [bulkCreateRunInput, setBulkCreateRunInput] = useState('');
  const [bulkCreateUsers, setBulkCreateUsers] = useState<BulkCreateDraftUser[]>([]);
  const [editingBulkCreateUserId, setEditingBulkCreateUserId] = useState<string | null>(null);
  const [selectedBooksForBulkCreate, setSelectedBooksForBulkCreate] = useState<string[]>([]);
  const [bulkCreateBookPermissions, setBulkCreateBookPermissions] = useState<Record<string, PermissionSet>>({});
  const [bulkCreateBooksOpen, setBulkCreateBooksOpen] = useState(false);
  const [bulkCreateBooksSearch, setBulkCreateBooksSearch] = useState('');
  const [showBulkCreatePreviewModal, setShowBulkCreatePreviewModal] = useState(false);
  const [bulkCreateResultModal, setBulkCreateResultModal] = useState<BulkCreateResultModalData | null>(null);
  const bulkCreateBooksRef = useRef<HTMLDivElement | null>(null);
  const [editForm, setEditForm] = useState({
    group: '',
    role: '',
    profileIds: [] as string[],
    profileNames: [] as string[],
    permissionExpiryDate: '',
    resourceProfileIds: [] as string[]
  });
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([]);
  const [editCustomRoles, setEditCustomRoles] = useState<string[]>([]);
  const [isEditRolesDropdownOpen, setIsEditRolesDropdownOpen] = useState(false);
  const [editRoleSearch, setEditRoleSearch] = useState('');
  const [isEditResourceProfilesDropdownOpen, setIsEditResourceProfilesDropdownOpen] = useState(false);
  const [editResourceProfilesSearch, setEditResourceProfilesSearch] = useState('');
  const [isEditProfilesDropdownOpen, setIsEditProfilesDropdownOpen] = useState(false);
  const [editProfilesSearch, setEditProfilesSearch] = useState('');
  const [editProfilesWarning, setEditProfilesWarning] = useState('');
  const editRolesDropdownRef = useRef<HTMLDivElement | null>(null);
  const editResourceProfilesDropdownRef = useRef<HTMLDivElement | null>(null);
  const editProfilesDropdownRef = useRef<HTMLDivElement | null>(null);
  const [quickCreateForm, setQuickCreateForm] = useState({
    run: '',
    name: '',
    email: '',
    group: '',
    role: '',
    profileIds: [] as string[],
    profileNames: [] as string[],
    permissionExpiryDate: ''
  });
  const [isQuickProfilesDropdownOpen, setIsQuickProfilesDropdownOpen] = useState(false);
  const [quickProfilesSearch, setQuickProfilesSearch] = useState('');
  const [quickProfilesWarning, setQuickProfilesWarning] = useState('');
  const quickProfilesDropdownRef = useRef<HTMLDivElement | null>(null);
  const [addBooksModal, setAddBooksModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedBooksToAdd, setSelectedBooksToAdd] = useState<string[]>([]);
  const [addResourcesModal, setAddResourcesModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedResourcesToAdd, setSelectedResourcesToAdd] = useState<string[]>([]);
  const [expandedResourceModulesInAddModal, setExpandedResourceModulesInAddModal] = useState<string[]>([]);
  const [resourceSearchInAddModal, setResourceSearchInAddModal] = useState('');
  const [addUsersToBookModal, setAddUsersToBookModal] = useState<{ bookId: string; bookName: string } | null>(null);
  const [selectedUsersToAddToBook, setSelectedUsersToAddToBook] = useState<string[]>([]);
  const [isBulkPermissionEditorOpen, setIsBulkPermissionEditorOpen] = useState(false);
  const [bulkPermissionDraftUsers, setBulkPermissionDraftUsers] = useState<UserProfile[] | null>(null);
  const [bulkPermissionSelectedUserIds, setBulkPermissionSelectedUserIds] = useState<string[]>([]);
  const [bulkPermissionSelectedBookIds, setBulkPermissionSelectedBookIds] = useState<string[]>([]);
  const [bulkPermissionUserSearch, setBulkPermissionUserSearch] = useState('');
  const [bulkPermissionBookSearch, setBulkPermissionBookSearch] = useState('');
  const [bulkPermissionUsersDropdownOpen, setBulkPermissionUsersDropdownOpen] = useState(false);
  const [bulkPermissionBooksDropdownOpen, setBulkPermissionBooksDropdownOpen] = useState(false);
  const [bulkPermissionMassAction, setBulkPermissionMassAction] = useState<'add' | 'remove'>('add');
  const [bulkPermissionMassSelectedPermission, setBulkPermissionMassSelectedPermission] = useState<HierarchyPermission | ''>('');
  const bulkPermissionUsersDropdownRef = useRef<HTMLDivElement | null>(null);
  const bulkPermissionBooksDropdownRef = useRef<HTMLDivElement | null>(null);
  const [copyPermissionsModal, setCopyPermissionsModal] = useState<{ sourceUserId: string; sourceUserName: string } | null>(null);
  const [selectedBooksToCopy, setSelectedBooksToCopy] = useState<string[]>([]);
  const [selectedResourcesToCopy, setSelectedResourcesToCopy] = useState<string[]>([]);
  const [selectedUsersForCopy, setSelectedUsersForCopy] = useState<string[]>([]);
  const [copyBooksSearch, setCopyBooksSearch] = useState('');
  const [copyResourcesSearch, setCopyResourcesSearch] = useState('');
  const [copyUsersSearch, setCopyUsersSearch] = useState('');
  const [isCopyBooksDropdownOpen, setIsCopyBooksDropdownOpen] = useState(false);
  const [isCopyResourcesDropdownOpen, setIsCopyResourcesDropdownOpen] = useState(false);
  const [isCopyUsersDropdownOpen, setIsCopyUsersDropdownOpen] = useState(false);
  const [expandedCopyResourceModules, setExpandedCopyResourceModules] = useState<string[]>([]);
  const [isCopyPreviewModalOpen, setIsCopyPreviewModalOpen] = useState(false);
  const copyBooksDropdownRef = useRef<HTMLDivElement | null>(null);
  const copyResourcesDropdownRef = useRef<HTMLDivElement | null>(null);
  const copyUsersDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [permissionsSummaryModalUserId, setPermissionsSummaryModalUserId] = useState<string | null>(null);
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
    bookData: Array<{ id: string; name: string }>,
    resourceProfileData: ResourceProfileTemplate[]
  ) => {
    const profileById = new Map(profileData.map(profile => [profile.id, profile]));
    const bookNameById = new Map(bookData.map(book => [book.id, book.name]));
    const catalogBookIds = new Set(bookData.map(book => book.id));
    const toLevel = (permissions: PermissionSet) => {
      if (permissions.write) return 2;
      if (permissions.draft) return 1;
      if (permissions.read) return 0;
      return -1;
    };
    const fromLevel = (level: number, acknowledge: boolean): PermissionSet => ({
      read: level >= 0,
      draft: level >= 1,
      write: level >= 2,
      acknowledge
    });

    return inputUsers.map(user => {
      const selectedProfileIds = (user.profileIds && user.profileIds.length > 0)
        ? user.profileIds
        : user.profileId
          ? [user.profileId]
          : [];
      const selectedProfiles = selectedProfileIds
        .map(profileId => profileById.get(profileId))
        .filter((profile): profile is ProfileTemplate => !!profile);
      const selectedProfileNames = selectedProfiles.map(profile => profile.name);

      if (selectedProfiles.length === 0) {
        const resourcesFromProfiles = buildResourcesFromResourceProfiles(user.resourceProfileIds || [], resourceProfileData);
        const hasSelectedResourceProfiles = (user.resourceProfileIds || []).length > 0;
        return {
          ...user,
          profileId: '',
          profileName: '',
          profileIds: [],
          profileNames: [],
          resourceProfileIds: user.resourceProfileIds || [],
          resourcePermissions: hasSelectedResourceProfiles
            ? resourcesFromProfiles
            : (user.resourcePermissions && user.resourcePermissions.length > 0)
              ? user.resourcePermissions
              : getDefaultResourcesForUser(user),
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
      const profileBooksById = new Map<string, BookPermission>();
      selectedProfiles.forEach(profile => {
        profile.bookPermissions.forEach(book => {
          const existing = userBooksById.get(book.bookId);
          const bookName = bookNameById.get(book.bookId) || existing?.bookName || `Libro ${book.bookId}`;
          const normalized = sanitizePermissionsForBook(book.bookId, bookName, { ...book.permissions });
          const current = profileBooksById.get(book.bookId);
          if (!current) {
            profileBooksById.set(book.bookId, {
              bookId: book.bookId,
              bookName,
              permissions: normalized,
              disabled: existing?.disabled,
              isCustom: false
            });
            return;
          }
          const mergedLevel = Math.max(toLevel(current.permissions), toLevel(normalized));
          profileBooksById.set(book.bookId, {
            ...current,
            permissions: fromLevel(mergedLevel, current.permissions.acknowledge || normalized.acknowledge)
          });
        });
      });
      const profileBooks = Array.from(profileBooksById.values());
      const profileBookIds = new Set(profileBooks.map(book => book.bookId));

      const extraBooks = user.bookPermissions
        .filter(book => !profileBookIds.has(book.bookId))
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

      const resourcesFromProfiles = buildResourcesFromResourceProfiles(user.resourceProfileIds || [], resourceProfileData);
      const hasSelectedResourceProfiles = (user.resourceProfileIds || []).length > 0;
      return {
        ...user,
        profileId: selectedProfileIds[0] || '',
        profileName: selectedProfileNames.join(', '),
        profileIds: selectedProfileIds,
        profileNames: selectedProfileNames,
        resourceProfileIds: user.resourceProfileIds || [],
        resourcePermissions: hasSelectedResourceProfiles
          ? resourcesFromProfiles
          : (user.resourcePermissions && user.resourcePermissions.length > 0)
            ? user.resourcePermissions
            : getDefaultResourcesForUser({
                ...user,
                profileId: selectedProfileIds[0] || '',
                profileName: selectedProfileNames.join(', '),
                profileIds: selectedProfileIds,
                profileNames: selectedProfileNames
              }),
        bookPermissions: [...profileBooks, ...extraBooks]
      };
    });
  };

  useEffect(() => {
    const syncFromSharedConfig = () => {
      const latestProfiles = loadStoredProfiles();
      const latestBooks = loadStoredBooks();
      const latestResourceProfiles = loadStoredResourceProfiles();
      setProfilesCatalog(latestProfiles);
      setBooksCatalog(latestBooks);
      setResourceProfilesCatalog(latestResourceProfiles);
      setUsers(prev =>
        alignUsersWithSharedConfig(prev, latestProfiles, latestBooks, latestResourceProfiles)
          .map(user => ({ ...user, group: normalizeCompanyValue(user.group) }))
      );
      setSavedUsersSnapshot(prev =>
        alignUsersWithSharedConfig(prev, latestProfiles, latestBooks, latestResourceProfiles)
          .map(user => ({ ...user, group: normalizeCompanyValue(user.group) }))
      );
    };

    syncFromSharedConfig();
    window.addEventListener(PERMISSIONS_CONFIG_UPDATED_EVENT, syncFromSharedConfig);

    return () => {
      window.removeEventListener(PERMISSIONS_CONFIG_UPDATED_EVENT, syncFromSharedConfig);
    };
  }, []);

  const toggleUser = (userId: string) => {
    setExpandedUsers(prev => {
      const isCurrentlyExpanded = prev.includes(userId);
      const next = isCurrentlyExpanded
        ? prev.filter(id => id !== userId)
        : [...prev, userId];

      if (!isCurrentlyExpanded) {
        setExpandedUserSections(current => ({
          ...current,
          [userId]: current[userId] || { resources: false, books: false }
        }));
        setExpandedResourceGroupsByUser(current => ({
          ...current,
          [userId]: current[userId] || []
        }));
      }

      return next;
    });
  };

  const toggleUserSection = (userId: string, section: 'resources' | 'books') => {
    setExpandedUserSections(prev => ({
      ...prev,
      [userId]: {
        resources: prev[userId]?.resources ?? false,
        books: prev[userId]?.books ?? false,
        [section]: !(prev[userId]?.[section] ?? false)
      }
    }));
  };

  const toggleUserResourceGroup = (userId: string, groupId: string) => {
    setExpandedResourceGroupsByUser(prev => {
      const currentGroups = prev[userId] || [];
      const nextGroups = currentGroups.includes(groupId)
        ? currentGroups.filter(id => id !== groupId)
        : [...currentGroups, groupId];
      return {
        ...prev,
        [userId]: nextGroups
      };
    });
  };

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const toggleResource = (resourceId: string) => {
    setExpandedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const getSelectedPermissionProfileIds = (user: UserProfile) =>
    (user.profileIds && user.profileIds.length > 0)
      ? user.profileIds
      : user.profileId
        ? [user.profileId]
        : [];

  const resolveSelectedProfiles = (profileIds: string[]) =>
    profileIds
      .map(profileId => profilesCatalog.find(profile => profile.id === profileId))
      .filter((profile): profile is ProfileTemplate => !!profile);

  const normalizeProfileLabel = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const getPermissionProfileFamily = (profileName: string): 'mandante' | 'consultor' | null => {
    const normalized = normalizeProfileLabel(profileName);
    if (normalized === 'administrador mandante' || normalized === 'administrador mandante subrogante') return 'mandante';
    if (normalized === 'consultor' || normalized === 'consultor subrogante') return 'consultor';
    return null;
  };

  const hasForbiddenPermissionProfileMix = (profileIds: string[]) => {
    const families = resolveSelectedProfiles(profileIds)
      .map(profile => getPermissionProfileFamily(profile.name))
      .filter((family): family is 'mandante' | 'consultor' => !!family);
    return families.includes('mandante') && families.includes('consultor');
  };

  const togglePermissionProfileWithValidation = (
    currentProfileIds: string[],
    profileId: string
  ) => {
    const alreadySelected = currentProfileIds.includes(profileId);
    if (alreadySelected) {
      return {
        profileIds: currentProfileIds.filter(id => id !== profileId),
        warning: ''
      };
    }

    const nextProfileIds = [...currentProfileIds, profileId];
    if (hasForbiddenPermissionProfileMix(nextProfileIds)) {
      return {
        profileIds: currentProfileIds,
        warning: 'No se puede combinar un Perfil Mandante con un Perfil Consultor.'
      };
    }

    return {
      profileIds: nextProfileIds,
      warning: ''
    };
  };

  const openEditModal = (user: UserProfile) => {
    const parsedRoles = parseRolesFromValue(user.role);
    const selectedProfileIds = (user.profileIds && user.profileIds.length > 0)
      ? user.profileIds
      : user.profileId
        ? [user.profileId]
        : [];
    const selectedProfileNames = selectedProfileIds
      .map(profileId => profilesCatalog.find(profile => profile.id === profileId)?.name)
      .filter((name): name is string => !!name);
    setEditingUser(user.id);
    setEditForm({
      group: user.group,
      role: parsedRoles.join(', '),
      profileIds: selectedProfileIds,
      profileNames: selectedProfileNames,
      permissionExpiryDate: user.permissionExpiryDate || '',
      resourceProfileIds: user.resourceProfileIds || []
    });
    setEditSelectedRoles(parsedRoles);
    setEditRoleSearch('');
    setEditProfilesSearch('');
    setEditProfilesWarning('');
    setEditResourceProfilesSearch('');
    setIsEditRolesDropdownOpen(false);
    setIsEditProfilesDropdownOpen(false);
    setIsEditResourceProfilesDropdownOpen(false);
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

  const openQuickCreateUserModal = () => {
    setQuickCreateForm({
      run: '',
      name: '',
      email: '',
      group: '',
      role: '',
      profileIds: [],
      profileNames: [],
      permissionExpiryDate: ''
    });
    setQuickProfilesSearch('');
    setQuickProfilesWarning('');
    setIsQuickProfilesDropdownOpen(false);
    setIsQuickCreateUserModalOpen(true);
  };

  const closeQuickCreateUserModal = () => {
    setIsQuickCreateUserModalOpen(false);
    setQuickCreateForm({
      run: '',
      name: '',
      email: '',
      group: '',
      role: '',
      profileIds: [],
      profileNames: [],
      permissionExpiryDate: ''
    });
    setQuickProfilesSearch('');
    setQuickProfilesWarning('');
    setIsQuickProfilesDropdownOpen(false);
  };

  const createSingleUser = () => {
    const normalizedRun = quickCreateForm.run.trim().toLowerCase();
    if (!normalizedRun) {
      window.alert('Ingresa un RUT para crear el usuario.');
      return;
    }
    if (users.some(user => user.run.trim().toLowerCase() === normalizedRun)) {
      window.alert('El RUT ingresado ya existe en el sistema.');
      return;
    }
    if (!quickCreateForm.name.trim() || !quickCreateForm.email.trim() || !quickCreateForm.group || !quickCreateForm.role.trim()) {
      window.alert('Completa nombre, email, empresa y cargo para continuar.');
      return;
    }

    const selectedProfiles = quickCreateForm.profileIds
      .map(profileId => profilesCatalog.find(profile => profile.id === profileId))
      .filter((profile): profile is ProfileTemplate => !!profile);
    const selectedProfileNames = selectedProfiles.map(profile => profile.name);
    const bookNameById = new Map(booksCatalog.map(book => [book.id, book.name]));
    const avatarColorPalette = ['#4f46e5', '#2563eb', '#0ea5e9', '#0891b2', '#0f766e', '#059669', '#ca8a04', '#b45309'];

    const nextId = String(users.reduce((max, user) => {
      const parsed = Number.parseInt(user.id, 10);
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0) + 1);

    const profileBooksMap = new Map<string, BookPermission>();
    selectedProfiles.forEach(profile => {
      profile.bookPermissions.forEach(book => {
        const bookName = bookNameById.get(book.bookId) || `Libro ${book.bookId}`;
        const normalized = sanitizePermissionsForBook(book.bookId, bookName, normalizePermissionsByHierarchy({ ...book.permissions }));
        const existing = profileBooksMap.get(book.bookId);
        if (!existing) {
          profileBooksMap.set(book.bookId, {
            bookId: book.bookId,
            bookName,
            permissions: normalized,
            isCustom: false
          });
          return;
        }
        const existingLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(existing.permissions));
        const incomingLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(normalized));
        const mergedLevel = Math.max(existingLevel, incomingLevel);
        profileBooksMap.set(book.bookId, {
          ...existing,
          permissions: buildPermissionsFromHierarchyLevel(
            mergedLevel,
            existing.permissions.acknowledge || normalized.acknowledge
          )
        });
      });
    });
    const profileBooks = Array.from(profileBooksMap.values());

    const newUser: UserProfile = {
      id: nextId,
      name: quickCreateForm.name.trim(),
      run: quickCreateForm.run.trim(),
      email: quickCreateForm.email.trim(),
      permissionExpiryDate: quickCreateForm.permissionExpiryDate || undefined,
      avatar: quickCreateForm.name.trim().charAt(0).toUpperCase() || 'U',
      avatarColor: avatarColorPalette[users.length % avatarColorPalette.length],
      profileId: quickCreateForm.profileIds[0] || '',
      profileName: selectedProfileNames.join(', '),
      profileIds: quickCreateForm.profileIds,
      profileNames: selectedProfileNames,
      group: quickCreateForm.group,
      role: quickCreateForm.role.trim(),
      hasCustomPermissions: false,
      disabled: false,
      bookPermissions: profileBooks,
      resourceProfileIds: [],
      resourcePermissions: getDefaultResourcesForUser({
        profileId: quickCreateForm.profileIds[0] || '',
        profileName: selectedProfileNames.join(', '),
        profileIds: quickCreateForm.profileIds,
        profileNames: selectedProfileNames,
        group: quickCreateForm.group,
        role: quickCreateForm.role.trim()
      })
    };

    setUsers(prev => [...prev, newUser]);
    closeQuickCreateUserModal();
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bulkPermissionUsersDropdownRef.current && !bulkPermissionUsersDropdownRef.current.contains(target)) {
        setBulkPermissionUsersDropdownOpen(false);
      }
      if (bulkPermissionBooksDropdownRef.current && !bulkPermissionBooksDropdownRef.current.contains(target)) {
        setBulkPermissionBooksDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (editRolesDropdownRef.current && !editRolesDropdownRef.current.contains(target)) {
        setIsEditRolesDropdownOpen(false);
      }
      if (editProfilesDropdownRef.current && !editProfilesDropdownRef.current.contains(target)) {
        setIsEditProfilesDropdownOpen(false);
      }
      if (editResourceProfilesDropdownRef.current && !editResourceProfilesDropdownRef.current.contains(target)) {
        setIsEditResourceProfilesDropdownOpen(false);
      }
      if (quickProfilesDropdownRef.current && !quickProfilesDropdownRef.current.contains(target)) {
        setIsQuickProfilesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (copyBooksDropdownRef.current && !copyBooksDropdownRef.current.contains(target)) {
        setIsCopyBooksDropdownOpen(false);
      }
      if (copyResourcesDropdownRef.current && !copyResourcesDropdownRef.current.contains(target)) {
        setIsCopyResourcesDropdownOpen(false);
      }
      if (copyUsersDropdownRef.current && !copyUsersDropdownRef.current.contains(target)) {
        setIsCopyUsersDropdownOpen(false);
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
      window.alert('Completa nombre, empresa y cargo para continuar.');
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
      window.alert('Hay usuarios pendientes sin datos. Presiona "Crear Especialista" y completa nombre, empresa y cargo.');
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
    const appliedAssignments: BulkCreateAssignmentDetail[] = [];
    const omittedAssignments: BulkCreateAssignmentDetail[] = [];

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
              omittedAssignments.push({
                userName: draftUser.name.trim(),
                bookName,
                permissions: requestedPermissions,
                note: 'Conflicto con permisos heredados del perfil'
              });
            }
            return null;
          }

          appliedAssignments.push({
            userName: draftUser.name.trim(),
            bookName,
            permissions: requestedPermissions,
            note: 'Asignado'
          });

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
        bookPermissions: assignedBooks,
        resourceProfileIds: [],
        resourcePermissions: getDefaultResourcesForUser({
          profileId: draftUser.profileId,
          profileName: draftUser.profileName,
          group: draftUser.group,
          role: draftUser.role.trim()
        })
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
            omittedAssignments.push({
              userName: user.name,
              bookName,
              permissions: requestedPermissions,
              note: 'Conflicto con permisos heredados del perfil'
            });
          }
          return;
        }

        const existingBook = currentBooksById.get(bookId);
        appliedAssignments.push({
          userName: user.name,
          bookName,
          permissions: requestedPermissions,
          note: existingBook ? 'Permisos actualizados' : 'Libro asignado'
        });
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
    setBulkCreateResultModal({
      createdUsers: createdUsers.length,
      updatedUsers: existingUsersDraft.length,
      appliedAssignments,
      omittedAssignments
    });
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
      profileIds: [],
      profileNames: [],
      permissionExpiryDate: '',
      resourceProfileIds: []
    });
    setEditSelectedRoles([]);
    setEditRoleSearch('');
    setEditProfilesSearch('');
    setEditProfilesWarning('');
    setEditResourceProfilesSearch('');
    setIsEditRolesDropdownOpen(false);
    setIsEditProfilesDropdownOpen(false);
    setIsEditResourceProfilesDropdownOpen(false);
  };

  const setEditRoles = (roles: string[]) => {
    const normalized = Array.from(new Set(roles.map(role => role.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
    setEditSelectedRoles(normalized);
    setEditForm(prev => ({
      ...prev,
      role: normalized.join(', ')
    }));
  };

  const toggleEditRole = (role: string) => {
    if (editSelectedRoles.includes(role)) {
      setEditRoles(editSelectedRoles.filter(item => item !== role));
      return;
    }
    setEditRoles([...editSelectedRoles, role]);
  };

  const toggleSelectAllFilteredEditRoles = () => {
    if (filteredEditRoleOptions.length === 0) return;
    if (allFilteredEditRolesSelected) {
      setEditRoles(editSelectedRoles.filter(role => !filteredEditRoleOptions.includes(role)));
      return;
    }
    setEditRoles([...editSelectedRoles, ...filteredEditRoleOptions]);
  };

  const toggleSelectAllFilteredEditResourceProfiles = () => {
    if (filteredEditResourceProfiles.length === 0) return;
    if (allFilteredEditResourceProfilesSelected) {
      setEditForm(prev => ({
        ...prev,
        resourceProfileIds: prev.resourceProfileIds.filter(id => !filteredEditResourceProfiles.some(profile => profile.id === id))
      }));
      return;
    }
    setEditForm(prev => ({
      ...prev,
      resourceProfileIds: Array.from(new Set([
        ...prev.resourceProfileIds,
        ...filteredEditResourceProfiles.map(profile => profile.id)
      ]))
    }));
  };

  const createEditCargo = () => {
    const newCargo = window.prompt('Ingrese el nombre del nuevo cargo');
    if (!newCargo) return;
    const normalized = newCargo.trim();
    if (!normalized) return;

    const existsInCatalog = editRoleOptions.some(role => role.toLowerCase() === normalized.toLowerCase());
    if (!existsInCatalog) {
      setEditCustomRoles(prev => [...prev, normalized]);
    }
    if (!editSelectedRoles.some(role => role.toLowerCase() === normalized.toLowerCase())) {
      setEditRoles([...editSelectedRoles, normalized]);
    }
  };

  const toggleEditResourceProfile = (resourceProfileId: string) => {
    setEditForm(prev => ({
      ...prev,
      resourceProfileIds: prev.resourceProfileIds.includes(resourceProfileId)
        ? prev.resourceProfileIds.filter(id => id !== resourceProfileId)
        : [...prev.resourceProfileIds, resourceProfileId]
    }));
  };

  const toggleQuickPermissionProfile = (profileId: string) => {
    const result = togglePermissionProfileWithValidation(quickCreateForm.profileIds, profileId);
    const selectedProfiles = resolveSelectedProfiles(result.profileIds);
    setQuickCreateForm(prev => ({
      ...prev,
      profileIds: result.profileIds,
      profileNames: selectedProfiles.map(profile => profile.name)
    }));
    setQuickProfilesWarning(result.warning);
  };

  const toggleEditPermissionProfile = (profileId: string) => {
    const result = togglePermissionProfileWithValidation(editForm.profileIds, profileId);
    const selectedProfiles = resolveSelectedProfiles(result.profileIds);
    setEditForm(prev => ({
      ...prev,
      profileIds: result.profileIds,
      profileNames: selectedProfiles.map(profile => profile.name)
    }));
    setEditProfilesWarning(result.warning);
  };

  const saveUserChanges = () => {
    if (!editingUser) return;
    const selectedRolesValue = editSelectedRoles.join(', ');

    const selectedProfiles = editForm.profileIds
      .map(profileId => profilesCatalog.find(profile => profile.id === profileId))
      .filter((profile): profile is ProfileTemplate => !!profile);
    const selectedProfileNames = selectedProfiles.map(profile => profile.name);
    const bookNameById = new Map(booksCatalog.map(book => [book.id, book.name]));
    const selectedResourcesFromProfiles = buildResourcesFromResourceProfiles(editForm.resourceProfileIds, resourceProfilesCatalog);
    const hasSelectedResourceProfiles = editForm.resourceProfileIds.length > 0;
    const mergedProfileBooks = (() => {
      const map = new Map<string, BookPermission>();
      selectedProfiles.forEach(profile => {
        profile.bookPermissions.forEach(book => {
          const bookName = bookNameById.get(book.bookId) || `Libro ${book.bookId}`;
          const normalized = sanitizePermissionsForBook(book.bookId, bookName, normalizePermissionsByHierarchy({ ...book.permissions }));
          const existing = map.get(book.bookId);
          if (!existing) {
            map.set(book.bookId, {
              bookId: book.bookId,
              bookName,
              permissions: normalized,
              isCustom: false
            });
            return;
          }
          const existingLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(existing.permissions));
          const incomingLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(normalized));
          const mergedLevel = Math.max(existingLevel, incomingLevel);
          map.set(book.bookId, {
            ...existing,
            permissions: buildPermissionsFromHierarchyLevel(
              mergedLevel,
              existing.permissions.acknowledge || normalized.acknowledge
            )
          });
        });
      });
      return Array.from(map.values());
    })();

    setUsers(prev => prev.map(user =>
      user.id === editingUser
        ? {
            ...user,
            group: editForm.group,
            role: selectedRolesValue,
            permissionExpiryDate: editForm.permissionExpiryDate || undefined,
            profileId: editForm.profileIds[0] || '',
            profileName: selectedProfileNames.join(', '),
            profileIds: editForm.profileIds,
            profileNames: selectedProfileNames,
            resourceProfileIds: editForm.resourceProfileIds,
            resourcePermissions: hasSelectedResourceProfiles
              ? selectedResourcesFromProfiles
              : getDefaultResourcesForUser({
                  profileId: editForm.profileIds[0] || '',
                  profileName: selectedProfileNames.join(', '),
                  profileIds: editForm.profileIds,
                  profileNames: selectedProfileNames,
                  group: editForm.group,
                  role: selectedRolesValue
                }),
            bookPermissions: mergedProfileBooks.length > 0
              ? mergedProfileBooks
              : user.bookPermissions
          }
        : user
    ));

    closeEditModal();
  };

  const getProfileBookPermissions = (profileIds: string[], bookId: string) => {
    let merged: PermissionSet | undefined;
    const bookName = booksCatalog.find(book => book.id === bookId)?.name || `Libro ${bookId}`;

    profileIds.forEach(profileId => {
      const profile = profilesCatalog.find(p => p.id === profileId);
      const permissions = profile?.bookPermissions.find(book => book.bookId === bookId)?.permissions;
      if (!permissions) return;
      const normalized = sanitizePermissionsForBook(bookId, bookName, normalizePermissionsByHierarchy(permissions));

      if (!merged) {
        merged = normalized;
        return;
      }

      const mergedLevel = Math.max(
        getPermissionHierarchyLevel(normalizePermissionsByHierarchy(merged)),
        getPermissionHierarchyLevel(normalizePermissionsByHierarchy(normalized))
      );
      merged = buildPermissionsFromHierarchyLevel(mergedLevel, merged.acknowledge || normalized.acknowledge);
    });

    return merged;
  };

  const hasSamePermissions = (a: PermissionSet, b: PermissionSet) => (
    a.read === b.read &&
    a.draft === b.draft &&
    a.write === b.write &&
    a.acknowledge === b.acknowledge
  );

  const isBookPermissionException = (user: UserProfile, book: BookPermission) => {
    const selectedProfileIds = getSelectedPermissionProfileIds(user);
    if (selectedProfileIds.length === 0) return !!book.isCustom;

    const profilePermissions = getProfileBookPermissions(selectedProfileIds, book.bookId);
    if (!profilePermissions) return true;

    return !hasSamePermissions(book.permissions, profilePermissions);
  };

  const hasUserPermissionExceptions = (user: UserProfile) => {
    const selectedProfiles = resolveSelectedProfiles(getSelectedPermissionProfileIds(user));
    if (selectedProfiles.length === 0) return user.bookPermissions.some(book => !!book.isCustom);

    const profileBookIds = new Set(selectedProfiles.flatMap(profile => profile.bookPermissions.map(book => book.bookId)));
    const userBookIds = new Set(user.bookPermissions.map(book => book.bookId));

    const hasMissingOrExtraBooks = Array.from(profileBookIds).some(bookId => !userBookIds.has(bookId)) ||
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
    const user = users.find(u => u.id === userId);
    if (!user || user.disabled) return;
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
    const user = users.find(u => u.id === addBooksModal.userId);
    if (!user || user.disabled) return;

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
    return users.filter(user =>
      !user.disabled &&
      !user.bookPermissions.some(book => book.bookId === bookId)
    );
  };

  const addUsersToBook = () => {
    if (!addUsersToBookModal || selectedUsersToAddToBook.length === 0) return;

    const bookName = catalogById.get(addUsersToBookModal.bookId) || addUsersToBookModal.bookName;

    setUsers(prev => prev.map(user => {
      if (!selectedUsersToAddToBook.includes(user.id)) return user;
      if (user.disabled) return user;
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
    const sourceBooks = user.bookPermissions.map(book => book.bookId);
    const sourceResources = toManagedResourceList(user).map(resource => resource.resourceId);
    const sourceModuleNames = Array.from(new Set(toManagedResourceList(user).map(resource => resource.moduleName))).sort((a, b) => a.localeCompare(b));
    setCopyPermissionsModal({ sourceUserId: user.id, sourceUserName: user.name });
    setSelectedBooksToCopy(sourceBooks);
    setSelectedResourcesToCopy(sourceResources);
    setSelectedUsersForCopy([]);
    setCopyBooksSearch('');
    setCopyResourcesSearch('');
    setCopyUsersSearch('');
    setExpandedCopyResourceModules(sourceModuleNames);
    setIsCopyBooksDropdownOpen(false);
    setIsCopyResourcesDropdownOpen(false);
    setIsCopyUsersDropdownOpen(false);
    setIsCopyPreviewModalOpen(false);
  };

  const closeCopyPermissionsModal = () => {
    setCopyPermissionsModal(null);
    setSelectedBooksToCopy([]);
    setSelectedResourcesToCopy([]);
    setSelectedUsersForCopy([]);
    setCopyBooksSearch('');
    setCopyResourcesSearch('');
    setCopyUsersSearch('');
    setExpandedCopyResourceModules([]);
    setIsCopyBooksDropdownOpen(false);
    setIsCopyResourcesDropdownOpen(false);
    setIsCopyUsersDropdownOpen(false);
    setIsCopyPreviewModalOpen(false);
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

  const toggleResourceSelectionForCopy = (resourceId: string) => {
    setSelectedResourcesToCopy(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleCopyResourceModule = (moduleName: string) => {
    setExpandedCopyResourceModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const toggleSelectAllFilteredCopyBooks = () => {
    if (filteredCopyBooks.length === 0) return;
    if (allFilteredCopyBooksSelected) {
      setSelectedBooksToCopy(prev => prev.filter(id => !filteredCopyBooks.some(book => book.bookId === id)));
      return;
    }
    setSelectedBooksToCopy(prev => Array.from(new Set([...prev, ...filteredCopyBooks.map(book => book.bookId)])));
  };

  const toggleSelectAllFilteredCopyResources = () => {
    if (filteredCopyResources.length === 0) return;
    if (allFilteredCopyResourcesSelected) {
      setSelectedResourcesToCopy(prev => prev.filter(id => !filteredCopyResources.some(resource => resource.resourceId === id)));
      return;
    }
    setSelectedResourcesToCopy(prev => Array.from(new Set([...prev, ...filteredCopyResources.map(resource => resource.resourceId)])));
  };

  const toggleSelectAllFilteredCopyUsers = () => {
    if (filteredCopyUsers.length === 0) return;
    if (allFilteredCopyUsersSelected) {
      setSelectedUsersForCopy(prev => prev.filter(id => !filteredCopyUsers.some(user => user.id === id)));
      return;
    }
    setSelectedUsersForCopy(prev => Array.from(new Set([...prev, ...filteredCopyUsers.map(user => user.id)])));
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
        const referenceBook: BookPermission = targetBook || {
          bookId,
          bookName: booksCatalog.find(book => book.id === bookId)?.name || `Libro ${bookId}`,
          permissions: { read: false, draft: false, write: false, acknowledge: false },
          isCustom: true,
          disabled: false
        };
        if (hasProfileAssignedPermissionsForBook(targetUser, referenceBook)) return;
        const targetPermissions = targetBook
          ? targetBook.permissions
          : { read: false, draft: false, write: false, acknowledge: false };

        totalChanges += Number(targetPermissions.read !== sourcePermissions.read);
        totalChanges += Number(targetPermissions.draft !== sourcePermissions.draft);
        totalChanges += Number(targetPermissions.write !== sourcePermissions.write);
        totalChanges += Number(targetPermissions.acknowledge !== sourcePermissions.acknowledge);
      });

      if ((targetUser.resourceProfileIds || []).length === 0) {
        const targetResourceIds = new Set(toManagedResourceList(targetUser).map(resource => resource.resourceId));
        const sourceResourceIds = new Set(selectedResourcesToCopy);
        const added = Array.from(sourceResourceIds).filter(id => !targetResourceIds.has(id)).length;
        const removed = Array.from(targetResourceIds).filter(id => !sourceResourceIds.has(id)).length;
        totalChanges += added + removed;
      }
    });

    return totalChanges;
  };

  const calculateCopyPermissionChangesByUser = () => {
    if (!copyPermissionsModal) return [];
    const sourceUser = users.find(user => user.id === copyPermissionsModal.sourceUserId);
    if (!sourceUser) return [];
    const sourceResourceNameById = new Map(copySourceResources.map(resource => [resource.resourceId, resource.resourceName]));

    const sourceBookById = new Map(
      sourceUser.bookPermissions
        .filter(book => selectedBooksToCopy.includes(book.bookId))
        .map(book => [
          book.bookId,
          {
            bookName: book.bookName,
            permissions: sanitizePermissionsForBook(book.bookId, book.bookName, book.permissions)
          }
        ])
    );

    return selectedUsersForCopy
      .map(targetUserId => {
        const targetUser = users.find(user => user.id === targetUserId);
        if (!targetUser) return null;

        let bookChanges = 0;
        const bookChangeDetails: Array<{
          bookId: string;
          bookName: string;
          from: PermissionSet;
          to: PermissionSet;
          blockedByProfile: boolean;
        }> = [];

        sourceBookById.forEach((sourceBook, bookId) => {
          const targetBook = targetUser.bookPermissions.find(book => book.bookId === bookId);
          const referenceBook: BookPermission = targetBook || {
            bookId,
            bookName: booksCatalog.find(book => book.id === bookId)?.name || `Libro ${bookId}`,
            permissions: { read: false, draft: false, write: false, acknowledge: false },
            isCustom: true,
            disabled: false
          };
          const blockedByProfile = hasProfileAssignedPermissionsForBook(targetUser, referenceBook);
          const targetPermissions = targetBook
            ? sanitizePermissionsForBook(bookId, referenceBook.bookName, targetBook.permissions)
            : { read: false, draft: false, write: false, acknowledge: false };

          const changedCount =
            Number(targetPermissions.read !== sourceBook.permissions.read) +
            Number(targetPermissions.draft !== sourceBook.permissions.draft) +
            Number(targetPermissions.write !== sourceBook.permissions.write) +
            Number(targetPermissions.acknowledge !== sourceBook.permissions.acknowledge);

          if (!blockedByProfile) {
            bookChanges += changedCount;
          }

          if (changedCount > 0 || blockedByProfile) {
            bookChangeDetails.push({
              bookId,
              bookName: sourceBook.bookName,
              from: targetPermissions,
              to: sourceBook.permissions,
              blockedByProfile
            });
          }
        });

        const targetResourceIds = new Set(toManagedResourceList(targetUser).map(resource => resource.resourceId));
        const sourceResourceIds = new Set(selectedResourcesToCopy);
        const resourcesLockedByProfile = (targetUser.resourceProfileIds || []).length > 0;
        const resourcesToAdd = resourcesLockedByProfile
          ? []
          : Array.from(sourceResourceIds)
            .filter(id => !targetResourceIds.has(id))
            .map(id => sourceResourceNameById.get(id) || id);
        const resourcesToRemove = resourcesLockedByProfile
          ? []
          : Array.from(targetResourceIds)
            .filter(id => !sourceResourceIds.has(id))
            .map(id => RESOURCE_CATALOG.find(resource => resource.resourceId === id)?.resourceName || id);
        const resourceChanges = resourcesToAdd.length + resourcesToRemove.length;

        return {
          userId: targetUser.id,
          userName: targetUser.name,
          userRun: targetUser.run,
          avatar: targetUser.avatar,
          avatarColor: targetUser.avatarColor,
          bookChanges,
          bookChangeDetails,
          resourceChanges,
          resourcesToAdd,
          resourcesToRemove,
          resourcesLockedByProfile,
          totalChanges: bookChanges + resourceChanges
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item && (item.totalChanges > 0 || item.bookChangeDetails.some(detail => detail.blockedByProfile)));
  };

  const openCopyPermissionsPreview = () => {
    if ((selectedBooksToCopy.length === 0 && selectedResourcesToCopy.length === 0) || selectedUsersForCopy.length === 0) return;
    setIsCopyPreviewModalOpen(true);
  };

  const applyCopiedPermissions = () => {
    if (!copyPermissionsModal || (selectedBooksToCopy.length === 0 && selectedResourcesToCopy.length === 0) || selectedUsersForCopy.length === 0) return;

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

    const targetUserIds = new Set(selectedUsersForCopy);
    setUsers(prev => prev.map(user => {
      if (!targetUserIds.has(user.id)) return user;

      const nextBookPermissions = [...user.bookPermissions];

      sourceBooksToCopy.forEach((sourceBook, bookId) => {
        const existingIndex = nextBookPermissions.findIndex(book => book.bookId === bookId);
        const existingBook = existingIndex >= 0 ? nextBookPermissions[existingIndex] : undefined;
        const referenceBook: BookPermission = existingBook || {
          bookId,
          bookName: sourceBook.bookName,
          permissions: { read: false, draft: false, write: false, acknowledge: false },
          isCustom: true,
          disabled: false
        };
        if (hasProfileAssignedPermissionsForBook(user, referenceBook)) return;

        if (existingIndex >= 0) {
          nextBookPermissions[existingIndex] = {
            ...existingBook!,
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

      const canEditResources = (user.resourceProfileIds || []).length === 0;
      const nextResources = canEditResources
        ? RESOURCE_CATALOG.filter(resource => selectedResourcesToCopy.includes(resource.resourceId))
        : (user.resourcePermissions || []);

      return {
        ...user,
        bookPermissions: nextBookPermissions,
        resourceProfileIds: canEditResources ? [] : user.resourceProfileIds,
        resourcePermissions: nextResources
      };
    }));

    setIsCopyPreviewModalOpen(false);
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
    if (user.disabled) return [];

    const assignedBookIds = user.bookPermissions.map(b => b.bookId);
    return booksCatalog.filter(book => !assignedBookIds.includes(book.id));
  };

  const isBookAccessVisuallyDisabled = (user: UserProfile, book: BookPermission) =>
    !!user.disabled || !!book.disabled;

  const getPermissionHierarchyLevel = (permissions: PermissionSet) => {
    if (permissions.write) return 2;
    if (permissions.draft) return 1;
    if (permissions.read) return 0;
    return -1;
  };

  const buildPermissionsFromHierarchyLevel = (level: number, acknowledge: boolean): PermissionSet => ({
    read: level >= 0,
    draft: level >= 1,
    write: level >= 2,
    acknowledge
  });

  const normalizePermissionsByHierarchy = (permissions: PermissionSet): PermissionSet => {
    const level = getPermissionHierarchyLevel(permissions);
    return buildPermissionsFromHierarchyLevel(level, permissions.acknowledge);
  };

  const getBasePermissionsForBook = (user: UserProfile, book: BookPermission): PermissionSet => {
    const base = getProfileBookPermissions(getSelectedPermissionProfileIds(user), book.bookId);
    if (!base) {
      return { read: false, draft: false, write: false, acknowledge: false };
    }
    return normalizePermissionsByHierarchy(base);
  };

  const hasProfileAssignedPermissionsForBook = (user: UserProfile, book: BookPermission) => {
    const base = getBasePermissionsForBook(user, book);
    return !!(base.read || base.draft || base.write || base.acknowledge);
  };

  const getNextPermissionsForPermissionState = (
    user: UserProfile,
    book: BookPermission,
    permissionType: keyof PermissionSet,
    targetEnabled: boolean
  ): PermissionSet => {
    const current = normalizePermissionsByHierarchy(book.permissions);
    const base = getBasePermissionsForBook(user, book);

    if (permissionType === 'acknowledge') {
      return {
        ...current,
        acknowledge: targetEnabled || base.acknowledge
      };
    }

    const currentLevel = getPermissionHierarchyLevel(current);
    const baseLevel = getPermissionHierarchyLevel(base);
    const permissionLevelByType: Record<'read' | 'draft' | 'write', number> = {
      read: 0,
      draft: 1,
      write: 2
    };

    let desiredLevel = currentLevel;

    if (targetEnabled) {
      desiredLevel = Math.max(currentLevel, permissionLevelByType[permissionType]);
    } else {
      if (permissionType === 'write') desiredLevel = 1;
      if (permissionType === 'draft') desiredLevel = 0;
      if (permissionType === 'read') desiredLevel = -1;
    }

    if (isLibroObraMaestro(book.bookId, book.bookName)) {
      desiredLevel = Math.min(desiredLevel, 1);
    }

    desiredLevel = Math.max(desiredLevel, baseLevel);
    return buildPermissionsFromHierarchyLevel(desiredLevel, current.acknowledge);
  };

  const canToggleBookPermission = (
    user: UserProfile,
    book: BookPermission,
    permissionType: keyof PermissionSet
  ) => {
    if (user.disabled || book.disabled) return false;
    if (hasProfileAssignedPermissionsForBook(user, book)) return false;
    if (permissionType === 'write' && isLibroObraMaestro(book.bookId, book.bookName)) return false;
    const current = normalizePermissionsByHierarchy(book.permissions);
    const next = getNextPermissionsForPermissionState(user, book, permissionType, !current[permissionType]);
    return !hasSamePermissions(current, next);
  };

  const isPermissionDisplayedAsEnabled = (
    user: UserProfile,
    book: BookPermission,
    permissionType: keyof BookPermission['permissions']
  ) =>
    !isBookAccessVisuallyDisabled(user, book) && normalizePermissionsByHierarchy(book.permissions)[permissionType];

  const isProfileBookForUser = (user: UserProfile, bookId: string) => {
    const selectedProfiles = resolveSelectedProfiles(getSelectedPermissionProfileIds(user));
    if (selectedProfiles.length === 0) return false;
    return selectedProfiles.some(profile => profile.bookPermissions.some(book => book.bookId === bookId));
  };

  const canEditBookPermissions = (user: UserProfile, book: BookPermission) =>
    (['read', 'draft', 'write', 'acknowledge'] as Array<keyof PermissionSet>)
      .some(permissionType => canToggleBookPermission(user, book, permissionType));

  const canRemoveBookFromUser = (user: UserProfile, bookId: string) => {
    const book = user.bookPermissions.find(item => item.bookId === bookId);
    return !user.disabled && !book?.disabled && !isProfileBookForUser(user, bookId);
  };

  const toggleBookPermission = (
    userId: string,
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetUser = users.find(user => user.id === userId);
    const targetBook = targetUser?.bookPermissions.find(book => book.bookId === bookId);
    if (!targetUser || !targetBook || !canToggleBookPermission(targetUser, targetBook, permissionType)) return;

    setUsers(prev => prev.map(user =>
      user.id === userId
        ? {
            ...user,
            bookPermissions: user.bookPermissions.map(book =>
              book.bookId === bookId
                ? {
                    ...book,
                    permissions: getNextPermissionsForPermissionState(
                      user,
                      book,
                      permissionType,
                      !normalizePermissionsByHierarchy(book.permissions)[permissionType]
                    ),
                    isCustom: true
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
    const actionableBooks = user.bookPermissions.filter(book => canToggleBookPermission(user, book, permissionType));
    if (actionableBooks.length === 0) return;

    const allEnabled = actionableBooks.every(book => normalizePermissionsByHierarchy(book.permissions)[permissionType]);
    const targetState = !allEnabled;

    setUsers(prev => prev.map(u =>
      u.id === userId
        ? {
            ...u,
            bookPermissions: u.bookPermissions.map(book => ({
              ...book,
              permissions: canToggleBookPermission(u, book, permissionType)
                ? getNextPermissionsForPermissionState(u, book, permissionType, targetState)
                : book.permissions
            }))
          }
        : u
    ));
  };

  const getPermissionCheckboxState = (userId: string, permissionType: keyof BookPermission['permissions']) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.bookPermissions.length === 0) return 'none';
    const actionableBooks = user.bookPermissions.filter(book => canToggleBookPermission(user, book, permissionType));
    if (actionableBooks.length === 0) return 'none';

    const enabledCount = actionableBooks.filter(book => normalizePermissionsByHierarchy(book.permissions)[permissionType]).length;

    if (enabledCount === 0) return 'none';
    if (enabledCount === actionableBooks.length) return 'all';
    return 'some';
  };

  const hasEditablePermissionsForUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    return user.bookPermissions.some(book => canEditBookPermissions(user, book));
  };

  const avatarPalette = ['#9333ea', '#2563eb', '#059669', '#ea580c', '#ec4899', '#0d9488'];
  const hierarchyPermissionLabels: Record<HierarchyPermission, string> = {
    read: 'Lectura',
    draft: 'Asistente',
    write: 'Escritura'
  };
  const hierarchyOrder: HierarchyPermission[] = ['read', 'draft', 'write'];

  const getHierarchyLevelByPermission = (permission: HierarchyPermission) => {
    if (permission === 'write') return 2;
    if (permission === 'draft') return 1;
    return 0;
  };

  const getHighestHierarchyPermissionLabel = (permissions: PermissionSet) => {
    const normalized = normalizePermissionsByHierarchy(permissions);
    if (normalized.write) return hierarchyPermissionLabels.write;
    if (normalized.draft) return hierarchyPermissionLabels.draft;
    if (normalized.read) return hierarchyPermissionLabels.read;
    return '';
  };

  const ensureDraftBookForBulkEditor = (user: UserProfile, bookId: string) => {
    const existing = user.bookPermissions.find(book => book.bookId === bookId);
    if (existing) return existing;
    const catalogBook = booksCatalog.find(book => book.id === bookId);
    return {
      bookId,
      bookName: catalogBook?.name || `Libro ${bookId}`,
      permissions: { read: false, draft: false, write: false, acknowledge: false },
      isCustom: true,
      disabled: false
    } as BookPermission;
  };

  const canAddHierarchyPermission = (
    currentPermissions: PermissionSet,
    basePermissions: PermissionSet,
    permission: HierarchyPermission
  ) => {
    const hasProfilePermissions = !!(basePermissions.read || basePermissions.draft || basePermissions.write || basePermissions.acknowledge);
    if (hasProfilePermissions) return false;
    const currentLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(currentPermissions));
    const baseLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(basePermissions));
    const targetLevel = getHierarchyLevelByPermission(permission);
    if (targetLevel <= baseLevel) return false;
    if (targetLevel <= currentLevel) return false;
    return true;
  };

  const canRemoveHierarchyPermission = (
    currentPermissions: PermissionSet,
    basePermissions: PermissionSet,
    permission: HierarchyPermission
  ) => {
    const hasProfilePermissions = !!(basePermissions.read || basePermissions.draft || basePermissions.write || basePermissions.acknowledge);
    if (hasProfilePermissions) return false;
    const currentLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(currentPermissions));
    const baseLevel = getPermissionHierarchyLevel(normalizePermissionsByHierarchy(basePermissions));
    const targetLevel = getHierarchyLevelByPermission(permission);
    if (targetLevel < baseLevel) return false;
    if (targetLevel > currentLevel) return false;
    return true;
  };

  const applyAddHierarchyPermission = (
    currentPermissions: PermissionSet,
    basePermissions: PermissionSet,
    permission: HierarchyPermission,
    book: BookPermission
  ) => {
    const current = normalizePermissionsByHierarchy(currentPermissions);
    const base = normalizePermissionsByHierarchy(basePermissions);
    if (!canAddHierarchyPermission(current, base, permission)) return current;
    const currentLevel = getPermissionHierarchyLevel(current);
    const nextLevel = Math.max(currentLevel, getHierarchyLevelByPermission(permission));
    const adjustedLevel = isLibroObraMaestro(book.bookId, book.bookName) ? Math.min(nextLevel, 1) : nextLevel;
    const finalLevel = Math.max(adjustedLevel, getPermissionHierarchyLevel(base));
    return buildPermissionsFromHierarchyLevel(finalLevel, current.acknowledge || base.acknowledge);
  };

  const applySetHierarchyPermission = (
    currentPermissions: PermissionSet,
    basePermissions: PermissionSet,
    permission: HierarchyPermission,
    book: BookPermission
  ) => {
    const current = normalizePermissionsByHierarchy(currentPermissions);
    const base = normalizePermissionsByHierarchy(basePermissions);
    const hasProfilePermissions = !!(base.read || base.draft || base.write || base.acknowledge);
    if (hasProfilePermissions) return current;
    const targetLevel = getHierarchyLevelByPermission(permission);
    const baseLevel = getPermissionHierarchyLevel(base);
    const adjustedTargetLevel = isLibroObraMaestro(book.bookId, book.bookName)
      ? Math.min(targetLevel, 1)
      : targetLevel;
    const finalLevel = Math.max(adjustedTargetLevel, baseLevel);
    return buildPermissionsFromHierarchyLevel(finalLevel, current.acknowledge || base.acknowledge);
  };

  const applyRemoveHierarchyPermission = (
    currentPermissions: PermissionSet,
    basePermissions: PermissionSet,
    permission: HierarchyPermission
  ) => {
    const current = normalizePermissionsByHierarchy(currentPermissions);
    const base = normalizePermissionsByHierarchy(basePermissions);
    if (!canRemoveHierarchyPermission(current, base, permission)) return current;

    const currentLevel = getPermissionHierarchyLevel(current);
    const baseLevel = getPermissionHierarchyLevel(base);
    let nextLevel = currentLevel;
    if (permission === 'write') nextLevel = 1;
    if (permission === 'draft') nextLevel = 0;
    if (permission === 'read') nextLevel = -1;
    nextLevel = Math.max(nextLevel, baseLevel);
    return buildPermissionsFromHierarchyLevel(nextLevel, current.acknowledge || base.acknowledge);
  };

  const openBulkPermissionEditorModal = () => {
    setBulkPermissionDraftUsers(JSON.parse(JSON.stringify(users)) as UserProfile[]);
    setBulkPermissionSelectedUserIds([]);
    setBulkPermissionSelectedBookIds([]);
    setBulkPermissionUserSearch('');
    setBulkPermissionBookSearch('');
    setBulkPermissionMassAction('add');
    setBulkPermissionMassSelectedPermission('');
    setBulkPermissionUsersDropdownOpen(false);
    setBulkPermissionBooksDropdownOpen(false);
    setIsBulkPermissionEditorOpen(true);
  };

  const closeBulkPermissionEditorModal = () => {
    setIsBulkPermissionEditorOpen(false);
    setBulkPermissionDraftUsers(null);
    setBulkPermissionSelectedUserIds([]);
    setBulkPermissionSelectedBookIds([]);
    setBulkPermissionMassSelectedPermission('');
  };

  const applyBulkPermissionEditorChanges = () => {
    if (!bulkPermissionDraftUsers) return;
    setUsers(bulkPermissionDraftUsers);
    closeBulkPermissionEditorModal();
  };

  const toggleBulkPermissionUserSelection = (userId: string) => {
    setBulkPermissionSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleBulkPermissionBookSelection = (bookId: string) => {
    setBulkPermissionSelectedBookIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const applyMassPermissionsToSelection = () => {
    if (!bulkPermissionDraftUsers || bulkPermissionSelectedUserIds.length === 0 || bulkPermissionSelectedBookIds.length === 0) return;
    if (!bulkPermissionMassSelectedPermission) return;

    const targetUsers = new Set(bulkPermissionSelectedUserIds);
    const targetBooks = new Set(bulkPermissionSelectedBookIds);

    setBulkPermissionDraftUsers(prev => {
      if (!prev) return prev;
      return prev.map(user => {
        if (!targetUsers.has(user.id)) return user;
        const nextBooks = [...user.bookPermissions];

        targetBooks.forEach(bookId => {
          const existingIndex = nextBooks.findIndex(book => book.bookId === bookId);
          const draftBook = existingIndex >= 0
            ? nextBooks[existingIndex]
            : ensureDraftBookForBulkEditor(user, bookId);

          const basePermissions = getBasePermissionsForBook(user, draftBook);
          let nextPermissions = normalizePermissionsByHierarchy(draftBook.permissions);

          nextPermissions = bulkPermissionMassAction === 'add'
            ? applySetHierarchyPermission(nextPermissions, basePermissions, bulkPermissionMassSelectedPermission, draftBook)
            : applyRemoveHierarchyPermission(nextPermissions, basePermissions, bulkPermissionMassSelectedPermission);

          const updatedBook: BookPermission = {
            ...draftBook,
            permissions: nextPermissions,
            isCustom: true
          };

          if (existingIndex >= 0) {
            nextBooks[existingIndex] = updatedBook;
          } else {
            nextBooks.push(updatedBook);
          }
        });

        return { ...user, bookPermissions: nextBooks };
      });
    });
  };

  const updateSingleBulkEditorPermission = (userId: string, bookId: string, permission: HierarchyPermission, checked: boolean) => {
    setBulkPermissionDraftUsers(prev => {
      if (!prev) return prev;
      return prev.map(user => {
        if (user.id !== userId) return user;
        const nextBooks = [...user.bookPermissions];
        const existingIndex = nextBooks.findIndex(book => book.bookId === bookId);
        const draftBook = existingIndex >= 0
          ? nextBooks[existingIndex]
          : ensureDraftBookForBulkEditor(user, bookId);

        const basePermissions = getBasePermissionsForBook(user, draftBook);
        const nextPermissions = checked
          ? applyAddHierarchyPermission(draftBook.permissions, basePermissions, permission, draftBook)
          : applyRemoveHierarchyPermission(draftBook.permissions, basePermissions, permission);

        const updatedBook: BookPermission = {
          ...draftBook,
          permissions: nextPermissions,
          isCustom: true
        };

        if (existingIndex >= 0) {
          nextBooks[existingIndex] = updatedBook;
        } else {
          nextBooks.push(updatedBook);
        }

        return { ...user, bookPermissions: nextBooks };
      });
    });
  };

  const toManagedResourceList = (user: UserProfile) => {
    const current = getEffectiveResourcesForUser(user);
    const ids = new Set(current.map(resource => resource.resourceId));
    return RESOURCE_CATALOG.filter(resource => ids.has(resource.resourceId));
  };

  const getAvailableResourcesForUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.disabled) return [];
    const assignedIds = new Set(toManagedResourceList(user).map(resource => resource.resourceId));
    return RESOURCE_CATALOG.filter(resource => !assignedIds.has(resource.resourceId));
  };

  const openAddResourcesModal = (userId: string, userName: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.disabled) return;
    const available = getAvailableResourcesForUser(userId);
    const moduleNames = RESOURCE_GROUPS
      .map(group => group.moduleName)
      .filter(moduleName => available.some(resource => resource.moduleName === moduleName));
    setAddResourcesModal({ userId, userName });
    setSelectedResourcesToAdd([]);
    setExpandedResourceModulesInAddModal(moduleNames);
    setResourceSearchInAddModal('');
  };

  const closeAddResourcesModal = () => {
    setAddResourcesModal(null);
    setSelectedResourcesToAdd([]);
    setExpandedResourceModulesInAddModal([]);
    setResourceSearchInAddModal('');
  };

  const toggleResourceSelectionToAdd = (resourceId: string) => {
    setSelectedResourcesToAdd(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleResourceModuleInAddModal = (moduleName: string) => {
    setExpandedResourceModulesInAddModal(prev =>
      prev.includes(moduleName)
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const addResourcesToUser = () => {
    if (!addResourcesModal || selectedResourcesToAdd.length === 0) return;

    setUsers(prev => prev.map(user => {
      if (user.id !== addResourcesModal.userId || user.disabled) return user;
      const currentResources = toManagedResourceList(user);
      const existing = new Set(currentResources.map(resource => resource.resourceId));
      const toAdd = RESOURCE_CATALOG.filter(resource =>
        selectedResourcesToAdd.includes(resource.resourceId) && !existing.has(resource.resourceId)
      );
      return {
        ...user,
        resourceProfileIds: [],
        resourcePermissions: [...currentResources, ...toAdd]
      };
    }));

    closeAddResourcesModal();
  };

  const removeResourceFromUser = (userId: string, resourceId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId || user.disabled) return user;
      const currentResources = toManagedResourceList(user);
      return {
        ...user,
        resourceProfileIds: [],
        resourcePermissions: currentResources.filter(resource => resource.resourceId !== resourceId)
      };
    }));
  };

  const getEffectiveResourcesForUser = (user: UserProfile) => {
    const resourcesFromProfiles = buildResourcesFromResourceProfiles(user.resourceProfileIds || [], resourceProfilesCatalog);
    if ((user.resourceProfileIds && user.resourceProfileIds.length > 0)) {
      return resourcesFromProfiles;
    }
    if (user.resourcePermissions && user.resourcePermissions.length > 0) {
      return user.resourcePermissions;
    }
    return getDefaultResourcesForUser(user);
  };

  const filteredUsers = users.filter(user => {
    const normalizedSearch = searchQuery.toLowerCase();
    const userResources = getEffectiveResourcesForUser(user);
    const matchesSearch = user.name.toLowerCase().includes(normalizedSearch) ||
      user.run.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      userResources.some(resource =>
        resource.resourceName.toLowerCase().includes(normalizedSearch) ||
        resource.moduleName.toLowerCase().includes(normalizedSearch)
      );
    const matchesGroup = groupFilters.length === 0 || groupFilters.includes(user.group);
    const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
    const userProfileIds = getSelectedPermissionProfileIds(user);
    const matchesProfile = profileFilters.length === 0 || userProfileIds.some(profileId => profileFilters.includes(profileId));
    const matchesBook = bookFilters.length === 0 || user.bookPermissions.some(book => bookFilters.includes(book.bookId));

    const booksForPermissionCheck = bookFilters.length === 0
      ? user.bookPermissions
      : user.bookPermissions.filter(book => bookFilters.includes(book.bookId));
    const matchesPermission = permissionFilters.length === 0 ||
      booksForPermissionCheck.some(book =>
        permissionFilters.some(permission => normalizePermissionsByHierarchy(book.permissions)[permission])
      );

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
        .filter(({ permission }) => permissionFilters.length === 0 || permissionFilters.some(permissionType => normalizePermissionsByHierarchy(permission.permissions)[permissionType]))
    }))
    .filter(book => bookFilters.length === 0 || bookFilters.includes(book.bookId));

  const resourcesFromFilteredUsers = RESOURCE_CATALOG
    .map(resource => ({
      resource,
      assignments: filteredUsers
        .filter(user => getEffectiveResourcesForUser(user).some(item => item.resourceId === resource.resourceId))
        .map(user => ({ user }))
    }))
    .filter(entry => entry.assignments.length > 0);

  const isBooksListView = viewMode === 'books';

  const toggleAllPermissionsForBook = (
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    const actionableAssignments = targetAssignments.filter(({ user, permission }) => canToggleBookPermission(user, permission, permissionType));
    if (actionableAssignments.length === 0) return;

    const allEnabled = actionableAssignments.every(({ permission }) => normalizePermissionsByHierarchy(permission.permissions)[permissionType]);
    const targetState = !allEnabled;
    const targetUserIds = new Set(actionableAssignments.map(({ user }) => user.id));

    setUsers(prev => prev.map(user => {
      if (!targetUserIds.has(user.id)) return user;

      return {
        ...user,
        bookPermissions: user.bookPermissions.map(book =>
          book.bookId === bookId && canToggleBookPermission(user, book, permissionType)
            ? {
                ...book,
                permissions: getNextPermissionsForPermissionState(user, book, permissionType, targetState),
                isCustom: true
              }
            : book
        )
      };
    }));
  };

  const hasEditableAssignmentsForBook = (bookId: string) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    return targetAssignments.some(({ user, permission }) =>
      (['read', 'draft', 'write', 'acknowledge'] as Array<keyof PermissionSet>)
        .some(permissionType => canToggleBookPermission(user, permission, permissionType))
    );
  };

  const getBookPermissionCheckboxState = (
    bookId: string,
    permissionType: keyof BookPermission['permissions']
  ) => {
    const targetAssignments = booksFromFilteredUsers.find(book => book.bookId === bookId)?.assignments || [];
    const actionableAssignments = targetAssignments.filter(({ user, permission }) => canToggleBookPermission(user, permission, permissionType));
    if (actionableAssignments.length === 0) return 'none';

    const enabledCount = actionableAssignments.filter(({ permission }) => normalizePermissionsByHierarchy(permission.permissions)[permissionType]).length;
    if (enabledCount === 0) return 'none';
    if (enabledCount === actionableAssignments.length) return 'all';
    return 'some';
  };

  const roleOptions = Array.from(new Set(users.map(user => user.role))).sort((a, b) => a.localeCompare(b));
  const copySourceUser = copyPermissionsModal
    ? users.find(user => user.id === copyPermissionsModal.sourceUserId) || null
    : null;
  const copySourceBooks = copySourceUser?.bookPermissions || [];
  const copySourceResources = copySourceUser ? toManagedResourceList(copySourceUser) : [];
  const copyTargetUsers = users.filter(user => user.id !== copyPermissionsModal?.sourceUserId);
  const normalizedCopyBooksSearch = copyBooksSearch.trim().toLowerCase();
  const normalizedCopyUsersSearch = copyUsersSearch.trim().toLowerCase();
  const normalizedCopyResourcesSearch = copyResourcesSearch.trim().toLowerCase();
  const filteredCopyBooks = copySourceBooks.filter(book =>
    book.bookName.toLowerCase().includes(normalizedCopyBooksSearch)
  );
  const filteredCopyUsers = copyTargetUsers.filter(user =>
    user.name.toLowerCase().includes(normalizedCopyUsersSearch) ||
    user.run.toLowerCase().includes(normalizedCopyUsersSearch)
  );
  const filteredCopyResources = copySourceResources.filter(resource =>
    resource.resourceName.toLowerCase().includes(normalizedCopyResourcesSearch) ||
    resource.moduleName.toLowerCase().includes(normalizedCopyResourcesSearch)
  );
  const filteredCopyResourcesByModule = filteredCopyResources.reduce<Record<string, UserResourceAccess[]>>((acc, resource) => {
    if (!acc[resource.moduleName]) acc[resource.moduleName] = [];
    acc[resource.moduleName].push(resource);
    return acc;
  }, {});
  const filteredCopyResourceModuleNames = Object.keys(filteredCopyResourcesByModule).sort((a, b) => a.localeCompare(b));
  const allFilteredCopyBooksSelected = filteredCopyBooks.length > 0 && filteredCopyBooks.every(book => selectedBooksToCopy.includes(book.bookId));
  const allFilteredCopyUsersSelected = filteredCopyUsers.length > 0 && filteredCopyUsers.every(user => selectedUsersForCopy.includes(user.id));
  const allFilteredCopyResourcesSelected = filteredCopyResources.length > 0 && filteredCopyResources.every(resource => selectedResourcesToCopy.includes(resource.resourceId));
  const copyPreviewItems = calculateCopyPermissionChangesByUser();
  const copyPreviewTotalChanges = copyPreviewItems.reduce((acc, item) => acc + item.totalChanges, 0);
  const editRoleOptions = Array.from(new Set([
    ...DEFAULT_CARGO_OPTIONS,
    ...editCustomRoles,
    ...users.flatMap(user => parseRolesFromValue(user.role)),
    ...editSelectedRoles
  ])).sort((a, b) => a.localeCompare(b));
  const normalizedEditRoleSearch = editRoleSearch.trim().toLowerCase();
  const filteredEditRoleOptions = editRoleOptions.filter(role =>
    role.toLowerCase().includes(normalizedEditRoleSearch)
  );
  const allFilteredEditRolesSelected =
    filteredEditRoleOptions.length > 0 &&
    filteredEditRoleOptions.every(role => editSelectedRoles.includes(role));
  const normalizedEditResourceProfilesSearch = editResourceProfilesSearch.trim().toLowerCase();
  const filteredEditResourceProfiles = resourceProfilesCatalog.filter(profile =>
    profile.name.toLowerCase().includes(normalizedEditResourceProfilesSearch)
  );
  const allFilteredEditResourceProfilesSelected =
    filteredEditResourceProfiles.length > 0 &&
    filteredEditResourceProfiles.every(profile => editForm.resourceProfileIds.includes(profile.id));
  const profileOptions = profilesCatalog.map(profile => ({ value: profile.id, label: profile.name }));
  const normalizedQuickProfilesSearch = quickProfilesSearch.trim().toLowerCase();
  const filteredQuickPermissionProfiles = profilesCatalog.filter(profile =>
    profile.name.toLowerCase().includes(normalizedQuickProfilesSearch)
  );
  const normalizedEditProfilesSearch = editProfilesSearch.trim().toLowerCase();
  const filteredEditPermissionProfiles = profilesCatalog.filter(profile =>
    profile.name.toLowerCase().includes(normalizedEditProfilesSearch)
  );
  const normalizedQuickCreateRun = quickCreateForm.run.trim().toLowerCase();
  const quickCreateRunExists = normalizedQuickCreateRun.length > 0 &&
    users.some(user => user.run.trim().toLowerCase() === normalizedQuickCreateRun);
  const canSaveQuickCreateUser = !!(
    quickCreateForm.run.trim() &&
    quickCreateForm.name.trim() &&
    quickCreateForm.email.trim() &&
    quickCreateForm.group &&
    quickCreateForm.role.trim() &&
    !quickCreateRunExists
  );
  const bookOptions = Array.from(catalogById.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const permissionOptions: MultiSelectOption[] = [
    { value: 'read', label: 'Lectura' },
    { value: 'draft', label: 'Asistente' },
    { value: 'write', label: 'Escritura' },
    { value: 'acknowledge', label: 'Toma Conoc.' }
  ];
  const bulkPermissionWorkingUsers = bulkPermissionDraftUsers || users;
  const bulkPermissionUsersFiltered = bulkPermissionWorkingUsers
    .filter(user => {
      const query = bulkPermissionUserSearch.trim().toLowerCase();
      if (!query) return true;
      return user.name.toLowerCase().includes(query) ||
        user.run.toLowerCase().includes(query) ||
        user.profileName?.toLowerCase().includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const bulkPermissionBooksFiltered = booksCatalog
    .filter(book => {
      const query = bulkPermissionBookSearch.trim().toLowerCase();
      if (!query) return true;
      return book.name.toLowerCase().includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const allFilteredBulkPermissionUsersSelected = bulkPermissionUsersFiltered.length > 0 &&
    bulkPermissionUsersFiltered.every(user => bulkPermissionSelectedUserIds.includes(user.id));
  const allFilteredBulkPermissionBooksSelected = bulkPermissionBooksFiltered.length > 0 &&
    bulkPermissionBooksFiltered.every(book => bulkPermissionSelectedBookIds.includes(book.id));

  const bulkPermissionSelectedUsers = bulkPermissionSelectedUserIds
    .map(userId => bulkPermissionWorkingUsers.find(user => user.id === userId))
    .filter((user): user is UserProfile => !!user);
  const bulkPermissionSelectedBooks = bulkPermissionSelectedBookIds
    .map(bookId => booksCatalog.find(book => book.id === bookId) || { id: bookId, name: catalogById.get(bookId) || `Libro ${bookId}` })
    .filter(book => !!book);
  const permissionsSummaryUser = permissionsSummaryModalUserId
    ? users.find(user => user.id === permissionsSummaryModalUserId) || null
    : null;
  const permissionsSummaryResources = permissionsSummaryUser ? toManagedResourceList(permissionsSummaryUser) : [];
  const permissionsSummaryResourcesByModule = permissionsSummaryResources.reduce<Record<string, UserResourceAccess[]>>((acc, resource) => {
    if (!acc[resource.moduleName]) acc[resource.moduleName] = [];
    acc[resource.moduleName].push(resource);
    return acc;
  }, {});
  const permissionsSummaryResourceModules = [
    ...RESOURCE_GROUPS
      .map(group => group.moduleName)
      .filter(moduleName => permissionsSummaryResourcesByModule[moduleName]?.length),
    ...Object.keys(permissionsSummaryResourcesByModule)
      .filter(moduleName => !RESOURCE_GROUPS.some(group => group.moduleName === moduleName))
      .sort((a, b) => a.localeCompare(b))
  ];

  const toggleSelectAllFilteredBulkPermissionUsers = () => {
    if (allFilteredBulkPermissionUsersSelected) {
      const filteredIds = new Set(bulkPermissionUsersFiltered.map(user => user.id));
      setBulkPermissionSelectedUserIds(prev => prev.filter(id => !filteredIds.has(id)));
      return;
    }
    setBulkPermissionSelectedUserIds(prev => Array.from(new Set([...prev, ...bulkPermissionUsersFiltered.map(user => user.id)])));
  };

  const toggleSelectAllFilteredBulkPermissionBooks = () => {
    if (allFilteredBulkPermissionBooksSelected) {
      const filteredIds = new Set(bulkPermissionBooksFiltered.map(book => book.id));
      setBulkPermissionSelectedBookIds(prev => prev.filter(id => !filteredIds.has(id)));
      return;
    }
    setBulkPermissionSelectedBookIds(prev => Array.from(new Set([...prev, ...bulkPermissionBooksFiltered.map(book => book.id)])));
  };

  const getUserAvatarInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  };

  const formatPermissionSummary = (permissions: PermissionSet) =>
    `Lectura: ${permissions.read ? 'Sí' : 'No'} | Asistente: ${permissions.draft ? 'Sí' : 'No'} | Escritura: ${permissions.write ? 'Sí' : 'No'} | Toma de conocimiento: ${permissions.acknowledge ? 'Sí' : 'No'}`;

  const serializeUser = (user: UserProfile) => JSON.stringify({
    name: user.name,
    run: user.run,
    email: user.email,
    group: user.group,
    role: user.role,
    permissionExpiryDate: user.permissionExpiryDate || '',
    profileId: user.profileId || '',
    profileName: user.profileName || '',
    profileIds: [...((user.profileIds && user.profileIds.length > 0) ? user.profileIds : (user.profileId ? [user.profileId] : []))]
      .sort((a, b) => a.localeCompare(b)),
    profileNames: [...((user.profileNames && user.profileNames.length > 0) ? user.profileNames : (user.profileName ? [user.profileName] : []))]
      .sort((a, b) => a.localeCompare(b)),
    disabled: !!user.disabled,
    resourceProfileIds: [...(user.resourceProfileIds || [])].sort((a, b) => a.localeCompare(b)),
    resourcePermissions: [...(user.resourcePermissions || [])]
      .sort((a, b) => a.resourceId.localeCompare(b.resourceId))
      .map(resource => ({
        resourceId: resource.resourceId
      })),
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

  const totalUsersCount = users.length;
  const disabledUsersCount = users.filter(user => !!user.disabled).length;
  const activeUsersCount = totalUsersCount - disabledUsersCount;
  const usersWithCustomPermissionsCount = users.filter(hasUserPermissionExceptions).length;
  const activeFilterCount =
    (searchQuery.trim().length > 0 ? 1 : 0) +
    groupFilters.length +
    roleFilters.length +
    profileFilters.length +
    bookFilters.length +
    permissionFilters.length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setGroupFilters([]);
    setRoleFilters([]);
    setProfileFilters([]);
    setBookFilters([]);
    setPermissionFilters([]);
  };

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
        <div className="max-w-7xl mx-auto px-8 py-7">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#1f2937' }}>
                Permisos por Usuario
              </h1>
              <p className="text-[#6b7280]">
                Vista consolidada de usuarios, permisos y estado de configuración
              </p>
            </div>
            <div className="text-sm text-[#64748b]">
              Mostrando <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredUsers.length}</span> de{' '}
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{users.length}</span> usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-28">
        <div className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#eef2f7]">
            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]" style={{ fontWeight: 700 }}>
                Usuarios totales
              </div>
              <div className="text-3xl mt-1 text-[#0f172a]" style={{ fontWeight: 600 }}>
                {totalUsersCount}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]" style={{ fontWeight: 700 }}>
                Usuarios activos
              </div>
              <div className="text-3xl mt-1 text-[#0f172a]" style={{ fontWeight: 600 }}>
                {activeUsersCount}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]" style={{ fontWeight: 700 }}>
                Usuarios deshabilitados
              </div>
              <div className="text-3xl mt-1 text-[#334155]" style={{ fontWeight: 600 }}>
                {disabledUsersCount}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]" style={{ fontWeight: 700 }}>
                Permisos personalizados
              </div>
              <div className="flex items-center gap-1.5 text-3xl mt-1 text-[#d97706]" style={{ fontWeight: 600 }}>
                <AlertCircle className="w-5 h-5" />
                {usersWithCustomPermissionsCount}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-[#64748b]" style={{ fontWeight: 700 }}>
                Cambios pendientes
              </div>
              <div className="text-3xl mt-1 text-[#2563eb]" style={{ fontWeight: 600 }}>
                {changedUsers.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e1e4e8] p-4 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] border border-[#dbe3ee] rounded-lg">
                <label className="text-sm text-[#334155]" style={{ fontWeight: 600 }}>
                  Vista
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'users' | 'books' | 'resources')}
                  className="px-2.5 py-1.5 rounded-md border border-[#d1d5db] text-sm text-[#1f2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                >
                  <option value="users">Usuarios</option>
                  <option value="books">Libros</option>
                  <option value="resources">Recursos</option>
                </select>
              </div>
              <div className="text-sm text-[#334155]">
                Filtros activos: <span style={{ fontWeight: 700 }}>{activeFilterCount}</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-[#0f766e] hover:text-[#0f766e]/80"
                  style={{ fontWeight: 600 }}
                >
                  Borrar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={openBulkPermissionEditorModal}
                className="px-3.5 py-2 rounded-lg bg-white text-[#2563eb] border border-[#bfdbfe] hover:bg-[#eff6ff] transition-colors shadow-sm flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <Edit2 className="w-4 h-4" />
                Editar permisos
              </button>
              <button
                onClick={openQuickCreateUserModal}
                className="px-3.5 py-2 rounded-lg bg-[#f97316] text-white border border-[#fb923c] hover:bg-[#ea580c] transition-colors shadow-sm flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <UserPlus className="w-4 h-4" />
                Crear usuario
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, RUN, email o recurso..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-4 flex-wrap">
            <MultiSelectFilter
              label="Empresas"
              allLabel="Todas las empresas"
              options={CONSTRUCTION_COMPANIES.map(company => ({ value: company, label: company }))}
              selectedValues={groupFilters}
              onChange={setGroupFilters}
            />

            <MultiSelectFilter
              label="Cargos"
              allLabel="Todos los cargos"
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

        {/* Users List */}
        {viewMode === 'books' ? (
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
                      disabled={getAvailableUsersForBook(bookEntry.bookId).length === 0}
                      className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={getAvailableUsersForBook(bookEntry.bookId).length === 0 ? 'No hay usuarios habilitados disponibles para agregar' : 'Agregar usuario al libro'}
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
                                    className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 px-4 py-4 rounded-lg border items-center ${
                                      isBookAccessVisuallyDisabled(user, permission) ? 'bg-[#f9fafb]' : 'bg-white'
                                    } ${
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
                                          disabled={!canToggleBookPermission(user, permission, permissionType)}
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isPermissionDisplayedAsEnabled(user, permission, permissionType)
                                              ? isBookPermissionException(user, permission)
                                                ? 'bg-[#fef3c7] text-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : isBookAccessVisuallyDisabled(user, permission)
                                                ? 'bg-[#f3f4f6] text-[#9ca3af]'
                                                : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                            }
                                          `}
                                          title={
                                            user.disabled
                                              ? 'Usuario deshabilitado'
                                              : permission.disabled
                                                ? 'Libro deshabilitado'
                                                : permissionType === 'write' && isLibroObraMaestro(permission.bookId, permission.bookName)
                                                  ? 'Escritura no disponible para Libro de Obra Maestro'
                                                  : 'Alternar permiso'
                                          }
                                        >
                                          {isPermissionDisplayedAsEnabled(user, permission, permissionType) ? (
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
                                            user.disabled
                                              ? 'Usuario deshabilitado: no se puede quitar'
                                              : permission.disabled
                                                ? 'Libro deshabilitado: no se puede quitar'
                                              :
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
                                disabled={getAvailableUsersForBook(bookEntry.bookId).length === 0}
                                className="mt-4 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
        ) : viewMode === 'resources' ? (
          <div className="space-y-4">
            {resourcesFromFilteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e1e4e8] px-6 py-10 text-center text-[#6b7280]">
                No hay recursos con usuarios asignados para los filtros actuales.
              </div>
            ) : (
              resourcesFromFilteredUsers.map((resourceEntry, index) => {
                const isExpanded = expandedResources.includes(resourceEntry.resource.resourceId);
                return (
                  <motion.div
                    key={resourceEntry.resource.resourceId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center gap-4 px-6 py-5">
                      <div className="w-12 h-12 rounded-xl bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>

                      <button
                        onClick={() => toggleResource(resourceEntry.resource.resourceId)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                            {resourceEntry.resource.resourceName}
                          </h3>
                          <p className="text-sm text-[#0284c7]" style={{ fontWeight: 500 }}>
                            {resourceEntry.resource.moduleName} · {resourceEntry.assignments.length} usuarios
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                        )}
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
                          <div className="bg-[#f8f9fb] border-t border-[#e1e4e8] px-6 py-4">
                            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 mb-2 bg-white rounded-lg border border-[#e5e7eb]">
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Usuario
                              </div>
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Empresa
                              </div>
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Perfil
                              </div>
                            </div>
                            <div className="space-y-2">
                              {resourceEntry.assignments.map(({ user }) => (
                                <div
                                  key={`${resourceEntry.resource.resourceId}-${user.id}`}
                                  className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-4 bg-white rounded-lg border border-[#e5e7eb] items-center"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                      style={{ backgroundColor: user.avatarColor, fontWeight: 600 }}
                                    >
                                      {user.avatar}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{user.name}</div>
                                      <div className="text-sm text-[#6b7280]">RUN: {user.run}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-[#374151]">{user.group}</div>
                                  <div className="text-sm text-[#4f46e5]">{user.profileName || 'Sin perfil'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
        <div className="space-y-4">
          {filteredUsers.map((user, index) => {
            const isExpanded = expandedUsers.includes(user.id);
            const resourcesFromProfiles = buildResourcesFromResourceProfiles(user.resourceProfileIds || [], resourceProfilesCatalog);
            const userResources = (user.resourceProfileIds && user.resourceProfileIds.length > 0)
              ? resourcesFromProfiles
              : (user.resourcePermissions && user.resourcePermissions.length > 0)
                ? user.resourcePermissions
                : getDefaultResourcesForUser(user);
            const sectionState = expandedUserSections[user.id] || { resources: false, books: false };
            const userExpandedGroups = expandedResourceGroupsByUser[user.id] || [];
            const groupedResources = RESOURCE_GROUPS
              .map(group => ({
                ...group,
                resources: userResources.filter(resource => resource.moduleName === group.moduleName)
              }))
              .filter(group => group.resources.length > 0);

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
                        <span className="text-xs text-[#6b7280]">
                          Caducidad: {user.permissionExpiryDate || 'Sin fecha'}
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
                        <DropdownMenuItem onClick={() => setPermissionsSummaryModalUserId(user.id)}>
                          <Eye className="w-4 h-4" />
                          Resumen de permisos
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
                      <div className="bg-[#f8f9fb] border-t border-[#e1e4e8] px-6 py-4 flex flex-col gap-4">
                        <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden order-2">
                          <button
                            onClick={() => toggleUserSection(user.id, 'resources')}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
                          >
                            <h4 className="text-sm text-[#374151]" style={{ fontWeight: 600 }}>
                              Recursos Asignados ({userResources.length})
                            </h4>
                            {sectionState.resources ? (
                              <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                            )}
                          </button>

                          {sectionState.resources && (
                            <div className="border-t border-[#e5e7eb] bg-[#f8f9fb] p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Recursos Asignados ({userResources.length})
                                </h4>
                                <button
                                  onClick={() => openAddResourcesModal(user.id, user.name)}
                                  disabled={!!user.disabled}
                                  className="px-3 py-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={user.disabled ? 'Usuario deshabilitado: no se pueden agregar recursos' : 'Agregar recurso'}
                                  style={{ fontWeight: 500 }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Agregar Recurso
                                </button>
                              </div>

                              {userResources.length === 0 ? (
                                <div className="px-5 py-4 text-sm text-[#6b7280] bg-white border border-[#e5e7eb] rounded-lg">
                                  Este usuario no tiene recursos asignados
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-[1fr_140px] gap-4 px-6 py-3 border border-[#e5e7eb] border-b-0 text-[#111827] bg-white rounded-t-lg">
                                    <div style={{ fontWeight: 600 }}>Recurso</div>
                                    <div className="text-center" style={{ fontWeight: 600 }}>Permiso</div>
                                  </div>
                                  <div className="border border-[#e5e7eb] rounded-b-lg overflow-hidden bg-white">
                                    {groupedResources.map(group => {
                                      const groupOpen = userExpandedGroups.includes(group.id);
                                      return (
                                        <div key={`${user.id}-${group.id}`} className="border-b border-[#e5e7eb] last:border-b-0 bg-white">
                                          <button
                                            onClick={() => toggleUserResourceGroup(user.id, group.id)}
                                            className="w-full grid grid-cols-[1fr_140px] gap-4 px-6 py-4 text-left hover:bg-[#f8fafc] transition-colors"
                                          >
                                            <div className="flex items-center gap-2 text-[#111827]" style={{ fontWeight: 600 }}>
                                              {groupOpen ? <ChevronDown className="w-4 h-4 text-[#6b7280]" /> : <ChevronRight className="w-4 h-4 text-[#6b7280]" />}
                                              {group.name}
                                            </div>
                                            <div />
                                          </button>

                                          {groupOpen && group.resources.map(resource => (
                                            <div key={`${user.id}-${resource.resourceId}`} className="grid grid-cols-[1fr_140px] gap-4 px-6 py-4 border-t border-[#f1f5f9] items-center">
                                              <div className="pl-10 text-[#1f2937]">{resource.resourceName}</div>
                                              <div className="flex justify-center">
                                                {user.disabled ? (
                                                  <div className="w-10 h-10 rounded-md border border-[#d1d5db] bg-[#f3f4f6] text-[#9ca3af] flex items-center justify-center">
                                                    <X className="w-5 h-5" />
                                                  </div>
                                                ) : (
                                                  <button
                                                    onClick={() => removeResourceFromUser(user.id, resource.resourceId)}
                                                    className="w-10 h-10 rounded-md border border-[#fecaca] bg-white text-[#ef4444] hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
                                                    title="Quitar recurso del usuario"
                                                  >
                                                    <Trash2 className="w-5 h-5" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden order-1">
                          <button
                            onClick={() => toggleUserSection(user.id, 'books')}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
                          >
                            <h4 className="text-sm text-[#374151]" style={{ fontWeight: 600 }}>
                              Libros Asignados ({user.bookPermissions.length})
                            </h4>
                            {sectionState.books ? (
                              <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                            )}
                          </button>

                          {sectionState.books && (
                            <div className="border-t border-[#e5e7eb] bg-[#f8f9fb] p-4">
                              {/* Add Books Button */}
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Libros Asignados ({user.bookPermissions.length})
                                </h4>
                                <button
                                  onClick={() => openAddBooksModal(user.id, user.name)}
                                  disabled={!!user.disabled}
                                  className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={user.disabled ? 'Usuario deshabilitado: no se pueden agregar libros' : 'Agregar libro'}
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
                              disabled={!!user.disabled}
                              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.disabled ? 'Usuario deshabilitado: no se pueden agregar libros' : 'Agregar primer libro'}
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
                                    isBookAccessVisuallyDisabled(user, book) ? 'bg-[#f9fafb]' : 'bg-white'
                                  } ${
                                    isBookPermissionException(user, book) ? 'border-[#f59e0b]' : 'border-[#e1e4e8]'
                                  }`}
                                >
                              {/* Book Name */}
                              <div className="flex flex-col gap-1">
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
                                  {user.disabled && (
                                    <span className="px-2 py-0.5 bg-[#e5e7eb] text-[#6b7280] rounded text-xs" style={{ fontWeight: 600 }}>
                                      Usuario deshabilitado
                                    </span>
                                  )}
                                </div>
                                {hasProfileAssignedPermissionsForBook(user, book) && (
                                  <div className="text-xs text-amber-700" style={{ fontWeight: 600 }}>
                                    Permisos fijos por perfil: {getHighestHierarchyPermissionLabel(getBasePermissionsForBook(user, book))}
                                  </div>
                                )}
                              </div>

                              {/* Read Permission */}
                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleBookPermission(user.id, book.bookId, 'read')}
                                  disabled={!canToggleBookPermission(user, book, 'read')}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${isPermissionDisplayedAsEnabled(user, book, 'read')
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : isBookAccessVisuallyDisabled(user, book)
                                      ? 'bg-[#f3f4f6] text-[#9ca3af]'
                                      : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    user.disabled
                                      ? 'Usuario deshabilitado'
                                      : book.disabled
                                        ? 'Libro deshabilitado'
                                        : 'Alternar permiso de lectura'
                                  }
                                >
                                  {isPermissionDisplayedAsEnabled(user, book, 'read') ? (
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
                                  disabled={!canToggleBookPermission(user, book, 'draft')}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${isPermissionDisplayedAsEnabled(user, book, 'draft')
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : isBookAccessVisuallyDisabled(user, book)
                                      ? 'bg-[#f3f4f6] text-[#9ca3af]'
                                      : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    user.disabled
                                      ? 'Usuario deshabilitado'
                                      : book.disabled
                                        ? 'Libro deshabilitado'
                                        : 'Alternar permiso de asistente'
                                  }
                                >
                                  {isPermissionDisplayedAsEnabled(user, book, 'draft') ? (
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
                                  disabled={!canToggleBookPermission(user, book, 'write')}
                                  className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                  ${isPermissionDisplayedAsEnabled(user, book, 'write')
                                    ? isBookPermissionException(user, book)
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                    : isBookAccessVisuallyDisabled(user, book)
                                      ? 'bg-[#f3f4f6] text-[#9ca3af]'
                                      : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                  }
                                `}
                                  title={
                                    isLibroObraMaestro(book.bookId, book.bookName)
                                      ? 'Escritura no disponible para Libro de Obra Maestro'
                                      : user.disabled
                                        ? 'Usuario deshabilitado'
                                        : book.disabled
                                          ? 'Libro deshabilitado'
                                          : 'Alternar permiso de escritura'
                                  }
                                >
                                  {isPermissionDisplayedAsEnabled(user, book, 'write') ? (
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
                                      disabled={!canToggleBookPermission(user, book, 'acknowledge')}
                                      className={`
                                      w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                      ${isPermissionDisplayedAsEnabled(user, book, 'acknowledge')
                                        ? isBookPermissionException(user, book)
                                          ? 'bg-[#fef3c7] text-[#f59e0b]'
                                          : 'bg-[#dcfce7] text-[#16a34a]'
                                        : isBookAccessVisuallyDisabled(user, book)
                                          ? 'bg-[#f3f4f6] text-[#9ca3af]'
                                          : 'bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]'
                                      }
                                    `}
                                      title={
                                        user.disabled
                                          ? 'Usuario deshabilitado'
                                          : book.disabled
                                            ? 'Libro deshabilitado'
                                            : 'Alternar permiso de toma de conocimiento'
                                      }
                                    >
                                      {isPermissionDisplayedAsEnabled(user, book, 'acknowledge') ? (
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
                                            user.disabled
                                              ? 'Usuario deshabilitado: no se puede quitar'
                                              : book.disabled
                                                ? 'Libro deshabilitado: no se puede quitar'
                                              :
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
                                            user.disabled
                                              ? 'Usuario deshabilitado: no se puede quitar'
                                              : book.disabled
                                                ? 'Libro deshabilitado: no se puede quitar'
                                              :
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
                          )}
                        </div>
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

      {/* Bulk Permission Editor Modal */}
      <AnimatePresence>
        {isBulkPermissionEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
            onClick={closeBulkPermissionEditorModal}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-[1280px] h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg text-slate-900" style={{ fontWeight: 700 }}>
                      Asignación Masiva de Permisos
                    </h2>
                    <p className="text-sm text-slate-600">
                      Selecciona usuarios y libros para asignar permisos adicionales
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-sm text-slate-700 mb-2" style={{ fontWeight: 700 }}>
                      Usuarios ({bulkPermissionSelectedUserIds.length})
                    </div>
                    <div ref={bulkPermissionUsersDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setBulkPermissionUsersDropdownOpen(prev => !prev)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-left text-sm text-slate-800 flex items-center justify-between"
                      >
                        <span>{bulkPermissionSelectedUserIds.length === 0 ? 'Seleccionar usuarios...' : `${bulkPermissionSelectedUserIds.length} usuarios seleccionados`}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${bulkPermissionUsersDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {bulkPermissionUsersDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-40">
                          <div className="p-3 border-b border-slate-100">
                            <input
                              type="text"
                              value={bulkPermissionUserSearch}
                              onChange={(e) => setBulkPermissionUserSearch(e.target.value)}
                              placeholder="Buscar"
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={allFilteredBulkPermissionUsersSelected}
                              onChange={toggleSelectAllFilteredBulkPermissionUsers}
                            />
                            <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                          </label>
                          <div className="max-h-72 overflow-y-auto">
                            {bulkPermissionUsersFiltered.map(user => (
                              <label
                                key={`bulk-user-${user.id}`}
                                className="flex items-start justify-between gap-3 px-3 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50"
                              >
                                <div className="flex-1">
                                  <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{user.name}</div>
                                  <div className="text-xs text-slate-500">RUN: {user.run}</div>
                                  <div className="text-xs text-slate-500">Cargo: {user.role || '-'}</div>
                                  {user.profileName && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                      {user.profileName}
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={bulkPermissionSelectedUserIds.includes(user.id)}
                                  onChange={() => toggleBulkPermissionUserSelection(user.id)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-sm text-slate-700 mb-2" style={{ fontWeight: 700 }}>
                      Libros ({bulkPermissionSelectedBookIds.length})
                    </div>
                    <div ref={bulkPermissionBooksDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setBulkPermissionBooksDropdownOpen(prev => !prev)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-left text-sm text-slate-800 flex items-center justify-between"
                      >
                        <span>{bulkPermissionSelectedBookIds.length === 0 ? 'Seleccionar libros...' : `${bulkPermissionSelectedBookIds.length} libros seleccionados`}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${bulkPermissionBooksDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {bulkPermissionBooksDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-40">
                          <div className="p-3 border-b border-slate-100">
                            <input
                              type="text"
                              value={bulkPermissionBookSearch}
                              onChange={(e) => setBulkPermissionBookSearch(e.target.value)}
                              placeholder="Buscar"
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={allFilteredBulkPermissionBooksSelected}
                              onChange={toggleSelectAllFilteredBulkPermissionBooks}
                            />
                            <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                          </label>
                          <div className="max-h-72 overflow-y-auto">
                            {bulkPermissionBooksFiltered.map(book => (
                              <label
                                key={`bulk-book-${book.id}`}
                                className="flex items-center justify-between gap-3 px-3 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50"
                              >
                                <span className="text-sm text-slate-900">{book.name}</span>
                                <input
                                  type="checkbox"
                                  checked={bulkPermissionSelectedBookIds.includes(book.id)}
                                  onChange={() => toggleBulkPermissionBookSelection(book.id)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {bulkPermissionSelectedUserIds.length > 0 && bulkPermissionSelectedBookIds.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm text-slate-900" style={{ fontWeight: 700 }}>
                            Configurar Permisos Adicionales
                          </h3>
                          <p className="text-xs text-slate-600 mt-1">
                            Los permisos heredados del perfil se muestran en gris. Solo puedes agregar permisos adicionales.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={bulkPermissionMassAction}
                            onChange={(e) => setBulkPermissionMassAction(e.target.value as 'add' | 'remove')}
                            className="px-3 py-2 rounded-md border border-slate-300 text-sm"
                          >
                            <option value="add">Asignar permiso</option>
                            <option value="remove">Quitar permiso</option>
                          </select>
                          <select
                            value={bulkPermissionMassSelectedPermission}
                            onChange={(e) => setBulkPermissionMassSelectedPermission(e.target.value as HierarchyPermission | '')}
                            className="px-3 py-2 rounded-md border border-slate-300 text-sm min-w-[170px]"
                          >
                            <option value="">Seleccionar permiso</option>
                            {hierarchyOrder.map(permission => (
                              <option key={`mass-option-${permission}`} value={permission}>
                                {hierarchyPermissionLabels[permission]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={applyMassPermissionsToSelection}
                            disabled={!bulkPermissionMassSelectedPermission}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontWeight: 600 }}
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    </div>

                    {bulkPermissionSelectedBooks.map((book, bookIndex) => (
                      <motion.div
                        key={`bulk-editor-book-${book.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: bookIndex * 0.03 }}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                      >
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-slate-900" style={{ fontWeight: 700 }}>
                          {book.name}
                        </div>
                        <div>
                          {bulkPermissionSelectedUsers.map((user, userIndex) => {
                            const color = avatarPalette[userIndex % avatarPalette.length];
                            const bookPermission = ensureDraftBookForBulkEditor(user, book.id);
                            const basePermissions = getBasePermissionsForBook(user, bookPermission);
                            const currentPermissions = normalizePermissionsByHierarchy(bookPermission.permissions);
                            const baseLabel = getHighestHierarchyPermissionLabel(basePermissions);
                            const isBookDisabled = !!user.disabled || !!bookPermission.disabled;

                            return (
                              <div
                                key={`bulk-row-${book.id}-${user.id}`}
                                className="grid grid-cols-[1.1fr_1fr] gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 items-start"
                              >
                                <div>
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="w-12 h-12 rounded-xl text-white flex items-center justify-center"
                                      style={{ backgroundColor: color, fontWeight: 700 }}
                                    >
                                      {getUserAvatarInitials(user.name)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{user.name}</div>
                                      <div className="text-xs text-slate-500">RUN: {user.run || '12345678A'}</div>
                                      <div className="text-xs text-slate-500">Cargo: {user.role || '-'}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {user.profileName && (
                                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{user.profileName}</span>
                                        )}
                                        {baseLabel && (
                                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                            <span>🔒</span>
                                            <span>{baseLabel} desde perfil</span>
                                          </span>
                                        )}
                                      </div>
                                      {baseLabel && (
                                        <div className="mt-2 text-xs text-amber-700">
                                          ⚠️ Permisos fijos por perfil: {baseLabel}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                                  {(() => {
                                    const permissionStates = hierarchyOrder.map(permission => {
                                      const checked = currentPermissions[permission];
                                      const includedByProfile = normalizePermissionsByHierarchy(basePermissions)[permission];
                                      const disabledByProfile = checked && includedByProfile;
                                      const disabledByRule = isBookDisabled ||
                                        (permission === 'write' && isLibroObraMaestro(bookPermission.bookId, bookPermission.bookName)) ||
                                        (checked
                                          ? (!canRemoveHierarchyPermission(currentPermissions, basePermissions, permission) || disabledByProfile)
                                          : !canAddHierarchyPermission(currentPermissions, basePermissions, permission));
                                      return {
                                        permission,
                                        checked,
                                        disabledByRule
                                      };
                                    });
                                    return (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
                                          {permissionStates.map(state => (
                                            <div
                                              key={`bulk-row-head-${book.id}-${user.id}-${state.permission}`}
                                              className="flex items-center justify-center gap-1.5 text-slate-800 text-xs"
                                              style={{ fontWeight: 700 }}
                                            >
                                              <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                              <span className={state.disabledByRule ? 'text-slate-400' : 'text-slate-800'}>
                                                {hierarchyPermissionLabels[state.permission]}
                                              </span>
                                            </div>
                                          ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 pt-2.5">
                                          {permissionStates.map(state => (
                                            <div
                                              key={`bulk-row-cell-${book.id}-${user.id}-${state.permission}`}
                                              className="flex items-center justify-center"
                                            >
                                              <button
                                                type="button"
                                                disabled={state.disabledByRule}
                                                onClick={() => updateSingleBulkEditorPermission(user.id, book.id, state.permission, !state.checked)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                                                  state.checked
                                                    ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#74c69d]'
                                                    : 'bg-white border-[#d1d5db] text-[#9ca3af]'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                              >
                                                {state.checked ? (
                                                  <Check className="w-6 h-6" strokeWidth={3} />
                                                ) : (
                                                  <Square className="w-4 h-4 text-transparent" />
                                                )}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Selecciona al menos un usuario y un libro para comenzar</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-8 py-4 sticky bottom-0">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeBulkPermissionEditorModal}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                    style={{ fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={applyBulkPermissionEditorChanges}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    style={{ fontWeight: 600 }}
                  >
                    Guardar Permisos
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Create User Modal */}
      <AnimatePresence>
        {isQuickCreateUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={closeQuickCreateUserModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-4xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Crear especialista: {quickCreateForm.run.trim() || '---'}
                </h3>
                <button
                  onClick={closeQuickCreateUserModal}
                  className="text-[#6b7280] hover:text-[#374151] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    value={quickCreateForm.run}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, run: e.target.value }))}
                    placeholder="RUT"
                    className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                  {quickCreateRunExists && (
                    <p className="text-sm text-[#ef4444] mt-2">El RUT ingresado ya existe en el sistema.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={quickCreateForm.name}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre completo"
                    className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                  <input
                    type="email"
                    value={quickCreateForm.email}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={quickCreateForm.group}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {CONSTRUCTION_COMPANIES.map(company => (
                      <option key={`quick-company-${company}`} value={company}>{company}</option>
                    ))}
                  </select>
                  <select
                    value={quickCreateForm.role}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">Seleccionar cargo...</option>
                    {DEFAULT_CARGO_OPTIONS.map(role => (
                      <option key={`quick-role-${role}`} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div ref={quickProfilesDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQuickProfilesDropdownOpen(prev => !prev)}
                      className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] flex items-center justify-between"
                    >
                      <span className="text-sm text-left" style={{ fontWeight: 500 }}>
                        {quickCreateForm.profileIds.length === 0
                          ? 'Sin Perfil'
                          : `${quickCreateForm.profileIds.length} perfil(es) seleccionado(s)`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isQuickProfilesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isQuickProfilesDropdownOpen && (
                      <div className="absolute bottom-full mb-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={quickProfilesSearch}
                            onChange={(e) => setQuickProfilesSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                          />
                        </div>
                        <div className="max-h-[38vh] overflow-y-auto">
                          {filteredQuickPermissionProfiles.map(profile => (
                            <label
                              key={`quick-profile-${profile.id}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#f1f5f9] last:border-b-0 cursor-pointer hover:bg-[#f8fafc]"
                            >
                              <span className="text-sm text-[#1f2937]">{profile.name}</span>
                              <input
                                type="checkbox"
                                checked={quickCreateForm.profileIds.includes(profile.id)}
                                onChange={() => toggleQuickPermissionProfile(profile.id)}
                              />
                            </label>
                          ))}
                          {filteredQuickPermissionProfiles.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No se encontraron perfiles.</div>
                          )}
                        </div>
                      </div>
                    )}
                    {quickProfilesWarning && (
                      <p className="text-xs text-[#dc2626] mt-2">{quickProfilesWarning}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="date"
                      value={quickCreateForm.permissionExpiryDate}
                      onChange={(e) => setQuickCreateForm(prev => ({ ...prev, permissionExpiryDate: e.target.value }))}
                      className="w-full px-5 py-4 bg-white border border-[#d1d5db] rounded-2xl text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={closeQuickCreateUserModal}
                  className="px-10 py-3 rounded-2xl border border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={createSingleUser}
                  disabled={!canSaveQuickCreateUser}
                  className="px-10 py-3 rounded-2xl bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                            <option value="">Seleccionar empresa...</option>
                            {CONSTRUCTION_COMPANIES.map(company => (
                              <option key={`bulk-company-${company}`} value={company}>{company}</option>
                            ))}
                          </select>
                          <select
                            value={editingDraft.role}
                            onChange={(e) => updateBulkCreateUser(editingDraft.id, { role: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg"
                          >
                            <option value="">Seleccionar cargo...</option>
                            {DEFAULT_CARGO_OPTIONS.map(role => (
                              <option key={`bulk-role-${role}`} value={role}>{role}</option>
                            ))}
                          </select>
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

      {/* Bulk Create Result Modal */}
      <AnimatePresence>
        {bulkCreateResultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
            onClick={() => setBulkCreateResultModal(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[86vh] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-center justify-between">
                <div>
                  <h3 className="text-3xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Resultado de Asignación
                  </h3>
                  <p className="text-sm text-[#6b7280] mt-1">
                    Nuevos: {bulkCreateResultModal.createdUsers} | Existentes actualizados: {bulkCreateResultModal.updatedUsers}
                  </p>
                </div>
                <button
                  onClick={() => setBulkCreateResultModal(null)}
                  className="px-4 py-2 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cerrar
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(86vh-92px)]">
                <div className="rounded-xl border border-[#d1fae5] bg-[#f0fdf4]">
                  <div className="px-4 py-3 border-b border-[#bbf7d0]">
                    <div style={{ fontWeight: 600, color: '#166534' }}>
                      Permisos aplicados ({bulkCreateResultModal.appliedAssignments.length})
                    </div>
                  </div>
                  <div className="max-h-[46vh] overflow-y-auto divide-y divide-[#dcfce7]">
                    {bulkCreateResultModal.appliedAssignments.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-[#166534]">No hubo cambios aplicados.</div>
                    ) : (
                      bulkCreateResultModal.appliedAssignments.map((item, idx) => (
                        <div key={`applied-${idx}`} className="px-4 py-3 text-sm">
                          <div style={{ fontWeight: 600, color: '#14532d' }}>{item.userName}</div>
                          <div className="text-[#166534]">{item.bookName}</div>
                          <div className="text-[#15803d]">{formatPermissionSummary(item.permissions)}</div>
                          {item.note && <div className="text-xs text-[#16a34a] mt-1">{item.note}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2]">
                  <div className="px-4 py-3 border-b border-[#fecaca]">
                    <div style={{ fontWeight: 600, color: '#991b1b' }}>
                      Permisos no aplicados ({bulkCreateResultModal.omittedAssignments.length})
                    </div>
                  </div>
                  <div className="max-h-[46vh] overflow-y-auto divide-y divide-[#fee2e2]">
                    {bulkCreateResultModal.omittedAssignments.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-[#991b1b]">No hubo omisiones.</div>
                    ) : (
                      bulkCreateResultModal.omittedAssignments.map((item, idx) => (
                        <div key={`omitted-${idx}`} className="px-4 py-3 text-sm">
                          <div style={{ fontWeight: 600, color: '#7f1d1d' }}>{item.userName}</div>
                          <div className="text-[#991b1b]">{item.bookName}</div>
                          <div className="text-[#b91c1c]">{formatPermissionSummary(item.permissions)}</div>
                          {item.note && <div className="text-xs text-[#dc2626] mt-1">{item.note}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
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
                    Modifica la empresa, cargo y perfil del usuario
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

                {/* Company Selector */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Empresa
                  </label>
                  <select
                    value={editForm.group}
                    onChange={(e) => setEditForm(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {CONSTRUCTION_COMPANIES.map(company => (
                      <option key={`edit-company-${company}`} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Cargo Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                      Cargos ({editSelectedRoles.length})
                    </label>
                    <button
                      type="button"
                      onClick={createEditCargo}
                      className="text-xs text-[#2563eb] hover:text-[#1d4ed8]"
                      style={{ fontWeight: 600 }}
                    >
                      + Crear cargo
                    </button>
                  </div>
                  <div ref={editRolesDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEditRolesDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] flex items-center justify-between"
                    >
                      <span className="text-sm" style={{ fontWeight: 500 }}>
                        {editSelectedRoles.length === 0
                          ? 'Seleccionar cargos...'
                          : `${editSelectedRoles.length} cargos seleccionados`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isEditRolesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isEditRolesDropdownOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={editRoleSearch}
                            onChange={(e) => setEditRoleSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                          />
                        </div>
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-[#eef2f7] text-sm text-[#374151] cursor-pointer hover:bg-[#f8fafc]">
                          <input
                            type="checkbox"
                            checked={allFilteredEditRolesSelected}
                            onChange={toggleSelectAllFilteredEditRoles}
                          />
                          <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                        </label>
                        <div className="max-h-56 overflow-y-auto">
                          {filteredEditRoleOptions.map(role => (
                            <label
                              key={`edit-role-${role}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#f1f5f9] last:border-b-0 cursor-pointer hover:bg-[#f8fafc]"
                            >
                              <span className="text-sm text-[#1f2937]">{role}</span>
                              <input
                                type="checkbox"
                                checked={editSelectedRoles.includes(role)}
                                onChange={() => toggleEditRole(role)}
                              />
                            </label>
                          ))}
                          {filteredEditRoleOptions.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No se encontraron cargos.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Selector */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Perfiles de Permisos ({editForm.profileIds.length})
                  </label>
                  <div ref={editProfilesDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEditProfilesDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] flex items-center justify-between"
                    >
                      <span className="text-sm" style={{ fontWeight: 500 }}>
                        {editForm.profileIds.length === 0
                          ? 'Sin Perfil'
                          : `${editForm.profileIds.length} perfil(es) seleccionado(s)`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isEditProfilesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isEditProfilesDropdownOpen && (
                      <div className="absolute bottom-full mb-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={editProfilesSearch}
                            onChange={(e) => setEditProfilesSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                          />
                        </div>
                        <div className="max-h-[38vh] overflow-y-auto">
                          {filteredEditPermissionProfiles.map(profile => (
                            <label
                              key={`edit-permission-profile-${profile.id}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#f1f5f9] last:border-b-0 cursor-pointer hover:bg-[#f8fafc]"
                            >
                              <span className="text-sm text-[#1f2937]">{profile.name}</span>
                              <input
                                type="checkbox"
                                checked={editForm.profileIds.includes(profile.id)}
                                onChange={() => toggleEditPermissionProfile(profile.id)}
                              />
                            </label>
                          ))}
                          {filteredEditPermissionProfiles.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No se encontraron perfiles.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {editProfilesWarning && (
                    <p className="text-xs text-[#dc2626] mt-2">{editProfilesWarning}</p>
                  )}
                  <p className="text-xs text-[#6b7280] mt-2">
                    Sin perfil, el usuario puede agregar cualquier libro y permiso. Si elige perfiles, se aplican permisos base combinados.
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Fecha de caducidad de permisos
                  </label>
                  <input
                    type="date"
                    value={editForm.permissionExpiryDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, permissionExpiryDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  />
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
                  disabled={!editForm.group || editSelectedRoles.length === 0}
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

      {/* Add Resources Modal */}
      <AnimatePresence>
        {addResourcesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeAddResourcesModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#ecfeff] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Agregar Recursos
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Selecciona recursos para <span style={{ fontWeight: 500 }}>{addResourcesModal.userName}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                {(() => {
                  const availableResources = getAvailableResourcesForUser(addResourcesModal.userId);
                  const normalizedSearch = resourceSearchInAddModal.trim().toLowerCase();
                  const filteredResources = normalizedSearch.length === 0
                    ? availableResources
                    : availableResources.filter(resource =>
                        resource.resourceName.toLowerCase().includes(normalizedSearch) ||
                        resource.moduleName.toLowerCase().includes(normalizedSearch)
                      );

                  const resourcesByModule = filteredResources.reduce<Record<string, UserResourceAccess[]>>((acc, resource) => {
                    if (!acc[resource.moduleName]) acc[resource.moduleName] = [];
                    acc[resource.moduleName].push(resource);
                    return acc;
                  }, {});
                  const mappedModuleNames = new Set(Object.keys(resourcesByModule));
                  const moduleNames = [
                    ...RESOURCE_GROUPS
                      .map(group => group.moduleName)
                      .filter(moduleName => mappedModuleNames.has(moduleName)),
                    ...Object.keys(resourcesByModule)
                      .filter(moduleName => !RESOURCE_GROUPS.some(group => group.moduleName === moduleName))
                      .sort((a, b) => a.localeCompare(b))
                  ];

                  if (availableResources.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-[#6b7280]">No hay recursos disponibles para agregar</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={resourceSearchInAddModal}
                          onChange={(e) => setResourceSearchInAddModal(e.target.value)}
                          placeholder="Buscar recurso o módulo..."
                          className="w-full px-3 py-2 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                        />
                      </div>
                      {filteredResources.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[#6b7280]">No hay recursos para esta búsqueda</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-[#d1d5db] overflow-hidden bg-white">
                          <div className="grid grid-cols-[1fr_120px] gap-4 px-4 py-3 border-b border-[#e5e7eb] bg-[#f8fafc]">
                            <div style={{ fontWeight: 700, color: '#111827' }}>Recurso</div>
                            <div className="text-center" style={{ fontWeight: 700, color: '#111827' }}>Permiso</div>
                          </div>

                          {moduleNames.map(moduleName => {
                            const isModuleExpanded = expandedResourceModulesInAddModal.includes(moduleName);
                            const moduleResources = resourcesByModule[moduleName]
                              .slice()
                              .sort((a, b) => a.resourceName.localeCompare(b.resourceName));

                            return (
                              <div key={moduleName} className="border-b border-[#e5e7eb] last:border-b-0">
                                <button
                                  type="button"
                                  onClick={() => toggleResourceModuleInAddModal(moduleName)}
                                  className="w-full grid grid-cols-[1fr_120px] gap-4 px-4 py-3 bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2" style={{ fontWeight: 700, color: '#111827' }}>
                                    {isModuleExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                                    )}
                                    {moduleName}
                                  </div>
                                  <div />
                                </button>

                                {isModuleExpanded && moduleResources.map(resource => {
                                  const checked = selectedResourcesToAdd.includes(resource.resourceId);
                                  return (
                                    <button
                                      key={resource.resourceId}
                                      type="button"
                                      onClick={() => toggleResourceSelectionToAdd(resource.resourceId)}
                                      className="w-full grid grid-cols-[1fr_120px] gap-4 px-10 py-3 border-t border-[#eef2f7] hover:bg-[#f8fafc] transition-colors text-left"
                                    >
                                      <div style={{ color: '#0f172a' }}>{resource.resourceName}</div>
                                      <div className="flex justify-center">
                                        <span className={`w-8 h-8 rounded border flex items-center justify-center ${
                                          checked
                                            ? 'bg-[#dbeafe] border-[#93c5fd] text-[#2563eb]'
                                            : 'bg-white border-[#94a3b8] text-transparent'
                                        }`}>
                                          <Check className="w-4 h-4" strokeWidth={3} />
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeAddResourcesModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addResourcesToUser}
                  disabled={selectedResourcesToAdd.length === 0}
                  className="flex-1 px-4 py-3 bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Agregar {selectedResourcesToAdd.length > 0 ? `(${selectedResourcesToAdd.length})` : ''}
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
              className="bg-white rounded-xl shadow-2xl p-8 max-w-5xl w-full max-h-[85vh] overflow-y-auto"
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
                    Selecciona libros y recursos de <span style={{ fontWeight: 600 }}>{copyPermissionsModal.sourceUserName}</span> y los usuarios destino.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 mb-6">
                <div>
                  <div className="text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Libros ({selectedBooksToCopy.length})
                  </div>
                  <div ref={copyBooksDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCopyBooksDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-3 rounded-lg border border-[#d1d5db] bg-white text-left text-sm text-[#1f2937] flex items-center justify-between"
                    >
                      <span>{selectedBooksToCopy.length} libros seleccionados</span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isCopyBooksDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCopyBooksDropdownOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={copyBooksSearch}
                            onChange={(e) => setCopyBooksSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm rounded-md border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          />
                        </div>
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-[#eef2f7] text-sm text-[#374151] cursor-pointer hover:bg-[#f8fafc]">
                          <input
                            type="checkbox"
                            checked={allFilteredCopyBooksSelected}
                            onChange={toggleSelectAllFilteredCopyBooks}
                          />
                          <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                        </label>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCopyBooks.map(book => (
                            <label
                              key={`copy-book-${book.bookId}`}
                              className="flex items-start justify-between gap-3 px-3 py-3 border-b border-[#f1f5f9] last:border-b-0 cursor-pointer hover:bg-[#f8fafc]"
                            >
                              <div className="flex-1">
                                <div className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                                  {book.bookName}
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedBooksToCopy.includes(book.bookId)}
                                onChange={() => toggleBookSelectionForCopy(book.bookId)}
                              />
                            </label>
                          ))}
                          {filteredCopyBooks.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No hay libros disponibles.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Recursos ({selectedResourcesToCopy.length})
                  </div>
                  <div ref={copyResourcesDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCopyResourcesDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-3 rounded-lg border border-[#d1d5db] bg-white text-left text-sm text-[#1f2937] flex items-center justify-between"
                    >
                      <span>{selectedResourcesToCopy.length} recursos seleccionados</span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isCopyResourcesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCopyResourcesDropdownOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={copyResourcesSearch}
                            onChange={(e) => setCopyResourcesSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm rounded-md border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          />
                        </div>
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-[#eef2f7] text-sm text-[#374151] cursor-pointer hover:bg-[#f8fafc]">
                          <input
                            type="checkbox"
                            checked={allFilteredCopyResourcesSelected}
                            onChange={toggleSelectAllFilteredCopyResources}
                          />
                          <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                        </label>
                        <div className="max-h-72 overflow-y-auto">
                          {filteredCopyResourceModuleNames.map(moduleName => {
                            const resourcesInModule = filteredCopyResourcesByModule[moduleName] || [];
                            const isExpanded = expandedCopyResourceModules.includes(moduleName);
                            return (
                              <div key={`copy-resource-module-${moduleName}`} className="border-b border-[#f1f5f9] last:border-b-0">
                                <button
                                  type="button"
                                  onClick={() => toggleCopyResourceModule(moduleName)}
                                  className="w-full px-3 py-3 flex items-center justify-between text-left hover:bg-[#f8fafc]"
                                >
                                  <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>{moduleName}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                                  )}
                                </button>
                                {isExpanded && resourcesInModule.map(resource => (
                                  <label
                                    key={`copy-resource-${resource.resourceId}`}
                                    className="flex items-center justify-between gap-3 px-5 py-2 cursor-pointer hover:bg-[#f8fafc]"
                                  >
                                    <span className="text-sm text-[#334155]">{resource.resourceName}</span>
                                    <input
                                      type="checkbox"
                                      checked={selectedResourcesToCopy.includes(resource.resourceId)}
                                      onChange={() => toggleResourceSelectionForCopy(resource.resourceId)}
                                    />
                                  </label>
                                ))}
                              </div>
                            );
                          })}
                          {filteredCopyResourceModuleNames.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No hay recursos disponibles.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                    Usuarios destino ({selectedUsersForCopy.length})
                  </div>
                  <div ref={copyUsersDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCopyUsersDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-3 rounded-lg border border-[#d1d5db] bg-white text-left text-sm text-[#1f2937] flex items-center justify-between"
                    >
                      <span>{selectedUsersForCopy.length} usuarios seleccionados</span>
                      <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isCopyUsersDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCopyUsersDropdownOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-[#eef2f7]">
                          <input
                            type="text"
                            value={copyUsersSearch}
                            onChange={(e) => setCopyUsersSearch(e.target.value)}
                            placeholder="Buscar"
                            className="w-full px-3 py-2 text-sm rounded-md border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          />
                        </div>
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-[#eef2f7] text-sm text-[#374151] cursor-pointer hover:bg-[#f8fafc]">
                          <input
                            type="checkbox"
                            checked={allFilteredCopyUsersSelected}
                            onChange={toggleSelectAllFilteredCopyUsers}
                          />
                          <span style={{ fontWeight: 600 }}>Seleccionar todos</span>
                        </label>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCopyUsers.map(user => (
                            <label
                              key={`copy-user-${user.id}`}
                              className="flex items-start justify-between gap-3 px-3 py-3 border-b border-[#f1f5f9] last:border-b-0 cursor-pointer hover:bg-[#f8fafc]"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs"
                                  style={{ backgroundColor: user.avatarColor, fontWeight: 700 }}
                                >
                                  {user.avatar || getUserAvatarInitials(user.name)}
                                </div>
                                <div>
                                  <div className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>{user.name}</div>
                                  <div className="text-xs text-[#64748b]">RUN: {user.run}</div>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedUsersForCopy.includes(user.id)}
                                onChange={() => toggleUserSelectionForCopy(user.id)}
                              />
                            </label>
                          ))}
                          {filteredCopyUsers.length === 0 && (
                            <div className="px-3 py-3 text-sm text-[#6b7280]">No hay usuarios disponibles.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(selectedBooksToCopy.length > 0 || selectedResourcesToCopy.length > 0 || selectedUsersForCopy.length > 0) && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg text-sm text-[#1d4ed8]">
                  <span style={{ fontWeight: 600 }}>
                    Seleccionados: {selectedBooksToCopy.length} libro(s), {selectedResourcesToCopy.length} recurso(s) y {selectedUsersForCopy.length} usuario(s).
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
                  onClick={openCopyPermissionsPreview}
                  disabled={(selectedBooksToCopy.length === 0 && selectedResourcesToCopy.length === 0) || selectedUsersForCopy.length === 0}
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

      <AnimatePresence>
        {isCopyPreviewModalOpen && copyPermissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[60]"
            onClick={() => setIsCopyPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-[#e5e7eb]">
                <h3 className="text-xl text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Previsualización de cambios
                </h3>
                <p className="text-sm text-[#6b7280] mt-1">
                  Revisa los cambios antes de aplicar la copia de permisos.
                </p>
              </div>

              <div className="px-6 py-4 overflow-y-auto space-y-3">
                {copyPreviewItems.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#fff7ed] text-[#9a3412] text-sm">
                    No hay cambios aplicables con la selección actual.
                  </div>
                ) : (
                  copyPreviewItems.map(item => (
                    <div key={`copy-preview-${item.userId}`} className="p-4 rounded-lg border border-[#e5e7eb]">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: item.avatarColor, fontWeight: 700 }}
                        >
                          {item.avatar || getUserAvatarInitials(item.userName)}
                        </div>
                        <div>
                          <div className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>{item.userName}</div>
                          <div className="text-xs text-[#64748b]">RUN: {item.userRun}</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#64748b] mb-3">
                        Total cambios aplicables: <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.totalChanges}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-[#0f172a]" style={{ fontWeight: 700 }}>
                          Libros
                        </div>
                        {item.bookChangeDetails.length === 0 ? (
                          <div className="text-sm text-[#64748b]">Sin cambios en libros.</div>
                        ) : (
                          item.bookChangeDetails.map(detail => (
                            <div key={`book-change-${item.userId}-${detail.bookId}`} className="rounded-md border border-[#e2e8f0] p-3">
                              <div className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                                {detail.bookName}
                              </div>
                              {detail.blockedByProfile ? (
                                <div className="text-xs text-amber-700 mt-1">
                                  No se aplicará: permisos fijos por perfil en usuario destino.
                                </div>
                              ) : (
                                <div className="text-xs text-[#475569] mt-1">
                                  <span style={{ fontWeight: 600 }}>Antes:</span> {formatPermissionSummary(detail.from)}
                                  <br />
                                  <span style={{ fontWeight: 600 }}>Después:</span> {formatPermissionSummary(detail.to)}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="text-sm text-[#0f172a]" style={{ fontWeight: 700 }}>
                          Recursos
                        </div>
                        {item.resourcesLockedByProfile ? (
                          <div className="text-xs text-amber-700">
                            No se aplicará: recursos bloqueados por perfil en usuario destino.
                          </div>
                        ) : item.resourcesToAdd.length === 0 && item.resourcesToRemove.length === 0 ? (
                          <div className="text-sm text-[#64748b]">Sin cambios en recursos.</div>
                        ) : (
                          <div className="text-xs text-[#475569]">
                            {item.resourcesToAdd.length > 0 && (
                              <div>
                                <span style={{ fontWeight: 600 }}>Agregar:</span> {item.resourcesToAdd.join(', ')}
                              </div>
                            )}
                            {item.resourcesToRemove.length > 0 && (
                              <div className="mt-1">
                                <span style={{ fontWeight: 600 }}>Quitar:</span> {item.resourcesToRemove.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between gap-3">
                <div className="text-sm text-[#334155]">
                  Total de cambios: <span style={{ fontWeight: 700 }}>{copyPreviewTotalChanges}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCopyPreviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-[#f8fafc]"
                    style={{ fontWeight: 600 }}
                  >
                    Volver
                  </button>
                  <button
                    onClick={applyCopiedPermissions}
                    disabled={copyPreviewTotalChanges === 0}
                    className="px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontWeight: 600 }}
                  >
                    Confirmar copia
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Permissions Summary Modal */}
      <AnimatePresence>
        {permissionsSummaryUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setPermissionsSummaryModalUserId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-5xl w-full max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: permissionsSummaryUser.avatarColor, fontWeight: 700 }}
                  >
                    {permissionsSummaryUser.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl text-[#1f2937]" style={{ fontWeight: 700 }}>
                      Resumen general de permisos
                    </h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      {permissionsSummaryUser.name} · RUN: {permissionsSummaryUser.run}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-[#eff6ff] text-[#1d4ed8]" style={{ fontWeight: 600 }}>
                        Empresa: {permissionsSummaryUser.group || '-'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#f8fafc] text-[#334155]" style={{ fontWeight: 600 }}>
                        Cargo: {permissionsSummaryUser.role || '-'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#f5f3ff] text-[#5b21b6]" style={{ fontWeight: 600 }}>
                        Perfil: {permissionsSummaryUser.profileName || 'Sin perfil'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPermissionsSummaryModalUserId(null)}
                  className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4">
                  <div className="text-xs uppercase tracking-wide text-[#1d4ed8]" style={{ fontWeight: 700 }}>
                    Libros
                  </div>
                  <div className="text-3xl text-[#1d4ed8] mt-1" style={{ fontWeight: 700 }}>
                    {permissionsSummaryUser.bookPermissions.length}
                  </div>
                </div>
                <div className="rounded-xl border border-[#cffafe] bg-[#ecfeff] p-4">
                  <div className="text-xs uppercase tracking-wide text-[#0f766e]" style={{ fontWeight: 700 }}>
                    Recursos
                  </div>
                  <div className="text-3xl text-[#0f766e] mt-1" style={{ fontWeight: 700 }}>
                    {permissionsSummaryResources.length}
                  </div>
                </div>
                <div className="rounded-xl border border-[#ede9fe] bg-[#f5f3ff] p-4">
                  <div className="text-xs uppercase tracking-wide text-[#6d28d9]" style={{ fontWeight: 700 }}>
                    Estado usuario
                  </div>
                  <div className="text-lg text-[#6d28d9] mt-2" style={{ fontWeight: 700 }}>
                    {permissionsSummaryUser.disabled ? 'Deshabilitado' : 'Habilitado'}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg text-[#1f2937] mb-3" style={{ fontWeight: 700 }}>
                  Permisos de libros
                </h4>
                <div className="rounded-xl border border-[#e5e7eb] overflow-hidden">
                  <div className="grid grid-cols-[1.5fr_2fr] gap-4 px-4 py-3 bg-[#f8fafc] text-sm text-[#334155]" style={{ fontWeight: 700 }}>
                    <div>Libro</div>
                    <div>Permisos</div>
                  </div>
                  {permissionsSummaryUser.bookPermissions.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-[#64748b]">Sin libros asignados.</div>
                  ) : (
                    permissionsSummaryUser.bookPermissions.map(book => (
                      <div key={`summary-book-${permissionsSummaryUser.id}-${book.bookId}`} className="grid grid-cols-[1.5fr_2fr] gap-4 px-4 py-3 border-t border-[#f1f5f9] text-sm">
                        <div className="text-[#1f2937]" style={{ fontWeight: 600 }}>{book.bookName}</div>
                        <div className="text-[#475569]">{formatPermissionSummary(book.permissions)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg text-[#1f2937] mb-3" style={{ fontWeight: 700 }}>
                  Permisos de recursos
                </h4>
                <div className="rounded-xl border border-[#e5e7eb] overflow-hidden">
                  {permissionsSummaryResources.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-[#64748b]">Sin recursos asignados.</div>
                  ) : (
                    permissionsSummaryResourceModules.map(moduleName => (
                      <div key={`summary-module-${permissionsSummaryUser.id}-${moduleName}`} className="border-t border-[#f1f5f9] first:border-t-0">
                        <div className="px-4 py-3 bg-[#f8fafc] text-sm text-[#0f172a]" style={{ fontWeight: 700 }}>
                          {moduleName}
                        </div>
                        <div className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {(permissionsSummaryResourcesByModule[moduleName] || []).map(resource => (
                              <span
                                key={`summary-resource-${permissionsSummaryUser.id}-${resource.resourceId}`}
                                className="px-2.5 py-1 rounded-full text-xs bg-[#eef2ff] text-[#4338ca]"
                                style={{ fontWeight: 600 }}
                              >
                                {resource.resourceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
