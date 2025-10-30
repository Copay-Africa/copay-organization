import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect the root entry page to the login route.
  redirect("/login");
  return null;
}
