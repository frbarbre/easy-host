import { FormSchema, defaultFormValues } from "@/schemas/form-schema";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface PersistenceOptions {
  form: UseFormReturn<FormSchema>;
  debounceMs?: number;
}

export function usePersistence({ form, debounceMs = 500 }: PersistenceOptions) {
  const [isLoading, setIsLoading] = useState(true);

  const resetForm = () => {
    // Clear localStorage
    localStorage.removeItem("formState");
    localStorage.removeItem("scrollPosition");

    // Reset form to empty/default values
    form.reset(defaultFormValues);

    // Reset scroll position
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  // Load saved state and scroll position
  useEffect(() => {
    const savedState = localStorage.getItem("formState");
    const savedScroll = localStorage.getItem("scrollPosition");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        form.reset(parsedState);
      } catch (error) {
        console.error("❌ Error loading saved state:", error);
      }
    }

    requestAnimationFrame(() => {
      setIsLoading(false);
      requestAnimationFrame(() => {
        if (savedScroll) {
          window.scrollTo({
            top: parseInt(savedScroll),
            behavior: "instant",
          });
        }
      });
    });
  }, [form]);

  // Save form state with debounce
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const subscription = form.watch((data) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem("formState", JSON.stringify(data));
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [form, debounceMs]);

  // Save scroll position with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          localStorage.setItem("scrollPosition", window.scrollY.toString());
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isLoading, resetForm };
}
