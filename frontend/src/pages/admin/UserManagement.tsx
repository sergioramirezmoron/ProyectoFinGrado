import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { ShieldCheck, ShieldAlert, Loader2, Search, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "../../types/auth";

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const data = response.data.member || [];
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSalesRole = async (user: User) => {
    setUpdatingId(user.id || null);
    const hasSalesRole = user.roles.includes("ROLE_SALES");
    const newRoles = hasSalesRole
      ? user.roles.filter((r) => r !== "ROLE_SALES")
      : [...user.roles, "ROLE_SALES"];

    try {
      await api.patch(
        `/users/${user.id}`,
        { roles: newRoles },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, roles: newRoles } : u))
      );
    } catch (error) {
      throw new Error(`Error actualizando roles: ${error}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term) ||
        u.surname?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const displayedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Personal</h1>
          <p className="text-slate-500 text-sm">
            Asigna permisos de ventas a los usuarios registrados.
          </p>
        </div>
        <UserCog size={32} className="text-blue-600" />
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Usuario
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Roles Actuales
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-500">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500" />
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-20 text-center text-slate-400 text-sm">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {user.name} {user.surname}
                    </div>
                    <div className="text-sm text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md"
                        >
                          {role.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleSalesRole(user)}
                      disabled={
                        updatingId === user.id ||
                        user.roles.includes("ROLE_ADMIN")
                      }
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        user.roles.includes("ROLE_SALES")
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      } disabled:opacity-30`}
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : user.roles.includes("ROLE_SALES") ? (
                        <>
                          <ShieldAlert size={16} /> Quitar Ventas
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} /> Hacer Ventas
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredUsers.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""}
              {searchTerm && " encontrados"}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border rounded-lg border-slate-200 disabled:opacity-20 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Página</span>
                  <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs shadow-sm">
                    {page}
                  </span>
                  <span className="text-slate-400">de {totalPages}</span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 border rounded-lg border-slate-200 disabled:opacity-20 hover:bg-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
