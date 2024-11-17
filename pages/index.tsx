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
  const [isClient, setIsClient] = useState(false);  // Para asegurarnos de que el código solo se ejecute en el cliente

  // Función para obtener las notas
  const fetchNotes = async () => {
    const response = await fetch('http://localhost:5000/api/notes');
    const data = await response.json();
    setNotes(data);
  };

  // Función para agregar una nueva nota
  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      fetchNotes();
      resetForm();

      // Si se programó una notificación, configurar el temporizador
      if (notificationTime) {
        scheduleNotification();
      }
    }
  };

  // Función para actualizar una nota existente
  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
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

  // Función para eliminar una nota
  const deleteNote = async (id: string) => {
    await fetch(`http://localhost:5000/api/notes/${id}`, {
      method: 'DELETE',
    });
    fetchNotes();
  };

  // Función para editar una nota
  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note._id);
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNoteId(null);
    setNotificationTime(''); // Resetear el campo de hora
  };

  // Función para enviar notificación
  const scheduleNotification = () => {
    const targetTime = new Date(notificationTime).getTime();
    const currentTime = new Date().getTime();

    if (targetTime > currentTime) {
      const timeToWait = targetTime - currentTime;

      // Esperar hasta el momento de la notificación
      setTimeout(() => {
        new Notification('¡Recordatorio de Nota!', {
          body: `Es hora de revisar tu nota: ${title}`,
        });
      }, timeToWait);
    }
  };

  // Establecer que estamos en el cliente
  useEffect(() => {
    setIsClient(true); // Marcar que ahora estamos en el cliente
    fetchNotes(); // Obtener las notas del servidor
  }, []);

  // Solo renderizamos el formulario y el contenido cuando estemos en el cliente
  if (!isClient) {
    return null; // Evitar que se renderice nada en el servidor
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
