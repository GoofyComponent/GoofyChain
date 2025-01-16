import ReviewCard from "./review-card";
import Marquee from "@/components/ui/marquee";

// Données en dur pour le moment
const reviews = [
  {
    name: "Adrien Albuquerque",
    username: "@ADR1811",
    body: "C'est vraiment de la merde.",
    img: "https://cdn.discordapp.com/avatars/139819923324010496/a35779571bea1a73f0af807c7f6e43ed.webp?size=32",
    url: "https://github.com/ADR1811",
  },
  {
    name: "Thanh-Long Pham",
    username: "@Thanh-0dev",
    body: "Partagez vous mon héritage.",
    img: "https://cdn.discordapp.com/avatars/294549619785072640/b9ce2331c739776f4b5bc7e3a968d875.webp?size=32",
    url: "https://github.com/Thanh-0dev",
  },
  {
    name: "Thomas Buisson",
    username: "@ThomAzgo",
    body: "Squid Game 🐙🔥.",
    img: "https://cdn.discordapp.com/avatars/178053706573545472/fc37800cdd3fe3bda80add9019e1262a.webp?size=32",
    url: "https://github.com/ThomAzgo",
  },
  {
    name: "Luca Grousset",
    username: "@lucag322",
    body: "Y'a Thanh il recopie mon dashboard.",
    img: "https://cdn.discordapp.com/avatars/402137575630045184/373b7b58cb5e6400778507fde81d28f7.webp?size=32",
    url: "https://github.com/lucag322",
  },
  {
    name: "Antoine Azevedo Da Silva",
    username: "@DestroyCom",
    body: "J'ai mangé 2 banh mi et un bo bun.",
    img: "https://cdn.discordapp.com/avatars/296665923639836673/da9816dcbdd1e18d166aab877ffd3c47.webp?size=32",
    url: "https://github.com/DestroyCom",
  },
  {
    name: "Teddy Gamiette",
    username: "@tedjy971",
    body: "J'adore les API, dans 20/30 ans il n'y en aura plus.",
    img: "https://cdn.discordapp.com/avatars/493659978402365440/3c276c18ddf459afb9b3b733bc94c700.webp?size=32",
    url: "https://github.com/tedjy971",
  },
  {
    name: "Brandon Vo",
    username: "@Hiteazel",
    body: "J'ajoute juste des composants sur la page parce qu'elle parait vide.",
    img: "https://cdn.discordapp.com/avatars/289084574137450497/5877a6f8f7700f6f70bf23c9b36da7ed.webp?size=32",
    url: "https://github.com/Hiteazel",
  },
];

const ReviewCarousel = ({ className = "" }) => {
  return (
    <div className={`relative w-[60%] ${className}`}>
      <Marquee pauseOnHover className="[--duration:20s]">
        {reviews.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent"></div>
    </div>
  );
};

export default ReviewCarousel;
