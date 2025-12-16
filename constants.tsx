import { Memory } from './types';

export const GAME_SPEED = 6;
export const CHECKPOINT_DISTANCE = 700; // Pixels to walk before a question

export const MEMORIES: Memory[] = [
  {
    id: 1,
    question: "Instagram'dan konuşuyorduk ama ilk kez yüz yüze nerede buluştuk?",
    optionA: "Tabaq Restoran 🍛",
    optionB: "Kütüphane 📚",
    correctOption: 'A',
    failMessage: "Hayır! İlk buluşmamız Tabaq'ta olmuştu, unuttun mu?",
    theme: 'school'
  },
  {
    id: 2,
    question: "Yine Tabaq'taydık... Peki ne içiyorduk?",
    optionA: "Ben Çay, Sen Kahve ☕",
    optionB: "Ben Cortado, Sen Flat White 🥛",
    correctOption: 'B',
    failMessage: "Kahve zevkimizi nasıl unutursun? Cortado ve Flat White!",
    theme: 'school'
  },
  {
    id: 3,
    question: "30 Kasım... İlk randevumuzda hangi şarkıda dans ettik?",
    optionA: "Perfect - Ed Sheeran 🎵",
    optionB: "All of Me - John Legend 🎹",
    correctOption: 'B',
    failMessage: "O büyülü gece 'All of Me' çalıyordu...",
    theme: 'night_view_date'
  },
  {
    id: 4,
    question: "Okulda sana hangi sporu oynamayı öğrettim?",
    optionA: "Masa Tenisi 🏓",
    optionB: "Voleybol 🏐",
    correctOption: 'A',
    failMessage: "Raketleri hatırla! Masa tenisi ustası olmuştun.",
    theme: 'gym'
  },
  {
    id: 5,
    question: "2 Aralık... Otobüs durağında ne oldu?",
    optionA: "Otobüsü kaçırdık 🚌",
    optionB: "İlk öpücük 💋",
    correctOption: 'B',
    failMessage: "O anı unutamazsın... İlk öpücüğümüzdü.",
    theme: 'bus_station'
  },
  {
    id: 6,
    question: "Bir gün Kahve Dürağı yerine nereye kaçtık?",
    optionA: "Pizza yemeye 🍕",
    optionB: "Burger yemeye 🍔",
    correctOption: 'A',
    failMessage: "Canımız pizza çekmişti, kahveyi boşvermiştik!",
    theme: 'restaurant'
  },
  {
    id: 7,
    question: "Sana hangi dersi çalıştırdım?",
    optionA: "Matematik ➕",
    optionB: "İngilizce 🇬🇧",
    correctOption: 'B',
    failMessage: "Teacher mode on! İngilizce dersiydi.",
    theme: 'school'
  },
  {
    id: 8,
    question: "Perşembe 11 Aralık 2025, o gün ne olduğunu hatırlıyor musun? ;)",
    optionA: "Evetttt",
    optionB: "Hatırlat benii",
    correctOption: 'A', // Technically A is correct, but B will have special handling in App.tsx
    failMessage: "Aile varrrr", // Used for the toast message
    theme: 'night'
  }
];
