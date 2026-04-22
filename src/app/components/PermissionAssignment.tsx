import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, BookOpen, UserPlus, Trash2, Check, X, Filter, Users, Shield, AlertCircle, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  run: string;
  avatar: string;
  avatarColor: string;
  profileId?: string;
  profileName?: string;
  permissions: {
    read: boolean;
    draft: boolean;
    write: boolean;
    acknowledge: boolean;
  };
  customPermissions?: {
    read?: boolean;
    draft?: boolean;
    write?: boolean;
    acknowledge?: boolean;
  };
}

interface Book {
  id: string;
  name: string;
  users: User[];
}

const mockBooks: Book[] = [
  {
    id: '1',
    name: 'Libro de Obra Maestro',
    users: [
      {
        id: '1',
        name: 'María García López',
        run: '12345678A',
        avatar: 'M',
        avatarColor: '#9333ea',
        profileId: '2',
        profileName: 'Administrador Mandante',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      },
      {
        id: '2',
        name: 'Juan Martínez Ruiz',
        run: '87654321B',
        avatar: 'J',
        avatarColor: '#6366f1',
        profileId: '4',
        profileName: 'Consultor',
        permissions: { read: true, draft: false, write: false, acknowledge: true }
      },
      {
        id: '3',
        name: 'Laura Pérez Moreno',
        run: '78945612E',
        avatar: 'L',
        avatarColor: '#8b5cf6',
        profileId: '4',
        profileName: 'Consultor',
        permissions: { read: true, draft: false, write: true, acknowledge: false },
        customPermissions: { write: true }
      }
    ]
  },
  {
    id: '2',
    name: 'Libro de Comunicaciones',
    users: [
      {
        id: '4',
        name: 'Carlos Sánchez Gil',
        run: '45678912C',
        avatar: 'C',
        avatarColor: '#ec4899',
        profileId: '6',
        profileName: 'Visualizador',
        permissions: { read: true, draft: true, write: false, acknowledge: true },
        customPermissions: { draft: true }
      },
      {
        id: '5',
        name: 'Ana Torres Vega',
        run: '32165498D',
        avatar: 'A',
        avatarColor: '#14b8a6',
        profileId: '2',
        profileName: 'Administrador Mandante',
        permissions: { read: true, draft: true, write: true, acknowledge: true }
      }
    ]
  },
  {
    id: '3',
    name: 'Libro de Especialidades',
    users: []
  }
];

const availableUsers: Omit<User, 'permissions'>[] = [
  { id: '6', name: 'Pedro Rodríguez', run: '11223344F', avatar: 'P', avatarColor: '#f97316' },
  { id: '7', name: 'Sofía Ramírez', run: '55667788G', avatar: 'S', avatarColor: '#06b6d4' },
  { id: '8', name: 'Miguel Ángel Castro', run: '99887766H', avatar: 'MA', avatarColor: '#8b5cf6' },
  { id: '9', name: 'Isabel Morales', run: '22334455I', avatar: 'I', avatarColor: '#ec4899' },
  { id: '10', name: 'Diego Fernández', run: '66778899J', avatar: 'D', avatarColor: '#10b981' }
];

