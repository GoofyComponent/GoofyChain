import ReviewCard from "./review-card";
import Marquee from "@/components/ui/marquee";

// Données en dur pour le moment
const reviews = [
  {
    name: "Adrien Albuquerque",
    username: "@ADR1811",
    body: "Shit, this is.",
    img: "https://avatars.githubusercontent.com/u/29776857",
    url: "https://github.com/ADR1811",
  },
  {
    name: "Thanh-Long Pham",
    username: "@Thanh-0dev",
    body: "Share my fortune.",
    img: "https://avatars.githubusercontent.com/u/72603795",
    url: "https://github.com/Thanh-0dev",
  },
  {
    name: "Thomas Buisson",
    username: "@ThomAzgo",
    body: "Squid Game 🐙🔥.",
    img: "https://avatars.githubusercontent.com/u/72854286",
    url: "https://github.com/ThomAzgo",
  },
  {
    name: "Luca Grousset",
    username: "@lucag322",
    body: "There is Thanh he copies my dashboard.",
    img: "https://avatars.githubusercontent.com/u/97728486",
    url: "https://github.com/lucag322",
  },
  {
    name: "Antoine Azevedo Da Silva",
    username: "@DestroyCom",
    body: "I ate 2 banh mi and a bo bun.",
    img: "https://avatars.githubusercontent.com/u/37459465",
    url: "https://github.com/DestroyCom",
  },
  {
    name: "Teddy Gamiette",
    username: "@tedjy971",
    body: "I love APIs, in 20/30 years there won't be any more.",
    img: "https://avatars.githubusercontent.com/u/93723692",
    url: "https://github.com/tedjy971",
  },
  {
    name: "Brandon Vo",
    username: "@Hiteazel",
    body: "I just add components to the page because it looks empty.",
    img: "https://avatars.githubusercontent.com/u/95615052",
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
