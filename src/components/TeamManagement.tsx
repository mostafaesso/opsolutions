import { useState } from "react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamManagementProps {
  companySlug: string;
  userEmail: string;
  canInvite?: boolean;
}

export const TeamManagement = ({ companySlug, userEmail, canInvite = false }: TeamManagementProps) => {
  const { members, inviteMember, updateRole, removeMember } = useTeamMembers(companySlug);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "employee">("employee");
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim() || !fullName.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await inviteMember(email, fullName, role, userEmail);
      setEmail("");
      setFullName("");
      setRole("employee");
      setIsOpen(false);
      toast({ title: "Success", description: "Invitation sent!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this team member?")) return;
    try {
      await removeMember(memberId);
      toast({ title: "Success", description: "Member removed!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team members and their roles</CardDescription>
          </div>
          {canInvite && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new team member to join your company
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Select value={role} onValueChange={(value: any) => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite} disabled={submitting} className="w-full">
                    {submitting ? "Inviting..." : "Send Invitation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No team members yet</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role: <span className="capitalize">{member.role}</span> · Status: {member.status}
                  </p>
                </div>
                {canInvite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