export function PermissionAssignment() {
  const [expandedBooks, setExpandedBooks] = useState<string[]>(['1']);
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [addUserModal, setAddUserModal] = useState<{ bookId: string; bookName: string } | null>(null);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<string[]>([]);

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const togglePermission = (bookId: string, userId: string, permission: keyof User['permissions']) => {
    setBooks(prev => prev.map(book =>
      book.id === bookId
        ? {
            ...book,
            users: book.users.map(user =>
              user.id === userId
                ? {
                    ...user,
                    permissions: {
                      ...user.permissions,
                      [permission]: !user.permissions[permission]
                    }
                  }
                : user
            )
          }
        : book
    ));
  };

  const removeUser = (bookId: string, userId: string) => {
    setBooks(prev => prev.map(book =>
      book.id === bookId
        ? {
            ...book,
            users: book.users.filter(user => user.id !== userId)
          }
        : book
    ));
  };

  const openAddUserModal = (bookId: string, bookName: string) => {
    setAddUserModal({ bookId, bookName });
    setSelectedUsersToAdd([]);
  };

  const closeAddUserModal = () => {
    setAddUserModal(null);
    setSelectedUsersToAdd([]);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsersToAdd(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const addUsersToBook = () => {
    if (!addUserModal || selectedUsersToAdd.length === 0) return;

    const usersToAdd = availableUsers
      .filter(user => selectedUsersToAdd.includes(user.id))
      .map(user => ({
        ...user,
        permissions: { read: false, draft: false, write: false, acknowledge: false }
      }));

    setBooks(prev => prev.map(book =>
      book.id === addUserModal.bookId
        ? {
            ...book,
            users: [...book.users, ...usersToAdd]
          }
        : book
    ));

    closeAddUserModal();
  };

  const getAvailableUsersForBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return availableUsers;

    const existingUserIds = book.users.map(u => u.id);
    return availableUsers.filter(user => !existingUserIds.includes(user.id));
  };

  const toggleAllPermissions = (bookId: string, permissionType: keyof User['permissions']) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.users.length === 0) return;

    // Check if all permissions of this type are already enabled
    const allEnabled = book.users.every(user => user.permissions[permissionType]);

    // Toggle all to opposite state
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? {
            ...b,
            users: b.users.map(user => ({
              ...user,
              permissions: {
                ...user.permissions,
                [permissionType]: !allEnabled
              }
            }))
          }
        : b
    ));
  };

  const getPermissionCheckboxState = (bookId: string, permissionType: keyof User['permissions']) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.users.length === 0) return 'none';

    const enabledCount = book.users.filter(user => user.permissions[permissionType]).length;

    if (enabledCount === 0) return 'none';
    if (enabledCount === book.users.length) return 'all';
    return 'some';
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl" style={{ fontWeight: 600, color: '#1f2937' }}>
              Gestión de Permisos
            </h1>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por RUN..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              />
            </div>
            <button className="p-3 bg-white border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors">
              <Filter className="w-5 h-5 text-[#6b7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-4">
          {books.map((book, index) => {
            const isExpanded = expandedBooks.includes(book.id);

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden shadow-sm"
              >
                {/* Book Header */}
                <div className="flex items-center gap-4 px-6 py-5">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>

                  {/* Book Info */}
                  <button
                    onClick={() => toggleBook(book.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                        {book.name}
                      </h3>
                      <p className="text-sm text-[#3b82f6]" style={{ fontWeight: 500 }}>
                        {book.users.length} usuarios
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

                  {/* Add User Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddUserModal(book.id, book.name);
                    }}
                    className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>

                {/* Expanded Content */}
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
                        {book.users.length > 0 ? (
                          <div className="px-6 py-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 px-4 py-3 mb-2 bg-[#f8f9fb] rounded-lg">
                              <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                Profesional
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => toggleAllPermissions(book.id, 'read')}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                                  title="Seleccionar/Deseleccionar todos"
                                >
                                  {getPermissionCheckboxState(book.id, 'read') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(book.id, 'read') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(book.id, 'draft')}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                                  title="Seleccionar/Deseleccionar todos"
                                >
                                  {getPermissionCheckboxState(book.id, 'draft') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(book.id, 'draft') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(book.id, 'write')}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                                  title="Seleccionar/Deseleccionar todos"
                                >
                                  {getPermissionCheckboxState(book.id, 'write') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(book.id, 'write') === 'some' ? (
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
                                  onClick={() => toggleAllPermissions(book.id, 'acknowledge')}
                                  className="flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                                  title="Seleccionar/Deseleccionar todos"
                                >
                                  {getPermissionCheckboxState(book.id, 'acknowledge') === 'all' ? (
                                    <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                                  ) : getPermissionCheckboxState(book.id, 'acknowledge') === 'some' ? (
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

                            {/* User Rows */}
                            <div className="space-y-2">
                              {book.users.map((user, userIndex) => {
                                const hasCustomPermissions = user.customPermissions && Object.keys(user.customPermissions).length > 0;

                                return (
                                  <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: userIndex * 0.05 }}
                                    className={`
                                      grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-6 px-4 py-4 bg-white rounded-lg border items-center
                                      ${hasCustomPermissions ? 'border-[#f59e0b]' : 'border-[#e1e4e8]'}
                                    `}
                                  >
                                    {/* User Info */}
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
                                          {hasCustomPermissions && (
                                            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                                          )}
                                        </div>
                                        <div className="text-sm text-[#6b7280] mb-1">
                                          RUN: {user.run}
                                        </div>
                                        {user.profileName && (
                                          <div className="flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-[#4f46e5]" />
                                            <span className="text-xs text-[#4f46e5]" style={{ fontWeight: 500 }}>
                                              {user.profileName}
                                            </span>
                                            {hasCustomPermissions && (
                                              <span className="text-xs text-[#f59e0b]" style={{ fontWeight: 500 }}>
                                                · Modificados
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Read Permission */}
                                    <div className="flex justify-center">
                                      <div className="relative">
                                        <button
                                          onClick={() => togglePermission(book.id, user.id, 'read')}
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                            ${user.permissions.read
                                              ? user.customPermissions?.read !== undefined
                                                ? 'bg-[#fef3c7] text-[#f59e0b] ring-2 ring-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : 'bg-[#f3f4f6] text-[#9ca3af]'
                                            }
                                          `}
                                        >
                                          {user.permissions.read ? (
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                          ) : (
                                            <X className="w-5 h-5" strokeWidth={2} />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Draft Permission */}
                                    <div className="flex justify-center">
                                      <div className="relative">
                                        <button
                                          onClick={() => togglePermission(book.id, user.id, 'draft')}
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                            ${user.permissions.draft
                                              ? user.customPermissions?.draft !== undefined
                                                ? 'bg-[#fef3c7] text-[#f59e0b] ring-2 ring-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : 'bg-[#f3f4f6] text-[#9ca3af]'
                                            }
                                          `}
                                        >
                                          {user.permissions.draft ? (
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                          ) : (
                                            <X className="w-5 h-5" strokeWidth={2} />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Write Permission */}
                                    <div className="flex justify-center">
                                      <div className="relative">
                                        <button
                                          onClick={() => togglePermission(book.id, user.id, 'write')}
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                            ${user.permissions.write
                                              ? user.customPermissions?.write !== undefined
                                                ? 'bg-[#fef3c7] text-[#f59e0b] ring-2 ring-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : 'bg-[#f3f4f6] text-[#9ca3af]'
                                            }
                                          `}
                                        >
                                          {user.permissions.write ? (
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                          ) : (
                                            <X className="w-5 h-5" strokeWidth={2} />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Acknowledge Permission */}
                                    <div className="flex justify-center">
                                      <div className="relative">
                                        <button
                                          onClick={() => togglePermission(book.id, user.id, 'acknowledge')}
                                          className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                            ${user.permissions.acknowledge
                                              ? user.customPermissions?.acknowledge !== undefined
                                                ? 'bg-[#fef3c7] text-[#f59e0b] ring-2 ring-[#f59e0b]'
                                                : 'bg-[#dcfce7] text-[#16a34a]'
                                              : 'bg-[#f3f4f6] text-[#9ca3af]'
                                            }
                                          `}
                                        >
                                          {user.permissions.acknowledge ? (
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                          ) : (
                                            <X className="w-5 h-5" strokeWidth={2} />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => removeUser(book.id, user.id)}
                                        className="p-2 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <Users className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                            <p className="text-[#6b7280]">
                              No hay usuarios asignados a este libro
                            </p>
                            <button
                              onClick={() => openAddUserModal(book.id, book.name)}
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

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-end gap-4"
        >
          <button className="px-6 py-3 text-[#374151] hover:bg-white rounded-lg transition-colors border border-[#d1d5db]" style={{ fontWeight: 500 }}>
            Descartar Cambios
          </button>
          <button className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors shadow-sm" style={{ fontWeight: 600 }}>
            Guardar Configuraci�n
          </button>
        </motion.div>
      </div>

      {/* Add Users Modal */}
      <AnimatePresence>
        {addUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={closeAddUserModal}
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
                    Selecciona los usuarios para agregar a <span style={{ fontWeight: 500 }}>{addUserModal.bookName}</span>
                  </p>
                </div>
              </div>

              {/* Available Users List */}
              <div className="mb-6">
                {(() => {
                  const availableForBook = getAvailableUsersForBook(addUserModal.bookId);

                  if (availableForBook.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
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
                          onClick={() => toggleUserSelection(user.id)}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${selectedUsersToAdd.includes(user.id)
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
                            {selectedUsersToAdd.includes(user.id) && (
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
              {selectedUsersToAdd.length > 0 && (
                <div className="mb-6 p-4 bg-[#eff6ff] rounded-lg">
                  <div className="flex items-center gap-2 text-[#3b82f6]">
                    <Users className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>
                      {selectedUsersToAdd.length} usuario{selectedUsersToAdd.length !== 1 ? 's' : ''} seleccionado{selectedUsersToAdd.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">
                    Los usuarios se agregarán sin permisos. Puedes asignarlos después.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={closeAddUserModal}
                  className="flex-1 px-4 py-3 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors border border-[#d1d5db]"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addUsersToBook}
                  disabled={selectedUsersToAdd.length === 0}
                  className="flex-1 px-4 py-3 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  Agregar {selectedUsersToAdd.length > 0 ? `(${selectedUsersToAdd.length})` : ''}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
