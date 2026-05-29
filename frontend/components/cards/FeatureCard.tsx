type FeatureCardProps = {
  title: string
  description: string
}

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {

  return (
    <div className="
      bg-zinc-900
      border
      border-zinc-800
      p-6
      rounded-2xl
    ">

      <h3 className="
        text-xl
        font-bold
        mb-3
        text-violet-400
      ">
        {title}
      </h3>

      <p className="text-zinc-400">
        {description}
      </p>

    </div>
  )
}
