import { useEffect, useState } from 'react';

interface Note {
  _id: string;
  title: string;
  content: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [notificationTime, setNotificationTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false); // Asegurar que el código solo se ejecute en el cliente

  const fetchNotes = async () => {
    const response = await fetch('https://simpleapi-production-e401.up.railway.app/api/notes');
    const data = await response.json();
    setNotes(data);
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

  useEffect(() => {
    setIsClient(true);
    fetchNotes();
  }, []);

  if (!isClient) {
    // Evitar renderizar contenido del cliente en el servidor
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center">Notas</h1>

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
        {notes.map((note) => (
          <li key={note._id} className="border p-2 mb-2">
            <h2 className="font-bold">{note.title}</h2>
            <p>{note.content}</p>
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
