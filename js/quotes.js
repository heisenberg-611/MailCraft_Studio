/**
 * MailCraft Studio - Inspirational & Philosophical Quotes Engine
 * 160+ Curated Quotes from Classic Thinkers, Philosophers, Authors & Leaders
 * Supports random rotation, parsing, and email-safe HTML compilation
 * 100% on-device & zero external dependencies
 */

const Quotes = {
  list: [
    "Recognize that unlearning is the highest form of learning. ~ Rumi",
    "At the touch of love everyone becomes a poet. ~ Plato",
    "Justice is the first virtue of social institutions. ~ John Rawls",
    "Man is by nature a social animal. ~ Aristotle",
    "The only stable state is the one in which all men are equal before the law. ~ Aristotle",
    "Love is composed of a single soul inhabiting two bodies. ~ Aristotle",
    "If you want peace, work for justice. ~ Pope Paul VI",
    "There is always some madness in love. But there is also always some reason in madness. ~ Friedrich Nietzsche",
    "Injustice anywhere is a threat to justice everywhere. ~ Martin Luther King Jr.",
    "Society does not consist of individuals but expresses the sum of interrelations. ~ Karl Marx",

    "He who opens a school door closes a prison. ~ Victor Hugo",
    "To love is to burn, to be on fire. ~ Jane Austen",
    "The arc of the moral universe is long, but it bends toward justice. ~ Martin Luther King Jr.",
    "Without music, life would be a mistake. ~ Friedrich Nietzsche",
    "The greatest happiness of the greatest number is the foundation of morals and legislation. ~ Jeremy Bentham",
    "Freedom is the recognition of necessity. ~ Baruch Spinoza",
    "One is not born, but rather becomes, a woman. ~ Simone de Beauvoir",
    "Hell is other people. ~ Jean-Paul Sartre",
    "The unexamined life is not worth living. ~ Socrates",
    "Happiness depends upon ourselves. ~ Aristotle",

    "Power tends to corrupt, and absolute power corrupts absolutely. ~ Lord Acton",
    "An eye for an eye will leave the whole world blind. ~ Mahatma Gandhi",
    "I think therefore I am. ~ René Descartes",
    "Liberty consists in doing what one desires. ~ John Stuart Mill",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. ~ Aristotle",
    "The oppressed are allowed once every few years to decide which particular representatives of the oppressing class are to represent them. ~ Karl Marx",
    "Love all, trust a few, do wrong to none. ~ William Shakespeare",
    "To be radical is to grasp things by the root. ~ Karl Marx",
    "The strongest man in the world is he who stands most alone. ~ Henrik Ibsen",
    "No man's knowledge here can go beyond his experience. ~ John Locke",

    "It is not power that corrupts but fear. ~ Aung San Suu Kyi",
    "Where there is power, there is resistance. ~ Michel Foucault",
    "The means of defense against foreign danger historically have become the instruments of tyranny at home. ~ James Madison",
    "Love is an endless act of forgiveness. ~ Peter Ustinov",
    "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. ~ Albert Camus",
    "A society grows great when old men plant trees whose shade they know they shall never sit in. ~ Greek Proverb",
    "Morality is simply the attitude we adopt towards people whom we personally dislike. ~ Oscar Wilde",
    "Religion is the opium of the people. ~ Karl Marx",
    "The mind is everything. What you think you become. ~ Buddha",
    "Better to be violent, if there is violence in our hearts, than to put on the cloak of nonviolence to cover impotence. ~ Mahatma Gandhi",

    "Justice delayed is justice denied. ~ William E. Gladstone",
    "Life must be understood backward. But it must be lived forward. ~ Søren Kierkegaard",
    "The only thing necessary for the triumph of evil is for good men to do nothing. ~ Edmund Burke",
    "A loving heart is the truest wisdom. ~ Charles Dickens",
    "No society can surely be flourishing and happy, of which the far greater part of the members are poor and miserable. ~ Adam Smith",
    "The more laws, the less justice. ~ Cicero",
    "He who has a why to live can bear almost any how. ~ Friedrich Nietzsche",
    "Patriotism is supporting your country all the time, and your government when it deserves it. ~ Mark Twain",
    "To educate a man in mind and not in morals is to educate a menace to society. ~ Theodore Roosevelt",
    "War is peace. Freedom is slavery. Ignorance is strength. ~ George Orwell",

    "The function of freedom is to free someone else. ~ Toni Morrison",
    "Love has reasons which reason cannot understand. ~ Blaise Pascal",
    "An unjust law is no law at all. ~ Saint Augustine",
    "The individual has always had to struggle to keep from being overwhelmed by the tribe. ~ Friedrich Nietzsche",
    "Equality may perhaps be a right, but no power on earth can ever turn it into a fact. ~ Honoré de Balzac",
    "What is rational is actual and what is actual is rational. ~ G. W. F. Hegel",
    "The mass of men lead lives of quiet desperation. ~ Henry David Thoreau",
    "You can discover more about a person in an hour of play than in a year of conversation. ~ Plato",
    "Freedom is nothing else but a chance to be better. ~ Albert Camus",
    "The price good men pay for indifference to public affairs is to be ruled by evil men. ~ Plato",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. ~ Ralph Waldo Emerson",
    "Knowledge is power. ~ Francis Bacon",
    "Peace cannot be kept by force; it can only be achieved by understanding. ~ Albert Einstein",
    "The highest result of education is tolerance. ~ Helen Keller",
    "No one can make you feel inferior without your consent. ~ Eleanor Roosevelt",
    "Love is the beauty of the soul. ~ Saint Augustine",
    "The future depends on what you do today. ~ Mahatma Gandhi",
    "Character is destiny. ~ Heraclitus",
    "The weak can never forgive. Forgiveness is the attribute of the strong. ~ Mahatma Gandhi",
    "Education is the most powerful weapon which you can use to change the world. ~ Nelson Mandela",

    "The truth is rarely pure and never simple. ~ Oscar Wilde",
    "The first duty of society is justice. ~ Alexander Hamilton",
    "Love seeks not itself to please. ~ William Blake",
    "Wisdom begins in wonder. ~ Socrates",
    "We become what we contemplate. ~ Plato",
    "Life is really simple, but we insist on making it complicated. ~ Confucius",
    "No act of kindness, no matter how small, is ever wasted. ~ Aesop",
    "He who conquers himself is the mightiest warrior. ~ Confucius",
    "The best way to find yourself is to lose yourself in the service of others. ~ Mahatma Gandhi",
    "Power concedes nothing without a demand. ~ Frederick Douglass",

    "The limits of my language mean the limits of my world. ~ Ludwig Wittgenstein",
    "Man is condemned to be free. ~ Jean-Paul Sartre",
    "Hope is being able to see that there is light despite all of the darkness. ~ Desmond Tutu",
    "To deny people their human rights is to challenge their very humanity. ~ Nelson Mandela",
    "Love is friendship set on fire. ~ Jeremy Taylor",
    "Those who cannot remember the past are condemned to repeat it. ~ George Santayana",
    "The greatest good you can do for another is not just share your riches, but reveal to them their own. ~ Benjamin Disraeli",
    "Freedom lies in being bold. ~ Robert Frost",
    "The greatest obstacle to discovery is not ignorance—it is the illusion of knowledge. ~ Daniel J. Boorstin",
    "The price of freedom is eternal vigilance. ~ Thomas Jefferson",

    "The world is changed by your example, not by your opinion. ~ Paulo Coelho",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. ~ Ralph Waldo Emerson",
    "The greatest prison people live in is the fear of what other people think. ~ David Icke",
    "Only the educated are free. ~ Epictetus",
    "The aim of life is self-development. ~ Oscar Wilde",
    "The superior man understands what is right; the inferior man understands what will sell. ~ Confucius",
    "A house divided against itself cannot stand. ~ Abraham Lincoln",
    "The ballot is stronger than the bullet. ~ Abraham Lincoln",
    "Where wisdom reigns, there is no conflict between thinking and feeling. ~ Carl Jung",
    "The privilege of a lifetime is to become who you truly are. ~ Carl Jung",

    "Every man takes the limits of his own field of vision for the limits of the world. ~ Arthur Schopenhauer",
    "Freedom is secured not by the fulfilling of one's desires, but by the removal of desire. ~ Epictetus",
    "The more you know yourself, the more patience you have for what you see in others. ~ Erik Erikson",
    "Kindness is the language which the deaf can hear and the blind can see. ~ Mark Twain",
    "A person may cause evil to others not only by his actions but by his inaction. ~ John Stuart Mill",
    "There is no greater agony than bearing an untold story inside you. ~ Maya Angelou",
    "Whenever the people are well-informed, they can be trusted with their own government. ~ Thomas Jefferson",
    "The only thing worse than being blind is having sight but no vision. ~ Helen Keller",
    "Judge a man by his questions rather than by his answers. ~ Voltaire",
    "The art of being wise is knowing what to overlook. ~ William James",

    "The most courageous act is still to think for yourself. Aloud. ~ Coco Chanel",
    "I am not an Athenian or a Greek, but a citizen of the world. ~ Socrates",
    "There is no such thing as a moral or an immoral book. Books are well written, or badly written. That is all. ~ Oscar Wilde",
    "The only limit to our realization of tomorrow will be our doubts of today. ~ Franklin D. Roosevelt",
    "If you want to know what a man's like, take a good look at how he treats his inferiors, not his equals. ~ J.K. Rowling",
    "The mind is not a vessel to be filled, but a fire to be kindled. ~ Plutarch",
    "He who fights with monsters should look to it that he himself does not become a monster. ~ Friedrich Nietzsche",
    "A room without books is like a body without a soul. ~ Marcus Tullius Cicero",
    "You must be the change you wish to see in the world. ~ Mahatma Gandhi",
    "To live is the rarest thing in the world. Most people exist, that is all. ~ Oscar Wilde",
    "The whole secret of a successful life is to find out what is one's destiny to do, and then do it. ~ Henry Ford",
    "Good and evil, reward and punishment, are the only motives to a rational creature. ~ John Locke",
    "If you tell the truth, you don't have to remember anything. ~ Mark Twain",
    "Without deviation from the norm, progress is not possible. ~ Frank Zappa",
    "The measure of a man is what he does with power. ~ Plato",
    "There is but one truly serious philosophical problem, and that is suicide. ~ Albert Camus",
    "The heavier the burden, the closer our lives come to the earth, the more real and truthful they become. ~ Milan Kundera",
    "In the end, we will remember not the words of our enemies, but the silence of our friends. ~ Martin Luther King Jr.",
    "The philosophers have only interpreted the world, in various ways; the point is to change it. ~ Karl Marx",
    "Good people do not need laws to tell them to act responsibly, while bad people will find a way around the laws. ~ Plato",
    "Doubt is an uncomfortable condition, but certainty is a ridiculous one. ~ Voltaire",
    "Man is the only creature who refuses to be what he is. ~ Albert Camus",
    "A society that puts equality before freedom will get neither. A society that puts freedom before equality will get a high degree of both. ~ Milton Friedman",
    "We accept the love we think we deserve. ~ Stephen Chbosky",
    "The line separating good and evil passes not through states, nor between classes, nor between political parties either—but right through every human heart. ~ Aleksandr Solzhenitsyn",
    "The roots of education are bitter, but the fruit is sweet. ~ Aristotle",
    "Poverty is the parent of revolution and crime. ~ Aristotle",
    "If God did not exist, it would be necessary to invent him. ~ Voltaire",
    "An investment in knowledge pays the best interest. ~ Benjamin Franklin",
    "A people that elect corrupt politicians, imposters, thieves and traitors are not victims, but accomplices. ~ George Orwell",
    "You have power over your mind - not outside events. Realize this, and you will find strength. ~ Marcus Aurelius",
    "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth. ~ Marcus Aurelius",
    "It is the mark of an educated mind to be able to entertain a thought without accepting it. ~ Aristotle",
    "Prejudices are what fools use for reason. ~ Voltaire",
    "Do not say a little in many words but a great deal in few. ~ Pythagoras",
    "We are what we pretend to be, so we must be careful about what we pretend to be. ~ Kurt Vonnegut",
    "A fool thinks himself to be wise, but a wise man knows himself to be a fool. ~ William Shakespeare",
    "Words are, of course, the most powerful drug used by mankind. ~ Rudyard Kipling",
    "I would rather die having spoken in my manner, than speak in your manner and live. ~ Socrates",
    "Truth is by nature self-evident. As soon as you remove the cobwebs of ignorance that surround it, it shines clear. ~ Mahatma Gandhi",
    "I cannot teach anybody anything. I can only make them think. ~ Socrates",
    "A man who fears suffering is already suffering from what he fears. ~ Michel de Montaigne",
    "Death is not the greatest loss in life. The greatest loss is what dies inside us while we live. ~ Norman Cousins",
    "The mind is furnished with ideas by experience alone. ~ John Locke",
    "Courage is knowing what not to fear. ~ Plato",
    "The secret of happiness, you see, is not found in seeking more, but in developing the capacity to enjoy less. ~ Socrates",
    "He who is unable to live in society, or who has no need because he is sufficient for himself, must be either a beast or a god. ~ Aristotle",
    "Never interrupt your enemy when he is making a mistake. ~ Napoleon Bonaparte",
    "Laws are spider webs through which the big flies pass and the little ones get caught. ~ Honoré de Balzac",
    "Every nation gets the government it deserves. ~ Joseph de Maistre",
    "The reading of all good books is like a conversation with the finest minds of past centuries. ~ René Descartes",
    "If a man knows not to which port he sails, no wind is favorable. ~ Seneca",
    "Wealth consists not in having great possessions, but in having few wants. ~ Epictetus",
    "We suffer more often in imagination than in reality. ~ Seneca",
    "There is only one way to happiness and that is to cease worrying about things which are beyond the power of our will. ~ Epictetus",
    "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult. ~ Seneca",
    "Ignorance is the root and stem of all evil. ~ Plato",
    "Happiness is the meaning and the purpose of life, the whole aim and end of human existence. ~ Aristotle"
  ],

  /**
   * Get a random quote from the library
   */
  getRandomQuote() {
    const idx = Math.floor(Math.random() * this.list.length);
    return this.list[idx];
  },

  /**
   * Parse quote string into body and author
   */
  parseQuote(quoteStr) {
    if (!quoteStr || typeof quoteStr !== 'string') {
      return { text: '', author: '' };
    }
    const parts = quoteStr.split('~');
    if (parts.length > 1) {
      return {
        text: parts[0].trim().replace(/^["']|["']$/g, ''),
        author: parts.slice(1).join('~').trim()
      };
    }
    return {
      text: quoteStr.trim().replace(/^["']|["']$/g, ''),
      author: ''
    };
  },

  /**
   * Render email-safe quote block HTML
   */
  renderQuoteHtml(quoteStr, accentColor = '#00DC82', isDark = false, fontFamily = 'sans-serif', customTextColor = null) {
    if (!quoteStr || !quoteStr.trim()) return '';

    const parsed = this.parseQuote(quoteStr);
    const borderColor = accentColor || '#00DC82';
    const textColor = customTextColor || (isDark ? '#D4D4D8' : '#475569');
    const authorColor = isDark ? '#9CA3AF' : '#64748B';

    return `
<table cellpadding="0" cellspacing="0" border="0" class="sig-quote-table" style="border-collapse: collapse; margin-top: 8px; max-width: 480px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td class="sig-dark-quote" style="border-left: 2px solid ${borderColor}; padding-left: 10px; font-family: ${fontFamily}; font-size: 11px; font-style: italic; color: ${textColor}; line-height: 1.4; vertical-align: top;">
      &ldquo;${parsed.text}&rdquo;${parsed.author ? ` <span style="font-style: normal; font-weight: 600; color: ${authorColor}; white-space: nowrap;">&mdash; ${parsed.author}</span>` : ''}
    </td>
  </tr>
</table>
    `.trim();
  }
};

// Universal exports
if (typeof window !== 'undefined') {
  window.Quotes = Quotes;
}
if (typeof globalThis !== 'undefined') {
  globalThis.Quotes = Quotes;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Quotes;
}
