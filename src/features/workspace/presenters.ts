/**
 * The on-screen characters a video can cast, with what each is like.
 * One list for the plan's picker and the editor's Video section, so a
 * character chosen in one is recognised by the other.
 */
export const PRESENTERS = [
  { name: "Dr. Maya Kapoor", role: "Dermatologist · warm, reassuring", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Rohan Mehta", role: "Physician · clear, authoritative", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Aisha Shah", role: "Medical presenter · calm, precise", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Daniel Lee", role: "Physician · conversational", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Elena Rostova", role: "Oncology specialist · measured", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Marcus Thorne", role: "Cardiology lead · authoritative", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=160&q=80" },
];

export function presenterImage(name: string): string | undefined {
  return PRESENTERS.find((p) => p.name === name)?.image;
}
