import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import { SPLProgramInteractions } from '../../components/ui/client/SPL_ProgramInteractions/SPL_ProgramInteractions';


export default function CrudPage() {
  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto p-6">
        <SPLProgramInteractions />
      </div>
    </AuthGate>
  );
}