import Image from 'next/image'

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="KnightED Logo"
        width={40}
        height={40}
        className="object-contain"
      />
      <h1 className="text-xl font-subheading text-gray-900 dark:text-gray-50">KnightED</h1>
    </div>
  )
}

export default Logo
