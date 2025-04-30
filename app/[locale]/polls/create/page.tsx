"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createPoll, State } from "../actions";
import { useActionState } from "react";

export default function CreatePollPage() {
  const t = useTranslations("poll.create");
  const categoryT = useTranslations("common.category");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [options, setOptions] = useState([
    { text: "", position: 0 },
    { text: "", position: 1 },
  ]);

  const initialState: State = { success: false, error: null };
  const [state, formAction] = useActionState(createPoll, initialState);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, { text: "", position: options.length }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Update positions after removal
      const updatedOptions = newOptions.map((option, i) => ({
        ...option,
        position: i,
      }));
      setOptions(updatedOptions);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Link href="/polls" className="text-blue-500 hover:underline mb-8 block">
        {t("backToPolls")}
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

        {state.success === false && state.error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("titleLabel")}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("descriptionLabel")}
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("categoryLabel")}
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="general">{categoryT("general")}</option>
              <option value="politics">{categoryT("politics")}</option>
              <option value="technology">{categoryT("technology")}</option>
              <option value="entertainment">
                {categoryT("entertainment")}
              </option>
              <option value="sports">{categoryT("sports")}</option>
              <option value="other">{categoryT("other")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("optionsLabel", { count: options.length })}
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`options[${index}].text`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={t("optionPlaceholder", { number: index + 1 })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={200}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      aria-label="Remove option"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path
                          fillRule="evenodd"
                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {t("addOption")}
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>
            <Button type="submit">{t("createPoll")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
