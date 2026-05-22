type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  variant = 'primary',
}: ButtonProps) {

  const styles = {
    primary:
      'bg-violet-600 hover:bg-violet-700',

    secondary:
      'bg-zinc-800 hover:bg-zinc-700',
  }

  return (
    <button
      className={`
        px-5
        py-3
        rounded-xl
        font-semibold
        transition
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  )
}
