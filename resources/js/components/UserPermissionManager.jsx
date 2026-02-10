import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  Select,
  MultiSelect,
  Stack,
  Table,
  Text,
  Title,
  Badge,
  Group,
  Modal,
  Textarea,
  Checkbox,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Menu,
} from '@mantine/core';
import {
  IconShield,
  IconKey,
  IconUser,
  IconTrash,
  IconCheck,
  IconX,
  IconHistory,
  IconDots,
} from '@tabler/icons-react';
import axios from 'axios';
import { route } from 'ziggy-js';
import classes from './css/UserPermissionManager.module.css';

export default function UserPermissionManager() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [reason, setReason] = useState('');
  const [bulkAction, setBulkAction] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, permissionsRes, rolesRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/permissions'),
        axios.get('/api/roles'),
      ]);
      setUsers(usersRes.data);
      setPermissions(permissionsRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId) => {
    if (!userId) return;

    setSelectedUser(userId);
    setLoading(true);

    try {
      const response = await axios.get(route('users.permissions.index', userId));
      setUserPermissions(response.data.permissions || []);
      setUserRoles(response.data.roles || []);
      setAuditTrail(response.data.audit_trail || {});
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (permissionId) => {
    if (!selectedUser) return;

    try {
      await axios.post(
        route('users.permissions.grant', [selectedUser, permissionId]),
        { reason }
      );
      setReason('');
      handleUserSelect(selectedUser);
    } catch (error) {
      console.error('Error granting permission:', error);
    }
  };

  const handleDenyPermission = async (permissionId) => {
    if (!selectedUser) return;

    try {
      await axios.post(
        route('users.permissions.deny', [selectedUser, permissionId]),
        { reason }
      );
      setReason('');
      handleUserSelect(selectedUser);
    } catch (error) {
      console.error('Error denying permission:', error);
    }
  };

  const handleRemoveOverride = async (permissionId) => {
    if (!selectedUser) return;

    try {
      await axios.delete(
        route('users.permissions.remove', [selectedUser, permissionId])
      );
      handleUserSelect(selectedUser);
    } catch (error) {
      console.error('Error removing override:', error);
    }
  };

  const handleAssignRole = async (roleId) => {
    if (!selectedUser) return;

    try {
      await axios.post(
        route('users.permissions.roles.assign', [selectedUser, roleId]),
        { reason }
      );
      setReason('');
      handleUserSelect(selectedUser);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedUser) return;

    try {
      await axios.delete(
        route('users.permissions.roles.remove', [selectedUser, roleId])
      );
      handleUserSelect(selectedUser);
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  if (loading && !selectedUser) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Box>
      <Title order={1} mb="lg">
        🔐 User Permission Manager
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Stack>
              <Text fw={600}>Select User</Text>
              <Select
                placeholder="Choose a user"
                data={users.map((u) => ({ value: u.id, label: u.name }))}
                value={selectedUser}
                onChange={handleUserSelect}
                searchable
              />

              {selectedUser && (
                <Button
                  variant="light"
                  onClick={() => setShowAudit(!showAudit)}
                  leftSection={<IconHistory size={14} />}
                >
                  View Audit Trail
                </Button>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          {selectedUser ? (
            <Stack gap="lg">
              {/* Permission Overrides */}
              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Group justify="space-between">
                    <Text fw={600} fz="lg">
                      📋 Permission Overrides
                    </Text>
                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconKey size={14} />}
                        >
                          Add Permission
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Card.Section>

                <Table striped size="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Permission</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Reason</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {userPermissions.length > 0 ? (
                      userPermissions.map((perm) => (
                        <Table.Tr key={perm.id}>
                          <Table.Td>{perm.permission_name}</Table.Td>
                          <Table.Td>
                            <Badge color={perm.allowed ? 'green' : 'red'}>
                              {perm.allowed ? 'Granted' : 'Denied'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>{perm.reason || '-'}</Table.Td>
                          <Table.Td>
                            <ActionIcon
                              color="red"
                              size="sm"
                              onClick={() =>
                                handleRemoveOverride(perm.permission_id)
                              }
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={4} ta="center">
                          No permission overrides
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Card>

              {/* Role Assignments */}
              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Text fw={600} fz="lg">
                    👤 Role Assignments
                  </Text>
                </Card.Section>

                <Table striped size="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Expires</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {userRoles.length > 0 ? (
                      userRoles.map((role) => (
                        <Table.Tr key={role.id}>
                          <Table.Td>{role.role_name}</Table.Td>
                          <Table.Td>
                            {role.expires_at ? new Date(role.expires_at).toLocaleDateString() : 'Never'}
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon
                              color="red"
                              size="sm"
                              onClick={() => handleRemoveRole(role.role_id)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={3} ta="center">
                          No role assignments
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          ) : (
            <Alert title="Select a user" color="blue">
              Choose a user from the left panel to manage their permissions and roles
            </Alert>
          )}
        </Grid.Col>
      </Grid>

      {/* Audit Trail Modal */}
      {showAudit && selectedUser && (
        <Modal
          opened={showAudit}
          onClose={() => setShowAudit(false)}
          title="📜 Permission Audit Trail"
          size="lg"
        >
          <Stack gap="md">
            <Box>
              <Text fw={600} mb="sm">
                Permission Changes
              </Text>
              {auditTrail.permissions && auditTrail.permissions.length > 0 ? (
                <Stack gap="xs">
                  {auditTrail.permissions.map((entry) => (
                    <Text key={entry.id} size="sm">
                      {entry.permission_name}:{' '}
                      <Badge size="sm" color={entry.allowed ? 'green' : 'red'}>
                        {entry.allowed ? 'Granted' : 'Denied'}
                      </Badge>{' '}
                      by {entry.granted_by_name} on{' '}
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </Text>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">No changes</Text>
              )}
            </Box>

            <Box>
              <Text fw={600} mb="sm">
                Role Changes
              </Text>
              {auditTrail.roles && auditTrail.roles.length > 0 ? (
                <Stack gap="xs">
                  {auditTrail.roles.map((entry) => (
                    <Text key={entry.id} size="sm">
                      {entry.role_name} assigned by {entry.granted_by_name} on{' '}
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </Text>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">No changes</Text>
              )}
            </Box>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}

