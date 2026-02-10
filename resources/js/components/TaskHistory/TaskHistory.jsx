import { useState, useEffect } from 'react';
import {
  Box,
  Loader,
  Center,
  Timeline,
  Text,
  Group,
  Badge,
  Avatar,
  Tabs,
  Table,
  Paper,
  Stack,
} from '@mantine/core';
import {
  IconClock,
  IconCheck,
  IconPencil,
  IconPlus,
  IconMessage,
} from '@tabler/icons-react';
import axios from 'axios';
import { route } from 'ziggy-js';
import classes from './css/TaskHistory.module.css';

export default function TaskHistory({ projectId, taskId }) {
  const [timeline, setTimeline] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [projectId, taskId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [timelineRes, historyRes] = await Promise.all([
        axios.get(route('projects.tasks.history.timeline', [projectId, taskId])),
        axios.get(route('projects.tasks.history', [projectId, taskId])),
      ]);
      setTimeline(timelineRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (event) => {
    switch (event) {
      case 'created':
        return <IconPlus size={16} />;
      case 'updated':
        return <IconPencil size={16} />;
      case 'completed':
        return <IconCheck size={16} />;
      case 'comment':
        return <IconMessage size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Tabs defaultValue="timeline" orientation="vertical">
      <Tabs.List>
        <Tabs.Tab value="timeline" leftSection={<IconClock size={14} />}>
          Timeline
        </Tabs.Tab>
        <Tabs.Tab value="history" leftSection={<IconPencil size={14} />}>
          Changes
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="timeline" pl="xl">
        {timeline.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No activity yet
          </Text>
        ) : (
          <Timeline active={timeline.length} bulletSize={24} lineWidth={2}>
            {timeline.map((event, index) => (
              <Timeline.Item
                key={index}
                bullet={getIcon(event.type)}
                title={
                  <Group justify="space-between">
                    <Text fw={600}>{event.event}</Text>
                    <Text fz="xs" c="dimmed">
                      {formatDate(event.timestamp)}
                    </Text>
                  </Group>
                }
              >
                <Group gap="sm" my="sm">
                  {event.user && (
                    <>
                      <Avatar
                        src={event.user.profile_photo_path}
                        name={event.user.name}
                        size="sm"
                      />
                      <div>
                        <Text fz="sm" fw={500}>
                          {event.user.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {event.user.email}
                        </Text>
                      </div>
                    </>
                  )}
                </Group>
                <Text fz="sm" my="sm">
                  {event.description}
                </Text>
                {event.changes && (
                  <Badge size="sm" variant="light">
                    {event.changes} change{event.changes !== 1 ? 's' : ''}
                  </Badge>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="history" pl="xl">
        {history.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No changes yet
          </Text>
        ) : (
          <Stack gap="md">
            {history.map((audit) => (
              <Paper key={audit.id} withBorder p="md" className={classes.auditCard}>
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <Avatar
                      name={audit.user?.name || 'Unknown'}
                      size="sm"
                    />
                    <div>
                      <Text fw={600} fz="sm">
                        {audit.user?.name || 'Unknown'}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {formatDate(audit.created_at)}
                      </Text>
                    </div>
                  </Group>
                  <Badge>{audit.event}</Badge>
                </Group>

                {audit.changes.length > 0 && (
                  <Box>
                    <Text fz="xs" fw={500} mb="md" c="dimmed">
                      CHANGES
                    </Text>
                    <Table striped size="sm" className={classes.changesTable}>
                      <Table.Tbody>
                        {audit.changes.map((change, idx) => (
                          <Table.Tr key={idx}>
                            <Table.Td fw={500} w="25%">
                              {change.field}
                            </Table.Td>
                            <Table.Td>
                              <Text c="red" strikethrough>
                                {change.old}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text c="green" fw={500}>
                                {change.new}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                )}

                {audit.ip && (
                  <Text fz="xs" c="dimmed" mt="md">
                    IP: {audit.ip}
                  </Text>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Tabs.Panel>
    </Tabs>
  );
}

