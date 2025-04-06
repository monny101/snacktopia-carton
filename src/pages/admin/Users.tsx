import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "staff" | "customer";
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "staff" | "customer"
  >("customer");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order(sortField, { ascending: sortDirection === "asc" });

        if (error) throw error;
        setUsers(data as UserProfile[]);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortField, sortDirection]);

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const nameMatch = user.full_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const phoneMatch = user.phone
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return nameMatch || phoneMatch;
  });

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      console.log("Updating user role:", selectedUser.id, "to", selectedRole);

      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);

      if (error) {
        console.error("Error response from Supabase:", error);
        throw error;
      }

      console.log("User role updated successfully");

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: selectedRole } : u,
        ),
      );

      setIsEditRoleOpen(false);

      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}`,
      });
    } catch (error: any) {
      console.error("Error updating user role:", error);

      let errorMessage = "Failed to update user role";
      if (error.code === "42501") {
        errorMessage =
          "Permission denied. You need admin privileges to update user roles.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left font-medium">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort("full_name")}
                  >
                    Name
                    {sortField === "full_name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Phone</th>
                <th className="py-3 px-4 text-left font-medium">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort("role")}
                  >
                    Role
                    {sortField === "role" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  <button
                    className="flex items-center"
                    onClick={() => handleSort("created_at")}
                  >
                    Joined
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.full_name || "N/A"}</td>
                    <td className="py-3 px-4">{user.phone || "N/A"}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "staff"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRole(user.role);
                          setIsEditRoleOpen(true);
                        }}
                      >
                        Change Role
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No users found matching your search"
                      : "No users available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <p className="mb-4">
                Changing role for user:{" "}
                <span className="font-medium">{selectedUser.full_name}</span>
              </p>

              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: any) => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">
                  Role Permissions:
                </h3>
                <ul className="text-sm space-y-1">
                  <li>
                    <strong>Customer:</strong> Can browse products, place
                    orders, and use chat support
                  </li>
                  <li>
                    <strong>Staff:</strong> Can manage orders and respond to
                    customer chats
                  </li>
                  <li>
                    <strong>Admin:</strong> Full access to all features
                    including product management
                  </li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
