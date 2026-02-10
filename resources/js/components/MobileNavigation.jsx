import { useState } from 'react';
import {
  Box,
  Burger,
  Drawer,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
  Badge,
  Divider,
  Avatar,
  Menu,
} from '@mantine/core';
import {
  IconHome,
  IconBriefcase,
  IconUsers,
  IconSettings,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import { usePage, Link } from '@inertiajs/react';
import classes from './css/MobileNavigation.module.css';

export default function MobileNavigation() {
  const [opened, setOpened] = useState(false);
  const { auth, can } = usePage().props;

  const menuItems = [
    { label: 'Dashboard', icon: IconHome, href: 'dashboard' },
    { label: 'Projects', icon: IconBriefcase, href: 'projects.index' },
    { label: 'My Work', icon: IconUsers, href: 'my-work.tasks.index' },
    { label: 'Settings', icon: IconSettings, href: 'settings.profile', permission: 'view settings' },
  ];

  const filteredItems = menuItems.filter((item) => !item.permission || can(item.permission));

  return (
    <>
      <Burger
        opened={opened}
        onClick={() => setOpened(!opened)}
        size="sm"
        className={classes.burger}
      />

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size="80%"
        position="left"
        title="Menu"
        classNames={{ header: classes.drawerHeader, body: classes.drawerBody }}
      >
        <Stack gap="xs" pb="xl">
          {/* User Profile Section */}
          {auth?.user && (
            <>
              <Box className={classes.userProfile}>
                <Group gap="md">
                  <Avatar name={auth.user.name} size="lg" radius="md" />
                  <div>
                    <Text fw={600} size="sm">
                      {auth.user.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {auth.user.email}
                    </Text>
                  </div>
                </Group>
              </Box>
              <Divider />
            </>
          )}

          {/* Menu Items */}
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={route(item.href)}
                className={classes.navLink}
                onClick={() => setOpened(false)}
              >
                <Group gap="sm" w="100%">
                  <Icon size={20} />
                  <Text size="sm" fw={500}>
                    {item.label}
                  </Text>
                </Group>
              </Link>
            );
          })}

          <Divider />

          {/* Logout */}
          <Link
            href={route('auth.logout')}
            method="post"
            as="button"
            className={classes.logoutBtn}
          >
            <Group gap="sm" w="100%">
              <IconLogout size={20} />
              <Text size="sm" fw={500}>
                Logout
              </Text>
            </Group>
          </Link>
        </Stack>
      </Drawer>
    </>
  );
}

