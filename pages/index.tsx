import { useEffect, useState } from 'react';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string; // Se asume que las notas tienen un campo de fecha
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [notificationTime, setNotificationTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchNotes = async () => {
    const response = await fetch('https://simpleapi-production-e401.up.railway.app/api/notes');
    const data = await response.json();
    setNotes(data);
    setFilteredNotes(data);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('https://simpleapi-production-e401.up.railway.app/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      fetchNotes();
      resetForm();

      if (notificationTime) {
        scheduleNotification();
      }
    }
  };

  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`https://simpleapi-production-e401.up.railway.app/api/notes/${editingNoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    if (response.ok) {
      fetchNotes();
      resetForm();
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`https://simpleapi-production-e401.up.railway.app/api/notes/${id}`, {
      method: 'DELETE',
    });
    fetchNotes();
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note._id);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNoteId(null);
    setNotificationTime('');
  };

  const scheduleNotification = () => {
    const targetTime = new Date(notificationTime).getTime();
    const currentTime = new Date().getTime();

    if (targetTime > currentTime) {
      const timeToWait = targetTime - currentTime;

      setTimeout(() => {
        new Notification('¡Recordatorio de Nota!', {
          body: `Es hora de revisar tu nota: ${title}`,
        });
      }, timeToWait);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    const filtered = notes.filter((note) =>
      note.title.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredNotes(filtered);
  };

  const handleSort = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    const sorted = [...filteredNotes].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setFilteredNotes(sorted);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  useEffect(() => {
    setIsClient(true);
    fetchNotes();
  }, []);

  useEffect(() => {
    handleSort(sortOrder);
  }, [notes, sortOrder]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center"> Buscar una Nota</h1>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por título"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="border w-full p-2 mb-4 text-black"
      />

      {/* Filtro desplegable */}
      <div className="relative mb-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="bg-gray-200 p-2 rounded w-full text-left text-black"
        >
          Ordenar: {sortOrder === 'newest' ? 'Más nuevas' : 'Más viejas'}
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 bg-white border rounded w-full mt-1 text-black">
            <button
              onClick={() => {
                handleSort('newest');
                setDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Más nuevas
            </button>
            <button
              onClick={() => {
                handleSort('oldest');
                setDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Más viejas
            </button>
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold text-center"> Crear una nota</h1>

      <form onSubmit={editingNoteId ? updateNote : addNote} className="mb-4 text-black">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border w-full p-2 mb-2"
          required
        />
        <textarea
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border w-full p-2 mb-2"
          required
        />

        <div className="mb-4">
          <label htmlFor="notificationTime" className="block mb-2">Programar notificación</label>
          <input
            type="datetime-local"
            id="notificationTime"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="border w-full p-2 mb-2"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingNoteId ? 'Actualizar Nota' : 'Agregar Nota y Programar Notificación'}
        </button>
      </form>

      <ul>
        {filteredNotes.map((note) => (
          <li key={note._id} className="border p-2 mb-2">
            <h2 className="font-bold">{note.title}</h2>
            <p>{note.content}</p>
            <p className="text-gray-500 text-sm">Creado: {formatDate(note.createdAt)}</p>
            
            <div className="flex justify-between mt-2">
              <button onClick={() => handleEdit(note)} className="bg-yellow-500 text-white p-1 rounded">
                Editar
              </button>
              <button onClick={() => deleteNote(note._id)} className="bg-red-500 text-white p-1 rounded">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
