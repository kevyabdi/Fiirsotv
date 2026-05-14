import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiirso Admin",
  description: "Fiirso content management panel",
};

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
