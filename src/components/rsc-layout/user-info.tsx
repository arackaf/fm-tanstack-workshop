import { getDb } from "@/data/db";
import { users as usersTable } from "@/drizzle/schema";
import { SidePanel } from "./side-panel";

export const UserInfo = async () => {
  const db = await getDb();
  const [user] = await db.select().from(usersTable).limit(1);

  await new Promise(resolve => setTimeout(resolve, 2000));

  return <SidePanel user={user} />;
};
