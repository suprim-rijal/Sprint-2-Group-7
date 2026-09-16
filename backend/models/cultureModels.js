// {
//   "category": "Short Stories",
//   "nepal": [
//     {
//       "title": "The Clever Jackal",
//       "image": "/images/story-jackal.jpg",
//       "description": "A famous moral folktale told to children about wit overcoming brute strength."
//     },
//     {
//       "title": "Legend of Kathmandu Valley",
//       "image": "/images/story-kathmandu.jpg",
//       "description": "The ancient myth of Manjushri draining a lake to create the Kathmandu Valley."
//     }
//   ],
//   "ghana": [
//     {
//       "title": "Anansi and the Pot of Wisdom",
//       "image": "/images/anansi.jpg",
//       "description": "The classic trickster spider story about trying to hoard all the world's wisdom."
//     },
//     {
//       "title": "Why Turtle Has a Cracked Shell",
//       "image": "/images/turtle.jpg",
//       "description": "A popular folktale explaining how Turtle tricked the birds to join a sky feast."
//     }
//   ]
// }




const mongoose = require("mongoose");

const cultureItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const cultureSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
    nepal: [cultureItemSchema],
    ghana: [cultureItemSchema],
  },
  {
    timestamps: true,
  }
);

const Culture = mongoose.model("Culture", cultureSchema);
module.exports = Culture;