import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db';
import Product from '../models/Product';
import Team from '../models/Team';
import Event from '../models/Event';
import Member from '../models/Member';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Sample data
const products = [
  {
    name: "TeamWave Pro Jersey",
    description: "Official TeamWave gaming jersey with neon accents",
    category: "jerseys",
    price: 49.99,
    image: "/images/shop/jersey.jpg",
    stock: 50,
    rating: 4.8
  },
  {
    name: "Neon Gaming Mousepad",
    description: "RGB-illuminated gaming mousepad with TeamWave logo",
    category: "accessories",
    price: 24.99,
    image: "/images/shop/mousepad.jpg",
    stock: 100,
    rating: 4.5
  },
  {
    name: "Pro Gaming Headset",
    description: "High-quality gaming headset with surround sound",
    category: "peripherals",
    price: 129.99,
    image: "/images/shop/headset.jpg",
    stock: 30,
    rating: 4.9
  },
  {
    name: "TeamWave Hoodie",
    description: "Comfortable hoodie with retro gaming design",
    category: "jerseys",
    price: 69.99,
    image: "/images/shop/hoodie.jpg",
    stock: 40,
    rating: 4.7
  },
  {
    name: "Gaming Keychain",
    description: "LED keychain with TeamWave logo",
    category: "accessories",
    price: 9.99,
    image: "/images/shop/keychain.jpg",
    stock: 200,
    rating: 4.3
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with custom keycaps",
    category: "peripherals",
    price: 159.99,
    image: "/images/shop/keyboard.jpg",
    stock: 25,
    rating: 4.8
  }
];

const teams = [
  {
    name: "TeamWave CS:GO",
    game: "CS:GO",
    description: "Our professional Counter-Strike: Global Offensive team, competing at the highest level of tactical FPS gaming.",
    logo: "/images/teams/csgo-logo.jpg",
    status: "active",
    members: [
      {
        username: "NeonSniper",
        role: "Captain",
        avatar: "/images/members/neonsniper.jpg"
      },
      {
        username: "Tactical",
        role: "Rifler",
        avatar: "/images/members/tactical.jpg"
      },
      {
        username: "ShadowStrike",
        role: "AWPer",
        avatar: "/images/members/shadowstrike.jpg"
      },
      {
        username: "FlashMaster",
        role: "Support",
        avatar: "/images/members/flashmaster.jpg"
      },
      {
        username: "ClutchKing",
        role: "Entry Fragger",
        avatar: "/images/members/clutchking.jpg"
      }
    ],
    achievements: [
      {
        title: "National Championship 2023",
        date: new Date("2023-11-15"),
        description: "1st place at the National CS:GO Championship"
      },
      {
        title: "ESL Pro Series",
        date: new Date("2023-08-20"),
        description: "Top 4 finish at ESL Pro Series"
      }
    ]
  },
  {
    name: "TeamWave Valorant",
    game: "Valorant",
    description: "Our Valorant squad dominating the tactical shooter scene with innovative strategies and precision aim.",
    logo: "/images/teams/valorant-logo.jpg",
    status: "active",
    members: [
      {
        username: "PixelQueen",
        role: "Captain",
        avatar: "/images/members/pixelqueen.jpg"
      },
      {
        username: "AgentX",
        role: "Duelist",
        avatar: "/images/members/agentx.jpg"
      },
      {
        username: "WallHacker",
        role: "Sentinel",
        avatar: "/images/members/wallhacker.jpg"
      },
      {
        username: "SmokeMaster",
        role: "Controller",
        avatar: "/images/members/smokemaster.jpg"
      },
      {
        username: "ReconPro",
        role: "Initiator",
        avatar: "/images/members/reconpro.jpg"
      }
    ],
    achievements: [
      {
        title: "Valorant Champions Tour 2023",
        date: new Date("2023-09-10"),
        description: "Regional qualifier top 8"
      },
      {
        title: "Neon Cup 2023",
        date: new Date("2023-06-05"),
        description: "2nd place finish"
      }
    ]
  },
  {
    name: "TeamWave LoL",
    game: "League of Legends",
    description: "Our League of Legends team competing in the MOBA scene with strategic gameplay and team coordination.",
    logo: "/images/teams/lol-logo.jpg",
    status: "active",
    members: [
      {
        username: "LaneKing",
        role: "Top Laner",
        avatar: "/images/members/laneking.jpg"
      },
      {
        username: "JungleGod",
        role: "Jungler",
        avatar: "/images/members/junglegod.jpg"
      },
      {
        username: "ArcadeLegend",
        role: "Mid Laner",
        avatar: "/images/members/arcadelegend.jpg"
      },
      {
        username: "PixelPerfect",
        role: "ADC",
        avatar: "/images/members/pixelperfect.jpg"
      },
      {
        username: "SupportMaster",
        role: "Support",
        avatar: "/images/members/supportmaster.jpg"
      }
    ],
    achievements: [
      {
        title: "League Championship Series",
        date: new Date("2023-07-28"),
        description: "Top 6 finish in regional qualifier"
      }
    ]
  }
];

