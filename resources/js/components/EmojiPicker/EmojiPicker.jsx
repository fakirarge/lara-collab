import { useState } from 'react';
import {
  ActionIcon,
  Popover,
  Grid,
  Text,
  TextInput,
  ScrollArea,
  Group,
} from '@mantine/core';
import { IconMoodSmile, IconSearch } from '@tabler/icons-react';
import classes from './css/EmojiPicker.module.css';

// Popular emojis organized by category
const EMOJI_CATEGORIES = {
  'Smileys & Emotion': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
    '🤪', '😌', '😔', '😑', '😐', '😶', '🤫', '🤭',
    '🤫', '🤬', '🤐', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤮', '🤢', '🤮', '🤮', '🤧', '🤨', '🤰', '🤷',
    '😲', '😞', '😖', '😢', '😭', '😱', '😖', '😣',
    '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
    '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
    '😻', '😼', '😽', '🙀', '😿', '😾',
  ],
  'Hand Gestures': [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
    '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎',
    '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
    '🤝', '🤜', '🤛', '🫵', '👆', '👇', '☝️', '👈',
    '👉', '🫳', '🫴', '💪', '🦵', '🦶', '👂', '👃',
  ],
  'Food & Drink': [
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
    '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
    '🥑', '🍆', '🍅', '🌶️', '🌽', '🥒', '🥬', '🥦',
    '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖',
    '🥨', '🥯', '🥞', '🧇', '🥚', '🍳', '🧈', '🥞',
    '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
    '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫',
    '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪',
    '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢',
    '🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🧁', '🍮',
  ],
  'Travel & Places': [
    '🌍', '🌎', '🌏', '🌐', '🗺️', '🗿', '🏔️', '⛰️',
    '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡',
    '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤',
    '🏥', '🏦', '🏧', '🏨', '🏪', '🏫', '🏩', '💒',
    '🏛️', '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️',
    '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀',
  ],
  'Objects': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🥅',
    '⛳', '⛸️', '🎣', '🎽', '🎿', '🛷', '🛸', '🥌',
    '⛷️', '🏂', '🪀', '🪃', '🌱', '🌲', '🌳', '🌴',
    '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃',
  ],
  'Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘',
    '💝', '💟', '💌', '💋', '💯', '💢', '💥', '💫',
    '⭐', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈',
    '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
  ],
};

export default function EmojiPicker({ onSelect }) {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Smileys & Emotion');

  const filteredEmojis = search
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter((emoji) => {
          // Search by emoji unicode or name
          return emoji.includes(search) || search.includes(emoji);
        })
    : EMOJI_CATEGORIES[selectedCategory];

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji);
    setOpened(false);
    setSearch('');
  };

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} position="bottom" shadow="md">
      <Popover.Target>
        <ActionIcon
          onClick={() => setOpened(!opened)}
          variant="subtle"
          color="gray"
          title="Add emoji"
        >
          <IconMoodSmile size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <div className={classes.emojiPicker}>
          <TextInput
            placeholder="Search emoji..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className={classes.searchInput}
          />

          {!search && (
            <Group gap={4} p="xs" className={classes.categoryTabs}>
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <ActionIcon
                  key={category}
                  variant={selectedCategory === category ? 'filled' : 'light'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  title={category}
                >
                  {category.split(' ')[0].charAt(0)}
                </ActionIcon>
              ))}
            </Group>
          )}

          <ScrollArea.Autosize maxHeight={250} type="scroll" p="xs">
            <Grid gutter={4}>
              {filteredEmojis.map((emoji, index) => (
                <Grid.Col key={index} span={2}>
                  <ActionIcon
                    onClick={() => handleEmojiSelect(emoji)}
                    variant="subtle"
                    size="lg"
                    className={classes.emojiButton}
                    title={emoji}
                  >
                    {emoji}
                  </ActionIcon>
                </Grid.Col>
              ))}
            </Grid>
          </ScrollArea.Autosize>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

