"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, editUserSchema, changePasswordSchema } from "@/lib/schemas/users";
import { usersAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Mail,
  Calendar,
  Loader2,
  Users,
  ShieldCheck,
  Truck,
  MoreHorizontal,
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

const roleColorMap = {
  vendedor: "bg-primary text-primary-foreground",
  logistica: "bg-warning text-warning-foreground",
  admin: "bg-success text-success-foreground",
  owner: "bg-purple-600 text-white",
};

const roleLabels = {
  vendedor: "Vendedor",
  logistica: "Logística",
  admin: "Administrador",
  owner: "Owner",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await usersAPI.getAll();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
        toast.error("Error al cargar usuarios", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Form for creating new user
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
    formState: { errors: errorsNew },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  // Form for editing user
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(editUserSchema),
  });

  // Form for changing password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Generate next legajo number
  const generateLegajo = () => {
    const legajos = users.map(u => {
      const match = u.legajo?.match(/LEG-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxLegajo = Math.max(...legajos, 0);
    const nextNumber = maxLegajo + 1;
    return `LEG-${String(nextNumber).padStart(3, '0')}`;
  };

  // Filter users by search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.legajo?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateUser = async (data) => {
    setIsSubmitting(true);

    try {
      const userData = {
        name: data.name,
        email: data.email,
        role: data.role,
        legajo: generateLegajo(),
        password: data.password,
      };

      const createdUser = await usersAPI.create(userData);
      setUsers((prev) => [...prev, createdUser]);

      toast.success("Usuario creado", {
        description: `${createdUser.name} ha sido agregado al sistema`,
      });

      setIsCreateOpen(false);
      resetNew();
      setShowPassword(false);
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Error al crear usuario", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data) => {
    if (!userToEdit) return;

    setIsSubmitting(true);

    try {
      const updatedUser = await usersAPI.update(userToEdit.id, data);

      setUsers((prev) =>
        prev.map((u) => (u.id === userToEdit.id ? updatedUser : u))
      );

      toast.success("Usuario actualizado", {
        description: `${updatedUser.name} ha sido actualizado`,
      });

      setIsEditOpen(false);
      setUserToEdit(null);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Error al actualizar usuario", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (data) => {
    if (!userToChangePassword) return;

    setIsSubmitting(true);

    try {
      await usersAPI.changePassword(userToChangePassword.id, {
        password: data.newPassword,
      });

      toast.success("Contraseña actualizada", {
        description: `La contraseña de ${userToChangePassword.name} ha sido actualizada`,
      });

      setIsPasswordOpen(false);
      setUserToChangePassword(null);
      resetPassword();
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Error al cambiar contraseña", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);

    try {
      await usersAPI.delete(userToDelete.id);

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

      toast.success("Usuario eliminado", {
        description: `${userToDelete.name} ha sido eliminado del sistema`,
      });

      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Error al eliminar usuario", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user) => {
    setUserToEdit(user);
    resetEdit({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const openPasswordDialog = (user) => {
    setUserToChangePassword(user);
    resetPassword();
    setIsPasswordOpen(true);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const vendedores = users.filter((u) => u.role === "vendedor").length;
  const logisticos = users.filter((u) => u.role === "logistica").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const owners = users.filter((u) => u.role === "owner").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y modifica los parametros del sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por legajo, nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vendedores}</p>
                <p className="text-sm text-muted-foreground">Vendedores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Truck className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logisticos}</p>
                <p className="text-sm text-muted-foreground">Logística</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{owners}</p>
                <p className="text-sm text-muted-foreground">Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legajo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{user.legajo}</span>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColorMap[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar Usuario
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Cambiar Contraseña
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirmDelete(user)}
                          disabled={user.role === "admin" && admins <= 1}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Usuario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{user.legajo}</span>
                  </div>
                  <h3 className="font-medium text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={roleColorMap[user.role]}>
                  {roleLabels[user.role]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(user.createdAt).toLocaleDateString("es-AR")}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4 mr-1" />
                      Acciones
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => confirmDelete(user)}
                      disabled={user.role === "admin" && admins <= 1}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario del sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitNew(handleCreateUser)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                {...registerNew("name")}
              />
              {errorsNew.name && (
                <p className="text-sm text-destructive">
                  {errorsNew.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@rocha.com"
                {...registerNew("email")}
              />
              {errorsNew.email && (
                <p className="text-sm text-destructive">
                  {errorsNew.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...registerNew("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errorsNew.password && (
                <p className="text-sm text-destructive">
                  {errorsNew.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                onValueChange={(value) => {
                  const event = { target: { name: "role", value } };
                  registerNew("role").onChange(event);
                }}
                defaultValue=""
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="logistica">Logística</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              {errorsNew.role && (
                <p className="text-sm text-destructive">
                  {errorsNew.role.message}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(handleEditUser)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                placeholder="Juan Pérez"
                {...registerEdit("name")}
              />
              {errorsEdit.name && (
                <p className="text-sm text-destructive">
                  {errorsEdit.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="usuario@rocha.com"
                {...registerEdit("email")}
              />
              {errorsEdit.email && (
                <p className="text-sm text-destructive">
                  {errorsEdit.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select
                onValueChange={(value) => {
                  const event = { target: { name: "role", value } };
                  registerEdit("role").onChange(event);
                }}
                defaultValue=""
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="logistica">Logística</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              {errorsEdit.role && (
                <p className="text-sm text-destructive">
                  {errorsEdit.role.message}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              {userToChangePassword && (
                <>Establecer nueva contraseña para <strong>{userToChangePassword.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...registerPassword("newPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errorsPassword.newPassword && (
                <p className="text-sm text-destructive">
                  {errorsPassword.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  {...registerPassword("confirmPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errorsPassword.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errorsPassword.confirmPassword.message}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Cambiar Contraseña"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario{" "}
              <span className="font-medium">{userToDelete?.name}</span> será
              eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
