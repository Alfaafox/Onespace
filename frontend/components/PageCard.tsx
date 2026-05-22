interface Props {
  title: string;
  content: string;
}

export default function PageCard({
  title,
  content,
}: Props) {

  return (
    <div className="
      bg-zinc-900
      border
      border-zinc-800
      rounded-2xl
      p-6
      hover:border-violet-500
      transition
    ">

      <h2 className="
        text-2xl
        font-bold
        text-violet-400
        mb-4
      ">
        {title}
      </h2>

      <p className="
        text-zinc-400
      ">
        {content}
      </p>

    </div>
  );
}
