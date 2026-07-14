"use client";

import { useActionState, useEffect, useRef } from "react";
import { importRepository } from "@/actions/import";

export function ImportRepositoryForm() {
  const [state, formAction, pending] = useActionState(importRepository, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="w-full max-w-md">
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input 
          name="repository" 
          placeholder="owner/repo (e.g. facebook/react)" 
          required 
          maxLength={255}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
        />
        <button 
          type="submit" 
          disabled={pending}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {pending ? "Importing..." : "Import"}
        </button>
      </form>
      {state?.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
    </div>
  );
}
