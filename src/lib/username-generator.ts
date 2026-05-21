
const adjectives = [
  "Spicy", "Irie", "Sunny", "Cheeky", "Breezy", "Lush", "Vibrant", "Mystic", "Golden", "Cool",
  "Rhythmic", "Dandy", "Crisp", "Bold", "Sweet", "Mellow", "Zesty", "Heartical", "Dubwise", "Rootsy"
];

const nouns = [
  "Mango", "Taster", "Scorpion", "Chilton", "Banton", "Duppy", "Jerk", "Rocker", "Patron", "Styler",
  "Pioneer", "Gully", "Lion", "Boss", "Legend", "Don", "Empress", "Idren", "Selecta", "King"
];

const USERNAME_KEY = 'ralfeedback-username';

export function createNewUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900) + 100; // 100-999
  const newUsername = `${adjective}${noun}${number}`;
  try {
    localStorage.setItem(USERNAME_KEY, newUsername);
  } catch (error) {
    console.error("Could not save username to localStorage", error);
  }
  return newUsername;
}

export function getUsername(): string {
    try {
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        if (storedUsername) {
            return storedUsername;
        }
    } catch (error) {
        console.error("Could not read username from localStorage", error);
    }
    return createNewUsername();
}
