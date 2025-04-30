"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClientComponentClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types";

export default function ProfileSettingsPage() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First get the authenticated user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        // Then fetch the profile data
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setError("Failed to load profile");
        } else if (data) {
          setUser(data);
          setUsername(data.username || "");
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (e) {
        console.error("Error in profile settings:", e);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsSaving(true);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/${Date.now()}-${file.name}`, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);

      setAvatarUrl(urlData.publicUrl);
      setSuccess("Avatar uploaded successfully");
    } catch (e: unknown) {
      console.error("Error uploading avatar:", e);
      setError(e instanceof Error ? e.message : "Failed to upload avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Check username uniqueness if changed
      if (username !== user.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .neq("id", user.id)
          .maybeSingle();

        if (existingUser) {
          setError("Username is already taken");
          setIsSaving(false);
          return;
        }

        if (checkError) {
          console.error("Error checking username:", checkError);
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username,
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess("Profile updated successfully");
      router.refresh();
    } catch (e: unknown) {
      console.error("Error updating profile:", e);
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">
          Please{" "}
          <Link href="/login" className="text-blue-500 underline">
            log in
          </Link>{" "}
          to view your profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Link
        href="/profile"
        className="text-blue-500 hover:underline mb-8 block"
      >
        ← Back to profile
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar
              url={avatarUrl}
              username={username || user.username || "User"}
              size="lg"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="secondary" onClick={() => signOut()}>
              Sign Out
            </Button>

            <Button type="submit" isLoading={isSaving} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
