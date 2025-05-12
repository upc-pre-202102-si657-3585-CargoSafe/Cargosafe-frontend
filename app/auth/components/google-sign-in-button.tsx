import { FcGoogle } from "react-icons/fc";

export function GoogleSignInButton() {
  return (
    <button
      className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700"
      type="button"
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      <span>Continuar con Google</span>
    </button>
  );
} 