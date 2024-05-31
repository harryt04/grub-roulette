import Image from 'next/image'

export const PhotoComponent = ({ photoUrl }: { photoUrl: string }) => {
  return (
    <div>
      <Image
        src={photoUrl}
        alt="Place photo"
        width={400} // Specify the width you want
        height={300} // Specify the height you want
        layout="responsive"
      />
    </div>
  )
}
