const RESPONSES = [
  "Would you look at that, chat was dead for",
  "Incredible, chat was able to keep their mouth shut for",
  "We enjoyed a blissful silence for",
  "Chat has risen from the dead, laying dormat for",
];

const getResponse = (): string => {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
};

export { RESPONSES, getResponse };
