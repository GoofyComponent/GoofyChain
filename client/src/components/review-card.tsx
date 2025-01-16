const ReviewCard = ({
  img,
  name,
  username,
  body,
  url,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  url: string;
}) => {
  function cn(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  const handleClick = () => {
    window.open(url, "_blank");
  };

  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
      onClick={handleClick}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full select-none"
          width="32"
          height="32"
          alt=""
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white select-none">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40 select-none">
            {username}
          </p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm align-middle select-none">
        {body}
      </blockquote>
    </figure>
  );
};

export default ReviewCard;
