import { useNavigate } from "react-router-dom";
import { clearImpersonation, ImpersonationState } from "@/lib/impersonation";

const roleLabel: Record<string, string> = {
  admin: "Company Admin",
  manager: "Manager",
  employee: "Employee",
};

interface Props {
  state: ImpersonationState;
}

const ImpersonationBanner = ({ state }: Props) => {
  const navigate = useNavigate();

  const exit = () => {
    clearImpersonation();
    navigate("/admin");
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-white text-sm flex items-center justify-between px-4 py-2 shadow-md">
      <span>
        Previewing as <strong>{roleLabel[state.role]}</strong> · {state.companyName}
      </span>
      <button
        onClick={exit}
        className="text-white font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        Exit preview
      </button>
    </div>
  );
};

export default ImpersonationBanner;
