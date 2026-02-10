import Logo from "@/components/Logo";
import useNavigationStore from "@/hooks/store/useNavigationStore";
import { usePage } from "@inertiajs/react";
import { Group, ScrollArea, Text, rem } from "@mantine/core";
import { useI18n } from "@/i18n/context";
import {
  IconBuildingSkyscraper,
  IconFileDollar,
  IconGauge,
  IconLayoutList,
  IconListDetails,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect } from "react";
import NavbarLinksGroup from "./NavbarLinksGroup";
import UserButton from "./UserButton";
import classes from "./css/NavBarNested.module.css";

export default function Sidebar() {
  const { t } = useI18n();
  const { version } = usePage().props;
  const { items, setItems } = useNavigationStore();

  useEffect(() => {
    setItems([
      {
        label: t('dashboard'),
        icon: IconGauge,
        link: route("dashboard"),
        active: route().current("dashboard"),
        visible: true,
      },
      {
        label: t('projects'),
        icon: IconListDetails,
        link: route("projects.index"),
        active: route().current("projects.*"),
        visible: can("view projects"),
      },
      {
        label: t('my_work'),
        icon: IconLayoutList,
        active: route().current("my-work.*"),
        opened: route().current("my-work.*"),
        visible: can("view tasks") || can("view activities"),
        links: [
          {
            label: t('tasks'),
            link: route("my-work.tasks.index"),
            active: route().current("my-work.tasks.*"),
            visible: can("view tasks"),
          },
          {
            label: t('activity'),
            link: route("my-work.activity.index"),
            active: route().current("my-work.activity.*"),
            visible: can("view activities"),
          },
        ],
      },
      {
        label: t('users'),
        icon: IconUsers,
        link: route("users.index"),
        active: route().current("users.*"),
        visible: can("view users"),
      },
      {
        label: t('settings'),
        icon: IconSettings,
        active: route().current("settings.*"),
        opened: route().current("settings.*"),
        visible: can("view owner company") || can("view roles") || can("view labels") || can("view task priority"),
        links: [
          {
            label: t('company'),
            link: route("settings.company.edit"),
            active: route().current("settings.company.*"),
            visible: can("view owner company"),
          },
          {
            label: t('roles'),
            link: route("settings.roles.index"),
            active: route().current("settings.roles.*"),
            visible: can("view roles"),
          },
          {
            label: t('labels'),
            link: route("settings.labels.index"),
            active: route().current("settings.labels.*"),
            visible: can("view labels"),
          },
          {
            label: t('priority'),
            link: route("settings.task-priorities.index"),
            active: route().current("settings.task-priorities.*"),
            visible: can("view task priority"),
          },
        ],
      },
    ]);
  }, []);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: rem(120) }} />
          <Text size="xs" className={classes.version}>
            v{version}
          </Text>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {items
            .filter((i) => i.visible)
            .map((item) => (
              <NavbarLinksGroup key={item.label} item={item} />
            ))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
