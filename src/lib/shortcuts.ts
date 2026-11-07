export const SHORTCUT_GROUPS: { group: string; rows: [key: string, label: string][] }[] = [
  { group: "General", rows: [["/", "Search"], ["h", "Home"], ["?", "Shortcuts"], ["Esc", "Close"]] },
  {
    group: "Watch",
    rows: [
      ["k / Space", "Play or pause"],
      ["j / l", "Back or forward 10s"],
      ["Left / Right", "Back or forward 5s"],
      ["0-9", "Jump to 0-90%"],
      ["m", "Mute"],
      ["f", "Fullscreen"],
      ["Shift+N", "Next video"],
      ["Shift+P", "Previous video"],
    ],
  },
];
