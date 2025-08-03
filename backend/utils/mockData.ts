/**
 * Mock data to use when database connection fails
 * This allows the application to function in development mode without a database
 */

// Mock Members
export const members = [
  {
    _id: 'mem1',
    username: 'frostbyte',
    fullName: 'Alex Winters',
    avatar: 'https://placehold.co/100/8A2BE2/FFFFFF?text=AW',
    team: 'Frost Clan',
    role: 'Player',
    games: ['CS:GO', 'Valorant'],
    rank: 'Pro',
    bio: 'Professional CS:GO player with 5 years of experience',
    achievements: ['2023 Regional Champion', 'MVP Summer Tournament 2022'],
    socialLinks: {
      twitter: 'https://twitter.com/frostbyte',
      instagram: 'https://instagram.com/frostbyte',
      twitch: 'https://twitch.tv/frostbyte',
      youtube: '',
      discord: 'frostbyte#1234'
    },
    joinDate: new Date('2021-03-15'),
    createdAt: new Date('2021-03-15'),
    updatedAt: new Date('2023-01-10')
  },
  {
    _id: 'mem2',
    username: 'neon_blade',
    fullName: 'Sarah Kim',
    avatar: 'https://placehold.co/100/8A2BE2/FFFFFF?text=SK',
    team: 'Neon Strikers',
    role: 'Coach',
    games: ['League of Legends'],
    rank: 'Master Coach',
    bio: 'Former pro player turned coach with expertise in team strategy',
    achievements: ['Coach of the Year 2022', 'Championship Winner 2021'],
    socialLinks: {
      twitter: 'https://twitter.com/neon_blade',
      instagram: 'https://instagram.com/neon_blade',
      twitch: 'https://twitch.tv/neon_blade',
      youtube: 'https://youtube.com/neon_blade',
      discord: 'neonblade#5678'
    },
    joinDate: new Date('2020-06-22'),
    createdAt: new Date('2020-06-22'),
    updatedAt: new Date('2023-02-15')
  },
  {
    _id: 'mem3',
    username: 'shadowstrike',
    fullName: 'Marcus Johnson',
    avatar: 'https://placehold.co/100/8A2BE2/FFFFFF?text=MJ',
    team: 'Shadow Ops',
    role: 'Player',
    games: ['Fortnite', 'Apex Legends'],
    rank: 'Elite',
    bio: 'Battle royale specialist with incredible aim and game sense',
    achievements: ['Fortnite World Cup Qualifier', '3x Tournament Champion'],
    socialLinks: {
      twitter: 'https://twitter.com/shadowstrike',
      instagram: 'https://instagram.com/shadowstrike',
      twitch: 'https://twitch.tv/shadowstrike',
      youtube: 'https://youtube.com/shadowstrike',
      discord: 'shadowstrike#9012'
    },
    joinDate: new Date('2022-01-10'),
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2023-03-01')
  }
];

// Mock Events
export const events = [
  {
    _id: 'evt1',
    name: 'Summer Showdown 2023',
    description: 'The biggest CS:GO tournament of the summer',
    image: 'https://placehold.co/800x400/1A0033/00FFFF?text=SUMMER+SHOWDOWN',
    game: 'CS:GO',
    startDate: new Date('2023-07-15'),
    endDate: new Date('2023-07-18'),
    location: 'Los Angeles, CA',
    status: 'upcoming',
    teams: ['Team Alpha', 'Frost Clan', 'Neon Strikers'],
    prizePool: 50000,
    format: 'Double Elimination',
    registrationDeadline: new Date('2023-07-01'),
    isPublic: true,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-15')
  },
  {
    _id: 'evt2',
    name: 'Valorant Champions Tour',
    description: 'Official Valorant tournament with top teams',
    image: 'https://placehold.co/800x400/1A0033/00FFFF?text=VALORANT+TOUR',
    game: 'Valorant',
    startDate: new Date('2023-08-20'),
    endDate: new Date('2023-08-27'),
    location: 'Berlin, Germany',
    status: 'upcoming',
    teams: ['Frost Clan', 'Shadow Ops', 'Team Delta'],
    prizePool: 100000,
    format: 'Round Robin + Playoffs',
    registrationDeadline: new Date('2023-07-25'),
    isPublic: true,
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-05')
  },
  {
    _id: 'evt3',
    name: 'League of Legends Invitational',
    description: 'Elite LoL competition featuring the best teams',
    image: 'https://placehold.co/800x400/1A0033/00FFFF?text=LOL+INVITATIONAL',
    game: 'League of Legends',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2023-06-12'),
    location: 'Seoul, South Korea',
    status: 'completed',
    teams: ['Neon Strikers', 'Team Echo', 'Team Foxtrot'],
    prizePool: 75000,
    format: 'Single Elimination',
    registrationDeadline: new Date('2023-05-20'),
    isPublic: true,
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-06-13')
  }
];

// Function to find a member by ID
export const findMemberById = (id: string) => {
  return members.find(member => member._id === id) || null;
};

// Function to find an event by ID
export const findEventById = (id: string) => {
  return events.find(event => event._id === id) || null;
};

// Mock data flag to check if we're using mock data
export const isMockData = true; 