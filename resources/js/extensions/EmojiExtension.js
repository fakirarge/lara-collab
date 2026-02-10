import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * TipTap Extension for Emoji Support
 * Supports both emoji markdown (:name:) and unicode emoji
 */
export const EmojiExtension = Extension.create({
  name: 'emoji',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('emoji'),
        props: {
          decorations(state) {
            const decorations = [];
            const emojiRegex = /:[a-z_-]+:/gi;
            const unicodeEmojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{2300}-\u{23FF}]|[\u{2000}-\u{206F}]|[\u{3030}]|[\u{FE0F}]/gu;

            state.doc.descendants((node, pos) => {
              if (node.isText) {
                // Find emoji markdown format
                let match;
                while ((match = emojiRegex.exec(node.text)) !== null) {
                  decorations.push(
                    Decoration.inline(
                      pos + match.index,
                      pos + match.index + match[0].length,
                      { class: 'emoji-mention' }
                    )
                  );
                }

                // Find unicode emoji
                while ((match = unicodeEmojiRegex.exec(node.text)) !== null) {
                  decorations.push(
                    Decoration.inline(
                      pos + match.index,
                      pos + match.index + match[0].length,
                      { class: 'emoji-unicode' }
                    )
                  );
                }
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

export default EmojiExtension;

