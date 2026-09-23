/**
 * "Build your piece" options shown in the Custom Jewelry section.
 * Edit these to match what you actually offer — the picker and the
 * pre-filled order message update automatically.
 */

export interface CustomOptionGroup {
  id: string;
  label: string;
  options: string[];
}

export const customOptionGroups: CustomOptionGroup[] = [
  {
    id: 'stone',
    label: 'Stone',
    options: ['Turquoise', 'Black stone', 'Crystal accents', 'Surprise me'],
  },
  {
    id: 'charm',
    label: 'Charm',
    options: ['Cross', 'Star', 'Concho', 'Feather', 'Flower'],
  },
  {
    id: 'length',
    label: 'Chain length',
    options: ['16″', '18″', '20″', '24″', 'Long layer'],
  },
];
