"use server";

import { createClient } from "@/lib/supabase/server";
import { createPollSchema } from "@/lib/validations/poll";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export type State = { success: boolean; error: string | null };

export async function createPoll(
  prevState: State,
  formData: FormData,
): Promise<State> {
  let pollId: string | null = null;

  try {
    // Parse the form data
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || undefined;
    const category = formData.get("category") as string;

    // Parse options from formData
    const optionsData = [];
    let index = 0;
    let optionText;

    while ((optionText = formData.get(`options[${index}].text`)) !== null) {
      optionsData.push({
        text: optionText as string,
        position: index,
      });
      index++;
    }

    const pollData = {
      title,
      description,
      category,
      options: optionsData,
    };

    // Validate the poll data
    const validation = createPollSchema.safeParse(pollData);

    if (!validation.success) {
      return {
        success: false,
        error: "Invalid input",
      };
    }

    const {
      title: validTitle,
      description: validDescription,
      category: validCategory,
      options,
    } = validation.data;

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        title: validTitle,
        description: validDescription,
        category: validCategory,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (pollError) {
      return { success: false, error: pollError.message };
    }
    pollId = poll.id;

    // Create the poll options
    const pollOptions = options.map((option) => ({
      poll_id: poll.id,
      text: option.text,
      position: option.position,
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(pollOptions);

    if (optionsError) {
      // If options creation fails, try to clean up the poll
      await supabase.from("polls").delete().eq("id", poll.id);
      return { success: false, error: optionsError.message };
    }
  } catch (error) {
    console.error("Error creating poll:", error);
    return { success: false, error: "Internal server error" };
  }

  // Revalidate the polls page and redirect to the new poll with locale
  const locale = await getLocale();
  revalidatePath(`/${locale}/polls`);
  redirect(`/${locale}/polls/${pollId}`);
}
