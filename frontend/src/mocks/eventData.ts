// Mock data for events
export const eventsMockData = [
  {
    _id: "1",
    name: "CS:GO Championship 2024",
    description: "Join us for the biggest CS:GO tournament of the year! Players from all over the country will compete for the grand prize.\n\nThe tournament will feature group stages followed by single elimination brackets. All matches will be streamed live on our Twitch channel.",
    location: "Gaming Arena, Sousse",
    game: "CS:GO",
    startDate: "2024-06-15T10:00:00Z",
    endDate: "2024-06-16T18:00:00Z",
    image: "/events/csgo-tournament.jpg",
    status: "upcoming",
    participants: ["Team Alpha", "Phoenix Squad", "Victory Warriors", "Midnight Gamers"],
    prize: "$5,000",
    registration_link: "https://forms.example.com/register-csgo"
  },
  {
    _id: "2",
    name: "Valorant Pro League Season 2",
    description: "Season 2 of our professional Valorant league is here! This season features 8 top teams competing over 4 weeks.\n\nWeekly matches will be held every Saturday, with the playoffs and grand finals on the final weekend. Don't miss the action!",
    location: "TeamWave HQ, Online",
    game: "Valorant",
    startDate: "2024-07-05T16:00:00Z",
    endDate: "2024-07-28T20:00:00Z",
    image: "/events/valorant-league.jpg",
    status: "upcoming",
    participants: ["Team Alpha", "Neon Shadows", "Tactical Aces", "Radiant Squad"],
    prize: "$3,500",
    registration_link: "https://forms.example.com/register-valorant"
  },
  {
    _id: "3",
    name: "League of Legends Spring Cup",
    description: "The annual Spring Cup returns! This League of Legends tournament brings together both amateur and semi-pro teams for an exciting competition.\n\nThe format includes group stages and a double elimination bracket for playoffs. All matches are best-of-three, with the grand final being a best-of-five series.",
    location: "Gaming Center, Tunis",
    game: "League of Legends",
    startDate: "2024-05-10T12:00:00Z",
    endDate: "2024-05-12T20:00:00Z",
    image: "/events/lol-cup.jpg",
    status: "completed",
    participants: ["Nexus Guardians", "Elder Drakes", "Baron Team", "Mid Laners"],
    prize: "$2,000"
  }
];

// Function to find an event by ID
export const findEventById = (id: string) => {
  return eventsMockData.find(event => event._id === id) || null;
}; 