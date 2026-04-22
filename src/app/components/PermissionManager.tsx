import { useState } from 'react';
import { BookOpen, Users, Check, X, Save, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Book {
  id: string;
  title: string;
  author: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  share: boolean;
}

interface Assignment {
  bookId: string;
  userId: string;
  permissions: Permission;
}

const mockBooks: Book[] = [
  { id: '1', title: 'El Principito', author: 'Antoine de Saint-Exupéry' },
  { id: '2', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez' },
  { id: '3', title: 'Don Quijote', author: 'Miguel de Cervantes' },
  { id: '4', title: '1984', author: 'George Orwell' },
];

const mockUsers: User[] = [
  { id: '1', name: 'María González', email: 'maria@example.com' },
  { id: '2', name: 'Juan Pérez', email: 'juan@example.com' },
  { id: '3', name: 'Ana Martínez', email: 'ana@example.com' },
  { id: '4', name: 'Carlos Rodríguez', email: 'carlos@example.com' },
  { id: '5', name: 'Laura Fernández', email: 'laura@example.com' },
];

export function PermissionManager() {
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [permissions, setPermissions] = useState<Permission>({
    read: false,
    write: false,
    delete: false,
    share: false,
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedUsersForProfile, setSelectedUsersForProfile] = useState<string[]>([]);

  const currentBook = mockBooks[currentBookIndex];
  const currentUser = mockUsers[currentUserIndex];
  const remainingUsers = mockUsers.slice(currentUserIndex);

  const togglePermission = (key: keyof Permission) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAssignment = () => {
    const newAssignment: Assignment = {
      bookId: currentBook.id,
      userId: currentUser.id,
      permissions: { ...permissions },
    };
    setAssignments(prev => [...prev, newAssignment]);
    setShowSaveDialog(false);
    setShowProfileDialog(true);
  };

  const handleCreateProfile = () => {
    selectedUsersForProfile.forEach(userId => {
      const newAssignment: Assignment = {
        bookId: currentBook.id,
        userId,
        permissions: { ...permissions },
      };
      setAssignments(prev => [...prev, newAssignment]);
    });

    setShowProfileDialog(false);
    setProfileName('');
    setSelectedUsersForProfile([]);

    // Move to next user
    if (currentUserIndex < mockUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setPermissions({ read: false, write: false, delete: false, share: false });
    } else if (currentBookIndex < mockBooks.length - 1) {
      setCurrentBookIndex(prev => prev + 1);
      setCurrentUserIndex(0);
      setPermissions({ read: false, write: false, delete: false, share: false });
    }
  };

  const handleSkipProfile = () => {
    setShowProfileDialog(false);
    setSelectedUsersForProfile([]);

    // Move to next user
    if (currentUserIndex < mockUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setPermissions({ read: false, write: false, delete: false, share: false });
    } else if (currentBookIndex < mockBooks.length - 1) {
      setCurrentBookIndex(prev => prev + 1);
      setCurrentUserIndex(0);
      setPermissions({ read: false, write: false, delete: false, share: false });
    }
  };

  const toggleUserForProfile = (userId: string) => {
    setSelectedUsersForProfile(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-6xl mb-3" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Sistema de Permisos
          </h1>
          <p className="text-xl text-[#6b5d52] italic">
            Gestión administrativa de accesos
          </p>
        </header>

        {/* Progress */}
        <div className="mb-8 bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <span style={{ fontFamily: 'DM Mono, monospace' }}>
                Libro {currentBookIndex + 1} de {mockBooks.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span style={{ fontFamily: 'DM Mono, monospace' }}>
                Usuario {currentUserIndex + 1} de {mockUsers.length}
              </span>
            </div>
          </div>
          <div className="h-2 bg-[#e8e3dd] relative overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentBookIndex * mockUsers.length + currentUserIndex + 1) / (mockBooks.length * mockUsers.length)) * 100}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Current Book */}
          <motion.div
            key={currentBook.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#2b2419] text-white p-8 border-4 border-black"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/10">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                  {currentBook.title}
                </h2>
                <p className="text-white/70 italic">{currentBook.author}</p>
              </div>
            </div>
          </motion.div>

          {/* Current User */}
          <motion.div
            key={currentUser.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 border-4 border-black"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-black">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                  {currentUser.name}
                </h2>
                <p className="text-[#6b5d52]" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {currentUser.email}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Permissions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 bg-white border-4 border-black p-8"
        >
          <h3 className="text-3xl mb-8" style={{ fontWeight: 700 }}>
            Asignar Permisos
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {Object.entries(permissions).map(([key, value], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => togglePermission(key as keyof Permission)}
                className={`
                  relative p-6 border-2 transition-all duration-300
                  ${value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-[#f8f6f3]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl capitalize" style={{ fontWeight: 600 }}>
                    {key === 'read' ? 'Leer' :
                     key === 'write' ? 'Escribir' :
                     key === 'delete' ? 'Eliminar' :
                     'Compartir'}
                  </span>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${value ? 'bg-white' : 'bg-black'}
                  `}>
                    {value ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <X className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSaveDialog(true)}
            className="mt-8 w-full bg-[#d4763e] text-white p-6 border-2 border-black hover:bg-[#c26835] transition-colors"
          >
            <div className="flex items-center justify-center gap-3">
              <Save className="w-6 h-6" />
              <span className="text-2xl" style={{ fontWeight: 600 }}>
                Continuar
              </span>
            </div>
          </motion.button>
        </motion.div>

        {/* Assignments Summary */}
        {assignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-[#e8e3dd] border-2 border-black p-6"
          >
            <h4 className="text-xl mb-4" style={{ fontWeight: 600 }}>
              Asignaciones guardadas: {assignments.length}
            </h4>
            <div className="grid grid-cols-4 gap-2" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem' }}>
              {assignments.slice(-8).map((assignment, i) => (
                <div key={i} className="bg-white p-2 border border-black/20">
                  ✓ Asignación {assignments.length - 7 + i}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-8 z-50"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-black p-8 max-w-md w-full"
            >
              <h3 className="text-3xl mb-4" style={{ fontWeight: 700 }}>
                ¿Guardar asignación?
              </h3>
              <p className="text-[#6b5d52] mb-6 text-lg">
                Se guardará la asignación de permisos para {currentUser.name} en el libro "{currentBook.title}".
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveAssignment}
                  className="flex-1 bg-black text-white p-4 border-2 border-black hover:bg-[#2b2419] transition-colors"
                >
                  <span style={{ fontWeight: 600 }}>Sí, guardar</span>
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 bg-white text-black p-4 border-2 border-black hover:bg-[#f8f6f3] transition-colors"
                >
                  <span style={{ fontWeight: 600 }}>Cancelar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Dialog */}
      <AnimatePresence>
        {showProfileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-8 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-black">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                    Crear Perfil de Permisos
                  </h3>
                  <p className="text-[#6b5d52] text-lg">
                    ¿Desea aplicar los mismos permisos a otros usuarios?
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-3" style={{ fontWeight: 600 }}>
                  Nombre del perfil (opcional)
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="ej. Editores senior"
                  className="w-full p-4 border-2 border-black bg-[#f8f6f3] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="mb-6">
                <p className="text-lg mb-3" style={{ fontWeight: 600 }}>
                  Seleccionar usuarios:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {remainingUsers.filter(u => u.id !== currentUser.id).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleUserForProfile(user.id)}
                      className={`
                        w-full p-4 border-2 border-black text-left transition-all
                        ${selectedUsersForProfile.includes(user.id)
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-[#f8f6f3]'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div className="text-sm opacity-70" style={{ fontFamily: 'DM Mono, monospace' }}>
                            {user.email}
                          </div>
                        </div>
                        {selectedUsersForProfile.includes(user.id) && (
                          <Check className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateProfile}
                  disabled={selectedUsersForProfile.length === 0}
                  className="flex-1 bg-[#d4763e] text-white p-4 border-2 border-black hover:bg-[#c26835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span style={{ fontWeight: 600 }}>
                    Aplicar a {selectedUsersForProfile.length} usuario(s)
                  </span>
                </button>
                <button
                  onClick={handleSkipProfile}
                  className="flex-1 bg-white text-black p-4 border-2 border-black hover:bg-[#f8f6f3] transition-colors"
                >
                  <span style={{ fontWeight: 600 }}>Omitir</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
