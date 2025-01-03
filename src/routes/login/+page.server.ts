import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  if (user) {
    redirect(302, "/");
  }
};