const events = [
  {
    name: "CS:GO Championship 2024",
    description: "The annual CS:GO championship featuring top teams from around the country competing for glory and prizes.",
    image: "/images/events/csgo-championship.jpg",
    game: "CS:GO",
    startDate: new Date("2024-05-15T10:00:00"),
    endDate: new Date("2024-05-17T18:00:00"),
    location: "Sousse Gaming Arena",
    status: "upcoming",
    teams: ["TeamWave CS:GO", "NeonStrike", "PixelWarriors", "TacticalSquad"],
    prizePool: 5000,
    format: "Double Elimination",
    registrationDeadline: new Date("2024-05-01T23:59:59"),
    isPublic: true
  },
  {
    name: "Valorant Pro League Season 2",
    description: "The second season of the Valorant Pro League, featuring weekly matches and a playoffs series.",
    image: "/images/events/valorant-league.jpg",
    game: "Valorant",
    startDate: new Date("2024-06-01T14:00:00"),
    endDate: new Date("2024-07-30T20:00:00"),
    location: "Online",
    status: "upcoming",
    teams: ["TeamWave Valorant", "PixelPunks", "AgentSquad", "TacticalAces"],
    prizePool: 3500,
    format: "Round Robin + Playoffs",
    registrationDeadline: new Date("2024-05-25T23:59:59"),
    isPublic: true
  },
  {
    name: "League of Legends Spring Cup",
    description: "A weekend tournament for League of Legends teams to showcase their skills and strategy.",
    image: "/images/events/lol-cup.jpg",
    game: "League of Legends",
    startDate: new Date("2024-04-20T12:00:00"),
    endDate: new Date("2024-04-21T20:00:00"),
    location: "TeamWave Gaming Center",
    status: "completed",
    teams: ["TeamWave LoL", "LaneDemons", "JungleMasters", "RiftRaiders"],
    prizePool: 2000,
    format: "Single Elimination",
    registrationDeadline: new Date("2024-04-15T23:59:59"),
    isPublic: true
  }
];

const members = [
  {
    username: "NeonSniper",
    fullName: "Alex Johnson",
    avatar: "/images/members/neonsniper.jpg",
    team: "TeamWave CS:GO",
    role: "Captain",
    games: ["CS:GO"],
    rank: "Elite",
    bio: "Professional CS:GO player with over 5 years of competitive experience. Known for precision AWP shots and strategic leadership.",
    achievements: ["National Championship 2023", "ESL Pro Series Top 4", "MVP CS:GO Tournament 2022"],
    socialLinks: {
      twitter: "https://twitter.com/neonsniper",
      twitch: "https://twitch.tv/neonsniper",
      instagram: "https://instagram.com/neonsniper_csgo"
    },
    joinDate: new Date("2019-05-15")
  },
  {
    username: "PixelQueen",
    fullName: "Sarah Kim",
    avatar: "/images/members/pixelqueen.jpg",
    team: "TeamWave Valorant",
    role: "Captain",
    games: ["Valorant", "Fortnite"],
    rank: "Master",
    bio: "Former CS:GO pro who transitioned to Valorant. Known for exceptional aim and game sense. Leads the team with strategic depth and versatility.",
    achievements: ["Valorant Champions Tour Regional Qualifier", "Neon Cup 2023 2nd Place"],
    socialLinks: {
      twitter: "https://twitter.com/pixelqueen",
      twitch: "https://twitch.tv/pixelqueenplays",
      instagram: "https://instagram.com/pixelqueen_gaming"
    },
    joinDate: new Date("2020-08-21")
  },
  {
    username: "ArcadeLegend",
    fullName: "Marcus Chen",
    avatar: "/images/members/arcadelegend.jpg",
    team: "TeamWave LoL",
    role: "Mid Laner",
    games: ["League of Legends", "Dota 2"],
    rank: "Veteran",
    bio: "Mid lane specialist with a knack for outplaying opponents. Known for his deep champion pool and mechanical skill.",
    achievements: ["League Championship Series Regional Qualifier Top 6", "MVP Mid Laner 2023"],
    socialLinks: {
      twitter: "https://twitter.com/arcadelegendlol",
      youtube: "https://youtube.com/arcadelegend",
      discord: "arcadelegend#1234"
    },
    joinDate: new Date("2020-02-08")
  }
];

// Import function
const importData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Team.deleteMany({});
    await Event.deleteMany({});
    await Member.deleteMany({});

    // Insert new data
    await Product.insertMany(products);
    await Team.insertMany(teams);
    await Event.insertMany(events);
    await Member.insertMany(members);

    console.log('Data imported successfully');
    process.exit();
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete function
const destroyData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Team.deleteMany({});
    await Event.deleteMany({});
    await Member.deleteMany({});

    console.log('Data destroyed successfully');
    process.exit();
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the script based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 