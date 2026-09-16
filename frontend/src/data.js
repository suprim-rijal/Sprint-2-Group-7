// src/data.js

import clothingImg from "./assets/clothing.jpg";
import festivalsImg from "./assets/festivals.jpg";
import foodsImg from "./assets/foods.jpg";
import storyImg from "./assets/story.jpg";

export const cultureData = [
  {
    id: "festivals",
    category: "Festivals",
    nepal: [
      {
        id: 101,
        title: "Dashain Festival",
        image: festivalsImg,
        description: "The longest Hindu festival in Nepal celebrating victory over evil."
      },
      {
        id: 102,
        title: "Tihar (Deepavali)",
        image: festivalsImg,
        description: "The festival of lights honoring animals and the brother-sister bond."
      }
    ],
    ghana: [
      {
        id: 201,
        title: "Aboakyer Festival",
        image: festivalsImg,
        description: "A deer-hunting celebration held by the Effutu people."
      },
      {
        id: 202,
        title: "Homowo Festival",
        image: festivalsImg,
        description: "Celebrated by the Ga people to hoot at hunger in memory of a historic famine."
      }
    ]
  },
  {
    id: "foods",
    category: "Foods",
    nepal: [
      {
        id: 103,
        title: "Dal Bhat",
        image: foodsImg,
        description: "The staple everyday meal of rice, lentil soup, and vegetable curry."
      },
      {
        id: 104,
        title: "Momo",
        image: foodsImg,
        description: "Steamed dumplings filled with minced meat or vegetables."
      }
    ],
    ghana: [
      {
        id: 203,
        title: "Jollof Rice",
        image: foodsImg,
        description: "A flavorful one-pot rice dish cooked in a tomato base."
      },
      {
        id: 204,
        title: "Fufu and Light Soup",
        image: foodsImg,
        description: "Pounded cassava and green plantain served with a rich broth."
      }
    ]
  },
  {
    id: "clothing",
    category: "Clothing",
    nepal: [
      {
        id: 105,
        title: "Daura Suruwal",
        image: clothingImg,
        description: "Traditional double-breasted shirt and fitted trousers worn by men."
      },
      {
        id: 106,
        title: "Gunyo Cholo",
        image: clothingImg,
        description: "Traditional dress given to young girls to mark womanhood."
      }
    ],
    ghana: [
      {
        id: 205,
        title: "Kente Cloth",
        image: clothingImg,
        description: "A famous handwoven fabric featuring vibrant geometric patterns."
      },
      {
        id: 206,
        title: "Smock (Fugu)",
        image: clothingImg,
        description: "A heavy, hand-spun cotton garment with distinct striped patterns."
      }
    ]
  },
  {
    id: "short_stories",
    category: "Short Stories",
    nepal: [
      {
        id: 107,
        title: "The Clever Jackal",
        image: storyImg,
        description: "A famous moral folktale told to children about wit overcoming brute strength."
      },
      {
        id: 108,
        title: "Legend of Kathmandu Valley",
        image: storyImg,
        description: "The ancient myth of Manjushri draining a lake to create the Kathmandu Valley."
      }
    ],
    ghana: [
      {
        id: 207,
        title: "Anansi and the Pot of Wisdom",
        image: storyImg,
        description: "The classic trickster spider story about trying to hoard all the world's wisdom."
      },
      {
        id: 208,
        title: "Why Turtle Has a Cracked Shell",
        image: storyImg,
        description: "A popular folktale explaining how Turtle tricked the birds to join a sky feast."
      }
    ]
  }
];