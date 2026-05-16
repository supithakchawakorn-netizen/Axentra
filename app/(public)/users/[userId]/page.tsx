import { notFound, redirect } from "next/navigation";
import { getProfileById } from "@/lib/data/profiles";

interface UserIdPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserByIdPage({ params }: UserIdPageProps) {
  const { userId } = await params;
  const profile = await getProfileById(userId);
  if (!profile) notFound();
  redirect(`/@${profile.handle}`);
}
