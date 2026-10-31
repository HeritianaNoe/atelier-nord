import { avatarFor, type Gender } from "@/lib/avatars";

type Props = {
  user: { id: string; name: string; gender: Gender; photoUrl?: string | null };
  size?: number;
  className?: string;
};

export default function UserAvatar({ user, size = 36, className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarFor(user)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full bg-mist object-cover ring-1 ring-line ${className}`}
    />
  );
}
