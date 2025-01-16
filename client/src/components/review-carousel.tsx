import ReviewCard from "./review-card";
import Marquee from "@/components/ui/marquee";

// Données en dur pour le moment
const reviews = [
  {
    name: "Adrien Albuquerque",
    username: "@ADR1811",
    body: "C'est vraiment de la merde.",
    img: "https://avatars.githubusercontent.com/u/29776857?s=70&v=4",
    url: "https://github.com/ADR1811",
  },
  {
    name: "Thanh-Long Pham",
    username: "@Thanh-0dev",
    body: "Partagez vous mon héritage.",
    img: "https://avatars.githubusercontent.com/u/72603795?s=70&v=4",
    url: "https://github.com/Thanh-0dev",
  },
  {
    name: "Thomas Buisson",
    username: "@ThomAzgo",
    body: "Squid Game 🐙🔥.",
    img: "https://avatars.githubusercontent.com/u/72854286?s=70&v=4",
    url: "https://github.com/ThomAzgo",
  },
  {
    name: "Luca Grousset",
    username: "@lucag322",
    body: "Y'a Thanh il recopie mon dashboard.",
    img: "https://avatars.githubusercontent.com/u/97728486?s=70&v=4",
    url: "https://github.com/lucag322",
  },
  {
    name: "Antoine Azevedo Da Silva",
    username: "@DestroyCom",
    body: "J'ai mangé 2 banh mi et un bo bun.",
    img: "https://avatars.githubusercontent.com/u/37459465?s=70&v=4",
    url: "https://github.com/DestroyCom",
  },
  {
    name: "Teddy Gamiette",
    username: "@tedjy971",
    body: "J'adore les API, dans 20/30 ans il n'y en aura plus.",
    img: "https://avatars.githubusercontent.com/u/93723692?s=70&v=4",
    url: "https://github.com/tedjy971",
  },
  {
    name: "Brandon Vo",
    username: "@Hiteazel",
    body: "J'ajoute juste des composants sur la page parce qu'elle parait vide.",
    img: "https://avatars.githubusercontent.com/u/95615052?s=70&v=4",
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
