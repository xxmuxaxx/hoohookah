// Everything the constructor sells. Option `id`s are used as form values and in the preview renderer (./hookah.js),
// prices are in rubles. The first option of each single-choice group is selected by default.

const shafts = [
  { id: 'steel', title: 'Сталь', note: 'Шлифованная нержавейка', price: 4490, color: '#c9ced6' },
  { id: 'black', title: 'Чёрный матовый', note: 'Порошковая покраска', price: 4990, color: '#2b2b30' },
  { id: 'gold', title: 'Золото', note: 'Гальваника, нитрид титана', price: 6490, color: '#d4a640' },
];

const glassColors = [
  { id: 'clear', title: 'Прозрачное', price: 0, color: '#dfe9ee' },
  { id: 'smoke', title: 'Дымчатое', price: 400, color: '#50545e' },
  { id: 'amber', title: 'Янтарь', price: 400, color: '#d98a2b' },
  { id: 'emerald', title: 'Изумруд', price: 400, color: '#2f9e74' },
  { id: 'violet', title: 'Аметист', price: 400, color: '#8a5cc7' },
];

const bowls = [
  { id: 'clay', title: 'Глиняная', note: 'Классика, держит жар', price: 690, color: '#c2663f' },
  { id: 'phunnel', title: 'Фанел', note: 'Глазурь, без стекания сиропа', price: 990, color: '#2e2c38' },
  { id: 'silicone', title: 'Силиконовая', note: 'Не бьётся', price: 790, color: '#c8413b' },
];

const hoses = [
  { id: 'black', title: 'Силикон, чёрный', price: 890, color: '#1f1f23' },
  { id: 'white', title: 'Силикон, белый', price: 890, color: '#e9e6e1' },
  { id: 'leather', title: 'Кожаный', note: 'Ручная прошивка', price: 1990, color: '#7a4a2a' },
];

const extras = [
  { id: 'kaloud', title: 'Калауд', note: 'Ровный жар без фольги', price: 1490 },
  { id: 'tongs', title: 'Щипцы', note: 'Для углей', price: 390 },
  { id: 'mouthpiece', title: 'Личный мундштук', note: 'Алюминий, с чехлом', price: 590 },
];

export const models = {
  classic: {
    title: 'Классический',
    note: 'Высота 62 см, колба 2,3 л',
    groups: [
      { id: 'shaft', title: 'Шахта', options: shafts },
      {
        id: 'flask',
        title: 'Колба',
        options: [
          { id: 'drop', title: 'Капля', price: 2490 },
          { id: 'cone', title: 'Конус', price: 2290 },
          { id: 'barrel', title: 'Бочка', price: 2790 },
        ],
      },
      { id: 'glass', title: 'Цвет стекла', options: glassColors },
      { id: 'bowl', title: 'Чаша', options: bowls },
      { id: 'hose', title: 'Шланг', options: hoses },
      { id: 'extras', title: 'Аксессуары', multiple: true, options: extras },
    ],
  },
  mini: {
    title: 'Мини',
    note: 'Высота 38 см, колба 0,9 л — для поездок',
    groups: [
      {
        id: 'shaft',
        title: 'Шахта',
        options: shafts.slice(0, 2).map((shaft) => ({ ...shaft, price: shaft.price - 1500 })),
      },
      {
        id: 'flask',
        title: 'Колба',
        options: [
          { id: 'drop', title: 'Капля', price: 1490 },
          { id: 'cone', title: 'Конус', price: 1390 },
        ],
      },
      { id: 'glass', title: 'Цвет стекла', options: glassColors.slice(0, 3) },
      { id: 'bowl', title: 'Чаша', options: bowls.filter((bowl) => bowl.id !== 'phunnel') },
      { id: 'hose', title: 'Шланг', options: hoses.slice(0, 2) },
      { id: 'extras', title: 'Аксессуары', multiple: true, options: extras },
    ],
  },
};

export const deliveryOptions = [
  { id: 'pickup', title: 'Самовывоз', note: 'Москва, Ленинский проспект, 131', price: 0 },
  { id: 'courier', title: 'Курьер по Москве', note: 'На следующий день', price: 390 },
  { id: 'russia', title: 'По России', note: 'СДЭК, 2–5 дней', price: 690 },
];

// Demo only: a real shop must check promo codes on the server, anything here is visible to visitors
export const promoCodes = {
  HOOHOOKAH: 10,
  FIRST: 5,
};
