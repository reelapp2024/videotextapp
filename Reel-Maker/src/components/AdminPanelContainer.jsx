import React from 'react';
import AdminPanelModal from './AdminPanelModal';

export default function AdminPanelContainer({
  show,
  onClose,
  isAdmin,

  adminStats,
  adminUsers,

  adminNewEmail,
  setAdminNewEmail,
  adminNewPassword,
  setAdminNewPassword,
  adminNewName,
  setAdminNewName,
  adminNewRole,
  setAdminNewRole,
  adminCreateUser,
  adminLoading,
  loadAdminData,

  adminEditId,
  setAdminEditId,
  adminEditData,
  setAdminEditData,
  adminSaveEdit,
  adminToggleActive,
  adminDeleteUser,
}) {
  return (
    <AdminPanelModal
      show={show && isAdmin}
      onClose={onClose}
      adminStats={adminStats}
      adminUsers={adminUsers}
      adminNewEmail={adminNewEmail}
      setAdminNewEmail={setAdminNewEmail}
      adminNewPassword={adminNewPassword}
      setAdminNewPassword={setAdminNewPassword}
      adminNewName={adminNewName}
      setAdminNewName={setAdminNewName}
      adminNewRole={adminNewRole}
      setAdminNewRole={setAdminNewRole}
      adminCreateUser={adminCreateUser}
      adminLoading={adminLoading}
      loadAdminData={loadAdminData}
      adminEditId={adminEditId}
      setAdminEditId={setAdminEditId}
      adminEditData={adminEditData}
      setAdminEditData={setAdminEditData}
      adminSaveEdit={adminSaveEdit}
      adminToggleActive={adminToggleActive}
      adminDeleteUser={adminDeleteUser}
    />
  );
}

