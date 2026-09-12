import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  Camera, Lock, Plus, Trash2, CheckCircle, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── small helper ─────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

const emptyAddress = { street: '', city: '', state: '', zipCode: '', country: 'Ethiopia', isDefault: false };

const Profile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const avatarInputRef = useRef(null);

  /* ── state ──────────────────────────────────────────────── */
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [editingPassword, setEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  /* ── init ───────────────────────────────────────────────── */
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phone: user.phone || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  /* ── avatar ─────────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setEditingProfile(true);
  };

  /* ── save profile ───────────────────────────────────────── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const form = new FormData();
      form.append('name', profileData.name);
      form.append('phone', profileData.phone);
      if (avatarFile) form.append('avatar', avatarFile);

      await api.put('/users/profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Re-fetch full user from server so avatar URL and all fields are fresh
      await refreshUser();

      setEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── change password ────────────────────────────────────── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed successfully');
      setEditingPassword(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  /* ── addresses ──────────────────────────────────────────── */
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/users/addresses/${editingAddressId}`, addressForm);
        toast.success('Address updated');
      } else {
        await api.post('/users/addresses', addressForm);
        toast.success('Address added');
      }
      const fresh = await refreshUser();
      setAddresses(fresh?.addresses || []);
      setAddingAddress(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddress);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      const fresh = await refreshUser();
      setAddresses(fresh?.addresses || []);
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      street: addr.street, city: addr.city, state: addr.state,
      zipCode: addr.zipCode, country: addr.country, isDefault: addr.isDefault
    });
    setAddingAddress(true);
  };

  const cancelAddress = () => {
    setAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  };

  /* ── avatar display ─────────────────────────────────────── */
  const avatarUrl = avatarPreview || user?.avatar?.url;
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Keep local address list in sync when user context updates
  useEffect(() => {
    if (user?.addresses) setAddresses(user.addresses);
  }, [user?.addresses]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold text-gradient">My Profile</h1>

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-primary-600 to-accent-600" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-primary-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary-600">{initials}</span>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow hover:bg-primary-700 transition"
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex items-center gap-2 mt-14">
              {user.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              <span className="text-xs text-primary-700 bg-primary-50 border border-primary-200 px-2 py-1 rounded-full capitalize">
                {user.role}
              </span>
            </div>
          </div>

          {/* Info / Edit form */}
          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input className="input-field" value={profileData.name}
                    onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} required />
                </Field>
                <Field label="Phone Number">
                  <input className="input-field" type="tel" value={profileData.phone}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="+251 9XX XXX XXX" />
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingProfile}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {savingProfile ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button type="button" onClick={() => { setEditingProfile(false); setAvatarPreview(null); setAvatarFile(null); }}
                  className="btn-outline flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold">{user.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Account Status</p>
                    <p className="text-sm font-semibold">{user.isVerified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Change Password ──────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-600" /> Change Password
          </h2>
          {!editingPassword && (
            <button onClick={() => setEditingPassword(true)}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
              <Edit2 className="w-4 h-4" /> Change
            </button>
          )}
        </div>

        {editingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Field label="Current Password">
              <div className="relative">
                <input className="input-field pr-10" type={showPw ? 'text' : 'password'}
                  value={passwords.currentPassword} required
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password">
                <input className="input-field" type={showPw ? 'text' : 'password'}
                  value={passwords.newPassword} required minLength={6}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
              </Field>
              <Field label="Confirm New Password">
                <input className="input-field" type={showPw ? 'text' : 'password'}
                  value={passwords.confirmPassword} required
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
              </Field>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={savingPassword}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {savingPassword ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
                Update Password
              </button>
              <button type="button" onClick={() => { setEditingPassword(false); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="btn-outline flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500">Keep your account secure by using a strong password.</p>
        )}
      </div>

      {/* ── Addresses ────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" /> Saved Addresses
          </h2>
          {!addingAddress && (
            <button onClick={() => { setAddingAddress(true); setEditingAddressId(null); setAddressForm(emptyAddress); }}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          )}
        </div>

        {/* Address form */}
        {addingAddress && (
          <form onSubmit={handleSaveAddress} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl border">
            <h3 className="font-semibold text-sm text-gray-700">
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </h3>
            <Field label="Street Address">
              <input className="input-field" value={addressForm.street} required
                onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input className="input-field" value={addressForm.city} required
                  onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} />
              </Field>
              <Field label="State / Region">
                <input className="input-field" value={addressForm.state} required
                  onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zip Code">
                <input className="input-field" value={addressForm.zipCode} required
                  onChange={e => setAddressForm(p => ({ ...p, zipCode: e.target.value }))} />
              </Field>
              <Field label="Country">
                <input className="input-field" value={addressForm.country} required
                  onChange={e => setAddressForm(p => ({ ...p, country: e.target.value }))} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={addressForm.isDefault}
                onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded text-primary-600" />
              Set as default address
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> {editingAddressId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={cancelAddress} className="btn-outline flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address list */}
        {addresses.length === 0 && !addingAddress ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No saved addresses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr._id}
                className={`flex items-start justify-between p-4 rounded-xl border transition ${
                  addr.isDefault ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                }`}>
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${addr.isDefault ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    {addr.isDefault && (
                      <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full mb-1 inline-block">
                        Default
                      </span>
                    )}
                    <p className="font-semibold text-sm">{addr.street}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state}</p>
                    <p className="text-sm text-gray-500">{addr.zipCode}, {addr.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button onClick={() => startEditAddress(addr)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteAddress(addr._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
