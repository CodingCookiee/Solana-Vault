import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import { Crud } from "@/components/ui/client/ContractInteractions/Crud/Crud";

export default function CrudPage() {
  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto p-6">
        <Crud />
      </div>
    </AuthGate>
  );
}