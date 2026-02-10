import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Drawer,
  FileInput,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  Badge,
  Loader,
  Center,
  ActionIcon,
  Menu,
  Avatar,
} from '@mantine/core';
import {
  IconPlus,
  IconPin,
  IconPinOff,
  IconTrash,
  IconPencil,
  IconDots,
  IconX,
} from '@tabler/icons-react';
import RichTextEditor from '@/components/RichTextEditor';
import axios from 'axios';
import { route } from 'ziggy-js';
import classes from './css/ProjectNotes.module.css';

export default function ProjectNotes({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pinned: false,
  });

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(route('api.projects.notes.index', projectId));
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      pinned: false,
    });
    setEditingNote(null);
  };

  const handleOpenDrawer = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        pinned: note.pinned,
      });
    } else {
      resetForm();
    }
    setShowDrawer(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      if (editingNote) {
        await axios.put(
          route('api.projects.notes.update', [projectId, editingNote.id]),
          formData
        );
      } else {
        await axios.post(route('api.projects.notes.store', projectId), formData);
      }
      setShowDrawer(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    }
  };

  const handleDelete = async (noteId) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(route('api.projects.notes.destroy', [projectId, noteId]));
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
      }
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await axios.put(route('api.projects.notes.update', [projectId, note.id]), {
        ...note,
        pinned: !note.pinned,
      });
      fetchNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Text fw={600} fz="lg">
          📝 Project Notes
        </Text>
        <Button
          onClick={() => handleOpenDrawer()}
          leftSection={<IconPlus size={16} />}
          size="xs"
        >
          Add Note
        </Button>
      </Group>

      {notes.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed" fz="sm">
            No notes yet. Create your first note!
          </Text>
        </Card>
      ) : (
        <Stack gap="md">
          {notes.map((note) => (
            <Card key={note.id} withBorder className={note.pinned ? classes.pinnedCard : ''}>
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  {note.pinned && (
                    <Tooltip label="Pinned">
                      <IconPin size={16} color="var(--mantine-color-yellow-6)" />
                    </Tooltip>
                  )}
                  <div>
                    <Text fw={600} fz="sm">
                      {note.title}
                    </Text>
                    <Group gap={4}>
                      {note.creator && (
                        <Text fz="xs" c="dimmed">
                          By {note.creator.name}
                        </Text>
                      )}
                      <Text fz="xs" c="dimmed">
                        {new Date(note.created_at).toLocaleDateString()}
                      </Text>
                    </Group>
                  </div>
                </Group>

                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() => handleTogglePin(note)}
                      leftSection={note.pinned ? <IconPinOff size={14} /> : <IconPin size={14} />}
                    >
                      {note.pinned ? 'Unpin' : 'Pin'} Note
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => handleOpenDrawer(note)}
                      leftSection={<IconPencil size={14} />}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      onClick={() => handleDelete(note.id)}
                      leftSection={<IconTrash size={14} />}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Box
                className={classes.noteContent}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </Card>
          ))}
        </Stack>
      )}

      {/* Note Drawer */}
      <Drawer
        opened={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          resetForm();
        }}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        position="right"
        size="md"
      >
        <Stack gap="lg">
          <TextInput
            label="Title"
            placeholder="Note title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
            required
          />

          <div>
            <Text fz="sm" fw={500} mb="xs">
              Content
            </Text>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Note content"
              height={300}
            />
          </div>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                setShowDrawer(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Note</Button>
          </Group>
        </Stack>
      </Drawer>
    </Box>
  );
}

